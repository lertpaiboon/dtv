'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'ดีถาวรการบัญชีให้บริการอะไรบ้าง?',
    a: 'เราดูแล 4 งานหลัก ได้แก่ ทำบัญชีและภาษี ตรวจสอบบัญชีโดย CPA งานจดทะเบียนธุรกิจ และงาน HR & Payroll โดยสามารถเลือกใช้เฉพาะบริการที่ต้องการหรือให้เราดูแลต่อเนื่องครบวงจรได้',
  },
  {
    q: 'ค่าทำบัญชีคิดจากอะไร และเริ่มต้นเท่าไร?',
    a: 'ค่าทำบัญชีเริ่มต้น 1,500 บาทต่อเดือน ราคาจะขึ้นอยู่กับประเภทธุรกิจ ปริมาณเอกสาร จำนวนรายการ และความซับซ้อนของภาษี เราจะสอบถามข้อมูลและแจ้งราคาที่ชัดเจนให้ทราบก่อนเริ่มงาน',
  },
  {
    q: 'ต้องนำเอกสารไปส่งที่สำนักงานทุกเดือนหรือไม่?',
    a: 'ไม่จำเป็นต้องเดินทางมาทุกเดือน ทีมงานจะแนะนำวิธีรวบรวมและส่งเอกสารที่เหมาะกับรูปแบบการทำงานของคุณ ส่วนเอกสารต้นฉบับสำคัญสามารถนัดส่งที่สำนักงานได้',
  },
  {
    q: 'สำนักงานอยู่ที่ไหน และเปิดวันใด?',
    a: 'สำนักงานอยู่ที่ 234/116 ถนนอโศก–ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310 ใกล้ MRT เพชรบุรี ทางออก 1 เปิดวันจันทร์ถึงศุกร์ เวลา 08:30–18:00 น. แนะนำให้นัดหมายก่อนเข้าพบ',
  },
  {
    q: 'ฟรีแลนซ์หรือธุรกิจขนาดเล็กใช้บริการได้ไหม?',
    a: 'ได้ เราดูแลตั้งแต่บุคคลธรรมดา ฟรีแลนซ์ ร้านค้าออนไลน์ ไปจนถึงบริษัทและนิติบุคคลขนาดกลาง พร้อมช่วยวางระบบเอกสารให้เหมาะกับช่วงการเติบโตของธุรกิจ',
  },
  {
    q: 'เริ่มต้นปรึกษาต้องเตรียมข้อมูลอะไรบ้าง?',
    a: 'แจ้งประเภทธุรกิจ รูปแบบนิติบุคคล จำนวนเอกสารโดยประมาณ จำนวนพนักงาน และงานที่ต้องการให้ดูแล หากยังไม่แน่ใจสามารถส่งข้อความสั้น ๆ มาได้ ทีมงานจะช่วยถามรายละเอียดที่จำเป็นให้ครบ',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section faq" id="faq">
      <div className="container faq__layout">
        <div className="faq__intro reveal-on-scroll">
          <p className="section-kicker">คำถามที่ลูกค้ามักถาม</p>
          <h2>ก่อนเริ่มงาน<br />อยากรู้อะไร ถามได้เลย</h2>
          <p>ถ้ายังไม่พบคำตอบที่ต้องการ โทรคุยกับทีมงานได้โดยตรงในเวลาทำการ</p>
          <div className="faq__phones">
            <a className="faq__phone" href="tel:0991495656">099-149-5656</a>
            <a className="faq__phone" href="tel:0919415656">091-941-5656</a>
          </div>
        </div>

        <div className="faq__list reveal-on-scroll delay-2">
          {faqs.map((faq, index) => {
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
