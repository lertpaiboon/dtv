import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import WhyUs from '@/components/WhyUs';
import QuoteBand from '@/components/QuoteBand';
import CustomerReviews, { defaultCustomerReviews, CustomerReviewItem } from '@/components/CustomerReviews';
import WorkProcess from '@/components/WorkProcess';
import ContactForm from '@/components/ContactForm';
import { prisma } from '@/lib/prisma';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'ทำไมต้องดีถาวรการบัญชี | สำนักงานบัญชี อโศก–ดินแดง ใกล้ MRT เพชรบุรี',
  description:
    'ทำไมธุรกิจย่านอโศก–ดินแดงเลือกดีถาวรการบัญชี แจ้งราคาเป็นตัวเลขก่อนเริ่มงาน คืนใบเสร็จภาษีตัวจริงจากกรมสรรพากรทุกเดือน และตรวจสอบงบประจำปีโดยผู้สอบบัญชีรับอนุญาต (CPA)',
  alternates: {
    canonical: toAbsoluteUrl('/about'),
  },
};

async function getActiveReviews(): Promise<CustomerReviewItem[]> {
  if (!process.env.DATABASE_URL) return defaultCustomerReviews;
  try {
    const rows = await prisma.customerReview.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (rows.length === 0) return defaultCustomerReviews;
    return rows.map((r) => ({
      id: r.id,
      headline: r.headline,
      quote: r.quote,
      authorName: r.authorName,
      authorImage: r.authorImage,
      companyName: r.companyName,
      businessType: r.businessType,
      rating: r.rating,
      sourceUrl: r.sourceUrl,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
    }));
  } catch {
    return defaultCustomerReviews;
  }
}

export default async function AboutPage() {
  const reviewItems = await getActiveReviews();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">ทำไมต้องดีถาวร</span>
          </nav>
          <p className="page-hero__kicker">เกี่ยวกับ บริษัท ดีถาวรการบัญชี จำกัด</p>
          <h1>ทำไมธุรกิจย่านอโศก เลือกดีถาวรการบัญชี</h1>
          <p className="page-hero__lead">
            เราเชื่อว่าความสบายใจของเจ้าของกิจการเริ่มจากความโปร่งใส จึงยึดมาตรฐาน 3 ข้อเสมอ: แจ้งราคาเป็นตัวเลขก่อนเริ่มงาน คืนใบเสร็จภาษีตัวจริงจากกรมสรรพากรให้ลูกค้าเก็บทุกเดือน และดูแลบัญชีโดยทีมงานสายตรงพร้อมส่งงบประจำปีให้ CPA ตรวจสอบ
          </p>
          <div className="page-hero__actions">
            <Link href="/contact" className="btn btn-primary">
              นัดคุยกับทีมงาน
            </Link>
            <Link href="/services" className="btn btn-light">
              ดูบริการของเรา
            </Link>
          </div>
        </div>
      </section>

      <WhyUs />
      <QuoteBand />
      <WorkProcess />
      <CustomerReviews items={reviewItems} />
      <ContactForm />
    </>
  );
}
