import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Pricing from '@/components/Pricing';
import WorkProcess from '@/components/WorkProcess';
import FAQ, { defaultFaqs, FaqItem } from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';
import { prisma } from '@/lib/prisma';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'ค่าบริการทำบัญชี ยื่นภาษี จดบริษัท และตรวจสอบบัญชี CPA | ดีถาวรการบัญชี',
  description:
    'อัตราค่าบริการทำบัญชีรายเดือนเริ่มต้น 1,500 บาท/เดือน งานจดทะเบียนธุรกิจเริ่มต้น 1,500 บาท และตรวจสอบบัญชีโดย CPA แจ้งราคาชัดเจนก่อนเริ่มงาน ไม่มีค่ากระดาษหรือค่าปรึกษาแอบแฝง',
  alternates: {
    canonical: toAbsoluteUrl('/pricing'),
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

export default async function PricingPage() {
  const faqItems = await getFaqs();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">ค่าบริการ</span>
          </nav>
          <p className="page-hero__kicker">ราคาโปร่งใส ไม่มีบวกจุกจิก</p>
          <h1>ค่าบริการของ ดีถาวรการบัญชี</h1>
          <p className="page-hero__lead">
            เราดูปริมาณเอกสารจริงต่อเดือนแล้วแจ้งราคาเป็นตัวเลขให้ทราบก่อนเริ่มงานทุกครั้ง ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 หรือค่าปรึกษาภาษีเพิ่มเติมระหว่างสัญญา
          </p>
          <div className="page-hero__actions">
            <Link href="#contact" className="btn btn-primary">
              ขอใบเสนอราคาเฉพาะธุรกิจคุณ
            </Link>
            <a
              href="https://line.me/ti/p/DliAyJfUXd"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
            >
              ส่งข้อมูลประเมินราคาทาง LINE
            </a>
          </div>
        </div>
      </section>

      <Pricing />
      <WorkProcess />
      <FAQ items={faqItems} />
      <ContactForm />
    </>
  );
}
