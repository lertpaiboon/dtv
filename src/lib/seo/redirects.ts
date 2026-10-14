import { permanentRedirect, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/seo/site-url';

/**
 * Validates and normalizes a redirect target path to prevent Open Redirect / XSS attacks.
 * Allows internal paths starting with a single `/` or full URLs belonging to the canonical site host.
 */
export function sanitizeRedirectTarget(rawTarget: string): string | null {
  if (!rawTarget || typeof rawTarget !== 'string') return null;
  const trimmed = rawTarget.trim();
  if (!trimmed) return null;

  // Disallow dangerous protocols or protocol-relative external URLs
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('//') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return null;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const targetUrl = new URL(trimmed);
      const siteUrl = new URL(getSiteUrl());
      const targetHost = targetUrl.host.toLowerCase().replace(/^www\./, '');
      const siteHost = siteUrl.host.toLowerCase().replace(/^www\./, '');
      if (targetHost !== siteHost) {
        return null;
      }
      return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}` || '/';
    } catch {
      return null;
    }
  }

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized.startsWith('//')) return null;
  return normalized;
}

/**
 * Normalizes a source path for consistent database lookup.
 */
export function normalizeRedirectSource(rawSource: string): string {
  if (!rawSource || typeof rawSource !== 'string') return '/';
  let clean = rawSource.trim();
  try {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      clean = new URL(clean).pathname;
    }
  } catch {
    // Keep raw string if URL parsing fails
  }
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean.slice(0, 500);
}

/**
 * Looks up an active CustomRedirect in the database and increments its hit counter.
 */
export async function resolveServerRedirect(
  rawSourcePath: string
): Promise<{ targetPath: string; statusCode: number } | null> {
  if (!process.env.DATABASE_URL) return null;

  const normalizedSource = normalizeRedirectSource(rawSourcePath);
  const candidatePaths = Array.from(
    new Set([
      normalizedSource,
       (() => {
        try {
          return decodeURIComponent(normalizedSource);
        } catch {
          return normalizedSource;
        }
      })(),
      (() => {
        try {
          return encodeURI( decodeURIComponent(normalizedSource) );
        } catch {
          return normalizedSource;
        }
      })(),
    ])
  );

  try {
    const redirectMatch = await prisma.customRedirect.findFirst({
      where: {
        sourcePath: { in: candidatePaths },
        isActive: true,
      },
    });

    if (!redirectMatch) return null;

    const safeTarget = sanitizeRedirectTarget(redirectMatch.targetPath);
    if (!safeTarget || candidatePaths.includes(safeTarget)) {
      return null;
    }

    await prisma.customRedirect
      .update({
        where: { id: redirectMatch.id },
        data: {
          hits: { increment: 1 },
          lastHitAt: new Date(),
        },
      })
      .catch(() => null);

    return {
      targetPath: safeTarget,
      statusCode: redirectMatch.statusCode === 302 ? 302 : 301,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if a server-side CustomRedirect exists for `sourcePath` and triggers
 * Next.js HTTP redirect (308/301 or 307/302) before rendering a 404 response.
 */
export async function executeServerRedirectIfMatched(sourcePath: string): Promise<void> {
  const match = await resolveServerRedirect(sourcePath);
  if (!match) return;

  if (match.statusCode === 302) {
    redirect(match.targetPath);
  }
  permanentRedirect(match.targetPath);
}
