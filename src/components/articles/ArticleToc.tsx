import React from 'react';
import { extractHeadings, hasEmbeddedToc, TocHeading } from '@/lib/articles/markdown';
import { ListOrdered } from 'lucide-react';

interface ArticleTocProps {
  contentMarkdown: string;
}

export default function ArticleToc({ contentMarkdown }: ArticleTocProps) {
  if (hasEmbeddedToc(contentMarkdown)) {
    return null;
  }

  const headings: TocHeading[] = extractHeadings(contentMarkdown);

  if (headings.length < 2) {
    return null;
  }

  let h2Count = 0;
  const tocItems = headings.map((item) => {
    const hasLeadingNumber = /^\d+(?:\.\d+)*[.)]\s+/.test(item.text.trim());
    if (item.level === 2) {
      h2Count += 1;
      return {
        ...item,
        marker: hasLeadingNumber ? null : `${h2Count}.`,
      };
    }
    return {
      ...item,
      marker: hasLeadingNumber ? null : '•',
    };
  });

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
        <span>สารบัญเนื้อหา</span>
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
        {tocItems.map((item, idx) => (
          <li
            key={`${item.id}-${idx}`}
            style={{
              paddingLeft: item.level === 3 ? '22px' : '0',
              fontSize: item.level === 3 ? '0.88rem' : '0.94rem',
              fontWeight: item.level === 2 ? 500 : 400,
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
              {item.marker && (
                <span
                  style={{
                    color: item.level === 3 ? '#94a3b8' : 'var(--accent-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {item.marker}
                </span>
              )}
              <span>{item.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
