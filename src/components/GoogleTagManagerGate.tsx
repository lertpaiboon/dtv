'use client';

import { usePathname } from 'next/navigation';
import { GoogleTagManager } from '@next/third-parties/google';

interface GoogleTagManagerGateProps {
  gtmId?: string;
}

export default function GoogleTagManagerGate({ gtmId }: GoogleTagManagerGateProps) {
  const pathname = usePathname();

  if (!gtmId) return null;
  if (pathname && pathname.startsWith('/admin')) return null;

  return <GoogleTagManager gtmId={gtmId} />;
}
