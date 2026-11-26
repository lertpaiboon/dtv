import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPublishedArticleCards } from '@/lib/articles/queries';
import KnowledgeListClient from '@/components/articles/KnowledgeListClient';
import { buildPublicPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPublicPageMetadata({
  path: '/knowledge',
  title: 'คลังความรู้บัญชีและภาษี | บริษัท ดีถาวรการบัญชี จำกัด',
  description:
    'รวมบทความและเกร็ดความรู้ด้านภาษี บัญชี การจดทะเบียนธุรกิจ และการบริหารบุคคล โดยทีมงานผู้สอบบัญชีรับอนุญาต (CPA) บริษัท ดีถาวรการบัญชี จำกัด',
  ogDescription:
    'รวมบทความและเกร็ดความรู้ด้านภาษี บัญชี การจดทะเบียนธุรกิจ และการบริหารบุคคล โดยทีมงานผู้เชี่ยวชาญ',
});

export const revalidate = 3600;

export default async function KnowledgePage() {
  const articles = process.env.DATABASE_URL
    ? await getPublishedArticleCards().catch(() => [])
    : [];

  return (
    <div style={{ padding: '80px 0 100px', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="heading-badge">KNOWLEDGE HUB</div>
          <h1 className="section-title">
            คลังความรู้ <span className="gold-text">บัญชี ภาษี และธุรกิจ</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '14px auto 0' }}>
            รวบรวมสาระน่ารู้ บทความภาษี กฎหมายธุรกิจ และเทคนิคการบริหารจัดการงบการเงิน จากประสบการณ์ตรงของทีมงานดีถาวรการบัญชี
          </p>
        </div>

        {/* Client-side Instant Filter List */}
        <Suspense fallback={<div style={{ minHeight: '320px' }} />}>
          <KnowledgeListClient initialArticles={articles} />
        </Suspense>

        {/* Bottom Consulting Callout */}
        <div
          style={{
            marginTop: '70px',
            padding: '40px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: 'var(--radius-lg)',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
            มีข้อสงสัยเกี่ยวกับภาษีหรือระบบบัญชีของกิจการคุณ?
          </h3>
          <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 24px', fontSize: '1rem', lineHeight: 1.6 }}>
            อย่าปล่อยให้ความไม่แน่ใจกลายเป็นความเสี่ยง ปรึกษาทีมงานนักบัญชีและผู้ตรวจสอบบัญชีของดีถาวรการบัญชีได้ทันที
          </p>
          <Link
            href="/#contact"
            className="btn btn-primary"
            style={{
              padding: '12px 28px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <span>ปรึกษาทีมงานฟรีทันที</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
