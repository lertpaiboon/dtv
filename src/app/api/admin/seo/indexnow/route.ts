import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { submitToIndexNow } from '@/lib/seo/indexnow';
import { getAllCanonicalSitemapUrls } from '@/lib/seo/sitemap-urls';

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
      targetUrls = await getAllCanonicalSitemapUrls();
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
  } catch (error) {
    console.error('Error submitting to IndexNow:', error);
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถส่งคำขอแจ้งดัชนีได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
