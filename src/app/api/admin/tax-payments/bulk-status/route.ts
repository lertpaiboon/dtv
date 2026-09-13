import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import {
  BILLING_STATUSES,
  TAX_TYPES,
  isOneOf,
  parsePositiveId,
  permissionForTaxType,
  type TaxType,
} from '@/lib/admin-domain';

const statusLabels: Record<string, string> = {
  ADVANCED: 'สำรองจ่าย',
  UNBILLED: 'สำรองจ่าย',
  WAITING_TRANSFER: 'รอโอนเงิน',
  BILLED: 'รอโอนเงิน',
  PAID: 'จ่ายแล้ว',
  PENDING: 'รอดำเนินการ',
};

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

    const {
      paymentIds: rawIds,
      billingStatus,
      reimbursedAt: rawReimbursedAt,
      reimbursementRef,
      slipUrl,
      slipFileName,
    } = body;

    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      return NextResponse.json({ success: false, error: 'กรุณาเลือกอย่างน้อย 1 รายการ' }, { status: 400 });
    }

    const paymentIds = rawIds.map(parsePositiveId).filter((id): id is number => id !== null);
    if (paymentIds.length === 0) {
      return NextResponse.json({ success: false, error: 'รหัสรายการไม่ถูกต้อง' }, { status: 400 });
    }

    const uniquePaymentIds = [...new Set(paymentIds)];
    const existingPayments = await prisma.taxPayment.findMany({
      where: { id: { in: uniquePaymentIds } },
      select: { id: true, taxType: true },
    });
    if (existingPayments.length !== uniquePaymentIds.length) {
      return NextResponse.json({ success: false, error: 'ไม่พบบางรายการภาษีที่เลือก กรุณาโหลดข้อมูลใหม่' }, { status: 400 });
    }
    const canEditEveryPayment = existingPayments.every((payment) =>
      TAX_TYPES.includes(payment.taxType as TaxType) &&
      hasPermission(session, permissionForTaxType(payment.taxType as TaxType, 'edit'))
    );
    if (!canEditEveryPayment) {
      return NextResponse.json({ success: false, error: 'ไม่มีสิทธิ์แก้ไขรายการภาษีบางรายการที่เลือก' }, { status: 403 });
    }

    if (!isOneOf(billingStatus, BILLING_STATUSES)) {
      return NextResponse.json({ success: false, error: 'สถานะเรียกเก็บไม่ถูกต้อง' }, { status: 400 });
    }

    const updateData: {
      billingStatus: string;
      reimbursedAt?: Date | null;
      reimbursementRef?: string | null;
      slipUrl?: string | null;
      slipFileName?: string | null;
    } = {
      billingStatus,
    };

    if (billingStatus === 'PAID') {
      updateData.reimbursedAt = rawReimbursedAt ? new Date(rawReimbursedAt) : new Date();
      if (reimbursementRef !== undefined) {
        updateData.reimbursementRef = reimbursementRef ? String(reimbursementRef).trim() : null;
      }
      if (slipUrl !== undefined) {
        updateData.slipUrl = slipUrl ? String(slipUrl).trim() : null;
      }
      if (slipFileName !== undefined) {
        updateData.slipFileName = slipFileName ? String(slipFileName).trim() : null;
      }
    } else {
      updateData.reimbursedAt = null;
    }

    const result = await prisma.taxPayment.updateMany({
      where: { id: { in: uniquePaymentIds } },
      data: updateData,
    });

    const statusName = statusLabels[billingStatus] || billingStatus;

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `เปลี่ยนสถานะเป็น "${statusName}" สำเร็จ ${result.count} รายการ`,
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถอัปเดตสถานะรายการได้' }, { status: 500 });
  }
}
