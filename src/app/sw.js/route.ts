import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Self-unregistering Service Worker for localhost cleanup
// If another project previously registered a Service Worker on port 3000,
// this immediately unregisters it to prevent stale cache, 404 logs, and latency.
export async function GET() {
  const script = `
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    })
  );
});
`;

  return new NextResponse(script.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
