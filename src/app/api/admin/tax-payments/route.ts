import { Prisma } from '@prisma/client';
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
} from '@/lib/admin-domain';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawTaxType = searchParams.get('taxType') || 'PND51';
  if (!isOneOf(rawTaxType, TAX_TYPES)) {
    return NextResponse.json({ success: false, error: 'ประเภทภาษีไม่ถูกต้อง' }, { status: 400 });
  }
  if (!hasPermission(session, permissionForTaxType(rawTaxType, 'view'))) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const taxYear = searchParams.get('taxYear');
  const taxMonth = searchParams.get('taxMonth');
  const billingStatus = searchParams.get('billingStatus');
  const paymentMethodId = searchParams.get('paymentMethodId');
  const search = searchParams.get('search')?.trim().slice(0, 100) || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get('pageSize')) || 100));

  if (taxYear && !normalizeTaxYear(taxYear)) {
    return NextResponse.json({ success: false, error: 'ปีภาษีไม่ถูกต้อง' }, { status: 400 });
  }
  if (taxMonth && !normalizeTaxMonth(taxMonth)) {
    return NextResponse.json({ success: false, error: 'เดือนภาษีไม่ถูกต้อง' }, { status: 400 });
  }
  if (billingStatus && !isOneOf(billingStatus, BILLING_STATUSES)) {
    return NextResponse.json({ success: false, error: 'สถานะเรียกเก็บไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const where: Prisma.TaxPaymentWhereInput = { taxType: rawTaxType };
    if (taxYear) where.taxYear = taxYear;
    if (taxMonth) where.taxMonth = taxMonth;
    if (billingStatus) where.billingStatus = billingStatus;
    if (paymentMethodId) {
      const methodId = parsePositiveId(paymentMethodId);
      if (!methodId) return NextResponse.json({ success: false, error: 'ช่องทางชำระไม่ถูกต้อง' }, { status: 400 });
      where.paymentMethodId = methodId;
    }
    if (search) {
      where.OR = [
        { company: { name: { contains: search } } },
        { referenceNo: { contains: search } },
      ];
    }

    const [payments, totalCount] = await Promise.all([
      prisma.taxPayment.findMany({
        where,
        include: {
          company: { include: { contacts: { where: { isPrimary: true }, take: 1 } } },
          paymentMethod: true,
          createdBy: { select: { id: true, fullName: true } },
          _count: { select: { followUpLogs: true } },
        },
        orderBy: [{ paymentDate: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.taxPayment.count({ where }),
    ]);

    const summaryByMethod: Record<string, { count: number; totalAmount: string; name: string; code: string }> = {};
    let grandTotal = new Prisma.Decimal(0);
    for (const payment of payments) {
      grandTotal = grandTotal.plus(payment.amount);
      const code = payment.paymentMethod.code;
      const current = summaryByMethod[code];
      const total = (current ? new Prisma.Decimal(current.totalAmount) : new Prisma.Decimal(0)).plus(payment.amount);
      summaryByMethod[code] = {
        name: payment.paymentMethod.name,
        code,
        count: (current?.count || 0) + 1,
        totalAmount: total.toFixed(2),
      };
    }

    return NextResponse.json({
      success: true,
      data: payments,
      meta: { count: totalCount, page, pageSize, grandTotal: grandTotal.toFixed(2), summaryByMethod },
    });
  } catch (error) {
    console.error('Error fetching tax payments:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถโหลดรายการภาษีได้' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !isOneOf(body.taxType, TAX_TYPES)) {
      return NextResponse.json({ success: false, error: 'ประเภทภาษีไม่ถูกต้อง' }, { status: 400 });
    }
    if (!hasPermission(session, permissionForTaxType(body.taxType, 'create'))) {
      return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์บันทึกรายการภาษีนี้' }, { status: 403 });
    }

    const taxYear = normalizeTaxYear(body.taxYear);
    const taxMonth = normalizeTaxMonth(body.taxMonth);
    const companyId = parsePositiveId(body.companyId);
    const paymentMethodId = parsePositiveId(body.paymentMethodId);
    const paymentDate = parseDateOnly(body.paymentDate);
    const amount = normalizeMoney(body.amount);
    const billingStatus = isOneOf(body.billingStatus, BILLING_STATUSES) ? body.billingStatus : 'UNBILLED';

    if (!taxYear) return NextResponse.json({ success: false, error: 'ปีภาษีไม่ถูกต้อง' }, { status: 400 });
    if (body.taxType !== 'PND51' && !taxMonth) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุเดือนภาษี' }, { status: 400 });
    }
    if (!companyId) return NextResponse.json({ success: false, error: 'กรุณาเลือกบริษัทจากทะเบียนลูกค้า' }, { status: 400 });
    if (!paymentMethodId) return NextResponse.json({ success: false, error: 'กรุณาเลือกช่องทางชำระ' }, { status: 400 });
    if (!paymentDate) return NextResponse.json({ success: false, error: 'วันที่ชำระไม่ถูกต้อง' }, { status: 400 });
    if (!amount) return NextResponse.json({ success: false, error: 'จำนวนเงินต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง' }, { status: 400 });

    const [company, paymentMethod] = await Promise.all([
      prisma.company.findFirst({ where: { id: companyId, isActive: true }, select: { id: true } }),
      prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, isActive: true }, select: { id: true } }),
    ]);
    if (!company) return NextResponse.json({ success: false, error: 'ไม่พบบริษัทหรือบริษัทถูกปิดใช้งาน' }, { status: 400 });
    if (!paymentMethod) return NextResponse.json({ success: false, error: 'ไม่พบช่องทางชำระหรือช่องทางถูกปิดใช้งาน' }, { status: 400 });

    const created = await prisma.taxPayment.create({
      data: {
        taxType: body.taxType,
        taxYear,
        taxMonth: body.taxType === 'PND51' ? null : taxMonth,
        companyId,
        paymentMethodId,
        paymentDate,
        amount,
        referenceNo: asTrimmedText(body.referenceNo, 100),
        billingStatus,
        note: asTrimmedText(body.note, 2000),
        createdById: session.id,
      },
      include: { company: true, paymentMethod: true },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating tax payment:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถบันทึกรายการภาษีได้' }, { status: 500 });
  }
}
