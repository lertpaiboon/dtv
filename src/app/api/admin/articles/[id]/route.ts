import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { slugify, validateArticlePayload } from '@/lib/articles/validation';
import { ArticleStatus } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.VIEW)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ดูรายละเอียดบทความ' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ success: false, error: 'รหัสบทความไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: true,
        reviewer: true,
        faqs: { orderBy: { sortOrder: 'asc' } },
        citations: { orderBy: { sortOrder: 'asc' } },
        redirects: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทความที่ต้องการ' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching article detail:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลบทความ' }, { status: 500 });
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

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.EDIT)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์แก้ไขบทความ' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ success: false, error: 'รหัสบทความไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
      include: { redirects: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทความที่ต้องการแก้ไข' }, { status: 404 });
    }

    const body = await req.json();
    const title = (body.title || existing.title).trim();
    let slug = (body.slug || existing.slug).trim();
    slug = slugify(slug);

    const validation = validateArticlePayload({
      title,
      slug,
      category: body.category || existing.category,
      summary: body.summary ?? existing.summary,
      contentMarkdown: body.contentMarkdown ?? existing.contentMarkdown,
      coverImage: body.coverImage ?? existing.coverImage,
      coverImageAlt: body.coverImageAlt ?? existing.coverImageAlt,
      quickAnswer: body.quickAnswer ?? existing.quickAnswer,
      authorId: body.authorId ? Number(body.authorId) : existing.authorId,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join('; '), errors: validation.errors },
        { status: 400 }
      );
    }

    // Check if slug changed
    let oldSlugToRedirect: string | null = null;
    if (slug !== existing.slug) {
      // Check if new slug is taken by another article
      const duplicateSlug = await prisma.article.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (duplicateSlug && duplicateSlug.id !== articleId) {
        return NextResponse.json(
          { success: false, error: `Slug "${slug}" ถูกใช้งานโดยบทความอื่นแล้ว` },
          { status: 400 }
        );
      }

      // Check if new slug exists in redirects table
      const duplicateRedirect = await prisma.articleRedirect.findUnique({
        where: { fromSlug: slug },
        select: { articleId: true },
      });
      if (duplicateRedirect && duplicateRedirect.articleId !== articleId) {
        return NextResponse.json(
          { success: false, error: `Slug "${slug}" ถูกใช้งานในรายการ 301 Redirect แล้ว` },
          { status: 400 }
        );
      }

      // If the old slug had been published or was previously live, schedule 301 redirect
      oldSlugToRedirect = existing.slug;
    }

    const faqs = Array.isArray(body.faqs)
      ? body.faqs
          .filter((f: any) => f && f.question?.trim() && f.answer?.trim())
          .map((f: any, idx: number) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
            sortOrder: typeof f.sortOrder === 'number' ? f.sortOrder : idx,
          }))
      : null;

    const citations = Array.isArray(body.citations)
      ? body.citations
          .filter((c: any) => c && c.title?.trim() && c.url?.trim())
          .map((c: any, idx: number) => ({
            title: c.title.trim(),
            publisher: c.publisher?.trim() || null,
            url: c.url.trim(),
            referenceDate: c.referenceDate ? new Date(c.referenceDate) : null,
            sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : idx,
          }))
      : null;

    // Use transaction to update article, redirects, faqs, and citations safely
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Create redirect if slug changed
      if (oldSlugToRedirect) {
        await tx.articleRedirect.upsert({
          where: { fromSlug: oldSlugToRedirect },
          create: {
            fromSlug: oldSlugToRedirect,
            articleId,
          },
          update: {
            articleId,
          },
        });
      }

      // 2. Replace FAQs if provided
      if (faqs !== null) {
        await tx.articleFaq.deleteMany({ where: { articleId } });
        if (faqs.length > 0) {
          await tx.articleFaq.createMany({
            data: faqs.map((f: { question: string; answer: string; sortOrder: number }) => ({ ...f, articleId })),
          });
        }
      }

      // 3. Replace Citations if provided
      if (citations !== null) {
        await tx.articleCitation.deleteMany({ where: { articleId } });
        if (citations.length > 0) {
          await tx.articleCitation.createMany({
            data: citations.map((c: { title: string; publisher: string | null; url: string; referenceDate: Date | null; sortOrder: number }) => ({ ...c, articleId })),
          });
        }
      }

      // 4. Update Article fields
      return tx.article.update({
        where: { id: articleId },
        data: {
          title,
          slug,
          category: body.category ? body.category.trim() : existing.category,
          summary: body.summary !== undefined ? body.summary.trim() : existing.summary,
          contentMarkdown: body.contentMarkdown !== undefined ? body.contentMarkdown : existing.contentMarkdown,
          coverImage: body.coverImage !== undefined ? body.coverImage : existing.coverImage,
          coverImageAlt: body.coverImageAlt !== undefined ? body.coverImageAlt : existing.coverImageAlt,
          quickAnswer: body.quickAnswer !== undefined ? body.quickAnswer : existing.quickAnswer,
          focusKeyword: body.focusKeyword !== undefined ? (body.focusKeyword ? body.focusKeyword.trim() : null) : existing.focusKeyword,
          seoScore: typeof body.seoScore === 'number' ? body.seoScore : existing.seoScore,
          isNoIndex: body.isNoIndex !== undefined ? Boolean(body.isNoIndex) : existing.isNoIndex,
          canonicalUrl: body.canonicalUrl !== undefined ? (body.canonicalUrl ? body.canonicalUrl.trim() : null) : existing.canonicalUrl,
          ogImage: body.ogImage !== undefined ? (body.ogImage ? body.ogImage.trim() : null) : existing.ogImage,
          authorId: body.authorId !== undefined ? (body.authorId ? Number(body.authorId) : null) : existing.authorId,
          reviewerId: body.reviewerId !== undefined ? (body.reviewerId ? Number(body.reviewerId) : null) : existing.reviewerId,
          nextReviewAt: body.nextReviewAt !== undefined ? (body.nextReviewAt ? new Date(body.nextReviewAt) : null) : existing.nextReviewAt,
          // If already published, bump contentUpdatedAt
          ...(existing.status === ArticleStatus.PUBLISHED ? { contentUpdatedAt: new Date() } : {}),
        },
        include: {
          author: true,
          reviewer: true,
          faqs: { orderBy: { sortOrder: 'asc' } },
          citations: { orderBy: { sortOrder: 'asc' } },
          redirects: true,
        },
      });
    });

    try {
      revalidatePath('/knowledge');
      revalidatePath(`/knowledge/${updated.slug}`);
      if (oldSlugToRedirect) {
        revalidatePath(`/knowledge/${oldSlugToRedirect}`);
      }
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: oldSlugToRedirect
        ? `บันทึกการแก้ไขเรียบร้อยแล้ว (สร้าง 301 Redirect จาก /knowledge/${oldSlugToRedirect} สู่ URL ใหม่โดยอัตโนมัติ)`
        : 'บันทึกการแก้ไขบทความเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลบทความ' }, { status: 500 });
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

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ success: false, error: 'รหัสบทความไม่ถูกต้อง' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const force = searchParams.get('force') === 'true';

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, title: true },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'ไม่พบบทความที่ต้องการลบ' }, { status: 404 });
    }

    // Hard delete is allowed only if draft, or if super admin passes force=true
    if (article.status === ArticleStatus.DRAFT || (force && session.permissions.includes('*'))) {
      if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.DELETE)) {
        return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ลบบทความ' }, { status: 403 });
      }

      await prisma.article.delete({ where: { id: articleId } });
      try {
        revalidatePath('/knowledge');
      } catch (e) {
        console.warn('Revalidation warning:', e);
      }
      return NextResponse.json({
        success: true,
        message: `ลบบทความ "${article.title}" ถาวรเรียบร้อยแล้ว`,
      });
    }

    // Soft delete / archive
    if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.ARCHIVE)) {
      return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์จัดเก็บบทความ' }, { status: 403 });
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.ARCHIVED },
    });

    try {
      revalidatePath('/knowledge');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: `เปลี่ยนสถานะบทความ "${article.title}" เป็น ARCHIVED (ระงับการเผยแพร่และจัดเก็บ) เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการลบหรือจัดเก็บบทความ' }, { status: 500 });
  }
}
