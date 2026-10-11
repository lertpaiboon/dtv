import type { Metadata } from 'next';
import { Prompt, Outfit } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-prompt',
});

const outfit = Outfit({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
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
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
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
      'https://pitchayakarnpa.wixstudio.com/deethavorndesign4'
    ]
  };

  return (
    <html lang="th" className={`${prompt.variable} ${outfit.variable}`} suppressHydrationWarning>
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
