'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

export const defaultFaqs: FaqItem[] = [
  {
    q: 'ดีถาวรการบัญชีรับทำงานอะไรบ้าง',
    a: 'รับ 4 งาน คือ ทำบัญชีและยื่นภาษี ตรวจสอบบัญชีโดย CPA จดทะเบียนธุรกิจ และเงินเดือนกับประกันสังคม เลือกใช้เฉพาะงานที่ต้องการ หรือให้ดูแลทั้งหมดก็ได้',
  },
  {
    q: 'ค่าทำบัญชีคิดจากอะไร เริ่มที่เท่าไร',
    a: 'ค่าทำบัญชีเริ่มต้น 1,500 บาทต่อเดือน ราคาขึ้นอยู่กับประเภทธุรกิจ ปริมาณเอกสารต่อเดือน และความซับซ้อนของภาษี เราดูเอกสารจริงแล้วแจ้งราคาเป็นตัวเลขให้ทราบก่อนเริ่มงานทุกครั้ง',
  },
  {
    q: 'ต้องเอาเอกสารมาส่งที่สำนักงานทุกเดือนไหม',
    a: 'ไม่จำเป็นต้องเดินทางมาที่สำนักงานทุกเดือน สามารถส่งเอกสารผ่าน LINE อีเมล หรือขนส่งเอกชนได้ ส่วนเอกสารต้นฉบับสำคัญสามารถนัดส่งตามรอบที่สะดวก',
  },
  {
    q: 'ฟรีแลนซ์หรือร้านเล็กๆ ใช้บริการได้ไหม',
    a: 'ใช้ได้ครับ เราดูแลตั้งแต่ฟรีแลนซ์ ร้านค้าออนไลน์ บุคคลธรรมดา ไปจนถึง หจก. และบริษัทจำกัด พร้อมช่วยวางระบบเอกสารและภาษีให้เหมาะกับขนาดธุรกิจ',
  },
  {
    q: 'ย้ายสำนักงานบัญชีกลางปีได้ไหม',
    a: 'ย้ายได้ทุกเดือนครับ ไม่ต้องรอให้จบปีบัญชี เพียงเตรียมงบการเงินปีล่าสุดและแบบภาษีที่ยื่นไปแล้วในปีปัจจุบัน ทีมงานจะช่วยตรวจเช็กยอดสะสมและรับช่วงต่อยื่นภาษีรายเดือนจนถึงปิดงบปลายปีให้ครบถ้วน',
  },
  {
    q: 'ดีถาวรการบัญชีอยู่ที่ไหน เปิดวันไหน',
    a: 'สำนักงานอยู่ที่ 234/116 ถนนอโศก–ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310 ใกล้ MRT เพชรบุรี ทางออก 1 เปิดวันจันทร์–ศุกร์ เวลา 08:30–17:30 น.',
  },
];

export default function FAQ({ items }: { items?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const faqList = items && items.length > 0 ? items : defaultFaqs;

  return (
    <section className="section faq" id="faq">
      <div className="container faq__layout">
        <div className="faq__intro reveal-on-scroll">
          <p className="section-kicker">คำถามที่พบบ่อย</p>
          <h2>
            เตรียมตัวอย่างไร
            <br />
            ก่อนใช้บริการ
          </h2>
          <p>ไม่เจอคำตอบที่ต้องการ โทรถามได้ในเวลาทำการ</p>
          <div className="faq__phones">
            <a className="faq__phone" href="tel:0991495656">
              099-149-5656
            </a>
            <a className="faq__phone" href="tel:0919415656">
              091-941-5656
            </a>
          </div>
        </div>

        <div className="faq__list reveal-on-scroll delay-2">
          {faqList.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article className={`faq-item${isOpen ? ' faq-item--open' : ''}`} key={faq.q}>
                <button
                  type="button"
                  id={`faq-question-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown aria-hidden="true" />
                </button>
                {isOpen && (
                  <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
