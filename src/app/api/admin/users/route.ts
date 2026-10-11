import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission, hashPassword } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden: เฉพาะผู้ดูแลระบบสูงสุดเท่านั้น' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            taxPayments: true,
            followUpLogs: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดรายชื่อผู้ใช้งาน' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden: เฉพาะผู้ดูแลระบบสูงสุดเท่านั้น' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const fullName = (body.fullName || '').trim();
    const password = body.password || '';
    const roleId = parseInt(body.roleId, 10);
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    if (!fullName) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อ-นามสกุล' }, { status: 400 });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมลที่ถูกต้อง' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    }

    if (isNaN(roleId)) {
      return NextResponse.json({ success: false, error: 'กรุณาเลือกบทบาท (Role) ของผู้ใช้งาน' }, { status: 400 });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทบาทที่ระบุในระบบ' }, { status: 400 });
    }

    // Verify email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: `อีเมล "${email}" ถูกใช้งานแล้วในระบบ` }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        roleId,
        isActive,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        roleId: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: `สร้างผู้ใช้งาน "${newUser.fullName}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' }, { status: 500 });
  }
}
