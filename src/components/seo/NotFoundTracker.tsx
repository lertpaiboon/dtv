'use client';

import { useEffect } from 'react';

export default function NotFoundTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;
    const referrer = document.referrer || '';

    fetch('/api/seo/log-404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: path, referrer }),
    })
      .then((res) => res.json())
      .then((data) => {
        const target = data?.redirect?.targetPath;
        if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
          window.location.replace(target);
        }
      })
      .catch(() => null);
  }, []);

  return null;
}
