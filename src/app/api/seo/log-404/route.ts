import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url, referrer } = await req.json().catch(() => ({}));
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const cleanUrl = url.trim().slice(0, 500);

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
    const redirectMatch = await prisma.customRedirect.findUnique({
      where: { sourcePath: cleanUrl },
    });

    if (redirectMatch && redirectMatch.isActive) {
      // Record hit for redirect
      await prisma.customRedirect.update({
        where: { id: redirectMatch.id },
        data: {
          hits: { increment: 1 },
          lastHitAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        redirect: {
          targetPath: redirectMatch.targetPath,
          statusCode: redirectMatch.statusCode,
        },
      });
    }

    // Upsert 404 error log
    await prisma.errorLog404.upsert({
      where: { url: cleanUrl },
      update: {
        hits: { increment: 1 },
        referrer: referrer ? String(referrer).slice(0, 500) : undefined,
        isResolved: false,
      },
      create: {
        url: cleanUrl,
        referrer: referrer ? String(referrer).slice(0, 500) : undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
