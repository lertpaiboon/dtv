import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { validateArticlePayload } from '@/lib/articles/validation';
import { ArticleStatus } from '@prisma/client';
import { submitToIndexNow } from '@/lib/seo/indexnow';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.PUBLISH)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์เผยแพร่บทความ' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ success: false, error: 'รหัสบทความไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true, reviewer: true },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทความ' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action || 'publish';

    if (action === 'unpublish') {
      const updated = await prisma.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.DRAFT },
      });
      try {
        revalidatePath('/knowledge');
        revalidatePath(`/knowledge/${article.slug}`);
      } catch (e) {
        console.warn('Revalidation warning:', e);
      }
      return NextResponse.json({
        success: true,
        data: updated,
        message: `ระงับการเผยแพร่บทความ "${article.title}" และย้ายกลับไปเป็น DRAFT เรียบร้อยแล้ว`,
      });
    }

    if (action === 'archive') {
      const updated = await prisma.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.ARCHIVED },
      });
      try {
        revalidatePath('/knowledge');
        revalidatePath(`/knowledge/${article.slug}`);
      } catch (e) {
        console.warn('Revalidation warning:', e);
      }
      return NextResponse.json({
        success: true,
        data: updated,
        message: `จัดเก็บบทความ "${article.title}" เป็น ARCHIVED เรียบร้อยแล้ว`,
      });
    }

    // Default: publish action
    // Validate publishing readiness
    const validation = validateArticlePayload(
      {
        title: article.title,
        slug: article.slug,
        category: article.category,
        summary: article.summary,
        contentMarkdown: article.contentMarkdown,
        coverImage: article.coverImage,
        coverImageAlt: article.coverImageAlt,
        quickAnswer: article.quickAnswer,
        authorId: article.authorId,
      },
      true // isPublishing check
    );

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถเผยแพร่บทความได้เนื่องจากข้อมูลยังไม่ครบถ้วน: ${validation.errors.join(', ')}`,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: article.publishedAt ?? now,
        contentUpdatedAt: now,
      },
      include: {
        author: true,
        reviewer: true,
      },
    });

    // Asynchronously ping IndexNow search engines (Bing, Yandex, etc.)
    submitToIndexNow([`/knowledge/${article.slug}`]).catch((err) =>
      console.error('Async IndexNow publish notification failed:', err)
    );

    try {
      revalidatePath('/knowledge');
      revalidatePath(`/knowledge/${article.slug}`);
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `เผยแพร่บทความ "${article.title}" สู่สาธารณะ (PUBLISHED) สำเร็จแล้ว สามารถเข้าชมได้ที่ /knowledge/${article.slug}`,
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการเผยแพร่บทความ' }, { status: 500 });
  }
}
