import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeRedirectSource, sanitizeRedirectTarget } from '@/lib/seo/redirects';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'article:view') && !hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const logs = await prisma.errorLog404.findMany({
      orderBy: { hits: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'article:edit') && !hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, logId, targetPath } = body;

    if (action === 'convert_to_redirect') {
      const log = await prisma.errorLog404.findUnique({
        where: { id: Number(logId) },
      });

      if (!log) {
        return NextResponse.json({ success: false, error: 'ไม่พบรายการ 404 นี้' }, { status: 404 });
      }

      if (!targetPath) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุ URL ปลายทาง' }, { status: 400 });
      }

      const normSource = normalizeRedirectSource(log.url);
      const normTarget = sanitizeRedirectTarget(String(targetPath));

      if (!normTarget) {
        return NextResponse.json(
          { success: false, error: 'URL ปลายทางไม่ปลอดภัย ต้องเป็นพาธภายในเว็บไซต์ที่ขึ้นต้นด้วย / เท่านั้น' },
          { status: 400 }
        );
      }

      if (normSource === normTarget) {
        return NextResponse.json(
          { success: false, error: 'URL ต้นทางและปลายทางต้องไม่ซ้ำกัน' },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.customRedirect.upsert({
          where: { sourcePath: normSource },
          update: { targetPath: normTarget, isActive: true },
          create: { sourcePath: normSource, targetPath: normTarget, statusCode: 301 },
        }),
        prisma.errorLog404.update({
          where: { id: Number(logId) },
          data: { isResolved: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `แปลง 404 เป็น 301 Redirect เรียบร้อยแล้ว (${normSource} ➔ ${normTarget})`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'article:edit') && !hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id === 'all_resolved') {
      await prisma.errorLog404.deleteMany({
        where: { isResolved: true },
      });
      return NextResponse.json({ success: true, message: 'ลบประวัติ 404 ที่แก้ไขแล้วเรียบร้อย' });
    }

    if (id) {
      await prisma.errorLog404.delete({
        where: { id: parseInt(id, 10) },
      });
      return NextResponse.json({ success: true, message: 'ลบรายการสำเร็จ' });
    }

    return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
