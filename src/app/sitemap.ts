import { MetadataRoute } from 'next';
import { buildCanonicalSitemapEntries } from '@/lib/seo/sitemap-urls';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildCanonicalSitemapEntries();
}
