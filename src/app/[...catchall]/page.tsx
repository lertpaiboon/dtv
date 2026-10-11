import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface CatchAllProps {
  params: Promise<{ catchall: string[] }>;
}

/**
 * Server-Side Catch-All Route for:
 * 1. Resolving Custom 301/302 Redirects directly from the server with HTTP Location headers.
 * 2. Resolving Article Slugs that have 301 redirects recorded in article_redirects.
 * 3. Server-side 404 logging into error_logs_404 with User-Agent, IP, and Referrer.
 * 4. Triggering Next.js notFound() with genuine HTTP 404 status.
 */
export default async function CatchAllPage({ params }: CatchAllProps) {
  const { catchall } = await params;
  if (!catchall || catchall.length === 0) {
    notFound();
  }

  const path = '/' + catchall.join('/');

  // 1. Check Custom Redirects table in MySQL (Server-Side)
  try {
    const customRedirect = await prisma.customRedirect.findFirst({
      where: {
        sourcePath: path,
        isActive: true,
      },
    });

    if (customRedirect) {
      // Prevent self-redirect loop
      if (customRedirect.sourcePath !== customRedirect.targetPath) {
        // Increment hits counter in database
        await prisma.customRedirect
          .update({
            where: { id: customRedirect.id },
            data: {
              hits: { increment: 1 },
              lastHitAt: new Date(),
            },
          })
          .catch(() => null);

        // Send genuine Server-Side HTTP Redirect with Location header
        if (customRedirect.statusCode === 301) {
          permanentRedirect(customRedirect.targetPath);
        } else {
          redirect(customRedirect.targetPath);
        }
      }
    }

    // 2. Also check article_redirects table (if someone accessed /knowledge/old-slug)
    if (catchall[0] === 'knowledge' && catchall[1]) {
      const articleRedirect = await prisma.articleRedirect.findUnique({
        where: { fromSlug: catchall[1] },
        include: { article: true },
      });
      if (articleRedirect?.article?.slug) {
        permanentRedirect(`/knowledge/${articleRedirect.article.slug}`);
      }
    }
  } catch (error: any) {
    // If it's a Next.js navigation redirect or notFound, rethrow to let Next.js handle it
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.digest?.startsWith('NEXT_NOT_FOUND')) {
      throw error;
    }
    console.error('Error in catchall redirect resolution:', error);
  }

  // 3. If no redirect matches, log to error_logs_404 on the Server
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent')?.slice(0, 255) || null;
    const ipAddress = (
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      ''
    )
      .trim()
      .slice(0, 50) || null;
    const referrer = headersList.get('referer')?.slice(0, 500) || null;

    // Filter out common scraper spam or internal maps to avoid database bloat
    const isJunk =
      path.endsWith('.php') ||
      path.endsWith('.env') ||
      path.endsWith('.git') ||
      path.endsWith('.map') ||
      path.startsWith('/wp-') ||
      path.startsWith('/.well-known');

    if (!isJunk) {
      await prisma.errorLog404.upsert({
        where: { url: path.slice(0, 500) },
        update: {
          hits: { increment: 1 },
          referrer: referrer || undefined,
          userAgent: userAgent || undefined,
          ipAddress: ipAddress || undefined,
          isResolved: false,
        },
        create: {
          url: path.slice(0, 500),
          referrer,
          userAgent,
          ipAddress,
        },
      });
    }
  } catch (e) {
    console.error('Error logging 404 in catchall:', e);
  }

  // 4. Render 404 Not Found
  notFound();
}
