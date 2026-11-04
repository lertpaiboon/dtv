'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { defaultFaqs, type FaqItem } from '@/lib/default-content';

export type { FaqItem };

export default function FAQ({ items }: { items?: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const faqList = Array.isArray(items) && items.length > 0 ? items : defaultFaqs;

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
