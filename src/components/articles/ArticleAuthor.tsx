import React from 'react';
import { Author } from '@/lib/articles/types';
import { ShieldCheck, UserCheck, Calendar, AlertTriangle } from 'lucide-react';

interface ArticleAuthorProps {
  author: Author;
  reviewer?: Author;
  publishedAt: string;
  contentUpdatedAt?: string;
  reviewedAt?: string;
}

export default function ArticleAuthor({
  author,
  reviewer,
  publishedAt,
  contentUpdatedAt,
  reviewedAt,
}: ArticleAuthorProps) {
  const pubDateStr = new Date(publishedAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const revDateStr = reviewedAt
    ? new Date(reviewedAt).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const updateDateStr = contentUpdatedAt
    ? new Date(contentUpdatedAt).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className="article-author-card"
      style={{
        marginTop: '50px',
        padding: '30px',
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: reviewer ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Primary Author */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            <UserCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-dark)', fontWeight: 700, textTransform: 'uppercase' }}>
              ผู้เขียนบทความ (Author)
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
              {author.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {author.role}
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--accent-dark)',
                fontWeight: 600,
                marginTop: '6px',
                background: 'rgba(197, 160, 89, 0.1)',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              {author.credentials}
            </div>
          </div>
        </div>

        {/* Reviewer */}
        {reviewer && (
          <div style={{ display: 'flex', gap: '16px', borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>
                ผู้สอบทานความถูกต้อง (Expert Reviewer)
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                {reviewer.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {reviewer.role}
              </div>
              {revDateStr && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '6px' }}>
                  ตรวจสอบล่าสุดเมื่อ: <strong>{revDateStr}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Date metadata footer */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '14px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '0.82rem',
          color: 'var(--text-light)',
        }}
      >
        <span>📅 วันที่เผยแพร่: {pubDateStr}</span>
        {updateDateStr && <span>🔄 ปรับปรุงเนื้อหา: {updateDateStr}</span>}
      </div>

      {/* Professional Legal Disclaimer */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem',
          color: '#92400e',
          lineHeight: 1.5,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
        <span>
          <strong>ข้อสงวนสิทธิ์ทางวิชาชีพ:</strong> บทความนี้จัดทำขึ้นเพื่อให้ความรู้ความเข้าใจเกี่ยวกับภาษีและกฎหมายธุรกิจทั่วไปเท่านั้น มิใช่คำแนะนำเฉพาะเจาะจงสำหรับกิจการใดกิจการหนึ่ง ข้อกำหนดทางภาษีอาจมีรายละเอียดแตกต่างตามประเภทธุรกิจ หากต้องการคำปรึกษาที่เหมาะสมกับกรณีของท่าน กรุณาติดต่อทีมงานผู้เชี่ยวชาญโดยตรง
        </span>
      </div>
    </div>
  );
}
