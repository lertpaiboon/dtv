import React from 'react';
import { extractHeadings, TocHeading } from '@/lib/articles/markdown';
import { ListOrdered } from 'lucide-react';

interface ArticleTocProps {
  contentMarkdown: string;
}

export default function ArticleToc({ contentMarkdown }: ArticleTocProps) {
  const headings: TocHeading[] = extractHeadings(contentMarkdown);

  if (headings.length < 2) {
    return null;
  }

  return (
    <nav
      className="article-toc"
      aria-label="สารบัญเนื้อหาบทความ"
      style={{
        background: '#f8fafc',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'var(--primary)',
          marginBottom: '16px',
        }}
      >
        <ListOrdered size={18} color="var(--accent-dark)" aria-hidden="true" />
        <span>สารบัญเนื้อหา (Table of Contents)</span>
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {headings.map((item, idx) => (
          <li
            key={item.id || idx}
            style={{
              paddingLeft: item.level === 3 ? '20px' : '0',
              fontSize: item.level === 3 ? '0.88rem' : '0.94rem',
            }}
          >
            <a
              href={`#${item.id}`}
              style={{
                color: item.level === 3 ? 'var(--text-muted)' : 'var(--text-main)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '8px',
                transition: 'var(--transition)',
              }}
              className="hover-gold"
            >
              <span
                style={{
                  color: 'var(--accent-dark)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {idx + 1}.
              </span>
              <span>{item.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
