import { notFound } from 'next/navigation';
import { executeServerRedirectIfMatched } from '@/lib/seo/redirects';

export const dynamic = 'force-dynamic';

interface CatchAllPageProps {
  params: Promise<{ catchAll: string[] }>;
}

export default async function CatchAllRedirectOrNotFoundPage({ params }: CatchAllPageProps) {
  const { catchAll } = await params;
  const sourcePath = '/' + (catchAll || []).join('/');

  await executeServerRedirectIfMatched(sourcePath);

  notFound();
}
