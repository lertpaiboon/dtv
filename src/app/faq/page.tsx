import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import FAQ, { defaultFaqs, FaqItem } from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';
import { prisma } from '@/lib/prisma';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'คำถามที่พบบ่อย (FAQ) ก่อนใช้บริการทำบัญชีและยื่นภาษี | ดีถาวรการบัญชี',
  description:
    'รวมคำตอบเรื่องการทำบัญชีรายเดือน ค่าบริการเริ่มต้น การส่งเอกสาร การย้ายสำนักงานบัญชีกลางปี และเวลาทำการของดีถาวรการบัญชี ย่านอโศก–ดินแดง ใกล้ MRT เพชรบุรี',
  alternates: {
    canonical: toAbsoluteUrl('/faq'),
  },
};

async function getFaqs(): Promise<FaqItem[]> {
  if (!process.env.DATABASE_URL) return defaultFaqs;
  try {
    const rows = await prisma.faq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (rows.length === 0) return defaultFaqs;
    return rows.map((r) => ({ q: r.question, a: r.answer }));
  } catch {
    return defaultFaqs;
  }
}

export default async function FaqPage() {
  const faqItems = await getFaqs();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">คำถามที่พบบ่อย</span>
          </nav>
          <p className="page-hero__kicker">คำถามที่พบบ่อย (FAQ)</p>
          <h1>เตรียมตัวอย่างไร ก่อนใช้บริการ</h1>
          <p className="page-hero__lead">
            รวบรวมคำถามที่เจ้าของกิจการ SME ฟรีแลนซ์ และผู้ที่ต้องการย้ายสำนักงานบัญชีสอบถามเข้ามาบ่อยที่สุด หากต้องการปรึกษาเพิ่มเติมสามารถโทรหรือทัก LINE คุยกับทีมงานได้โดยตรง
          </p>
        </div>
      </section>

      <FAQ items={faqItems} />
      <ContactForm />
    </>
  );
}
