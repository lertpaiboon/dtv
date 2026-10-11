'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ArticleEditorForm, { ArticleFormData } from '@/components/admin/ArticleEditorForm';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditArticlePage() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<ArticleFormData | null>(null);
  const [authors, setAuthors] = useState<Array<{ id: number; name: string; role: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!articleId) return;

    setLoading(true);
    setError('');

    Promise.all([
      fetch(`/api/admin/articles/${articleId}`).then((r) => r.json()),
      fetch('/api/admin/articles?limit=1').then((r) => r.json()),
    ])
      .then(([artJson, listJson]) => {
        if (!artJson.success || !artJson.data) {
          throw new Error(artJson.error || 'ไม่พบข้อมูลบทความที่ต้องการ');
        }

        const art = artJson.data;
        setArticle({
          id: art.id,
          title: art.title,
          slug: art.slug,
          category: art.category,
          summary: art.summary,
          contentMarkdown: art.contentMarkdown,
          coverImage: art.coverImage || '',
          coverImageAlt: art.coverImageAlt || '',
          quickAnswer: art.quickAnswer || '',
          authorId: art.authorId,
          reviewerId: art.reviewerId,
          status: art.status,
          nextReviewAt: art.nextReviewAt ? art.nextReviewAt.split('T')[0] : '',
          publishedAt: art.publishedAt,
          faqs: art.faqs || [],
          citations: art.citations || [],
          focusKeyword: art.focusKeyword || '',
          seoScore: art.seoScore || 0,
          isNoIndex: Boolean(art.isNoIndex),
          canonicalUrl: art.canonicalUrl || '',
          ogImage: art.ogImage || '',
        });

        if (listJson.success && Array.isArray(listJson.authors)) {
          setAuthors(listJson.authors);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดบทความ');
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>กำลังโหลดข้อมูลบทความ...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ margin: '0 0 8px', color: 'var(--dtv-navy-950)' }}>{error || 'ไม่พบบทความ'}</h3>
        <Link
          href="/admin/articles"
          style={{
            display: 'inline-block',
            marginTop: '12px',
            color: 'var(--dtv-blue-600)',
            textDecoration: 'underline',
          }}
        >
          กลับสู่รายการบทความทั้งหมด
        </Link>
      </div>
    );
  }

  return <ArticleEditorForm initialData={article} authors={authors} isNew={false} />;
}
