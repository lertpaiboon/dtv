import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { parsePositiveId } from '@/lib/admin-domain';

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

    const parsedRoleId = parsePositiveId(roleId);
    if (!parsedRoleId) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ Role ID ที่ถูกต้อง' }, { status: 400 });
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ success: false, error: 'รายการสิทธิ์ต้องเป็น Array' }, { status: 400 });
    }

    const cleanPermissions = permissions
      .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      .map((p) => p.trim().slice(0, 60));

    const existingRole = await prisma.role.findUnique({ where: { id: parsedRoleId } });
    if (!existingRole) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทบาทที่ระบุในระบบ' }, { status: 404 });
    }

    if (existingRole.name === 'SUPER_ADMIN' && !cleanPermissions.includes('*')) {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบสิทธิ์หลัก (*) ออกจากบทบาท SUPER_ADMIN ได้' },
        { status: 400 }
      );
    }

    const updated = await prisma.role.update({
      where: { id: parsedRoleId },
      data: {
        permissions: cleanPermissions,
        description: description !== undefined ? String(description || '').trim().slice(0, 255) || null : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถบันทึกสิทธิ์ได้' }, { status: 500 });
  }
}
