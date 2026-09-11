import Image from 'next/image';
import Link from 'next/link';
import { Check, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__content reveal-on-scroll">
          <p className="section-kicker">บัญชี ภาษี และงานทะเบียน สำหรับธุรกิจที่อยากเดินหน้าอย่างมั่นใจ</p>
          <h1>เรื่องบัญชีที่ชัดเจน<br />ทำให้ธุรกิจไปได้ไกลกว่า</h1>
          <p className="hero__lead">
            ดีถาวรดูแลบัญชีและภาษีให้ครบตั้งแต่เอกสารชิ้นแรกจนถึงงบประจำปี
            ด้วยทีมงานวิชาชีพ ราคาที่บอกล่วงหน้า และใบเสร็จตัวจริงคืนให้คุณทุกครั้ง
          </p>

          <div className="hero__actions">
            <Link className="btn btn-primary btn-large" href="/#contact">ประเมินค่าบริการเบื้องต้น</Link>
            <div className="hero__phone">
              <PhoneCall aria-hidden="true" />
              <span>
                <small>ปรึกษาโดยตรง</small>
                <span className="hero__phone-numbers">
                  <a href="tel:0919415656">091-941-5656</a>
                  <span aria-hidden="true">/</span>
                  <a href="tel:0991495656">099-149-5656</a>
                </span>
              </span>
            </div>
          </div>

          <ul className="hero__checks" aria-label="จุดเด่นของบริการ">
            <li><Check aria-hidden="true" /> ไม่มีค่าใช้จ่ายแอบแฝง</li>
            <li><Check aria-hidden="true" /> ตรวจสอบโดยผู้สอบบัญชี CPA</li>
            <li><Check aria-hidden="true" /> ดูแลธุรกิจทุกขนาด</li>
          </ul>
        </div>

        <div className="hero__visual reveal-on-scroll delay-2">
          <div className="hero__image-frame">
            <Image
              src="/images/graphic_abstract.png"
              alt="การตรวจสอบข้อมูลบัญชีและผลประกอบการบนแท็บเล็ต"
              fill
              priority
              sizes="(max-width: 991px) 100vw, 50vw"
              className="hero__image"
            />
          </div>

          <div className="hero__credential">
            <ShieldCheck aria-hidden="true" />
            <div><strong>มาตรฐานวิชาชีพ</strong><span>ตรวจบัญชีโดย CPA</span></div>
          </div>

          <a
            className="hero__location"
            href="https://maps.app.goo.gl/Wi5FnyBApoioAP3J7"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin aria-hidden="true" />
            <span><small>สำนักงานอโศก–ดินแดง</small>ใกล้ MRT เพชรบุรี ทางออก 1</span>
          </a>
        </div>
      </div>

      <div className="container hero__facts" aria-label="ราคาเริ่มต้นและบริการ">
        <div><strong>1,000</strong><span>บาท/เดือน<br />ค่าทำบัญชีเริ่มต้น</span></div>
        <div><strong>1,500</strong><span>บาท<br />ค่าจดทะเบียนเริ่มต้น</span></div>
        <div><strong>4</strong><span>บริการหลัก<br />ครบในสำนักงานเดียว</span></div>
        <p>แจ้งขอบเขตงานและราคาให้ทราบก่อนเริ่มเสมอ</p>
      </div>
    </section>
  );
}
