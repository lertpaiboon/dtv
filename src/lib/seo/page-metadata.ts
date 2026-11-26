import type { Metadata } from 'next';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export interface PublicPageMetadataInput {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: 'website' | 'profile';
}

const DEFAULT_OG_IMAGE = '/images/logo.png';
const SITE_NAME = 'บริษัท ดีถาวรการบัญชี จำกัด';

/**
 * Builds consistent per-page SEO, Canonical, OpenGraph, and Twitter metadata
 * so child routes never fall back to the homepage's og:url / og:title from layout.tsx.
 */
export function buildPublicPageMetadata({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  type = 'website',
}: PublicPageMetadataInput): Metadata {
  const canonicalUrl = toAbsoluteUrl(path);
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;
  const hasCustomImage = Boolean(image);
  const resolvedImageUrl = toAbsoluteUrl(image || DEFAULT_OG_IMAGE);
  const resolvedWidth = imageWidth ?? (hasCustomImage ? 1200 : 500);
  const resolvedHeight = imageHeight ?? (hasCustomImage ? 630 : 500);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'th_TH',
      type,
      images: [
        {
          url: resolvedImageUrl,
          width: resolvedWidth,
          height: resolvedHeight,
          alt: imageAlt || resolvedOgTitle,
        },
      ],
    },
    twitter: {
      card: hasCustomImage ? 'summary_large_image' : 'summary',
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [resolvedImageUrl],
    },
  };
}
