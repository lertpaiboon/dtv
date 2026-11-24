import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeRedirectSource, resolveServerRedirect } from '@/lib/seo/redirects';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_RATE_LIMIT_ENTRIES = 2000;
const MAX_STORED_404_ROWS = 5000;
const logRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (logRateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    for (const [k, v] of logRateLimitMap.entries()) {
      if (v.resetAt <= now) logRateLimitMap.delete(k);
    }
    while (logRateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = logRateLimitMap.keys().next().value;
      if (oldestKey === undefined) break;
      logRateLimitMap.delete(oldestKey);
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
        req.headers.get('x-real-ip') ||
        req.headers.get('x-forwarded-for')?.split(',').pop() ||
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
    const safeReferrer = referrer ? String(referrer).slice(0, 500) : undefined;

    const existingLog = await prisma.errorLog404.findUnique({
      where: { url: cleanUrl },
      select: { id: true },
    });

    if (existingLog) {
      await prisma.errorLog404.update({
        where: { id: existingLog.id },
        data: {
          hits: { increment: 1 },
          referrer: safeReferrer,
          userAgent: userAgent || undefined,
          ipAddress: ipAddress || undefined,
          isResolved: false,
        },
      });
    } else {
      const totalRows = await prisma.errorLog404.count();
      if (totalRows < MAX_STORED_404_ROWS) {
        await prisma.errorLog404.create({
          data: {
            url: cleanUrl,
            referrer: safeReferrer,
            userAgent,
            ipAddress,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
