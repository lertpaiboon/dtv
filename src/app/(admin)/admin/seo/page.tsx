'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Globe,
  Zap,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Link2,
  Eye,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Clock,
  Copy,
  SlidersHorizontal,
} from 'lucide-react';

interface SeoStatsData {
  kpi: {
    averageScore: number;
    publishedCount: number;
    draftCount: number;
    archivedCount: number;
    goodScoreCount: number;
    fairScoreCount: number;
    poorScoreCount: number;
    reviewDueCount: number;
    totalRedirects: number;
    totalRedirectHits: number;
    unresolved404Count: number;
    total404Hits: number;
    sitemapUrlCount: number;
    lastIndexingTime: string | null;
    totalIndexPings: number;
  };
  articles: Array<{
    id: number;
    title: string;
    slug: string;
    category: string;
    status: string;
    focusKeyword: string | null;
    seoScore: number;
    nextReviewAt: string | null;
    publishedAt: string | null;
    contentUpdatedAt: string | null;
  }>;
  reviewDueArticles: Array<any>;
  indexingLogs: Array<{
    id: number;
    url: string;
    engine: string;
    status: string;
    response: string | null;
    createdAt: string;
  }>;
  customRedirects: Array<{
    id: number;
    sourcePath: string;
    targetPath: string;
    statusCode: number;
    isActive: boolean;
    hits: number;
    createdAt: string;
  }>;
  articleRedirects: Array<{
    id: number;
    fromSlug: string;
    articleId: number;
    article: { title: string; slug: string };
    createdAt: string;
  }>;
  error404Logs: Array<{
    id: number;
    url: string;
    referrer: string | null;
    hits: number;
    isResolved: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function AdminSeoSuitePage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'indexnow' | 'redirects' | '404' | 'sitemap'>('audit');
  const [data, setData] = useState<SeoStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // IndexNow action states
  const [manualUrl, setManualUrl] = useState('');
  const [submittingIndexNow, setSubmittingIndexNow] = useState(false);

  // Redirect modal states
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [redirectSource, setRedirectSource] = useState('');
  const [redirectTarget, setRedirectTarget] = useState('');
  const [redirectCode, setRedirectCode] = useState<number>(301);
  const [savingRedirect, setSavingRedirect] = useState(false);

  // Convert 404 modal states
  const [convert404ModalOpen, setConvert404ModalOpen] = useState(false);
  const [selected404Log, setSelected404Log] = useState<{ id: number; url: string } | null>(null);
  const [convertTarget, setConvertTarget] = useState('');
  const [converting404, setConverting404] = useState(false);

  // Search in audit
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'good' | 'fair' | 'poor' | 'due'>('all');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSeoData = useCallback(async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/seo/stats');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'ไม่สามารถดึงข้อมูล SEO ได้');
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSeoData();
  }, [fetchSeoData]);

  function handleRefresh() {
    setRefreshing(true);
    fetchSeoData();
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  // Submit single URL to IndexNow
  async function handleSingleIndexNow(e: React.FormEvent) {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    setSubmittingIndexNow(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [manualUrl.trim()] }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ส่ง IndexNow ไม่สำเร็จ');

      setSuccessMsg(json.message || 'ส่งคำขอ IndexNow สำเร็จ');
      setManualUrl('');
      fetchSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingIndexNow(false);
    }
  }

  // Bulk submit all published articles
  async function handleBulkIndexNow() {
    if (!confirm('ยืนยันส่งคำขอ IndexNow สำหรับบทความที่เผยแพร่ทั้งหมดไปยัง Bing และ Search Engines?')) return;

    setSubmittingIndexNow(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'bulk_published' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ส่ง IndexNow ไม่สำเร็จ');

      setSuccessMsg(json.message || 'ส่งคำขอ IndexNow สำเร็จครบทุกบทความ');
      fetchSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingIndexNow(false);
    }
  }

  // Create Custom Redirect
  async function handleSaveRedirect(e: React.FormEvent) {
    e.preventDefault();
    if (!redirectSource.trim() || !redirectTarget.trim()) return;

    setSavingRedirect(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePath: redirectSource.trim(),
          targetPath: redirectTarget.trim(),
          statusCode: redirectCode,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'บันทึก Redirect ไม่สำเร็จ');

      setSuccessMsg(json.message);
      setRedirectModalOpen(false);
      setRedirectSource('');
      setRedirectTarget('');
      fetchSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingRedirect(false);
    }
  }

  // Delete Custom Redirect
  async function handleDeleteRedirect(id: number) {
    if (!confirm('ต้องการลบรายการ Redirect นี้ใช่หรือไม่?')) return;

    try {
      const res = await fetch(`/api/admin/seo/redirects?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');

      setSuccessMsg('ลบรายการ Redirect สำเร็จ');
      fetchSeoData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Convert 404 to 301
  async function handleConvert404Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected404Log || !convertTarget.trim()) return;

    setConverting404(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/404-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert_to_redirect',
          logId: selected404Log.id,
          targetPath: convertTarget.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'แปลง Redirect ไม่สำเร็จ');

      setSuccessMsg(json.message);
      setConvert404ModalOpen(false);
      setSelected404Log(null);
      setConvertTarget('');
      fetchSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConverting404(false);
    }
  }

  // Delete 404 Log
  async function handleDelete404(id: number) {
    try {
      const res = await fetch(`/api/admin/seo/404-logs?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');
      fetchSeoData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Filtered articles in audit
  const filteredArticles = (data?.articles || []).filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(auditSearch.toLowerCase()) ||
      art.slug.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (art.focusKeyword && art.focusKeyword.toLowerCase().includes(auditSearch.toLowerCase()));

    if (!matchSearch) return false;

    if (auditFilter === 'good') return art.seoScore >= 80;
    if (auditFilter === 'fair') return art.seoScore >= 60 && art.seoScore < 80;
    if (auditFilter === 'poor') return art.seoScore < 60;
    if (auditFilter === 'due') {
      if (!art.nextReviewAt) return false;
      const diff = Math.ceil((new Date(art.nextReviewAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff <= 14;
    }
    return true;
  });

  const kpi = data?.kpi;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://deethavorn.com';

  return (
    <div className="admin-page seo-suite-page" style={{ paddingBottom: '60px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Globe size={14} /> DTV SEO SUITE
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#059669',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={12} /> ระบบพร้อมทำงาน 100%
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
            ศูนย์ควบคุมภาพรวม SEO & การตลาดค้นหา
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', margin: 0 }}>
            บริหารจัดการ Instant Indexing (IndexNow), 301 Redirects, 404 Monitor และตรวจสอบคะแนน SEO ทั่วทั้งระบบ
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            <span>รีเฟรช</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBulkIndexNow}
            disabled={submittingIndexNow}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderColor: '#1d4ed8',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            <Zap size={16} />
            <span>ยิง IndexNow ทุกบทความ</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '24px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="admin-alert admin-alert--success" style={{ marginBottom: '24px', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 5 Master KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* KPI 1: Average SEO Score */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>คะแนน SEO เฉลี่ย</span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: (kpi?.averageScore || 0) >= 80 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                color: (kpi?.averageScore || 0) >= 80 ? '#16a34a' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              <Sparkles size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: (kpi?.averageScore || 0) >= 80 ? '#16a34a' : '#d97706' }}>
              {kpi?.averageScore || 0}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>/ 100</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#16a34a' }}>● {kpi?.goodScoreCount || 0} ยอดเยี่ยม</span>
            <span style={{ color: '#d97706' }}>● {kpi?.fairScoreCount || 0} ปานกลาง</span>
            <span style={{ color: '#dc2626' }}>● {kpi?.poorScoreCount || 0} ต้องปรับปรุง</span>
          </div>
        </div>

        {/* KPI 2: Instant Indexing (IndexNow) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Instant Indexing</span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#2563eb' }}>
              {kpi?.totalIndexPings || 0}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>คำขอสะสม</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} />
            <span>เชื่อมต่อ Bing / Yandex พร้อมใช้งาน</span>
          </div>
        </div>

        {/* KPI 3: 301 Redirects */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>301 Redirects</span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(217, 119, 6, 0.1)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Link2 size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {kpi?.totalRedirects || 0}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>เส้นทาง</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>ยอดเรียกใช้งาน: <strong>{kpi?.totalRedirectHits || 0} ครั้ง</strong></span>
          </div>
        </div>

        {/* KPI 4: 404 Errors */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>404 Monitor</span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: (kpi?.unresolved404Count || 0) > 0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                color: (kpi?.unresolved404Count || 0) > 0 ? '#dc2626' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: (kpi?.unresolved404Count || 0) > 0 ? '#dc2626' : '#16a34a' }}>
              {kpi?.unresolved404Count || 0}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>ลิงก์เสียรอแก้ไข</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>ยอดพบเจอล่าสุด: {kpi?.total404Hits || 0} ครั้ง</span>
          </div>
        </div>

        {/* KPI 5: Sitemap URLs */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>XML Sitemap</span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {kpi?.sitemapUrlCount || 0}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>URLs ในแผนผัง</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-dark)' }}>
            <Link href="/sitemap.xml" target="_blank" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
              <span>เปิดดู /sitemap.xml</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          gap: '8px',
          marginBottom: '28px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'audit'}
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'audit' ? '#2563eb' : 'var(--text-muted)',
            borderBottom: activeTab === 'audit' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)',
          }}
        >
          <Sparkles size={16} />
          <span>คะแนน SEO รายบทความ ({data?.articles?.length || 0})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'indexnow'}
          onClick={() => setActiveTab('indexnow')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'indexnow' ? '#2563eb' : 'var(--text-muted)',
            borderBottom: activeTab === 'indexnow' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)',
          }}
        >
          <Zap size={16} />
          <span>Instant Indexing (IndexNow)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'redirects'}
          onClick={() => setActiveTab('redirects')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'redirects' ? '#2563eb' : 'var(--text-muted)',
            borderBottom: activeTab === 'redirects' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)',
          }}
        >
          <Link2 size={16} />
          <span>301 Redirects ({kpi?.totalRedirects || 0})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === '404'}
          onClick={() => setActiveTab('404')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === '404' ? '#2563eb' : 'var(--text-muted)',
            borderBottom: activeTab === '404' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)',
          }}
        >
          <AlertTriangle size={16} />
          <span>404 Monitor ({kpi?.unresolved404Count || 0})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sitemap'}
          onClick={() => setActiveTab('sitemap')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'sitemap' ? '#2563eb' : 'var(--text-muted)',
            borderBottom: activeTab === 'sitemap' ? '3px solid #2563eb' : '3px solid transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'var(--transition)',
          }}
        >
          <Layers size={16} />
          <span>Sitemap & Crawlers</span>
        </button>
      </div>

      {/* TAB 1: SEO AUDIT LIST */}
      {activeTab === 'audit' && (
        <div>
          {/* Review Due Alert Banner if any */}
          {(kpi?.reviewDueCount || 0) > 0 && (
            <div
              style={{
                padding: '16px 20px',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#b45309" />
                <div>
                  <strong style={{ color: '#92400e', fontSize: '0.92rem' }}>
                    มีบทความ {kpi?.reviewDueCount} รายการที่ใกล้ถึงกำหนดทบทวนความถูกต้องของข้อกฎหมาย/ภาษี
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: '#b45309', marginTop: '2px' }}>
                    ควรมอบหมายให้ผู้สอบบัญชี CPA/TA เข้าตรวจทานเนื้อหาเพื่อรักษามาตรฐาน E-E-A-T
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAuditFilter('due')}
                style={{ padding: '6px 14px', fontSize: '0.85rem', borderColor: '#fde68a', color: '#92400e' }}
              >
                กรองเฉพาะบทความครบกำหนด
              </button>
            </div>
          )}

          {/* Audit Controls & Filters */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', maxWidth: '420px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อบทความ, Slug, Focus Keyword..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'ทั้งหมด' },
                { key: 'good', label: '🟢 ยอดเยี่ยม (80+)' },
                { key: 'fair', label: '🟡 ปานกลาง (60-79)' },
                { key: 'poor', label: '🔴 ต่ำกว่าเกณฑ์ (<60)' },
                { key: 'due', label: '⏰ ครบกำหนดทบทวน' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setAuditFilter(f.key as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: auditFilter === f.key ? '1px solid #2563eb' : '1px solid var(--border)',
                    background: auditFilter === f.key ? '#eff6ff' : '#ffffff',
                    color: auditFilter === f.key ? '#2563eb' : 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Table */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>บทความ / หมวดหมู่</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Focus Keyword</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>SEO Score</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>สถานะ</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>ทบทวนกฎหมายรอบถัดไป</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((art) => {
                    const score = art.seoScore || 0;
                    const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
                    const scoreBg = score >= 80 ? '#ecfdf5' : score >= 60 ? '#fffbeb' : '#fef2f2';

                    return (
                      <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 18px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '4px' }}>
                            {art.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ background: 'var(--bg-light)', padding: '2px 8px', borderRadius: '4px' }}>{art.category}</span>
                            <span>/knowledge/{art.slug}</span>
                          </div>
                        </td>

                        <td style={{ padding: '16px 18px' }}>
                          {art.focusKeyword ? (
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e40af', background: '#eff6ff', padding: '4px 10px', borderRadius: '4px' }}>
                              🎯 {art.focusKeyword}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                              ยังไม่ได้ระบุ
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: scoreBg,
                              color: scoreColor,
                              fontWeight: 800,
                              fontSize: '0.92rem',
                              border: `1px solid ${scoreColor}33`,
                            }}
                          >
                            {score} / 100
                          </span>
                        </td>

                        <td style={{ padding: '16px 18px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: art.status === 'PUBLISHED' ? '#ecfdf5' : '#f1f5f9',
                              color: art.status === 'PUBLISHED' ? '#065f46' : 'var(--text-muted)',
                            }}
                          >
                            {art.status}
                          </span>
                        </td>

                        <td style={{ padding: '16px 18px' }}>
                          {art.nextReviewAt ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} color="var(--text-light)" />
                              {new Date(art.nextReviewAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {art.status === 'PUBLISHED' && (
                              <Link
                                href={`/knowledge/${art.slug}`}
                                target="_blank"
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                                title="เปิดดูหน้าสาธารณะ"
                              >
                                <Eye size={14} />
                              </Link>
                            )}
                            <Link
                              href={`/admin/articles/${art.id}`}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span>แก้ไข</span>
                              <ArrowRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      ไม่พบข้อมูลบทความตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INSTANT INDEXING (INDEXNOW) */}
      {activeTab === 'indexnow' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Box 1: Manual Ping Form */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Zap size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  ส่ง URL ขอ Index ทันที (Manual Ping)
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                ส่งคำขอตรงไปยังเครือข่าย IndexNow (Microsoft Bing, Yandex, Seznam) เพื่อให้บอทเข้ามาดึงข้อมูลหน้านี้ทันทีโดยไม่ต้องรอรอบการค้นหาปกติ
              </p>

              <form onSubmit={handleSingleIndexNow}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    URL บทความ หรือหน้าเว็บที่ต้องการส่ง:
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น /knowledge/vat-registration-guide หรือเต็ม URL"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingIndexNow || !manualUrl.trim()}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  <Zap size={16} />
                  <span>{submittingIndexNow ? 'กำลังส่งคำขอ...' : 'ส่งคำขอ IndexNow ทันที'}</span>
                </button>
              </form>
            </div>

            {/* Box 2: Protocol Status & Key Verification */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  การยืนยันตัวตน IndexNow Protocol
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '18px' }}>
                Search Engine จะตรวจสอบความเป็นเจ้าของเว็บไซต์ผ่าน Key Verification Endpoint ที่ระบบสร้างให้อัตโนมัติ
              </p>

              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>API Key Verification Endpoint:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {siteUrl}/api/indexnow
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${siteUrl}/api/indexnow`, 'key-endpoint')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)' }}
                    title="คัดลอกลิงก์"
                  >
                    {copiedKey === 'key-endpoint' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link
                  href="/api/indexnow"
                  target="_blank"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
                >
                  <Eye size={14} />
                  <span>ทดสอบเปิดดู Key ใน Browser</span>
                </Link>
                <Link
                  href="https://www.indexnow.org"
                  target="_blank"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
                >
                  <ExternalLink size={14} />
                  <span>IndexNow.org</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Indexing Logs Table */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>
            ประวัติการส่งคำขอ Instant Indexing ล่าสุด
          </h3>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>URL ที่ส่ง</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Engine</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>สถานะ</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>การตอบกลับ</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {(data?.indexingLogs || []).length > 0 ? (
                  data?.indexingLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {log.url}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {log.engine}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: log.status === 'SUCCESS' ? '#ecfdf5' : '#fef2f2',
                            color: log.status === 'SUCCESS' ? '#059669' : '#dc2626',
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.response || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      ยังไม่มีประวัติการส่งคำขอ IndexNow
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 301 REDIRECTS */}
      {activeTab === 'redirects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                รายการ 301 Permanent Redirects
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                เปลี่ยนเส้นทาง URL เก่าไปยัง URL ใหม่โดยอัตโนมัติ เพื่อส่งต่อคะแนน SEO (PageRank) และป้องกัน 404
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setRedirectSource('');
                setRedirectTarget('');
                setRedirectCode(301);
                setRedirectModalOpen(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
            >
              <Plus size={16} />
              <span>เพิ่ม Redirect ใหม่</span>
            </button>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>URL ต้นทาง (Source)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}></th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>URL ปลายทาง (Target)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>ประเภท</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>จำนวนคลิก (Hits)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Custom Redirects */}
                {(data?.customRedirects || []).map((red) => (
                  <tr key={`custom-${red.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#dc2626' }}>
                      {red.sourcePath}
                    </td>
                    <td style={{ padding: '14px 8px', color: 'var(--text-light)', textAlign: 'center' }}>➔</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#16a34a' }}>
                      {red.targetPath}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1e40af', fontSize: '0.78rem', fontWeight: 700 }}>
                        HTTP {red.statusCode}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                      {red.hits}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRedirect(red.id)}
                        className="admin-icon-button"
                        style={{ color: '#dc2626' }}
                        title="ลบ Redirect"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* 2. Article Redirects */}
                {(data?.articleRedirects || []).map((artRed) => (
                  <tr key={`art-${artRed.id}`} style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#dc2626' }}>
                      /knowledge/{artRed.fromSlug}
                    </td>
                    <td style={{ padding: '14px 8px', color: 'var(--text-light)', textAlign: 'center' }}>➔</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#16a34a' }}>
                      /knowledge/{artRed.article.slug}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '0.78rem', fontWeight: 700 }}>
                        Article Slug (301)
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      อัตโนมัติ
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ระบบบทความ</span>
                    </td>
                  </tr>
                ))}

                {(!data?.customRedirects || data.customRedirects.length === 0) &&
                  (!data?.articleRedirects || data.articleRedirects.length === 0) && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        ยังไม่มีรายการ 301 Redirect ในระบบ
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: 404 MONITOR */}
      {activeTab === '404' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                404 Broken Link Monitor
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                ตรวจจับหน้าที่ผู้ใช้หรือบอทเปิดเข้ามาแล้วไม่พบข้อมูล แปลงเป็น 301 Redirect ได้ในคลิกเดียวเพื่อรักษา Traffic
              </p>
            </div>
            {(data?.error404Logs || []).some((e) => e.isResolved) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  await fetch('/api/admin/seo/404-logs?id=all_resolved', { method: 'DELETE' });
                  fetchSeoData();
                }}
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              >
                ล้างรายการที่แก้ไขแล้ว
              </button>
            )}
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>URL ที่ไม่พบหน้า (404 Path)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>จำนวนครั้ง (Hits)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Referrer (ที่มา)</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>สถานะ</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {(data?.error404Logs || []).length > 0 ? (
                  data?.error404Logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#dc2626' }}>
                        {log.url}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>
                        {log.hits}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.referrer || 'เข้าชมโดยตรง (Direct)'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: log.isResolved ? '#ecfdf5' : '#fff1f2',
                            color: log.isResolved ? '#059669' : '#dc2626',
                          }}
                        >
                          {log.isResolved ? 'แก้ไขแล้ว' : 'ยังไม่แก้ไข'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              setSelected404Log({ id: log.id, url: log.url });
                              setConvertTarget('/knowledge');
                              setConvert404ModalOpen(true);
                            }}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Link2 size={13} />
                            <span>แปลงเป็น 301</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete404(log.id)}
                            className="admin-icon-button"
                            style={{ color: 'var(--text-light)' }}
                            title="ลบรายการ"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      ยอดเยี่ยมมาก! ไม่มีบันทึกข้อผิดพลาด 404 ในขณะนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SITEMAP & CRAWLERS */}
      {activeTab === 'sitemap' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Sitemap Info Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Layers size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  Dynamic XML Sitemap
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                แผนผังไซต์จะอัปเดตอัตโนมัติแบบ Server-Side เมื่อมีบทความใหม่ที่เปลี่ยนสถานะเป็น <code>PUBLISHED</code> โดยกรอง Draft และ Archived ออกทั้งหมด
              </p>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Sitemap URL:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>{siteUrl}/sitemap.xml</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${siteUrl}/sitemap.xml`, 'sitemap')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)' }}
                  >
                    {copiedKey === 'sitemap' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href="/sitemap.xml" target="_blank" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}>
                  <Eye size={14} />
                  <span>เปิดดูไฟล์ Sitemap</span>
                </Link>
              </div>
            </div>

            {/* Robots.txt Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                  Robots & AI Crawl Policy
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                ควบคุมการเข้าถึงของ Search Engine Bots และ AI Discovery Bots (เปิดรับ <strong>OAI-SearchBot</strong> สำหรับ ChatGPT Search พร้อมป้องกันเส้นทาง <code>/admin/</code>)
              </p>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Robots.txt URL:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>{siteUrl}/robots.txt</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${siteUrl}/robots.txt`, 'robots')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-dark)' }}
                  >
                    {copiedKey === 'robots' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href="/robots.txt" target="_blank" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}>
                  <Eye size={14} />
                  <span>เปิดดูไฟล์ Robots.txt</span>
                </Link>
              </div>
            </div>
          </div>

          {/* External Verification Tools */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>
            เครื่องมือตรวจสอบมาตรฐาน Rich Results และ Search Console
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <Link
              href="https://search.google.com/test/rich-results"
              target="_blank"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'var(--transition)',
              }}
              className="hover-card"
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary)' }}>Google Rich Results Test</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ทดสอบ Schema Article, FAQPage, Breadcrumb</span>
              </div>
              <ArrowUpRight size={18} color="var(--accent-dark)" />
            </Link>

            <Link
              href="https://search.google.com/search-console"
              target="_blank"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'var(--transition)',
              }}
              className="hover-card"
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary)' }}>Google Search Console</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ตรวจสอบ Index, Performance, Search Queries</span>
              </div>
              <ArrowUpRight size={18} color="var(--accent-dark)" />
            </Link>

            <Link
              href="https://www.bing.com/webmasters"
              target="_blank"
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'var(--transition)',
              }}
              className="hover-card"
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--primary)' }}>Bing Webmaster Tools</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ตรวจสถานะ Instant Indexing และ Bingbot</span>
              </div>
              <ArrowUpRight size={18} color="var(--accent-dark)" />
            </Link>
          </div>
        </div>
      )}

      {/* MODAL: ADD 301 REDIRECT */}
      {redirectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRedirectModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px 32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                เพิ่ม 301 Redirect เส้นทางใหม่
              </h3>
              <button
                type="button"
                onClick={() => setRedirectModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRedirect}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  URL ต้นทาง (Source Path):
                </label>
                <input
                  type="text"
                  placeholder="เช่น /vat-guide หรือ /old-page"
                  value={redirectSource}
                  onChange={(e) => setRedirectSource(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  URL ปลายทาง (Target Path):
                </label>
                <input
                  type="text"
                  placeholder="เช่น /knowledge/vat-registration-guide"
                  value={redirectTarget}
                  onChange={(e) => setRedirectTarget(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  ประเภทการ Redirect:
                </label>
                <select
                  value={redirectCode}
                  onChange={(e) => setRedirectCode(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value={301}>301 Permanent Redirect (แนะนำสำหรับ SEO)</option>
                  <option value={302}>302 Temporary Redirect (ชั่วคราว)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRedirectModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingRedirect}
                  className="btn btn-primary"
                >
                  {savingRedirect ? 'กำลังบันทึก...' : 'บันทึก Redirect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVERT 404 TO 301 */}
      {convert404ModalOpen && selected404Log && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConvert404ModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px 32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                แปลง 404 เป็น 301 Redirect
              </h3>
              <button
                type="button"
                onClick={() => setConvert404ModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConvert404Submit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  URL ที่ไม่พบหน้า (404 Error Path):
                </label>
                <input
                  type="text"
                  value={selected404Log.url}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: '#f8fafc',
                    color: '#dc2626',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  ต้องการให้เปลี่ยนทางไปยัง URL ใด (Target Path):
                </label>
                <input
                  type="text"
                  placeholder="เช่น /knowledge หรือ /knowledge/ชื่อบทความ"
                  value={convertTarget}
                  onChange={(e) => setConvertTarget(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConvert404ModalOpen(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={converting404}
                  className="btn btn-primary"
                >
                  {converting404 ? 'กำลังบันทึก...' : 'สร้าง 301 Redirect ทันที'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
