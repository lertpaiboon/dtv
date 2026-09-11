import type { Metadata } from 'next';
import { Prompt, Outfit } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollObserver from '@/components/ScrollObserver';

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://deethavorn.com'),
  title: 'ดีถาวรการบัญชี | รับทำบัญชี วางแผนภาษี ตรวจสอบบัญชี จดทะเบียนธุรกิจ',
  description:
    'บริษัท ดีถาวรการบัญชี จำกัด ให้บริการด้านบัญชีและภาษีครบวงจร ตรวจสอบบัญชีโดยผู้สอบบัญชีรับอนุญาต (CPA) จดทะเบียนธุรกิจ บริหารบุคคล เริ่มต้น 1,000 บาท/เดือน ติดต่อ 091-941-5656 หรือ 099-149-5656 (ใกล้ MRT เพชรบุรี)',
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
    url: 'https://deethavorn.com',
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
      'ยกระดับธุรกิจของคุณด้วยบริการมาตรฐานวิชาชีพในราคายุติธรรมและโปร่งใส เริ่มต้น 1,000 บาท/เดือน',
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
    'image': 'https://deethavorn.com/images/logo.png',
    'telephone': ['091-941-5656', '099-149-5656'],
    'email': ['dtv_accounting@hotmail.com', 'c.pimmphisa@gmail.com'],
    'url': 'https://deethavorn.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '234/116 ถนนอโศก-ดินแดง',
      'addressLocality': 'แขวงบางกะปิ เขตห้วยขวาง',
      'addressRegion': 'กรุงเทพมหานคร',
      'postalCode': '10310',
      'addressCountry': 'TH'
    },
    'priceRange': '1,000 - 15,000 THB',
    'openingHours': 'Mo-Sa 08:30-18:00',
    'sameAs': [
      'https://pitchayakarnpa.wixstudio.com/deethavorndesign4'
    ]
  };

  return (
    <html lang="th" className={`${prompt.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <ScrollObserver />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
