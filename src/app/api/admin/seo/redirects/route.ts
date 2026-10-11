import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    let { sourcePath, targetPath, statusCode } = body;

    if (!sourcePath || !targetPath) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอก URL ต้นทาง (Source) และ URL ปลายทาง (Target)' },
        { status: 400 }
      );
    }

    // Normalize paths
    sourcePath = sourcePath.trim();
    if (!sourcePath.startsWith('/')) sourcePath = `/${sourcePath}`;

    targetPath = targetPath.trim();
    if (!targetPath.startsWith('/') && !targetPath.startsWith('http')) {
      targetPath = `/${targetPath}`;
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
      message: `บันทึก 301 Redirect (${sourcePath} ➔ ${targetPath}) สำเร็จแล้ว`,
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
