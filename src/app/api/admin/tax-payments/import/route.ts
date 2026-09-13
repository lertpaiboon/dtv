import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import {
  BILLING_STATUSES,
  TAX_TYPES,
  asTrimmedText,
  isOneOf,
  normalizeMoney,
  normalizeTaxMonth,
  normalizeTaxYear,
  parseDateOnly,
  parsePositiveId,
  permissionForTaxType,
  type TaxType,
} from '@/lib/admin-domain';

interface ImportPaymentItemPayload {
  companyId: unknown;
  taxType?: unknown;
  taxYear?: unknown;
  taxMonth?: unknown;
  paymentDate: unknown;
  paymentMethodId: unknown;
  amount: unknown;
  billingStatus?: unknown;
  referenceNo?: unknown;
  note?: unknown;
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'ข้อมูลคำขอไม่ถูกต้อง' }, { status: 400 });
    }

    const rawTaxType = body.taxType;
    if (!isOneOf(rawTaxType, TAX_TYPES)) {
      return NextResponse.json({ success: false, error: 'ประเภทภาษีไม่ถูกต้อง' }, { status: 400 });
    }

    const taxType = rawTaxType as TaxType;
    if (!hasPermission(session, permissionForTaxType(taxType, 'create'))) {
      return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ในการนำเข้าข้อมูลภาษีประเภทนี้' }, { status: 403 });
    }

    const taxYear = normalizeTaxYear(body.taxYear);
    const taxMonth = normalizeTaxMonth(body.taxMonth);
    const duplicateStrategy = body.duplicateStrategy === 'SKIP' ? 'SKIP' : 'OVERWRITE';
    const items = body.items;

    if (!taxYear) {
      return NextResponse.json({ success: false, error: 'ปีภาษีไม่ถูกต้อง' }, { status: 400 });
    }
    if (taxType !== 'PND51' && !taxMonth) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุเดือนภาษี' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่มีรายการข้อมูลสำหรับนำเข้า' }, { status: 400 });
    }

    // Load active companies & payment methods to validate foreign keys
    const [companies, paymentMethods] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true, taxId: true },
      }),
      prisma.paymentMethod.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
      }),
    ]);

    const activeCompanyIds = new Set(companies.map((c) => c.id));
    const activePaymentMethodIds = new Set(paymentMethods.map((m) => m.id));

    // Validate and clean each item
    const validItems: {
      companyId: number;
      taxType: string;
      taxYear: string;
      taxMonth: string | null;
      paymentDate: Date;
      paymentMethodId: number;
      amount: string;
      billingStatus: string;
      referenceNo: string | null;
      note: string | null;
    }[] = [];

    const errors: string[] = [];

    for (let index = 0; index < items.length; index++) {
      const row = items[index] as ImportPaymentItemPayload;
      const rowNum = index + 1;

      const companyId = parsePositiveId(row.companyId);
      if (!companyId || !activeCompanyIds.has(companyId)) {
        errors.push(`แถวที่ ${rowNum}: ไม่พบบริษัทหรือบริษัทไม่ได้เปิดใช้งาน`);
        continue;
      }

      const paymentMethodId = parsePositiveId(row.paymentMethodId);
      if (!paymentMethodId || !activePaymentMethodIds.has(paymentMethodId)) {
        errors.push(`แถวที่ ${rowNum}: ไม่พบช่องทางชำระเงินหรือช่องทางถูกปิดใช้งาน`);
        continue;
      }

      const paymentDate = parseDateOnly(row.paymentDate);
      if (!paymentDate) {
        errors.push(`แถวที่ ${rowNum}: วันที่ชำระไม่ถูกต้อง (ต้องเป็นรูปแบบ YYYY-MM-DD)`);
        continue;
      }

      const amount = normalizeMoney(row.amount);
      if (!amount) {
        errors.push(`แถวที่ ${rowNum}: ยอดเงินภาษีต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง`);
        continue;
      }

      const rowTaxType = isOneOf(row.taxType, TAX_TYPES) ? (row.taxType as string) : taxType;
      const rowTaxYear = normalizeTaxYear(row.taxYear) || taxYear;
      const rowTaxMonth = rowTaxType === 'PND51' ? null : (normalizeTaxMonth(row.taxMonth) || taxMonth);

      const billingStatus = isOneOf(row.billingStatus, BILLING_STATUSES) ? row.billingStatus : 'ADVANCED';
      const referenceNo = asTrimmedText(row.referenceNo, 100);
      const note = asTrimmedText(row.note, 2000);

      validItems.push({
        companyId,
        taxType: rowTaxType,
        taxYear: rowTaxYear,
        taxMonth: rowTaxMonth,
        paymentDate,
        paymentMethodId,
        amount,
        billingStatus,
        referenceNo,
        note,
      });
    }

    if (validItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: errors[0] || 'ไม่มีข้อมูลที่ถูกต้องในการนำเข้า',
        details: errors,
      }, { status: 400 });
    }

    // Process batch import in transaction
    const result = await prisma.$transaction(async (tx) => {
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const item of validItems) {
        const existing = await tx.taxPayment.findFirst({
          where: {
            companyId: item.companyId,
            taxType: item.taxType,
            taxYear: item.taxYear,
            taxMonth: item.taxMonth,
          },
        });

        if (existing) {
          if (duplicateStrategy === 'SKIP') {
            skippedCount++;
          } else {
            // Overwrite existing record
            await tx.taxPayment.update({
              where: { id: existing.id },
              data: {
                paymentMethodId: item.paymentMethodId,
                paymentDate: item.paymentDate,
                amount: item.amount,
                billingStatus: item.billingStatus,
                referenceNo: item.referenceNo,
                note: item.note,
              },
            });
            updatedCount++;
          }
        } else {
          // Create new record
          await tx.taxPayment.create({
            data: {
              companyId: item.companyId,
              taxType: item.taxType,
              taxYear: item.taxYear,
              taxMonth: item.taxMonth,
              paymentDate: item.paymentDate,
              paymentMethodId: item.paymentMethodId,
              amount: item.amount,
              billingStatus: item.billingStatus,
              referenceNo: item.referenceNo,
              note: item.note,
              createdById: session.id,
            },
          });
          createdCount++;
        }
      }

      return { createdCount, updatedCount, skippedCount };
    });

    const msgParts: string[] = [];
    if (result.createdCount > 0) msgParts.push(`สร้างใหม่ ${result.createdCount} รายการ`);
    if (result.updatedCount > 0) msgParts.push(`อัปเดต ${result.updatedCount} รายการ`);
    if (result.skippedCount > 0) msgParts.push(`ข้ามรายการซ้ำ ${result.skippedCount} รายการ`);
    if (errors.length > 0) msgParts.push(`ข้อมูลไม่สมบูรณ์ ${errors.length} รายการ`);

    const message = `นำเข้าเสร็จสิ้น: ${msgParts.join(', ')}`;

    return NextResponse.json({
      success: true,
      message,
      meta: {
        total: items.length,
        validTotal: validItems.length,
        createdCount: result.createdCount,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        invalidCount: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error('Batch tax import error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลภาษี' }, { status: 500 });
  }
}
