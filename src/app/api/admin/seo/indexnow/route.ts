import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { submitToIndexNow, getSiteBaseUrl } from '@/lib/seo/indexnow';
import { ArticleStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session, 'article:edit') && !hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { mode, urls } = body;

    let targetUrls: string[] = [];

    if (mode === 'bulk_published') {
      const baseUrl = getSiteBaseUrl();
      const publishedArticles = await prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        select: { slug: true },
      });

      targetUrls = [
        `${baseUrl}/`,
        `${baseUrl}/knowledge`,
        ...publishedArticles.map((a) => `${baseUrl}/knowledge/${a.slug}`),
      ];
    } else if (Array.isArray(urls) && urls.length > 0) {
      targetUrls = urls.map((u: string) => u.trim()).filter(Boolean);
    } else if (typeof urls === 'string' && urls.trim()) {
      targetUrls = [urls.trim()];
    } else {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ URL หรือเลือกโหมด bulk_published' },
        { status: 400 }
      );
    }

    if (targetUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบบทความหรือ URL ที่ต้องการส่งคำขอ' },
        { status: 400 }
      );
    }

    const result = await submitToIndexNow(targetUrls);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error submitting to IndexNow:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
