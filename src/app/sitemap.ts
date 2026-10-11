import { MetadataRoute } from 'next';
import { getIndexableArticles, getAllActiveAuthors } from '@/lib/articles/queries';
import { getSiteUrl } from '@/lib/seo/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // 1. Fetch strictly indexable articles and active author profiles
  const [articles, authors] = await Promise.all([
    getIndexableArticles(),
    getAllActiveAuthors(),
  ]);

  // Determine a realistic, stable lastModified date based on the latest article update
  const latestArticleDate =
    articles.length > 0
      ? new Date(articles[0].contentUpdatedAt || articles[0].publishedAt)
      : new Date('2026-10-11T00:00:00.000Z');

  // 2. Static Canonical Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: latestArticleDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 3. Dynamic Published Articles
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/knowledge/${article.slug}`,
    lastModified: new Date(article.contentUpdatedAt || article.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Dynamic Active Author Profiles (E-E-A-T)
  const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: latestArticleDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...authorRoutes];
}

