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
