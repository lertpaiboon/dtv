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

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.REVIEW)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ตรวจอนุมัติบทความ' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ success: false, error: 'รหัสบทความไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, status: true, reviewerId: true },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทความ' }, { status: 404 });
    }

    let reviewerId = article.reviewerId;
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.reviewerId) {
        reviewerId = Number(body.reviewerId);
      }
    } catch {
      // body is optional
    }

    // If reviewerId not set, check if we have CPA reviewer (like Khun Wichian id=1) or active reviewer
    if (!reviewerId) {
      const defaultReviewer = await prisma.author.findFirst({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });
      if (defaultReviewer) {
        reviewerId = defaultReviewer.id;
      }
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.APPROVED,
        reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        reviewer: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `อนุมัติบทความ "${article.title}" เรียบร้อยแล้ว (สถานะ: APPROVED พร้อมสำหรับการเผยแพร่)`,
    });
  } catch (error) {
    console.error('Error approving article:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการอนุมัติบทความ' }, { status: 500 });
  }
}
