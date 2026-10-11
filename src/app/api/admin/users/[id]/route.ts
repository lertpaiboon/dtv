import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, hasPermission, hashPassword } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: 'รหัสผู้ใช้งานไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden: เฉพาะผู้ดูแลระบบสูงสุดเท่านั้น' }, { status: 403 });
  }

  const { id } = await params;
  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) {
    return NextResponse.json({ success: false, error: 'รหัสผู้ใช้งานไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: targetId },
      include: { role: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข' }, { status: 404 });
    }

    const body = await req.json();
    const fullName = (body.fullName !== undefined ? body.fullName : existing.fullName).trim();
    const email = (body.email !== undefined ? body.email : existing.email).trim().toLowerCase();
    const roleId = body.roleId !== undefined ? parseInt(body.roleId, 10) : existing.roleId;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive;
    const password = body.password ? String(body.password) : null;

    if (!fullName) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อ-นามสกุล' }, { status: 400 });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมลที่ถูกต้อง' }, { status: 400 });
    }

    if (isNaN(roleId)) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ Role ID ที่ถูกต้อง' }, { status: 400 });
    }

    // Safety checks for Super Admin & Self
    const isSelf = session.id === targetId;

    if (isSelf && !isActive) {
      return NextResponse.json({ success: false, error: 'ไม่อนุญาตให้ปิดการใช้งานบัญชีที่คุณกำลังล็อกอินอยู่' }, { status: 400 });
    }

    // Check if target is currently SUPER_ADMIN and is being deactivated or changed to another role
    if (existing.role.name === 'SUPER_ADMIN' && (!isActive || roleId !== existing.roleId)) {
      const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
      if (superAdminRole) {
        const otherActiveSuperAdmins = await prisma.user.count({
          where: {
            roleId: superAdminRole.id,
            isActive: true,
            id: { not: targetId },
          },
        });
        if (otherActiveSuperAdmins === 0) {
          return NextResponse.json({
            success: false,
            error: 'ไม่สามารถเปลี่ยนสิทธิ์หรือปิดการใช้งาน Super Admin คนสุดท้ายของระบบได้',
          }, { status: 400 });
        }
      }
    }

    // Verify email uniqueness if changed
    if (email !== existing.email) {
      const duplicate = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (duplicate && duplicate.id !== targetId) {
        return NextResponse.json({ success: false, error: `อีเมล "${email}" ถูกใช้งานแล้วโดยผู้ใช้อื่น` }, { status: 400 });
      }
    }

    // Verify role exists
    const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
    if (!roleExists) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทบาทที่ระบุในระบบ' }, { status: 400 });
    }

    // Password reset if provided
    let passwordHash: string | undefined = undefined;
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
      }
      passwordHash = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        fullName,
        email,
        roleId,
        isActive,
        ...(passwordHash ? { passwordHash } : {}),
      },
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
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `บันทึกข้อมูลผู้ใช้งาน "${updated.fullName}" เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้งาน' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden: เฉพาะผู้ดูแลระบบสูงสุดเท่านั้น' }, { status: 403 });
  }

  const { id } = await params;
  const targetId = parseInt(id, 10);
  if (isNaN(targetId)) {
    return NextResponse.json({ success: false, error: 'รหัสผู้ใช้งานไม่ถูกต้อง' }, { status: 400 });
  }

  if (session.id === targetId) {
    return NextResponse.json({ success: false, error: 'ไม่อนุญาตให้ลบบัญชีที่คุณกำลังใช้งานอยู่' }, { status: 400 });
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        role: true,
        _count: {
          select: {
            taxPayments: true,
            followUpLogs: true,
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้งานที่ต้องการลบ' }, { status: 404 });
    }

    // Check if target is SUPER_ADMIN and is the only one
    if (target.role.name === 'SUPER_ADMIN') {
      const otherActiveSuperAdmins = await prisma.user.count({
        where: {
          roleId: target.roleId,
          isActive: true,
          id: { not: targetId },
        },
      });
      if (otherActiveSuperAdmins === 0) {
        return NextResponse.json({
          success: false,
          error: 'ไม่สามารถลบ Super Admin คนสุดท้ายของระบบได้',
        }, { status: 400 });
      }
    }

    const hasRelatedRecords = target._count.taxPayments > 0 || target._count.followUpLogs > 0;

    if (hasRelatedRecords) {
      // Soft deactivate instead of hard delete to preserve audit history
      await prisma.user.update({
        where: { id: targetId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `ผู้ใช้งาน "${target.fullName}" มีประวัติการบันทึกรายการภาษี/ทวงถามในระบบ จึงได้เปลี่ยนสถานะเป็น "ปิดใช้งาน" แทนการลบถาวรเพื่อรักษาประวัติงาน`,
        isDeactivated: true,
      });
    }

    // Hard delete if no associated records
    await prisma.user.delete({
      where: { id: targetId },
    });

    return NextResponse.json({
      success: true,
      message: `ลบผู้ใช้งาน "${target.fullName}" ออกจากระบบเรียบร้อยแล้ว`,
      isDeleted: true,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' }, { status: 500 });
  }
}
