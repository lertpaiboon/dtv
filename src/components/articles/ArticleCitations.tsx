import React from 'react';
import { ArticleCitationItem } from '@/lib/articles/types';
import { Bookmark, ExternalLink } from 'lucide-react';

interface ArticleCitationsProps {
  citations: ArticleCitationItem[];
}

export default function ArticleCitations({ citations }: ArticleCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <section
      className="article-citations"
      aria-labelledby="citations-title"
      style={{
        marginTop: '45px',
        padding: '24px 28px',
        background: '#f8fafc',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--primary)',
          marginBottom: '16px',
        }}
      >
        <Bookmark size={18} color="var(--accent-dark)" aria-hidden="true" />
        <h3 id="citations-title" style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
          แหล่งอ้างอิงทางกฎหมายและเอกสารต้นทาง (Legal & Statutory References)
        </h3>
      </div>

      <ol
        style={{
          margin: 0,
          paddingLeft: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        {citations.map((cite, index) => (
          <li key={cite.id || index}>
            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{cite.title}</span>
            {cite.publisher && <span> — จัดทำโดย {cite.publisher}</span>}
            {cite.url && (
              <a
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '8px',
                  color: 'var(--accent-dark)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
                className="hover-gold"
              >
                <span>[เปิดดูแหล่งข้อมูล]</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
            {cite.accessedAt && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '8px' }}>
                (ตรวจสอบล่าสุดเมื่อ: {cite.accessedAt})
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
