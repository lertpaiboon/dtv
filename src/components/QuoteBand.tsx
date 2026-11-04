import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function QuoteBand() {
  return (
    <section className="quote-band" aria-label="คำมั่นสัญญาจากผู้ก่อตั้ง">
      <div className="quote-band__media" aria-hidden="true">
        <Image
          src="/images/office_atmosphere.png"
          alt="บรรยากาศสำนักงานดีถาวรการบัญชี อโศก–ดินแดง"
          fill
          sizes="100vw"
          className="quote-band__bg-img"
        />
        <div className="quote-band__overlay" />
      </div>

      <div className="container quote-band__inner reveal-on-scroll">
        <div className="quote-band__content">
          <span className="quote-band__line" aria-hidden="true" />
          <blockquote className="quote-band__quote">
            “ยื่นภาษีเสร็จแล้ว{' '}
            <span className="quote-band__highlight">ใบเสร็จตัวจริงจากสรรพากร</span>{' '}
            ต้องกลับไปอยู่ในมือลูกค้า ทุกครั้ง”
          </blockquote>
          <div className="quote-band__author">
            <div className="quote-band__avatar" aria-hidden="true">
              <ShieldCheck />
            </div>
            <div className="quote-band__meta">
              <strong>พิมพ์พิศา ชาญวสุนันท์</strong>
              <span>ผู้ก่อตั้ง ดีถาวรการบัญชี</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
