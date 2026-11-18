import { MetadataRoute } from 'next';
import { getIndexableArticles, getAllActiveAuthors } from '@/lib/articles/queries';
import { getSiteUrl } from '@/lib/seo/site-url';
import { SUB_SERVICES } from '@/lib/services/sub-services-data';

/**
 * Builds the canonical list of indexable sitemap entries for deethavorn.com.
 * Shared between `/sitemap.xml` and the Admin Bulk Instant Indexing dispatcher.
 */
export async function buildCanonicalSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // 1. Fetch strictly indexable articles and active author profiles
  const [articles, authors] = await Promise.all([
    getIndexableArticles().catch(() => []),
    getAllActiveAuthors().catch(() => []),
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
      url: `${baseUrl}/services`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/services/accounting-tax`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/audit`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/business-registration`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services/hr-payroll`,
      lastModified: latestArticleDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: latestArticleDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: latestArticleDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: latestArticleDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: latestArticleDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/knowledge`,
      lastModified: latestArticleDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: latestArticleDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 3. Dynamic 16 Sub-Service Pages
  const subServiceRoutes: MetadataRoute.Sitemap = SUB_SERVICES.map((sub) => ({
    url: `${baseUrl}/services/${sub.slug}`,
    lastModified: latestArticleDate,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  // 4. Dynamic Published Articles
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/knowledge/${article.slug}`,
    lastModified: new Date(article.contentUpdatedAt || article.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 5. Dynamic Active Author Profiles (E-E-A-T)
  const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: latestArticleDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const allEntries = [...staticRoutes, ...subServiceRoutes, ...articleRoutes, ...authorRoutes];
  const seen = new Set<string>();
  return allEntries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

/**
 * Returns all canonical URLs included in the XML sitemap.
 */
export async function getAllCanonicalSitemapUrls(): Promise<string[]> {
  const entries = await buildCanonicalSitemapEntries();
  return entries.map((entry) => entry.url);
}
