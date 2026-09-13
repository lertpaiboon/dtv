import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { parsePositiveId } from '@/lib/admin-domain';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'ต้องใช้สิทธิ์ Super Admin ในการแก้ไขช่องทางชำระเงิน' }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parsePositiveId(rawId);
  if (!id) {
    return NextResponse.json({ success: false, error: 'รหัสช่องทางไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'ข้อมูลคำขอไม่ถูกต้อง' }, { status: 400 });
    }

    const { code, name, cardLastDigits, isActive } = body;

    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบช่องทางชำระเงินนี้ในระบบ' }, { status: 404 });
    }

    const data: {
      code?: string;
      name?: string;
      cardLastDigits?: string | null;
      isActive?: boolean;
    } = {};

    if (code && typeof code === 'string') {
      const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');
      if (cleanCode !== existing.code) {
        const duplicate = await prisma.paymentMethod.findUnique({ where: { code: cleanCode } });
        if (duplicate) {
          return NextResponse.json({ success: false, error: `รหัส "${cleanCode}" ถูกใช้งานแล้ว` }, { status: 400 });
        }
        data.code = cleanCode;
      }
    }

    if (name && typeof name === 'string') {
      data.name = name.trim();
    }

    if (cardLastDigits !== undefined) {
      data.cardLastDigits = cardLastDigits ? String(cardLastDigits).trim().slice(-4) : null;
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated, message: 'แก้ไขช่องทางชำระเงินเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ success: false, error: 'Failed to update payment method' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'ต้องใช้สิทธิ์ Super Admin ในการลบช่องทางชำระเงิน' }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parsePositiveId(rawId);
  if (!id) {
    return NextResponse.json({ success: false, error: 'รหัสช่องทางไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: { select: { taxPayments: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบช่องทางชำระเงินนี้ในระบบ' }, { status: 404 });
    }

    // Safety check: if tax payments exist, deactivate instead of hard delete
    if (existing._count.taxPayments > 0) {
      await prisma.paymentMethod.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        action: 'deactivated',
        message: `มีรายการภาษี ${existing._count.taxPayments} รายการผูกกับช่องทางนี้อยู่ ระบบได้เปลี่ยนสถานะเป็น "ปิดใช้งาน" เพื่อรักษาความถูกต้องของข้อมูลประวัติภาษี`,
      });
    }

    // Otherwise safe to delete
    await prisma.paymentMethod.delete({ where: { id } });
    return NextResponse.json({ success: true, action: 'deleted', message: 'ลบช่องทางชำระเงินเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete payment method' }, { status: 500 });
  }
}
