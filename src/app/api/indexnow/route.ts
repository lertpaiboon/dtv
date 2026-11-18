import { NextResponse } from 'next/server';
import { INDEXNOW_KEY } from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!INDEXNOW_KEY) {
    return new NextResponse('IndexNow key not configured', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new NextResponse(INDEXNOW_KEY, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
