import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  MessageCircle,
} from 'lucide-react';

export default function WorkProcess() {
  return (
    <section className="section process" id="how">
      <div className="container">
        <div className="process__bento">
          {/* Row 1, Col 1: Step 1 */}
          <article className="process-step process-step--1 reveal-on-scroll">
            <div className="process-step__top">
              <span className="process-step__icon">
                <MessageCircle aria-hidden="true" />
              </span>
              <span className="process-step__badge">ขั้นที่ 1</span>
            </div>
            <h3>โทรหรือทัก LINE</h3>
            <p>เล่าว่าธุรกิจทำอะไร มีพนักงานกี่คน จด VAT แล้วหรือยัง</p>
          </article>

          {/* Row 1, Col 2-3: Heading */}
          <div className="process__head reveal-on-scroll delay-1">
            <p className="section-kicker">ขั้นตอนเริ่มงาน</p>
            <h2>
              เริ่มใช้บริการดีถาวร
              <br />
              ใน 3 ขั้น
            </h2>
          </div>

          {/* Row 2, Col 1: Photo 1 */}
          <div className="process__photo process__photo--1 reveal-on-scroll delay-1">
            <Image
              src="/images/process_desk.jpg"
              alt="เจ้าหน้าที่บัญชีตรวจสอบเอกสารและข้อมูลภาษีที่โต๊ะทำงาน"
              fill
              sizes="(max-width: 920px) 100vw, 33vw"
              className="process__photo-img"
            />
          </div>

          {/* Row 2, Col 2: Step 2 */}
          <article className="process-step process-step--2 reveal-on-scroll delay-2">
            <div className="process-step__top">
              <span className="process-step__icon">
                <ClipboardList aria-hidden="true" />
              </span>
              <span className="process-step__badge">ขั้นที่ 2</span>
            </div>
            <h3>ประเมินราคา</h3>
            <p>ดูปริมาณเอกสารต่อเดือน แล้วแจ้งราคาเป็นตัวเลขพร้อมขอบเขตงาน</p>
          </article>

          {/* Row 2, Col 3: Intro Copy + CTA */}
          <div className="process__cta-box reveal-on-scroll delay-2">
            <p>
              ส่วนใหญ่คุยกันครั้งเดียวก็ได้ราคา ไม่ต้องเข้ามาที่สำนักงาน ส่งเอกสารผ่าน LINE หรืออีเมลได้
            </p>
            <Link href="/#contact" className="btn btn-primary">
              ขอใบเสนอราคา <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {/* Row 3, Col 1-2: Wide Photo 2 */}
          <div className="process__photo process__photo--2 reveal-on-scroll delay-2">
            <Image
              src="/images/process_meeting.jpg"
              alt="ห้องประชุมสำหรับพูดคุยและวางแผนบัญชีภาษีกับลูกค้า"
              fill
              sizes="(max-width: 920px) 100vw, 66vw"
              className="process__photo-img"
            />
          </div>

          {/* Row 3, Col 3: Step 3 */}
          <article className="process-step process-step--3 reveal-on-scroll delay-3">
            <div className="process-step__top">
              <span className="process-step__icon">
                <CalendarCheck2 aria-hidden="true" />
              </span>
              <span className="process-step__badge">ขั้นที่ 3</span>
            </div>
            <h3>ดูแลทุกเดือน</h3>
            <p>ยื่นภาษีตามกำหนด ส่งใบเสร็จคืน ปลายปีปิดงบแล้วส่งให้ CPA ตรวจ</p>
          </article>
        </div>
      </div>
    </section>
  );
}
