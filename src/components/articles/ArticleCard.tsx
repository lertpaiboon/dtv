import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Tag,
  ArrowRight,
  Clock,
  UserCheck,
  Receipt,
  Building2,
  Calculator,
  ShieldCheck,
  Users,
  FileText,
} from 'lucide-react';
import { Article } from '@/lib/articles/types';

interface ArticleCardProps {
  article: Article;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'ภาษีอากร':
    case 'ภาษีและสรรพากร':
    case 'วางแผนภาษี':
      return <Receipt size={34} color="#fbbf24" strokeWidth={1.5} />;
    case 'จดทะเบียนธุรกิจ':
      return <Building2 size={34} color="#fbbf24" strokeWidth={1.5} />;
    case 'ตรวจสอบบัญชี':
      return <ShieldCheck size={34} color="#fbbf24" strokeWidth={1.5} />;
    case 'การทำบัญชี':
    case 'บัญชีและงบการเงิน':
      return <Calculator size={34} color="#fbbf24" strokeWidth={1.5} />;
    case 'บริหารทรัพยากรบุคคล':
    case 'ทรัพยากรบุคคล':
      return <Users size={34} color="#fbbf24" strokeWidth={1.5} />;
    default:
      return <FileText size={34} color="#fbbf24" strokeWidth={1.5} />;
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const publishedDateThai = new Date(article.publishedAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hasCover = Boolean(article.coverImage && article.coverImage.trim().length > 0);

  return (
    <article
      className="knowledge-card hover-lift"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.06)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div>
        {/* Cover Image / Fallback Hero Area */}
        <Link
          href={`/knowledge/${article.slug}`}
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #091c3a 0%, #173b75 60%, #0c244d 100%)',
          }}
        >
          {hasCover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
              }}
              className="article-card-cover-img"
            />
          ) : (
            /* Branded Elegant Fallback Placeholder */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative',
                background: 'linear-gradient(135deg, #091c3a 0%, #102a56 50%, #0c1e3d 100%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0) 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {getCategoryIcon(article.category)}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.75)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                ดีถาวรการบัญชี • คลังความรู้
              </div>
            </div>
          )}

          {/* Overlaid Badges on Image */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#ffffff',
                background: 'rgba(9, 28, 58, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Tag size={11} color="#fbbf24" aria-hidden="true" />
              <span>{article.category}</span>
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1e293b',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '3px 9px',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              <Clock size={12} color="#64748b" aria-hidden="true" />
              <span>{article.readTime}</span>
            </span>
          </div>
        </Link>

        {/* Card Body Content */}
        <div style={{ padding: '20px 22px 18px' }}>
          {/* Title */}
          <h2
            style={{
              fontSize: '1.16rem',
              fontWeight: 700,
              color: 'var(--primary)',
              lineHeight: 1.45,
              marginBottom: '10px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.9em',
            }}
          >
            <Link
              href={`/knowledge/${article.slug}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              className="hover-gold"
            >
              {article.title}
            </Link>
          </h2>

          {/* Summary */}
          <p
            style={{
              fontSize: '0.88rem',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '14px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8em',
            }}
          >
            {article.summary}
          </p>

          {/* Author mention */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#64748b',
            }}
          >
            <UserCheck size={13} color="var(--accent-dark)" aria-hidden="true" />
            <span>เขียนโดย: <strong>{article.author.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          padding: '12px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fafcff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: 'var(--text-light)',
          }}
        >
          <Calendar size={13} aria-hidden="true" />
          <time dateTime={article.publishedAt}>{publishedDateThai}</time>
        </div>

        <Link
          href={`/knowledge/${article.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#1d4ed8',
            textDecoration: 'none',
          }}
          className="hover-gold"
        >
          <span>อ่านบทความ</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
