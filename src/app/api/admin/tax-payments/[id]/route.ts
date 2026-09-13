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

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Context) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const paymentId = parsePositiveId((await params).id);
    if (!paymentId) return NextResponse.json({ success: false, error: 'รหัสรายการไม่ถูกต้อง' }, { status: 400 });

    const existing = await prisma.taxPayment.findUnique({ where: { id: paymentId } });
    if (!existing || !isOneOf(existing.taxType, TAX_TYPES)) {
      return NextResponse.json({ success: false, error: 'ไม่พบรายการที่ต้องการแก้ไข' }, { status: 404 });
    }
    if (!hasPermission(session, permissionForTaxType(existing.taxType, 'edit'))) {
      return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์แก้ไขรายการนี้' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

    const taxType = body.taxType === undefined
      ? undefined
      : isOneOf(body.taxType, TAX_TYPES) ? body.taxType : null;
    if (body.taxType !== undefined && !taxType) {
      return NextResponse.json({ success: false, error: 'ประเภทภาษีไม่ถูกต้อง' }, { status: 400 });
    }
    if (taxType && !hasPermission(session, permissionForTaxType(taxType, 'edit'))) {
      return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ย้ายรายการไปยังประเภทภาษีนี้' }, { status: 403 });
    }

    const targetTaxType = taxType ?? existing.taxType;

    const amount = body.amount === undefined ? undefined : normalizeMoney(body.amount);
    const taxYear = body.taxYear === undefined ? undefined : normalizeTaxYear(body.taxYear);
    const taxMonth = body.taxMonth === undefined ? undefined : normalizeTaxMonth(body.taxMonth);
    const paymentDate = body.paymentDate === undefined ? undefined : parseDateOnly(body.paymentDate);
    const paymentMethodId = body.paymentMethodId === undefined ? undefined : parsePositiveId(body.paymentMethodId);
    const billingStatus = body.billingStatus === undefined
      ? undefined
      : isOneOf(body.billingStatus, BILLING_STATUSES) ? body.billingStatus : null;

    if (body.amount !== undefined && !amount) return NextResponse.json({ success: false, error: 'จำนวนเงินไม่ถูกต้อง' }, { status: 400 });
    if (body.taxYear !== undefined && !taxYear) return NextResponse.json({ success: false, error: 'ปีภาษีไม่ถูกต้อง' }, { status: 400 });
    if (body.taxMonth !== undefined && targetTaxType !== 'PND51' && !taxMonth) return NextResponse.json({ success: false, error: 'เดือนภาษีไม่ถูกต้อง' }, { status: 400 });
    if (body.paymentDate !== undefined && !paymentDate) return NextResponse.json({ success: false, error: 'วันที่ชำระไม่ถูกต้อง' }, { status: 400 });
    if (body.paymentMethodId !== undefined && !paymentMethodId) return NextResponse.json({ success: false, error: 'ช่องทางชำระไม่ถูกต้อง' }, { status: 400 });
    if (body.billingStatus !== undefined && !billingStatus) return NextResponse.json({ success: false, error: 'สถานะเรียกเก็บไม่ถูกต้อง' }, { status: 400 });

    if (paymentMethodId) {
      const method = await prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, isActive: true }, select: { id: true } });
      if (!method) return NextResponse.json({ success: false, error: 'ช่องทางชำระถูกปิดใช้งานหรือไม่พบในระบบ' }, { status: 400 });
    }

    let finalTaxMonth: string | null | undefined = undefined;
    if (targetTaxType === 'PND51') {
      finalTaxMonth = null;
    } else if (taxMonth !== undefined) {
      finalTaxMonth = taxMonth;
    } else if (!existing.taxMonth) {
      const pDate = paymentDate || existing.paymentDate;
      const monthNum = new Date(pDate).getUTCMonth() + 1;
      finalTaxMonth = String(monthNum).padStart(2, '0');
    }

    const updated = await prisma.taxPayment.update({
      where: { id: paymentId },
      data: {
        taxType: taxType ?? undefined,
        amount: amount ?? undefined,
        paymentMethodId: paymentMethodId ?? undefined,
        paymentDate: paymentDate ?? undefined,
        referenceNo: body.referenceNo === undefined ? undefined : asTrimmedText(body.referenceNo, 100),
        billingStatus: billingStatus ?? undefined,
        reimbursedAt: billingStatus === 'PAID'
          ? existing.reimbursedAt || new Date()
          : billingStatus ? null : undefined,
        reimbursementRef: body.reimbursementRef === undefined ? undefined : (body.reimbursementRef ? String(body.reimbursementRef).trim() : null),
        slipUrl: body.slipUrl === undefined ? undefined : (body.slipUrl ? String(body.slipUrl).trim() : null),
        slipFileName: body.slipFileName === undefined ? undefined : (body.slipFileName ? String(body.slipFileName).trim() : null),
        note: body.note === undefined ? undefined : asTrimmedText(body.note, 2000),
        taxYear: taxYear ?? undefined,
        taxMonth: finalTaxMonth,
      },
      include: { company: true, paymentMethod: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating tax payment:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถแก้ไขข้อมูลได้' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const paymentId = parsePositiveId((await params).id);
    if (!paymentId) return NextResponse.json({ success: false, error: 'รหัสรายการไม่ถูกต้อง' }, { status: 400 });

    const existing = await prisma.taxPayment.findUnique({
      where: { id: paymentId },
      include: { _count: { select: { followUpLogs: true } } },
    });
    if (!existing || !isOneOf(existing.taxType, TAX_TYPES)) {
      return NextResponse.json({ success: false, error: 'ไม่พบรายการที่ต้องการลบ' }, { status: 404 });
    }
    if (!hasPermission(session, permissionForTaxType(existing.taxType, 'delete'))) {
      return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์ลบรายการนี้' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.followUpLog.deleteMany({ where: { taxPaymentId: paymentId } }),
      prisma.taxPayment.delete({ where: { id: paymentId } }),
    ]);

    return NextResponse.json({ success: true, message: 'ลบรายการสำเร็จ' });
  } catch (error) {
    console.error('Error deleting tax payment:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถลบรายการได้' }, { status: 500 });
  }
}
