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
    const [customRedirects, articleRedirects] = await Promise.all([
      prisma.customRedirect.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.articleRedirect.findMany({
        include: {
          article: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customRedirects,
        articleRedirects,
      },
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
    const { sourcePath: rawSource, targetPath: rawTarget, statusCode } = body;

    if (!rawSource || !rawTarget) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอก URL ต้นทาง (Source) และ URL ปลายทาง (Target)' },
        { status: 400 }
      );
    }

    const sourcePath = normalizeRedirectSource(String(rawSource));
    const targetPath = sanitizeRedirectTarget(String(rawTarget));

    if (!targetPath) {
      return NextResponse.json(
        { success: false, error: 'URL ปลายทางไม่ปลอดภัย ต้องเป็นพาธภายในเว็บไซต์ที่ขึ้นต้นด้วย / หรืออยู่ในโดเมนเดียวกันเท่านั้น' },
        { status: 400 }
      );
    }

    if (sourcePath === targetPath) {
      return NextResponse.json(
        { success: false, error: 'URL ต้นทางและปลายทางต้องไม่ซ้ำกัน (ป้องกัน Redirect Loop)' },
        { status: 400 }
      );
    }

    const code = Number(statusCode) === 302 ? 302 : 301;

    const redirectRecord = await prisma.customRedirect.upsert({
      where: { sourcePath },
      update: {
        targetPath,
        statusCode: code,
        isActive: true,
      },
      create: {
        sourcePath,
        targetPath,
        statusCode: code,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: redirectRecord,
      message: `บันทึก ${code} Redirect (${sourcePath} ➔ ${targetPath}) สำเร็จแล้ว`,
    });
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
    const idParam = searchParams.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;

    if (!id || isNaN(id)) {
      return NextResponse.json({ success: false, error: 'รหัส Redirect ไม่ถูกต้อง' }, { status: 400 });
    }

    await prisma.customRedirect.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'ลบรายการ Redirect เรียบร้อยแล้ว',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
