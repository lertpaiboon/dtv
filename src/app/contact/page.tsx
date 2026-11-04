import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'ติดต่อดีถาวรการบัญชี | ขอใบเสนอราคาทำบัญชี ใกล้ MRT เพชรบุรี ทางออก 1',
  description:
    'ติดต่อบริษัท ดีถาวรการบัญชี จำกัด สำนักงานบัญชีเลขที่ 234/116 ถนนอโศก–ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310 ใกล้ MRT เพชรบุรี ทางออก 1 โทร 099-149-5656, 091-941-5656',
  alternates: {
    canonical: toAbsoluteUrl('/contact'),
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">ติดต่อเรา</span>
          </nav>
          <p className="page-hero__kicker">สำนักงานบัญชี อโศก–ดินแดง ใกล้ MRT เพชรบุรี ทางออก 1</p>
          <h1>ติดต่อดีถาวรการบัญชี และขอใบเสนอราคา</h1>
          <p className="page-hero__lead">
            กรอกข้อมูลสั้นๆ เพื่อให้ทีมงานประเมินขอบเขตและราคาค่าบริการตามปริมาณเอกสารจริง โทรกลับภายใน 1 วันทำการ การประเมินราคาไม่มีค่าใช้จ่ายและไม่มีข้อผูกมัด
          </p>
        </div>
      </section>

      <ContactForm />
    </>
  );
}
