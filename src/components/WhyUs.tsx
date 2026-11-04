import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, MapPin, PhoneCall } from 'lucide-react';

const reasons = [
  {
    step: '01',
    image: '/images/why_price.png',
    title: 'บอกราคาเป็นตัวเลขก่อนเริ่มงาน',
    description: 'ดูเอกสารจริงก่อนแล้วค่อยบอกราคา ไม่มีค่ากระดาษ ค่านำส่ง หรือค่าปรึกษาเพิ่มระหว่างปี',
  },
  {
    step: '02',
    image: '/images/why_honesty.png',
    title: 'คืนใบเสร็จตัวจริงทุกเดือน',
    description: 'ยื่นภาษีเสร็จ ส่งใบเสร็จจากกรมสรรพากรคืนให้ทุกครั้ง ตรวจย้อนหลังเองได้',
  },
  {
    step: '03',
    image: '/images/why_quality.png',
    title: 'คนทำจบบัญชีโดยตรง งบปีตรวจโดย CPA',
    description: 'ทีมงานจบสายบัญชี ติดตามกฎหมายภาษีที่เปลี่ยนทุกปี',
  },
];

export default function WhyUs() {
  return (
    <section className="why" id="why-us">
      <div className="container why__layout">
        <div className="why__intro reveal-on-scroll">
          <div className="why__header">
            <p className="section-kicker section-kicker--inverse">ทำไมต้องดีถาวร</p>
            <h2>
              ทำไมธุรกิจย่านอโศก
              <br />
              เลือกดีถาวรการบัญชี
            </h2>
          </div>

          <div className="why__showcase">
            <Image
              src="/images/service_reg.png"
              alt="ทีมบัญชีดีถาวรการบัญชีให้คำปรึกษาและวางแผนภาษีร่วมกับลูกค้า"
              fill
              sizes="(max-width: 920px) 100vw, 48vw"
              className="why__showcase-img"
            />
            <div className="why__callout">
              <div className="why__callout-icon" aria-hidden="true">
                <PhoneCall />
              </div>
              <div className="why__callout-body">
                <strong>โทรมาในเวลาทำการ คุยกับคนที่ทำบัญชีให้คุณได้เลย</strong>
                <Link href="/#contact" className="why__callout-link">
                  นัดคุยกับทีมงาน <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="why__right reveal-on-scroll delay-2">
          <div className="why__lead-card">
            <span className="why__lead-badge">
              <CheckCircle2 aria-hidden="true" /> มาตรฐานการทำงานของเรา
            </span>
            <p>
              ลูกค้าส่วนใหญ่ย้ายมาจากสำนักงานบัญชีเดิมเพราะเรื่องเดียวกัน คือไม่รู้ว่าจ่ายค่าอะไรไปบ้าง
              และไม่เคยเห็นใบเสร็จภาษีตัวจริง เราจึงทำสามเรื่องนี้เป็นมาตรฐาน
            </p>
          </div>

          <div className="why__reasons">
            {reasons.map((reason, index) => {
              const delayClass = `delay-${(index % 3) + 1}`;
              return (
                <article className={`reason reveal-on-scroll ${delayClass}`} key={reason.title}>
                  <div className="reason__icon-wrap">
                    <Image src={reason.image} alt="" width={44} height={44} />
                  </div>
                  <div className="reason__body">
                    <div className="reason__top">
                      <h3>{reason.title}</h3>
                      <span className="reason__step">{reason.step}</span>
                    </div>
                    <p>{reason.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container location-strip reveal-on-scroll delay-2">
        <div className="location-strip__icon">
          <MapPin aria-hidden="true" />
        </div>
        <div>
          <span>เข้ามาคุยกับเราได้ที่สำนักงาน</span>
          <h3>234/116 ถนนอโศก–ดินแดง ใกล้ MRT เพชรบุรี ทางออก 1</h3>
        </div>
        <a
          href="https://maps.app.goo.gl/Wi5FnyBApoioAP3J7"
          target="_blank"
          rel="noopener noreferrer"
        >
          ดูเส้นทาง <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
