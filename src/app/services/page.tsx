import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Services from '@/components/Services';
import WorkProcess from '@/components/WorkProcess';
import Pricing from '@/components/Pricing';
import ContactForm from '@/components/ContactForm';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'บริการของดีถาวรการบัญชี | รับทำบัญชี ยื่นภาษี ตรวจสอบบัญชี CPA จดบริษัท และเงินเดือน',
  description:
    'รวมบริการของบริษัท ดีถาวรการบัญชี จำกัด ครบทั้ง 4 หมวดหลัก: ทำบัญชีและยื่นภาษี ตรวจสอบบัญชีโดย CPA จดทะเบียนธุรกิจ และงานบุคคลกับเงินเดือน เริ่มต้น 1,500 บาท/เดือน',
  alternates: {
    canonical: toAbsoluteUrl('/services'),
  },
};

export default function ServicesOverviewPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">บริการทั้งหมด</span>
          </nav>
          <p className="page-hero__kicker">บริการครบวงจรสำหรับธุรกิจและฟรีแลนซ์</p>
          <h1>บริการของดีถาวรการบัญชี</h1>
          <p className="page-hero__lead">
            ดูแลตั้งแต่เปิดกิจการ จดทะเบียนบริษัทและ VAT ทำบัญชีรายเดือน ยื่น ภ.พ.30 และ ภ.ง.ด. ปิดงบประจำปีส่งให้ CPA ตรวจสอบ ไปจนถึงระบบเงินเดือนและประกันสังคม เลือกใช้เฉพาะงานที่ต้องการหรือให้เราดูแลครบวงจรได้ในที่เดียว
          </p>
          <div className="page-hero__actions">
            <Link href="/#contact" className="btn btn-primary">
              ขอใบเสนอราคา
            </Link>
            <a
              href="https://line.me/ti/p/DliAyJfUXd"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
            >
              แอด LINE ปรึกษาก่อน
            </a>
          </div>
        </div>
      </section>

      <Services />
      <WorkProcess />
      <Pricing />
      <ContactForm />
    </>
  );
}
