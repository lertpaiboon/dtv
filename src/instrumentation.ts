/**
 * Next.js Server Instrumentation Hook (enabled natively in Next.js 15).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startServerKeepAlive } = await import('./lib/seo/keepalive');
    startServerKeepAlive();
  }
}
