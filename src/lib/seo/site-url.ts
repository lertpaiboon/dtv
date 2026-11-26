/**
 * Canonical Site URL Configuration
 * Single source of truth for all SEO, Canonical, OpenGraph, Schema, Sitemap, and IndexNow calls.
 * Production canonical domain is strictly https://www.deethavorn.com (with www)
 */

export const DEFAULT_SITE_URL = 'https://www.deethavorn.com';

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return url.replace(/\/+$/, '');
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return getSiteUrl();
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${cleanPath}`;
}

export function normalizeAuthorSameAsUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host === 'deethavorn.com' || host === 'www.deethavorn.com') {
      const siteUrl = getSiteUrl();
      if ((parsed.pathname === '/' || parsed.pathname === '') && parsed.hash.toLowerCase() === '#why-us') {
        return `${siteUrl}/about`;
      }
      const suffix =
        parsed.pathname === '/' && !parsed.search && !parsed.hash
          ? '/'
          : `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return `${siteUrl}${suffix}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function normalizeAuthorSameAs(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const nextUrl = normalizeAuthorSameAsUrl(trimmed);
    if (!seen.has(nextUrl)) {
      seen.add(nextUrl);
      normalized.push(nextUrl);
    }
  }

  return normalized.length > 0 ? normalized : undefined;
}
