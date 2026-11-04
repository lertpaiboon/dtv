import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import ScrollToTopButton from './ScrollToTopButton';
import CookiePreferencesButton from './CookiePreferencesButton';

const serviceLinks = [
  { label: 'ทำบัญชีและภาษี', href: '/services/accounting-tax' },
  { label: 'ตรวจสอบบัญชีโดย CPA', href: '/services/audit' },
  { label: 'จดทะเบียนธุรกิจ', href: '/services/business-registration' },
  { label: 'งานบุคคลและเงินเดือน', href: '/services/hr-payroll' },
  { label: 'ดูบริการทั้งหมด', href: '/services' },
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
            <span className="brand__copy">
              <strong>ดีถาวรการบัญชี</strong>
              <small>Deethavorn Accounting</small>
            </span>
          </Link>
          <p>
            รับทำบัญชี ยื่นภาษี ตรวจสอบบัญชีโดย CPA จดทะเบียนธุรกิจ และดูแลระบบเงินเดือน ด้วยมาตรฐานวิชาชีพและราคาที่โปร่งใส
          </p>
          <span className="footer__trust">
            <ShieldCheck aria-hidden="true" /> เก็บข้อมูลลูกค้าเป็นความลับทุกกรณี
          </span>
        </div>

        <div className="footer__column">
          <h3>บริการ</h3>
          {serviceLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="footer__column">
          <h3>เมนูหลัก</h3>
          <Link href="/about">ทำไมต้องดีถาวร</Link>
          <Link href="/pricing">ค่าบริการ</Link>
          <Link href="/faq">คำถามที่พบบ่อย</Link>
          <Link href="/knowledge">คลังความรู้</Link>
          <Link href="/contact">ติดต่อเรา</Link>
          <Link href="/privacy-policy">นโยบายความเป็นส่วนตัว (PDPA)</Link>
          <CookiePreferencesButton className="footer__cookie-btn">ตั้งค่าคุกกี้</CookiePreferencesButton>
        </div>

        <div className="footer__column footer__contact">
          <h3>ติดต่อสำนักงาน</h3>
          <div className="footer__contact-group">
            <Phone aria-hidden="true" />
            <span>
              <a href="tel:0991495656">099-149-5656</a>
              <a href="tel:0919415656">091-941-5656</a>
            </span>
          </div>
          <div className="footer__contact-group">
            <Mail aria-hidden="true" />
            <span>
              <a href="mailto:dtv_accounting@hotmail.com">dtv_accounting@hotmail.com</a>
              <a href="mailto:c.pimmphisa@gmail.com">c.pimmphisa@gmail.com</a>
            </span>
          </div>
          <span>
            <Clock3 aria-hidden="true" />
            จันทร์–ศุกร์ 08:30–17:30 น.
          </span>
          <span>
            <MapPin aria-hidden="true" />
            <span>
              234/116 ถ.อโศก–ดินแดง
              <br />
              แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310
            </span>
          </span>

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
        <span>
          © {new Date().getFullYear()} บริษัท ดีถาวรการบัญชี จำกัด ·{' '}
          <Link href="/privacy-policy" className="footer__bottom-link">
            นโยบายข้อมูลส่วนบุคคล
          </Link>{' '}
          · <CookiePreferencesButton className="footer__cookie-link-btn">ตั้งค่าคุกกี้</CookiePreferencesButton>
        </span>
        <span>มาตรฐานวิชาชีพ · ราคาชัดเจน · ติดต่อได้จริง</span>
        <ScrollToTopButton />
      </div>
    </footer>
  );
}
