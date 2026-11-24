import type { Metadata } from 'next';
import localFont from 'next/font/local';
import GoogleTagManagerGate from '@/components/GoogleTagManagerGate';
import './globals.css';
import AppShell from '@/components/AppShell';

const promptThai = localFont({
  src: [
    { path: './fonts/prompt-300-thai.woff2', weight: '300', style: 'normal' },
    { path: './fonts/prompt-400-thai.woff2', weight: '400', style: 'normal' },
    { path: './fonts/prompt-500-thai.woff2', weight: '500', style: 'normal' },
    { path: './fonts/prompt-600-thai.woff2', weight: '600', style: 'normal' },
    { path: './fonts/prompt-700-thai.woff2', weight: '700', style: 'normal' },
    { path: './fonts/prompt-800-thai.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-prompt-thai',
  declarations: [
    {
      prop: 'unicode-range',
      value: 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC',
    },
  ],
});

const promptLatin = localFont({
  src: [
    { path: './fonts/prompt-300-latin.woff2', weight: '300', style: 'normal' },
    { path: './fonts/prompt-400-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/prompt-500-latin.woff2', weight: '500', style: 'normal' },
    { path: './fonts/prompt-600-latin.woff2', weight: '600', style: 'normal' },
    { path: './fonts/prompt-700-latin.woff2', weight: '700', style: 'normal' },
    { path: './fonts/prompt-800-latin.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  variable: '--font-prompt-latin',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

const outfit = localFont({
  src: './fonts/outfit-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
  variable: '--font-outfit',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

import { getSiteUrl, toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'ดีถาวรการบัญชี | รับทำบัญชี วางแผนภาษี ตรวจสอบบัญชี จดทะเบียนธุรกิจ',
  description:
    'บริษัท ดีถาวรการบัญชี จำกัด ให้บริการด้านบัญชีและภาษีครบวงจร ตรวจสอบบัญชีโดยผู้สอบบัญชีรับอนุญาต (CPA) จดทะเบียนธุรกิจ บริหารบุคคล เริ่มต้น 1,500 บาท/เดือน ติดต่อ 099-149-5656 หรือ 091-941-5656 (ใกล้ MRT เพชรบุรี)',
  keywords: [
    'ดีถาวรการบัญชี',
    'รับทำบัญชี',
    'ตรวจสอบบัญชี',
    'วางแผนภาษี',
    'จดทะเบียนบริษัท',
    'จดทะเบียน หจก',
    'สำนักงานบัญชี อโศก ดินแดง',
    'สำนักงานบัญชี MRT เพชรบุรี',
    'ผู้สอบบัญชีรับอนุญาต CPA'
  ],
  authors: [{ name: 'บริษัท ดีถาวรการบัญชี จำกัด' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ดีถาวรการบัญชี | รับทำบัญชี วางแผนภาษี ตรวจสอบบัญชี จดทะเบียนธุรกิจ',
    description:
      'ยกระดับธุรกิจของคุณด้วยบริการมาตรฐานวิชาชีพในราคายุติธรรมและโปร่งใส ครอบคลุมงานบัญชี ภาษี ตรวจสอบบัญชี และจดทะเบียนธุรกิจ',
    url: getSiteUrl(),
    type: 'website',
    locale: 'th_TH',
    siteName: 'ดีถาวรการบัญชี',
    images: [
      {
        url: '/images/logo.png',
        width: 500,
        height: 500,
        alt: 'โลโก้ บริษัท ดีถาวรการบัญชี จำกัด',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'ดีถาวรการบัญชี | รับทำบัญชี วางแผนภาษี ตรวจสอบบัญชี จดทะเบียนธุรกิจ',
    description:
      'ยกระดับธุรกิจของคุณด้วยบริการมาตรฐานวิชาชีพในราคายุติธรรมและโปร่งใส เริ่มต้น 1,500 บาท/เดือน',
    images: ['/images/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    'name': 'บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)',
    'logo': toAbsoluteUrl('/icon-512.png'),
    'image': toAbsoluteUrl('/images/logo.png'),
    'telephone': ['099-149-5656', '091-941-5656'],
    'email': ['dtv_accounting@hotmail.com', 'c.pimmphisa@gmail.com'],
    'url': getSiteUrl(),
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '234/116 ถนนอโศก-ดินแดง',
      'addressLocality': 'แขวงบางกะปิ เขตห้วยขวาง',
      'addressRegion': 'กรุงเทพมหานคร',
      'postalCode': '10310',
      'addressCountry': 'TH'
    },
    'priceRange': '1,500 - 15,000 THB',
    'openingHours': 'Mo-Fr 08:30-17:30',
    'sameAs': [
      'https://www.facebook.com/profile.php?id=61593462960006',
      'https://line.me/ti/p/DliAyJfUXd',
      'https://maps.app.goo.gl/t4gBzzKUVorbciF88'
    ]
  };

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="th" className={`${promptThai.variable} ${promptLatin.variable} ${outfit.variable}`} suppressHydrationWarning>
      <GoogleTagManagerGate gtmId={gtmId} />
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
