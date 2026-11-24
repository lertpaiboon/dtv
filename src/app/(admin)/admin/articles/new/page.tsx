'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleEditorForm, { type ArticleFormData } from '@/components/admin/ArticleEditorForm';
import { ARTICLE_CATEGORIES, normalizeArticleCategory } from '@/lib/articles/types';
import { RefreshCw } from 'lucide-react';

function sanitizePrefillText(value: string | null | undefined, maxLen = 200): string {
  if (!value) return '';
  return value.replace(/[<>\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function sanitizePrefillUrl(value: string | null | undefined): string {
  const trimmed = (value || '').trim();
  if (!trimmed || /[\s"'<>\\`\u0000-\u001F\u007F]/.test(trimmed)) return '';
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed.slice(0, 300);
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed.slice(0, 300);
  return '';
}

function NewArticlePageInner() {
  const searchParams = useSearchParams();
  const [authors, setAuthors] = useState<Array<{ id: number; name: string; role: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/articles?limit=1')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.authors)) {
          setAuthors(json.authors);
        }
      })
      .catch((err) => console.error('Failed to load authors:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>กำลังเตรียมแบบฟอร์มบทความใหม่...</p>
      </div>
    );
  }

  const paramTitle = sanitizePrefillText(searchParams.get('title'), 255);
  const paramSlug = sanitizePrefillText(searchParams.get('slug'), 255);
  const paramKeyword = sanitizePrefillText(
    searchParams.get('keyword') || searchParams.get('focusKeyword'),
    120
  );
  const paramCategory = sanitizePrefillText(searchParams.get('category'), 80);
  const paramPillarUrl = sanitizePrefillUrl(
    searchParams.get('pillarUrl') || searchParams.get('pillar')
  );
  const paramPillarTitle = sanitizePrefillText(searchParams.get('pillarTitle'), 160) || 'บริการของเรา';

  const hasPrefill = Boolean(paramTitle || paramSlug || paramKeyword || paramPillarUrl);

  const prefilledMarkdown = paramPillarUrl
    ? `## บทนำเกี่ยวกับ ${paramKeyword || paramTitle}\n\nอธิบายหลักเกณฑ์และแนวทางปฏิบัติเกี่ยวกับ **${
        paramKeyword || paramTitle
      }** สำหรับผู้ประกอบการและนิติบุคคล...\n\n> 💡 **ต้องการผู้เชี่ยวชาญดูแลโดยตรง?** ดูรายละเอียดเพิ่มเติมได้ที่ [${paramPillarTitle}](${paramPillarUrl}) หรือ [อัตราค่าบริการทำบัญชีและภาษี](/pricing)\n\n## ขั้นตอนและแนวทางปฏิบัติที่สำคัญ\n\n1. ตรวจสอบเอกสารและหลักฐานทางภาษีให้ครบถ้วน\n2. ยื่นแบบแสดงรายการภายในกำหนดเวลาของกรมสรรพากร\n`
    : '';

  const initialData: ArticleFormData | undefined = hasPrefill
    ? {
        title: paramTitle,
        slug: paramSlug,
        category: paramCategory
          ? normalizeArticleCategory(paramCategory)
          : ARTICLE_CATEGORIES[0] || 'ภาษีและสรรพากร',
        summary: paramKeyword
          ? `สรุปครบทุกประเด็นเรื่อง ${paramKeyword} ขั้นตอน เอกสารที่ต้องใช้ และข้อควรระวังตามเกณฑ์กรมสรรพากร โดยทีมผู้สอบบัญชีรับอนุญาต (CPA) ดีถาวรการบัญชี`
          : '',
        contentMarkdown: prefilledMarkdown,
        coverImage: '',
        coverImageAlt: paramKeyword || paramTitle,
        quickAnswer: paramKeyword
          ? `${paramKeyword} เป็นประเด็นสำคัญที่ผู้ประกอบการต้องดำเนินการให้ถูกต้องตามหลักเกณฑ์ของกรมสรรพากรและกรมพัฒนาธุรกิจการค้า เพื่อป้องกันเบี้ยปรับเงินเพิ่มและรักษาสิทธิประโยชน์ทางภาษีของกิจการอย่างครบถ้วน`
          : '',
        authorId: authors[0]?.id || null,
        reviewerId: authors[1]?.id || authors[0]?.id || null,
        status: 'DRAFT',
        nextReviewAt: '',
        faqs: paramKeyword
          ? [
              {
                question: `${paramKeyword} ต้องเตรียมเอกสารและเริ่มต้นอย่างไร?`,
                answer: `ผู้ประกอบการควรจัดเตรียมเอกสารทางบัญชีและภาษีที่เกี่ยวข้องให้ครบถ้วน และสามารถปรึกษาทีมผู้เชี่ยวชาญของดีถาวรการบัญชีเพื่อตรวจสอบความถูกต้องก่อนยื่นแบบจริง`,
                sortOrder: 0,
              },
              {
                question: `หากดำเนินการล่าช้าหรือไม่ถูกต้องจะมีผลอย่างไร?`,
                answer: `อาจมีภาระเบี้ยปรับและเงินเพิ่มตามประมวลรัษฎากร ดังนั้นจึงควรวางแผนล่วงหน้าและให้สำนักงานบัญชีช่วยดูแลตามกำหนดเวลา`,
                sortOrder: 1,
              },
            ]
          : [],
        citations: [
          {
            title: 'ประมวลรัษฎากร และคู่มือภาษีอากร กรมสรรพากร',
            publisher: 'กรมสรรพากร (Revenue Department)',
            url: 'https://www.rd.go.th',
            referenceDate: '',
            sortOrder: 0,
          },
        ],
        focusKeyword: paramKeyword,
        seoTitle: paramTitle,
        seoDescription: '',
        tags: paramKeyword,
        seoScore: 0,
        isNoIndex: false,
        canonicalUrl: '',
        ogImage: '',
      }
    : undefined;

  return <ArticleEditorForm initialData={initialData} authors={authors} isNew={true} />;
}

export default function NewArticlePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>กำลังเตรียมแบบฟอร์มบทความใหม่...</p>
        </div>
      }
    >
      <NewArticlePageInner />
    </Suspense>
  );
}
