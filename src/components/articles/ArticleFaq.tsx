import React from 'react';
import { ArticleFaqItem } from '@/lib/articles/types';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface ArticleFaqProps {
  faqs: ArticleFaqItem[];
}

export default function ArticleFaq({ faqs }: ArticleFaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="article-faqs" aria-labelledby="faq-section-title" style={{ marginTop: '50px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(197, 160, 89, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-dark)',
          }}
        >
          <HelpCircle size={20} aria-hidden="true" />
        </div>
        <h2
          id="faq-section-title"
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--primary)',
            margin: 0,
          }}
        >
          คำถามที่พบบ่อย (Frequently Asked Questions)
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqs.map((faq, index) => (
          <details
            key={faq.id || index}
            className="article-faq-item"
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              transition: 'var(--transition)',
            }}
          >
            <summary
              style={{
                padding: '18px 22px',
                fontWeight: 600,
                fontSize: '1.02rem',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                userSelect: 'none',
              }}
            >
              <span style={{ paddingRight: '16px' }}>{faq.question}</span>
              <ChevronDown
                size={18}
                className="faq-arrow"
                style={{ flexShrink: 0, color: 'var(--accent-dark)', transition: 'transform 0.2s' }}
                aria-hidden="true"
              />
            </summary>
            <div
              style={{
                padding: '0 22px 20px',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--text-main)',
                borderTop: '1px solid #f8fafc',
                background: '#fafcff',
              }}
            >
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
