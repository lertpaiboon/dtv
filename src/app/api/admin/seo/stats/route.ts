import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleStatus } from '@prisma/client';

import { getIndexableArticles } from '@/lib/articles/queries';
import { getIndexNowKeyPath } from '@/lib/seo/indexnow';

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
      totalIndexLogsCount,
      customRedirects,
      customRedirectsCount,
      customRedirectsHitsAggregate,
      articleRedirects,
      articleRedirectsCount,
      error404Logs,
      unresolved404Count,
      total404HitsAggregate,
      indexableArticles,
      activeAuthorsCount,
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
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.indexingLog.count(),
      prisma.customRedirect.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customRedirect.count({ where: { isActive: true } }),
      prisma.customRedirect.aggregate({ _sum: { hits: true } }),
      prisma.articleRedirect.findMany({
        include: { article: { select: { title: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.articleRedirect.count(),
      prisma.errorLog404.findMany({
        take: 30,
        orderBy: { hits: 'desc' },
      }),
      prisma.errorLog404.count({ where: { isResolved: false } }),
      prisma.errorLog404.aggregate({ _sum: { hits: true } }),
      getIndexableArticles(),
      prisma.author.count({ where: { isActive: true } }),
    ]);

    const publishedArticles = articles.filter((a) => a.status === ArticleStatus.PUBLISHED);
    const draftArticles = articles.filter((a) => a.status === ArticleStatus.DRAFT);
    const archivedArticles = articles.filter((a) => a.status === ArticleStatus.ARCHIVED);

    // Calculate SEO scores (null if no articles have score yet, avoid fake 75)
    const totalPublishedWithScore = publishedArticles.filter((a) => (a.seoScore || 0) > 0);
    const averageScore =
      totalPublishedWithScore.length > 0
        ? Math.round(
            totalPublishedWithScore.reduce((acc, curr) => acc + (curr.seoScore || 0), 0) /
              totalPublishedWithScore.length
          )
        : null;

    const goodScoreCount = publishedArticles.filter((a) => (a.seoScore || 0) >= 80).length;
    const fairScoreCount = publishedArticles.filter(
      (a) => (a.seoScore || 0) >= 60 && (a.seoScore || 0) < 80
    ).length;
    const poorScoreCount = publishedArticles.filter((a) => (a.seoScore || 0) < 60).length;

    // Review Due Alerts (articles where nextReviewAt <= now or within 14 days)
    const reviewDueArticles = publishedArticles.filter((a) => {
      if (!a.nextReviewAt) return false;
      const reviewDate = new Date(a.nextReviewAt);
      const diffDays = Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 14;
    });

    const totalCustomRedirectHits = customRedirectsHitsAggregate._sum.hits || 0;
    const total404Hits = total404HitsAggregate._sum.hits || 0;

    // Sitemap stats: 3 static routes (/, /knowledge, /privacy-policy) + strictly indexable articles + active author profiles
    const sitemapUrlCount = 3 + indexableArticles.length + activeAuthorsCount;

    return NextResponse.json({
      success: true,
      data: {
        indexNowKeyPath: getIndexNowKeyPath(),
        kpi: {
          averageScore,
          publishedCount: publishedArticles.length,
          draftCount: draftArticles.length,
          archivedCount: archivedArticles.length,
          goodScoreCount,
          fairScoreCount,
          poorScoreCount,
          reviewDueCount: reviewDueArticles.length,
          totalRedirects: customRedirectsCount + articleRedirectsCount,
          totalRedirectHits: totalCustomRedirectHits,
          unresolved404Count,
          total404Hits,
          sitemapUrlCount,
          lastIndexingTime: indexingLogs[0]?.createdAt || null,
          totalIndexPings: totalIndexLogsCount,
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
