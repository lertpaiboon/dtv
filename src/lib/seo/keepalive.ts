import { getSiteUrl } from '@/lib/seo/site-url';

const KEEPALIVE_INTERVAL_MS = 210_000;

/**
 * Starts a background keep-alive ping against `/api/health` every 3.5 minutes
 * in production to prevent Phusion Passenger idle pool suspension before Googlebot visits.
 */
export function startServerKeepAlive(): void {
  const g = globalThis as typeof globalThis & { __dtvKeepAliveStarted?: boolean };

  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.DISABLE_KEEPALIVE === 'true' ||
    g.__dtvKeepAliveStarted
  ) {
    return;
  }

  g.__dtvKeepAliveStarted = true;
  const healthUrl = `${getSiteUrl()}/api/health`;

  const timer = setInterval(() => {
    fetch(healthUrl, {
      headers: {
        'User-Agent': 'Deethavorn-KeepAlive/1.0',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(8000),
    }).catch(() => {});
  }, KEEPALIVE_INTERVAL_MS);

  timer.unref?.();
}
