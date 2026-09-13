import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';

const reasons = [
  {
    image: '/images/why_quality.png',
    title: 'ตรงสายและได้มาตรฐาน',
    description: 'ทีมงานสำเร็จการศึกษาด้านบัญชีโดยตรง และอัปเดตกฎหมายภาษีกับมาตรฐานวิชาชีพอย่างต่อเนื่อง',
  },
  {
    image: '/images/why_honesty.png',
    title: 'ตรวจสอบย้อนกลับได้',
    description: 'ทุกการยื่นภาษีมีหลักฐานชัดเจน พร้อมคืนใบเสร็จจากกรมสรรพากรให้คุณเก็บไว้เสมอ',
  },
  {
    image: '/images/why_price.png',
    title: 'ราคาเข้าใจง่าย',
    description: 'ประเมินตามขอบเขตงานจริง แจ้งราคาก่อนเริ่ม และไม่มีค่ากระดาษ ค่านำส่ง หรือค่าปรึกษายิบย่อย',
  },
  {
    image: '/images/why_contact.png',
    title: 'ติดต่อทีมงานได้จริง',
    description: 'ปรึกษาทีมงานได้โดยตรงวันจันทร์ถึงศุกร์ ไม่ต้องรอผ่านระบบอัตโนมัติหลายขั้นตอน',
  },
];

export default function WhyUs() {
  return (
    <section className="why" id="why-us">
      <div className="container why__layout">
        <div className="why__intro reveal-on-scroll">
          <p className="section-kicker section-kicker--inverse">วิธีทำงานของดีถาวร</p>
          <h2>ความสบายใจ<br />เริ่มจากงานที่โปร่งใส</h2>
          <p>เราไม่ได้ส่งมอบแค่เอกสารที่เสร็จ แต่ทำให้คุณรู้ว่างานไปถึงไหน จ่ายอะไร และควรเตรียมตัวอย่างไรต่อ</p>
        </div>

        <div className="why__reasons">
          {reasons.map((reason, index) => {
            const delayClass = `delay-${(index % 4) + 1}`;
            return (
              <article className={`reason reveal-on-scroll ${delayClass}`} key={reason.title}>
                <Image src={reason.image} alt="" width={54} height={54} />
                <div><h3>{reason.title}</h3><p>{reason.description}</p></div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="container location-strip reveal-on-scroll delay-2">
        <div className="location-strip__icon"><MapPin aria-hidden="true" /></div>
        <div>
          <span>เข้ามาคุยกับเราได้ที่สำนักงาน</span>
          <h3>234/116 ถนนอโศก–ดินแดง ใกล้ MRT เพชรบุรี ทางออก 1</h3>
        </div>
        <a
          href="https://maps.app.goo.gl/Wi5FnyBApoioAP3J7"
          target="_blank"
          rel="noopener noreferrer"
        >ดูเส้นทาง <ArrowUpRight aria-hidden="true" /></a>
      </div>
    </section>
  );
}
