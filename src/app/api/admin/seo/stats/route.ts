import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@prisma/client';

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
    const now = new Date();

    const [
      articles,
      indexingLogs,
      customRedirects,
      articleRedirects,
      error404Logs,
    ] = await Promise.all([
      prisma.article.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          status: true,
          focusKeyword: true,
          seoScore: true,
          nextReviewAt: true,
          publishedAt: true,
          contentUpdatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.indexingLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customRedirect.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.articleRedirect.findMany({
        include: { article: { select: { title: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.errorLog404.findMany({
        take: 20,
        orderBy: { hits: 'desc' },
      }),
    ]);

    const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
    const draftArticles = articles.filter((a) => a.status === ArticleStatus.DRAFT);
    const archivedArticles = articles.filter((a) => a.status === ArticleStatus.ARCHIVED);

    // Calculate SEO scores
    const totalPublishedWithScore = publishedArticles.filter((a) => (a.seoScore || 0) > 0);
    const averageScore = totalPublishedWithScore.length > 0
      ? Math.round(
          totalPublishedWithScore.reduce((acc, curr) => acc + (curr.seoScore || 0), 0) /
            totalPublishedWithScore.length
        )
      : 75;

    const goodScoreCount = publishedArticles.filter((a) => (a.seoScore || 0) >= 80).length;
    const fairScoreCount = publishedArticles.filter((a) => (a.seoScore || 0) >= 60 && (a.seoScore || 0) < 80).length;
    const poorScoreCount = publishedArticles.filter((a) => (a.seoScore || 0) < 60).length;

    // Review Due Alerts (articles where nextReviewAt <= now or within 14 days)
    const reviewDueArticles = publishedArticles.filter((a) => {
      if (!a.nextReviewAt) return false;
      const reviewDate = new Date(a.nextReviewAt);
      const diffDays = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 14;
    });

    const totalCustomRedirectHits = customRedirects.reduce((acc, curr) => acc + curr.hits, 0);
    const total404Hits = error404Logs.reduce((acc, curr) => acc + curr.hits, 0);
    const unresolved404Count = error404Logs.filter((e) => !e.isResolved).length;

    // Sitemap stats: 2 static routes + published articles
    const sitemapUrlCount = 2 + publishedArticles.length;

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          averageScore,
          publishedCount: publishedArticles.length,
          draftCount: draftArticles.length,
          archivedCount: archivedArticles.length,
          goodScoreCount,
          fairScoreCount,
          poorScoreCount,
          reviewDueCount: reviewDueArticles.length,
          totalRedirects: customRedirects.length + articleRedirects.length,
          totalRedirectHits: totalCustomRedirectHits,
          unresolved404Count,
          total404Hits,
          sitemapUrlCount,
          lastIndexingTime: indexingLogs[0]?.createdAt || null,
          totalIndexPings: indexingLogs.length,
        },
        articles,
        reviewDueArticles,
        indexingLogs,
        customRedirects,
        articleRedirects,
        error404Logs,
      },
    });
  } catch (error: any) {
    console.error('Error fetching SEO stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
