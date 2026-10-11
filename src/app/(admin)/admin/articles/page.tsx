'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Archive,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  contentUpdatedAt: string | null;
  reviewedAt: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: number; name: string; role: string | null } | null;
  reviewer?: { id: number; name: string; role: string | null } | null;
  focusKeyword?: string | null;
  seoScore?: number | null;
  _count: {
    faqs: number;
    citations: number;
    redirects: number;
  };
}

interface ArticleStats {
  TOTAL: number;
  DRAFT: number;
  IN_REVIEW: number;
  APPROVED: number;
  PUBLISHED: number;
  ARCHIVED: number;
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PUBLISHED: { label: 'เผยแพร่แล้ว', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  APPROVED: { label: 'อนุมัติแล้ว', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  IN_REVIEW: { label: 'รอตรวจสอบ', bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
  DRAFT: { label: 'ฉบับร่าง', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  ARCHIVED: { label: 'จัดเก็บ/ระงับ', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

export default function AdminArticlesPage() {
  const router = useRouter();
  const { user } = useAdminSession();

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    TOTAL: 0,
    DRAFT: 0,
    IN_REVIEW: 0,
    APPROVED: 0,
    PUBLISHED: 0,
    ARCHIVED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canCreate = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:create'));
  const canEdit = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:edit'));
  const canReview = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:review'));
  const canPublish = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:publish'));
  const canDelete = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:delete'));
  const canArchive = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:archive'));

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'ไม่สามารถโหลดรายการบทความได้');
      }

      setArticles(json.data || []);
      setStats(json.stats || { TOTAL: 0, DRAFT: 0, IN_REVIEW: 0, APPROVED: 0, PUBLISHED: 0, ARCHIVED: 0 });
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery, page]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleQuickAction = async (articleId: number, action: 'submit' | 'approve' | 'publish' | 'archive' | 'delete') => {
    if (action === 'delete') {
      if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?')) return;
    }

    try {
      let res: Response;
      if (action === 'submit') {
        res = await fetch(`/api/admin/articles/${articleId}/submit`, { method: 'POST' });
      } else if (action === 'approve') {
        res = await fetch(`/api/admin/articles/${articleId}/approve`, { method: 'POST' });
      } else if (action === 'publish') {
        res = await fetch(`/api/admin/articles/${articleId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'publish' }),
        });
      } else if (action === 'archive') {
        res = await fetch(`/api/admin/articles/${articleId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'archive' }),
        });
      } else {
        res = await fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'การดำเนินการไม่สำเร็จ');
      }

      setSuccessMsg(json.message || 'ดำเนินการสำเร็จ');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const formatDateThai = (isoDate?: string | null) => {
    if (!isoDate) return '-';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  const isReviewOverdue = (nextReviewAt?: string | null) => {
    if (!nextReviewAt) return false;
    const reviewDate = new Date(nextReviewAt);
    return reviewDate.getTime() < Date.now();
  };

  return (
    <div className="admin-page-stack">
      {/* Standard Page Header */}
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
          <span className="admin-page-header__icon" aria-hidden="true">
            <BookOpen size={20} />
          </span>
          <div>
            <h1>จัดการคลังความรู้และบทความ (Knowledge Hub)</h1>
            <p>ศูนย์บริหารบทความบัญชี ภาษี นิติบุคคล พร้อมระบบตรวจทาน E-E-A-T และ SEO/AEO</p>
          </div>
        </div>

        {canCreate && (
          <div className="admin-page-actions">
            <Link
              href="/admin/articles/new"
              className="admin-primary-button text-xs"
              style={{ textDecoration: 'none' }}
            >
              <Plus className="w-4 h-4" />
              <span>เขียนบทความใหม่</span>
            </Link>
          </div>
        )}
      </header>

      {/* Success / Alert Banner */}
      {successMsg && (
        <div
          style={{
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.92rem',
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stat Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => { setStatusFilter('ALL'); setPage(1); }}
          style={{
            background: statusFilter === 'ALL' ? 'var(--dtv-navy-900)' : '#ffffff',
            color: statusFilter === 'ALL' ? '#ffffff' : 'var(--dtv-ink)',
            border: '1px solid var(--admin-card-border)',
            borderRadius: '12px',
            padding: '16px 20px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>บทความทั้งหมด</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{stats.TOTAL}</div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('PUBLISHED'); setPage(1); }}
          style={{
            background: statusFilter === 'PUBLISHED' ? '#059669' : '#ffffff',
            color: statusFilter === 'PUBLISHED' ? '#ffffff' : '#059669',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '16px 20px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>เผยแพร่แล้ว (Public)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{stats.PUBLISHED}</div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('IN_REVIEW'); setPage(1); }}
          style={{
            background: statusFilter === 'IN_REVIEW' ? '#ca8a04' : '#ffffff',
            color: statusFilter === 'IN_REVIEW' ? '#ffffff' : '#ca8a04',
            border: '1px solid #fef08a',
            borderRadius: '12px',
            padding: '16px 20px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>รอตรวจสอบ (In Review)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{stats.IN_REVIEW}</div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('APPROVED'); setPage(1); }}
          style={{
            background: statusFilter === 'APPROVED' ? '#2563eb' : '#ffffff',
            color: statusFilter === 'APPROVED' ? '#ffffff' : '#2563eb',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '16px 20px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>อนุมัติแล้ว (Approved)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{stats.APPROVED}</div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('DRAFT'); setPage(1); }}
          style={{
            background: statusFilter === 'DRAFT' ? '#475569' : '#ffffff',
            color: statusFilter === 'DRAFT' ? '#ffffff' : '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '16px 20px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>แบบร่าง (Draft)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{stats.DRAFT}</div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('ARCHIVED'); setPage(1); }}
          style={{
            background: statusFilter === 'ARCHIVED' ? '#dc2626' : '#ffffff',
            color: statusFilter === 'ARCHIVED' ? '#ffffff' : '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px 20px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>จัดเก็บ (Archived)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{stats.ARCHIVED}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '400px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อบทความ หรือ Slug..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: 'var(--dtv-ink)',
              background: '#ffffff',
            }}
          >
            <option value="ALL">ทุกหมวดหมู่</option>
            <option value="ภาษีและสรรพากร">ภาษีและสรรพากร</option>
            <option value="จดทะเบียนธุรกิจ">จดทะเบียนธุรกิจ</option>
            <option value="ตรวจสอบบัญชี">ตรวจสอบบัญชี</option>
            <option value="วางแผนภาษี">วางแผนภาษี</option>
            <option value="บัญชีและงบการเงิน">บัญชีและงบการเงิน</option>
            <option value="ทรัพยากรบุคคล">ทรัพยากรบุคคล</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: 'var(--dtv-ink)',
              background: '#ffffff',
            }}
          >
            <option value="ALL">ทุกสถานะ ({stats.TOTAL})</option>
            <option value="PUBLISHED">เผยแพร่แล้ว ({stats.PUBLISHED})</option>
            <option value="IN_REVIEW">รอตรวจสอบ ({stats.IN_REVIEW})</option>
            <option value="APPROVED">อนุมัติแล้ว ({stats.APPROVED})</option>
            <option value="DRAFT">ฉบับร่าง ({stats.DRAFT})</option>
            <option value="ARCHIVED">จัดเก็บ/ระงับ ({stats.ARCHIVED})</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => fetchArticles()}
          title="รีเฟรชข้อมูล"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.88rem',
            color: 'var(--dtv-muted)',
          }}
        >
          <RefreshCw size={15} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Articles Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  ชื่อบทความ & Slug
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  หมวดหมู่
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  ผู้เขียน / ผู้ตรวจ
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  สถานะ
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  SEO Score
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  วันที่เผยแพร่
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  กำหนดทบทวน
                </th>
                <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: '0.88rem', color: '#475569', textAlign: 'right' }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>กำลังโหลดบทความ...</span>
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--dtv-ink)' }}>ไม่พบบทความตามเงื่อนไขที่เลือก</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>ลองปรับตัวกรองหรือกด &quot;เขียนบทความใหม่&quot; เพื่อเริ่มต้น</p>
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const badge = STATUS_BADGES[art.status] || STATUS_BADGES.DRAFT;
                  const overdue = isReviewOverdue(art.nextReviewAt);

                  return (
                    <tr
                      key={art.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      className="hover-bg-slate"
                    >
                      {/* Title & Slug */}
                      <td style={{ padding: '16px 20px', maxWidth: '340px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--dtv-navy-950)', marginBottom: '4px' }}>
                          <Link
                            href={`/admin/articles/${art.id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            className="hover-underline"
                          >
                            {art.title}
                          </Link>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>/knowledge/{art.slug}</span>
                          {art.status === 'PUBLISHED' && (
                            <a
                              href={`/knowledge/${art.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="ดูหน้าบทความจริง"
                              style={{ color: 'var(--dtv-blue-600)', display: 'inline-flex' }}
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '16px 16px', fontSize: '0.88rem' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                          }}
                        >
                          {art.category}
                        </span>
                      </td>

                      {/* Author / Reviewer */}
                      <td style={{ padding: '16px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        <div>
                          <strong>{art.author?.name || 'ไม่ระบุผู้เขียน'}</strong>
                        </div>
                        {art.reviewer && (
                          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '2px' }}>
                            ตรวจ: {art.reviewer.name}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* SEO Score Badge */}
                      <td style={{ padding: '16px 16px' }}>
                        {typeof art.seoScore === 'number' && art.seoScore > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                background: art.seoScore >= 80 ? '#dcfce7' : art.seoScore >= 50 ? '#fef3c7' : '#fee2e2',
                                color: art.seoScore >= 80 ? '#15803d' : art.seoScore >= 50 ? '#b45309' : '#b91c1c',
                                border: `1px solid ${art.seoScore >= 80 ? '#bbf7d0' : art.seoScore >= 50 ? '#fde68a' : '#fecaca'}`,
                                width: 'fit-content',
                              }}
                            >
                              <span>{art.seoScore} / 100</span>
                            </span>
                            {art.focusKeyword && (
                              <span style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={art.focusKeyword}>
                                {art.focusKeyword}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td style={{ padding: '16px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {formatDateThai(art.publishedAt)}
                      </td>

                      {/* Next Review Due Date */}
                      <td style={{ padding: '16px 16px', fontSize: '0.85rem' }}>
                        {art.nextReviewAt ? (
                          <span
                            style={{
                              color: overdue ? '#dc2626' : '#475569',
                              fontWeight: overdue ? 700 : 400,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {overdue && <AlertTriangle size={14} color="#dc2626" />}
                            {formatDateThai(art.nextReviewAt)}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Quick Workflow Action Buttons */}
                          {art.status === 'DRAFT' && canEdit && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(art.id, 'submit')}
                              title="ส่งให้ผู้เชี่ยวชาญตรวจ"
                              style={{
                                padding: '6px 10px',
                                background: '#fefce8',
                                border: '1px solid #fef08a',
                                borderRadius: '6px',
                                color: '#ca8a04',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Send size={12} />
                              <span>ส่งตรวจ</span>
                            </button>
                          )}

                          {art.status === 'IN_REVIEW' && canReview && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(art.id, 'approve')}
                              title="อนุมัติเนื้อหา"
                              style={{
                                padding: '6px 10px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                color: '#2563eb',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ShieldCheck size={12} />
                              <span>อนุมัติ</span>
                            </button>
                          )}

                          {art.status === 'APPROVED' && canPublish && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(art.id, 'publish')}
                              title="เผยแพร่สู่สาธารณะ"
                              style={{
                                padding: '6px 10px',
                                background: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                borderRadius: '6px',
                                color: '#059669',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle2 size={12} />
                              <span>เผยแพร่</span>
                            </button>
                          )}

                          {/* Edit button */}
                          <Link
                            href={`/admin/articles/${art.id}`}
                            style={{
                              padding: '6px 10px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              color: 'var(--dtv-ink)',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="แก้ไขบทความ"
                          >
                            <Edit size={13} />
                            <span>แก้ไข</span>
                          </Link>

                          {/* Archive / Delete */}
                          {art.status === 'PUBLISHED' && canArchive && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(art.id, 'archive')}
                              title="ระงับ/จัดเก็บบทความ"
                              style={{
                                padding: '6px 8px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                color: '#dc2626',
                                cursor: 'pointer',
                              }}
                            >
                              <Archive size={14} />
                            </button>
                          )}

                          {art.status === 'DRAFT' && canDelete && (
                            <button
                              type="button"
                              onClick={() => handleQuickAction(art.id, 'delete')}
                              title="ลบบทความ"
                              style={{
                                padding: '6px 8px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                color: '#dc2626',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.88rem',
              color: '#64748b',
            }}
          >
            <div>
              หน้า {page} จาก {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
