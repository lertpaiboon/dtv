import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeRedirectSource, resolveServerRedirect } from '@/lib/seo/redirects';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const logRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (logRateLimitMap.size > 2000) {
    for (const [k, v] of logRateLimitMap.entries()) {
      if (v.resetAt <= now) logRateLimitMap.delete(k);
    }
  }
  const entry = logRateLimitMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    logRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    const ipAddress =
      (
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        ''
      )
        .trim()
        .slice(0, 50) || null;

    if (isRateLimited(ipAddress || 'unknown')) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { url, referrer } = await req.json().catch(() => ({}));
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const cleanUrl = normalizeRedirectSource(url);

    // Ignore Next.js internals, static assets, and APIs
    if (
      cleanUrl.startsWith('/_next') ||
      cleanUrl.startsWith('/favicon') ||
      cleanUrl.startsWith('/images') ||
      cleanUrl.startsWith('/api') ||
      cleanUrl.endsWith('.map')
    ) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Check if there is an active custom redirect for this URL
    const redirectMatch = await resolveServerRedirect(cleanUrl);
    if (redirectMatch) {
      return NextResponse.json({
        success: true,
        redirect: redirectMatch,
      });
    }

    const userAgent = req.headers.get('user-agent')?.slice(0, 255) || null;

    // Upsert 404 error log
    await prisma.errorLog404.upsert({
      where: { url: cleanUrl },
      update: {
        hits: { increment: 1 },
        referrer: referrer ? String(referrer).slice(0, 500) : undefined,
        userAgent: userAgent || undefined,
        ipAddress: ipAddress || undefined,
        isResolved: false,
      },
      create: {
        url: cleanUrl,
        referrer: referrer ? String(referrer).slice(0, 500) : undefined,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
