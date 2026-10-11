import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.EDIT)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ส่งตรวจบทความ' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ success: false, error: 'รหัสบทความไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, status: true, authorId: true },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทความ' }, { status: 404 });
    }

    if (article.status !== ArticleStatus.DRAFT && article.status !== ArticleStatus.ARCHIVED) {
      return NextResponse.json(
        { success: false, error: `ไม่สามารถส่งตรวจได้เนื่องจากสถานะปัจจุบันคือ ${article.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.IN_REVIEW },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `ส่งบทความ "${article.title}" เข้าสู่สถานะรอการตรวจสอบ (IN_REVIEW) เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error submitting article for review:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการส่งตรวจบทความ' }, { status: 500 });
  }
}
