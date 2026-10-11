import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { hasArticlePermission, ARTICLE_PERMISSIONS } from '@/lib/articles/permissions';
import { prisma } from '@/lib/prisma';
import { slugify, validateArticlePayload } from '@/lib/articles/validation';
import { ArticleStatus, Prisma } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.VIEW)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์ดูรายการบทความ' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const statusParam = searchParams.get('status')?.trim().toUpperCase();
    const categoryParam = searchParams.get('category')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    if (statusParam && statusParam !== 'ALL' && Object.values(ArticleStatus).includes(statusParam as ArticleStatus)) {
      where.status = statusParam as ArticleStatus;
    }

    if (categoryParam && categoryParam !== 'ALL') {
      where.category = categoryParam;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    // Parallel fetch: articles list, total count, counts by status, and active authors
    const [articles, totalCount, statusCountsGroup, authors] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }],
        include: {
          author: { select: { id: true, name: true, role: true } },
          reviewer: { select: { id: true, name: true, role: true } },
          _count: { select: { faqs: true, citations: true, redirects: true } },
        },
      }),
      prisma.article.count({ where }),
      prisma.article.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.author.findMany({
        where: { isActive: true },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const stats: Record<string, number> = {
      TOTAL: 0,
      DRAFT: 0,
      IN_REVIEW: 0,
      APPROVED: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    let allTotal = 0;
    for (const group of statusCountsGroup) {
      stats[group.status] = group._count._all;
      allTotal += group._count._all;
    }
    stats.TOTAL = allTotal;

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats,
      authors,
    });
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการโหลดรายการบทความ' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasArticlePermission(session, ARTICLE_PERMISSIONS.CREATE)) {
    return NextResponse.json({ success: false, error: 'Forbidden: ไม่มีสิทธิ์สร้างบทความใหม่' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const title = (body.title || '').trim();
    let slug = (body.slug || '').trim();

    if (!slug) {
      slug = slugify(title);
    } else {
      slug = slugify(slug);
    }

    const validation = validateArticlePayload({
      title,
      slug,
      category: body.category,
      summary: body.summary,
      contentMarkdown: body.contentMarkdown,
      coverImage: body.coverImage,
      coverImageAlt: body.coverImageAlt,
      quickAnswer: body.quickAnswer,
      authorId: body.authorId ? Number(body.authorId) : null,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join('; '), errors: validation.errors },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Slug "${slug}" ถูกใช้งานแล้ว กรุณาระบุชื่อ URL Slug ใหม่` },
        { status: 400 }
      );
    }

    // Check if redirect already exists with this slug
    const existingRedirect = await prisma.articleRedirect.findUnique({
      where: { fromSlug: slug },
    });
    if (existingRedirect) {
      return NextResponse.json(
        {
          success: false,
          error: `Slug "${slug}" เคยถูกใช้เป็น URL เก่าที่มีการส่งต่อ (301 Redirect) กรุณาระบุชื่อ Slug อื่น`,
        },
        { status: 400 }
      );
    }

    const faqs = Array.isArray(body.faqs)
      ? body.faqs
          .filter((f: any) => f && f.question?.trim() && f.answer?.trim())
          .map((f: any, idx: number) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
            sortOrder: typeof f.sortOrder === 'number' ? f.sortOrder : idx,
          }))
      : [];

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
      : [];

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        category: body.category.trim(),
        summary: (body.summary || '').trim(),
        contentMarkdown: body.contentMarkdown || '',
        coverImage: body.coverImage || null,
        coverImageAlt: body.coverImageAlt || null,
        quickAnswer: body.quickAnswer || null,
        status: ArticleStatus.DRAFT,
        focusKeyword: body.focusKeyword ? body.focusKeyword.trim() : null,
        seoScore: typeof body.seoScore === 'number' ? body.seoScore : 0,
        isNoIndex: Boolean(body.isNoIndex),
        canonicalUrl: body.canonicalUrl ? body.canonicalUrl.trim() : null,
        ogImage: body.ogImage ? body.ogImage.trim() : null,
        authorId: body.authorId ? Number(body.authorId) : null,
        reviewerId: body.reviewerId ? Number(body.reviewerId) : null,
        nextReviewAt: body.nextReviewAt ? new Date(body.nextReviewAt) : null,
        faqs: {
          create: faqs,
        },
        citations: {
          create: citations,
        },
      },
      include: {
        author: true,
        reviewer: true,
        faqs: true,
        citations: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
      message: 'สร้างบทความฉบับร่าง (Draft) เรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการสร้างบทความ' }, { status: 500 });
  }
}
