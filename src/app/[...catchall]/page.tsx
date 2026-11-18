import { notFound } from 'next/navigation';
import { executeServerRedirectIfMatched } from '@/lib/seo/redirects';

export const dynamic = 'force-dynamic';

interface CatchAllPageProps {
  params: Promise<{ catchall: string[] }>;
}

export default async function CatchAllRedirectOrNotFoundPage({ params }: CatchAllPageProps) {
  const { catchall } = await params;
  const sourcePath = '/' + (catchall || []).join('/');

  await executeServerRedirectIfMatched(sourcePath);

  notFound();
}
