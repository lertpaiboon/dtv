import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ success: true, data: roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Only super admin can alter role permissions
  if (session.roleName !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'เฉพาะผู้ดูแลระบบสูงสุด (Super Admin) เท่านั้นที่สามารถแก้ไขสิทธิ์ได้' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { roleId, permissions, description } = body;

    if (!roleId) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ Role ID' }, { status: 400 });
    }

    const updated = await prisma.role.update({
      where: { id: parseInt(roleId, 10) },
      data: {
        permissions: Array.isArray(permissions) ? permissions : [],
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถบันทึกสิทธิ์ได้' }, { status: 500 });
  }
}
