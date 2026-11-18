import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function createHealthResponse() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function GET() {
  return createHealthResponse();
}

export async function HEAD() {
  return createHealthResponse();
}
