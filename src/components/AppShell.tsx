'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollObserver from '@/components/ScrollObserver';
import FloatingLineButton from '@/components/FloatingLineButton';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  if (isAdmin) {
    return <div className="admin-root">{children}</div>;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <ScrollObserver />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingLineButton />
    </>
  );
}
