import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import ScrollToTopButton from './ScrollToTopButton';

const serviceLinks = [
  'บัญชีและภาษีอากร',
  'ตรวจสอบบัญชีโดย CPA',
  'งานทะเบียนธุรกิจ',
  'HR และ Payroll',
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link href="/" className="brand brand--footer">
            <span className="footer__logo" aria-hidden="true">
              <Image
                className="footer__logo-image"
                src="/images/DTV%20LOGO.png"
                alt=""
                width={3508}
                height={2480}
                sizes="56px"
              />
            </span>
            <span className="brand__copy"><strong>ดีถาวรการบัญชี</strong><small>Deethavorn Accounting</small></span>
          </Link>
          <p>ดูแลบัญชี ภาษี ตรวจสอบบัญชี งานทะเบียน และระบบบุคคล ด้วยมาตรฐานวิชาชีพและราคาที่โปร่งใส</p>
          <span className="footer__trust"><ShieldCheck aria-hidden="true" /> รักษาความลับของลูกค้าทุกกรณี</span>
        </div>

        <div className="footer__column">
          <h3>บริการ</h3>
          {serviceLinks.map((label) => <Link href="/#services" key={label}>{label}</Link>)}
        </div>

        <div className="footer__column">
          <h3>ข้อมูลเพิ่มเติม</h3>
          <Link href="/#why-us">ทำไมต้องดีถาวร</Link>
          <Link href="/#pricing">ค่าบริการ</Link>
          <Link href="/#faq">คำถามที่พบบ่อย</Link>
          <Link href="/knowledge">คลังความรู้</Link>
        </div>

        <div className="footer__column footer__contact">
          <h3>ติดต่อสำนักงาน</h3>
          <div className="footer__contact-group"><Phone aria-hidden="true" /><span><a href="tel:0991495656">099-149-5656</a><a href="tel:0919415656">091-941-5656</a></span></div>
          <div className="footer__contact-group"><Mail aria-hidden="true" /><span><a href="mailto:dtv_accounting@hotmail.com">dtv_accounting@hotmail.com</a><a href="mailto:c.pimmphisa@gmail.com">c.pimmphisa@gmail.com</a></span></div>
          <span><Clock3 aria-hidden="true" />จันทร์–ศุกร์ 08:30–17:30 น.</span>
          <span><MapPin aria-hidden="true" /><span>234/116 ถ.อโศก–ดินแดง<br />แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310</span></span>

          <a
            href="https://line.me/ti/p/DliAyJfUXd"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__line-qr"
            title="คลิกหรือสแกนเพื่อแอด LINE"
          >
            <Image
              src="/images/line-qr.png"
              alt="LINE QR Code ดีถาวรการบัญชี"
              width={76}
              height={76}
              className="footer__line-qr-img"
            />
            <div className="footer__line-qr-info">
              <span>สแกน QR คุย LINE</span>
              <small>ปรึกษาทีมงานได้ทันที</small>
            </div>
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} บริษัท ดีถาวรการบัญชี จำกัด</span>
        <span>มาตรฐานวิชาชีพ · ราคาชัดเจน · ติดต่อได้จริง</span>
        <ScrollToTopButton />
      </div>
    </footer>
  );
}
