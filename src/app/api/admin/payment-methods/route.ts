import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeAll = searchParams.get('all') === 'true';

  try {
    const methods = await prisma.paymentMethod.findMany({
      where: includeAll ? {} : { isActive: true },
      include: {
        _count: {
          select: { taxPayments: true },
        },
      },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'ต้องใช้สิทธิ์ Super Admin ในการเพิ่มช่องทางชำระเงิน' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'ข้อมูลคำขอไม่ถูกต้อง' }, { status: 400 });
    }

    const { code, name, cardLastDigits, isActive } = body;
    if (!code || typeof code !== 'string' || !name || typeof name !== 'string') {
      return NextResponse.json({ success: false, error: 'กรุณาระบุรหัสช่องทาง (Code) และชื่อช่องทาง (Name)' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '_');
    const cleanName = name.trim();
    const cleanDigits = cardLastDigits ? String(cardLastDigits).trim().slice(-4) : null;

    // Check code uniqueness
    const existing = await prisma.paymentMethod.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: `รหัสช่องทาง "${cleanCode}" มีอยู่ในระบบแล้ว` }, { status: 400 });
    }

    const method = await prisma.paymentMethod.create({
      data: {
        code: cleanCode,
        name: cleanName,
        cardLastDigits: cleanDigits,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, data: method, message: 'สร้างช่องทางชำระเงินเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({ success: false, error: 'Failed to create payment method' }, { status: 500 });
  }
}
