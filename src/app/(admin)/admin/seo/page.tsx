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
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Clock,
  Copy,
  Target,
  TrendingUp,
  Compass,
  Network,
  Upload,
  Settings,
  Bot,
  Award,
  BookmarkPlus,
} from 'lucide-react';

type ActiveCommandTab =
  | 'CONTENT_GAP'
  | 'STRIKING_DISTANCE'
  | 'CTR_BOOSTER'
  | 'PLAN'
  | 'TOP_PERFORMER'
  | 'INDEXING'
  | 'EXPLORER'
  | 'INTERNAL_LINKS'
  | 'REDIRECTS_404'
  | 'AUDIT_GEO';

export default function AdminSeoSuitePage() {
  const [activeTab, setActiveTab] = useState<ActiveCommandTab>('CONTENT_GAP');
  const [statsData, setStatsData] = useState<any | null>(null);
  const [intelData, setIntelData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // GSC Config & CSV Import Modals
  const [gscModalOpen, setGscModalOpen] = useState(false);
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [gscSiteUrlInput, setGscSiteUrlInput] = useState('');
  const [savingGsc, setSavingGsc] = useState(false);
  const [serviceDisabledUrl, setServiceDisabledUrl] = useState('');

  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importingCsv, setImportingCsv] = useState(false);

  // Content Plan Quick Add
  const [newPlanKeyword, setNewPlanKeyword] = useState('');
  const [addingPlan, setAddingPlan] = useState(false);

  // Proactive Keyword Explorer
  const [explorerSeed, setExplorerSeed] = useState('จดทะเบียนบริษัท');
  const [exploring, setExploring] = useState(false);
  const [explorerResults, setExplorerResults] = useState<any[]>([]);

  // 1-Click Internal Link Insertion state
  const [insertingLinkKey, setInsertingLinkKey] = useState<string | null>(null);

  // Instant Indexing states
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

  // Audit filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'good' | 'fair' | 'poor' | 'due'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchAllSeoData = useCallback(async () => {
    try {
      setError('');
      const [statsRes, intelRes] = await Promise.all([
        fetch('/api/admin/seo/stats'),
        fetch('/api/admin/seo/intelligence'),
      ]);
      const [statsJson, intelJson] = await Promise.all([
        statsRes.json(),
        intelRes.json(),
      ]);

      if (!statsRes.ok || !statsJson.success) {
        throw new Error(statsJson.error || 'ไม่สามารถดึงข้อมูลสถิติ SEO ได้');
      }
      if (!intelRes.ok || !intelJson.success) {
        throw new Error(intelJson.error || 'ไม่สามารถดึงข้อมูล SEO Intelligence ได้');
      }

      setStatsData(statsJson.data);
      setIntelData(intelJson.data);
      if (intelJson.data?.connection?.siteUrl && !gscSiteUrlInput) {
        setGscSiteUrlInput(intelJson.data.connection.siteUrl);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [gscSiteUrlInput]);

  useEffect(() => {
    fetchAllSeoData();
  }, [fetchAllSeoData]);

  function handleRefresh() {
    setRefreshing(true);
    fetchAllSeoData();
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  // Build 1-Click New Article URL with query params
  function buildOneClickWriteUrl(item: {
    suggestedTitle: string;
    suggestedSlug: string;
    query?: string;
    keyword?: string;
    suggestedCategory?: string;
    category?: string;
    pillarUrl?: string;
    pillarTitle?: string;
  }) {
    const kw = item.query || item.keyword || '';
    const cat = item.suggestedCategory || item.category || 'ภาษีและสรรพากร';
    const params = new URLSearchParams({
      title: item.suggestedTitle || kw,
      slug: item.suggestedSlug || '',
      keyword: kw,
      category: cat,
      pillarUrl: item.pillarUrl || '/services/accounting-tax',
      pillarTitle: item.pillarTitle || 'บริการทำบัญชีและภาษีครบวงจร',
    });
    return `/admin/articles/new?${params.toString()}`;
  }

  // Save GSC Config & Sync
  async function handleSaveGscConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingGsc(true);
    setError('');
    setServiceDisabledUrl('');
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_gsc_config',
          serviceAccountJson,
          siteUrl: gscSiteUrlInput,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.serviceDisabledUrl) {
          setServiceDisabledUrl(json.serviceDisabledUrl);
        }
        throw new Error(json.error || 'เชื่อมต่อ GSC ไม่สำเร็จ');
      }
      setSuccessMsg(json.message);
      setGscModalOpen(false);
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingGsc(false);
    }
  }

  // Sync Live GSC
  async function handleSyncLiveGsc() {
    setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_live_gsc' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ซิงค์ข้อมูลสดไม่สำเร็จ');
      setSuccessMsg(json.message);
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
      setRefreshing(false);
    }
  }

  // Import CSV
  async function handleImportCsv(e: React.FormEvent) {
    e.preventDefault();
    if (!csvText.trim()) return;
    setImportingCsv(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_csv',
          csvContent: csvText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'นำเข้า CSV ไม่สำเร็จ');
      setSuccessMsg(json.message);
      setCsvModalOpen(false);
      setCsvText('');
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImportingCsv(false);
    }
  }

  // Add item to Content Plan
  async function handleAddToPlan(item: {
    keyword: string;
    suggestedTitle?: string;
    suggestedSlug?: string;
    category?: string;
    pillarUrl?: string;
    pillarTitle?: string;
    impressions?: number;
  }) {
    setAddingPlan(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_to_plan',
          ...item,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'เพิ่มแผนบทความไม่สำเร็จ');
      setSuccessMsg(json.message);
      setNewPlanKeyword('');
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingPlan(false);
    }
  }

  async function handleDeletePlanItem(id: string) {
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_plan_item', id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAllSeoData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Proactive Keyword Explorer
  async function handleExploreKeywords(seedOverride?: string) {
    const targetSeed = (seedOverride ?? explorerSeed).trim();
    if (!targetSeed) return;
    if (seedOverride) setExplorerSeed(seedOverride);

    setExploring(true);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'explore_keywords', seed: targetSeed }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ค้นหาคีย์เวิร์ดไม่สำเร็จ');
      setExplorerResults(json.data || []);
      setSuccessMsg(json.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExploring(false);
    }
  }

  // 1-Click Auto-Insert Internal Link
  async function handleOneClickInsertLink(
    sourceArticleId: number,
    targetSlug: string,
    matchedPhrase: string
  ) {
    const key = `${sourceArticleId}-${targetSlug}`;
    setInsertingLinkKey(key);
    setError('');
    try {
      const res = await fetch('/api/admin/seo/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insert_internal_link',
          sourceArticleId,
          targetSlug,
          matchedPhrase,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'แทรกลิงก์ไม่สำเร็จ');
      setSuccessMsg(json.message);
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInsertingLinkKey(null);
    }
  }

  // Multi-Channel Instant Indexing
  async function handleSingleIndexNow(urlToSubmit: string) {
    if (!urlToSubmit.trim()) return;
    setSubmittingIndexNow(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [urlToSubmit.trim()] }),
      });
      const json = await res.json();
      if (!res.ok && !json.success) throw new Error(json.error || 'ส่ง Instant Indexing ไม่สำเร็จ');
      setSuccessMsg(json.message || 'ส่งสัญญาณ Multi-Channel Indexing สำเร็จ');
      setManualUrl('');
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingIndexNow(false);
    }
  }

  async function handleBulkIndexNow() {
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
      if (!res.ok && !json.success) throw new Error(json.error || 'ส่ง Bulk Indexing ไม่สำเร็จ');
      setSuccessMsg(json.message || 'ส่งสัญญาณ Bulk Multi-Channel Indexing สำเร็จครบทุกหน้า');
      fetchAllSeoData();
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
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingRedirect(false);
    }
  }

  async function handleDeleteRedirect(id: number) {
    try {
      const res = await fetch(`/api/admin/seo/redirects?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');
      setSuccessMsg('ลบรายการ Redirect สำเร็จ');
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    }
  }

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
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConverting404(false);
    }
  }

  async function handleDelete404(id: number) {
    try {
      const res = await fetch(`/api/admin/seo/404-logs?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');
      fetchAllSeoData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 14px', color: '#c5a059' }} />
        <h3 style={{ margin: '0 0 6px', color: '#091c3a', fontWeight: 700 }}>
          กำลังประมวลผลระบบ SEO Intelligence & AI Search OS...
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          วิเคราะห์คีย์เวิร์ด 4 Opportunity Buckets • ตรวจสอบ Anti-Cannibalization • สแกน Internal Links
        </p>
      </div>
    );
  }

  const connection = intelData?.connection || {};
  const report = intelData?.plainEnglishReport;
  const buckets = intelData?.buckets || {
    CONTENT_GAP: [],
    STRIKING_DISTANCE: [],
    CTR_BOOSTER: [],
    TOP_PERFORMER: [],
  };
  const contentPlan: any[] = intelData?.contentPlan || [];
  const linkMatrix = intelData?.linkMatrix || { matrix: [], orphanCount: 0, opportunities: [] };
  const brokenLinks: any[] = intelData?.brokenLinks || [];
  const kpi = statsData?.kpi || {};
  const articles: any[] = statsData?.articles || [];

  const tierBadgeMap: Record<string, { label: string; bg: string; color: string }> = {
    LIVE_API: { label: '🟢 LIVE GSC API', bg: '#dcfce7', color: '#166534' },
    CACHED_SYNC: { label: '🔵 CACHED GSC SYNC', bg: '#dbeafe', color: '#1e40af' },
    CSV_IMPORT: { label: '🟣 CSV IMPORTED DATA', bg: '#f3e8ff', color: '#6b21a8' },
    DEMO_SIMULATION: { label: '🟡 DEMO SIMULATION (ข้อมูลจำลองเสมือนจริง)', bg: '#fef3c7', color: '#92400e' },
  };
  const activeTierBadge = tierBadgeMap[connection.tier] || tierBadgeMap.DEMO_SIMULATION;

  function renderRankDeltaBadge(row: any) {
    if (row.deltaStatus === 'NEW' || row.positionDelta === null || row.positionDelta === undefined) {
      return (
        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>
          ★ ใหม่
        </span>
      );
    }
    if (row.deltaStatus === 'UP') {
      return (
        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
          ▲ +{Math.abs(row.positionDelta).toFixed(1)}
        </span>
      );
    }
    if (row.deltaStatus === 'DOWN') {
      return (
        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#b45309' }}>
          ▼ -{Math.abs(row.positionDelta).toFixed(1)}
        </span>
      );
    }
    return (
      <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>
        — คงที่
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* 1. Header & GSC Data Source Controls */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091c3a 0%, #122b54 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 28px rgba(9, 28, 58, 0.16)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.76rem',
                fontWeight: 700,
                background: activeTierBadge.bg,
                color: activeTierBadge.color,
              }}
            >
              {activeTierBadge.label}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Property: <strong>{connection.siteUrl}</strong>
            </span>
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            ศูนย์ควบคุม SEO Intelligence & AI Search OS (7-Layer Framework)
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
            ตัดสินช่องว่างเนื้อหาจากหน้าที่ Google จัดอันดับจริง • ป้องกัน Keyword Cannibalization • ส่งดัชนี 3 ช่องทาง & คลังความรู้ `/llms.txt`
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setGscModalOpen(true)}
            style={{
              padding: '9px 14px',
              borderRadius: '9px',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Settings size={15} />
            <span>ตั้งค่า GSC API</span>
          </button>

          <button
            type="button"
            onClick={() => setCsvModalOpen(true)}
            style={{
              padding: '9px 14px',
              borderRadius: '9px',
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={15} />
            <span>นำเข้า CSV</span>
          </button>

          {connection.hasServiceAccount && (
            <button
              type="button"
              onClick={handleSyncLiveGsc}
              disabled={refreshing}
              style={{
                padding: '9px 16px',
                borderRadius: '9px',
                border: 'none',
                background: '#c5a059',
                color: '#091c3a',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>ดึงข้อมูลสด GSC</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '9px 14px',
              borderRadius: '9px',
              border: '1px solid rgba(197, 160, 89, 0.5)',
              background: 'rgba(197, 160, 89, 0.16)',
              color: '#fbbf24',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {(error || successMsg) && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: error ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`,
            color: error ? '#991b1b' : '#166534',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {error ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{error || successMsg}</span>
            {serviceDisabledUrl && (
              <a
                href={serviceDisabledUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 700 }}
              >
                คลิกเปิดใช้งาน Google Search Console API ที่นี่ ↗
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setError('');
              setSuccessMsg('');
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Layer 3: Executive Briefing & Next 3 Actions */}
      {report && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '22px 26px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={20} color="#c5a059" />
            <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#091c3a' }}>
              สรุปภาพรวมและแผนงาน SEO ประจำสัปดาห์ (Executive Briefing)
            </h2>
          </div>

          <p style={{ margin: '0 0 6px', fontSize: '0.96rem', fontWeight: 700, color: '#1e293b' }}>
            {report.headline}
          </p>
          <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
            {report.summaryParagraph}
          </p>

          {/* 3 Highlights Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                🏆 คีย์เวิร์ดที่ดึงคนเข้าเว็บสูงสุด (Top Performer)
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#14532d', marginTop: '4px' }}>
                {report.topPerformerHighlight}
              </div>
            </div>

            <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                💎 โอกาสเขียนบทความใหม่ที่น่าทำที่สุด (Top Content Gap)
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a', marginTop: '4px' }}>
                {report.topContentGapHighlight}
              </div>
            </div>

            <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fde047' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#a16207', textTransform: 'uppercase' }}>
                🚀 คีย์เวิร์ดที่ดันขึ้น Top 5 ได้ไวที่สุด (Quick Win)
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#713f12', marginTop: '4px' }}>
                {report.fastestWinHighlight}
              </div>
            </div>
          </div>

          {/* Next 3 Actions This Week */}
          {report.nextThreeActions && report.nextThreeActions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#091c3a', marginBottom: '10px' }}>
                ⚡ 3 งานสำคัญที่แนะนำให้ทำก่อนในสัปดาห์นี้ (Priority Actions):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {report.nextThreeActions.map((act: any) => (
                  <div
                    key={act.step}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#091c3a', marginBottom: '4px' }}>
                        {act.step}. {act.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                        {act.detail}
                      </div>
                    </div>
                    {act.actionUrl && (
                      <Link
                        href={act.actionUrl}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#091c3a',
                          color: '#fbbf24',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Zap size={13} />
                        <span>{act.actionLabel}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. 8-Tab SEO Command Center Navigation Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          background: '#ffffff',
          padding: '10px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        {[
          {
            id: 'CONTENT_GAP' as const,
            label: '1. Content Gap (บทความที่ยังขาด)',
            count: buckets.CONTENT_GAP.length,
            icon: Sparkles,
          },
          {
            id: 'STRIKING_DISTANCE' as const,
            label: '2. Striking Distance (อันดับ 5–20)',
            count: buckets.STRIKING_DISTANCE.length,
            icon: TrendingUp,
          },
          {
            id: 'CTR_BOOSTER' as const,
            label: '3. CTR Booster (ปรับ Title เพิ่มคลิก)',
            count: buckets.CTR_BOOSTER.length,
            icon: Target,
          },
          {
            id: 'PLAN' as const,
            label: '4. Content Plan (แผนบทความ)',
            count: contentPlan.length,
            icon: BookmarkPlus,
          },
          {
            id: 'TOP_PERFORMER' as const,
            label: '5. Top Performers',
            count: buckets.TOP_PERFORMER.length,
            icon: Award,
          },
          {
            id: 'INDEXING' as const,
            label: '6. Instant Indexing (3 ช่องทาง)',
            count: kpi.totalIndexPings || 0,
            icon: Zap,
          },
          {
            id: 'EXPLORER' as const,
            label: '7. Keyword Explorer (Autocomplete)',
            count: explorerResults.length || null,
            icon: Compass,
          },
          {
            id: 'INTERNAL_LINKS' as const,
            label: '8. Internal Link Matrix',
            count: linkMatrix.orphanCount > 0 ? `${linkMatrix.orphanCount} Orphan` : linkMatrix.matrix.length,
            icon: Network,
          },
          {
            id: 'REDIRECTS_404' as const,
            label: '9. 301 Redirects & 404 / ลิงก์เสีย',
            count: (kpi.unresolved404Count || 0) + brokenLinks.length,
            icon: Link2,
          },
          {
            id: 'AUDIT_GEO' as const,
            label: '10. SEO Audit 100-Point & /llms.txt',
            count: kpi.publishedCount || 0,
            icon: Bot,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'EXPLORER' && explorerResults.length === 0) {
                  handleExploreKeywords('จดทะเบียนบริษัท');
                }
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: isActive ? '1px solid #091c3a' : '1px solid transparent',
                background: isActive ? '#091c3a' : '#f8fafc',
                color: isActive ? '#ffffff' : '#334155',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <Icon size={15} color={isActive ? '#fbbf24' : '#64748b'} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: '999px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: isActive ? 'rgba(251, 191, 36, 0.22)' : '#e2e8f0',
                    color: isActive ? '#fbbf24' : '#475569',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1, 2, 3, 5: OPPORTUNITY BUCKETS (CONTENT_GAP, STRIKING_DISTANCE, CTR_BOOSTER, TOP_PERFORMER)
         ===================================================================== */}
      {(activeTab === 'CONTENT_GAP' ||
        activeTab === 'STRIKING_DISTANCE' ||
        activeTab === 'CTR_BOOSTER' ||
        activeTab === 'TOP_PERFORMER') && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
              {activeTab === 'CONTENT_GAP' &&
                'Tab 1 — Content Gap (คีย์เวิร์ดที่มี Impressions สูง แต่ยังไม่มีบทความรองรับโดยตรง)'}
              {activeTab === 'STRIKING_DISTANCE' &&
                'Tab 2 — Striking Distance อันดับ 5–20 (มีบทความแล้ว แนะนำเติม H2/H3 & FAQ เพื่อดันขึ้นหน้าแรก)'}
              {activeTab === 'CTR_BOOSTER' &&
                'Tab 3 — CTR Booster (ติด Top 5 หน้าแรกแล้ว แต่ควรปรับ SEO Title / Meta เพื่อเพิ่มยอดคลิก)'}
              {activeTab === 'TOP_PERFORMER' &&
                'Tab 5 — Top Performers (คีย์เวิร์ดที่ทำอันดับและยอดคลิกได้สูงที่สุด)'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
              ระบบกรองอัตโนมัติด้วย 5 Smart SEO Guardrails (Anti-Cannibalization, คำพ้องภาษีไทย, ตรวจ H2/FAQ, กรองข้อสอบปรนัย และเกณฑ์ Impressions &ge; 15)
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(buckets[activeTab] || []).map((item: any) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  background: item.alreadyOptimized ? '#f8fafc' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.04rem', color: '#091c3a' }}>
                        &ldquo;{item.query}&rdquo;
                      </strong>
                      {renderRankDeltaBadge(item)}
                      <span
                        style={{
                          padding: '2px 9px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          color: '#334155',
                        }}
                      >
                        อันดับเฉลี่ย {item.position}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        👁️ {item.impressions.toLocaleString()} Impressions • 🖱️ {item.clicks} คลิก (CTR {(item.ctr * 100).toFixed(2)}%)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      หน้าที่ติดอันดับบน Google: <code>{item.page}</code> • Pillar Page:{' '}
                      <Link href={item.pillarUrl} target="_blank" style={{ color: '#2563eb', fontWeight: 600 }}>
                        {item.pillarTitle} ({item.pillarUrl})
                      </Link>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {activeTab === 'CONTENT_GAP' && (
                      <>
                        <Link
                          href={buildOneClickWriteUrl(item)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#091c3a',
                            color: '#fbbf24',
                            fontWeight: 700,
                            fontSize: '0.83rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sparkles size={14} />
                          <span>1-Click เขียนบทความนี้ทันที</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToPlan({
                              keyword: item.query,
                              suggestedTitle: item.suggestedTitle,
                              suggestedSlug: item.suggestedSlug,
                              category: item.suggestedCategory,
                              pillarUrl: item.pillarUrl,
                              pillarTitle: item.pillarTitle,
                              impressions: item.impressions,
                            })
                          }
                          disabled={addingPlan}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          + เก็บเข้าแผน
                        </button>
                      </>
                    )}

                    {activeTab !== 'CONTENT_GAP' && item.matchedArticleId && (
                      <Link
                        href={`/admin/articles/${item.matchedArticleId}`}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.83rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <FileText size={14} />
                        <span>เปิดแก้ไขบทความเดิม</span>
                      </Link>
                    )}

                    {activeTab === 'STRIKING_DISTANCE' && !item.matchedArticleId && (
                      <Link
                        href={buildOneClickWriteUrl(item)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: '#091c3a',
                          color: '#fbbf24',
                          fontWeight: 700,
                          fontSize: '0.83rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={14} />
                        <span>1-Click เขียนบทความหนุนหน้าบริการ</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Guardrail Badges */}
                {item.guardrailBadges && item.guardrailBadges.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {item.guardrailBadges.map((b: any, i: number) => {
                      const toneStyles: Record<string, { bg: string; color: string; border: string }> = {
                        green: { bg: '#dcfce7', color: '#166534', border: '#86efac' },
                        blue: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
                        amber: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
                        purple: { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
                      };
                      const st = toneStyles[b.tone] || toneStyles.blue;
                      return (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                          }}
                        >
                          {b.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Suggested Editorial Title & English Slug for CONTENT_GAP */}
                {activeTab === 'CONTENT_GAP' && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      fontSize: '0.82rem',
                      color: '#334155',
                    }}
                  >
                    <div>
                      <strong>ชื่อบทความแนะนำ:</strong> {item.suggestedTitle}
                    </div>
                    <div>
                      <strong>Clean English Slug:</strong> <code>/knowledge/{item.suggestedSlug}</code> •{' '}
                      <strong>หมวดหมู่:</strong> {item.suggestedCategory}
                    </div>
                  </div>
                )}

                {/* Recommendation Box */}
                <div style={{ fontSize: '0.84rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                  💡 <strong>คำแนะนำจากระบบ:</strong> {item.actionRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: SEO CONTENT PLAN BASKET (PLANNED -> DRAFTING -> COMPLETED)
         ===================================================================== */}
      {activeTab === 'PLAN' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
                Tab 4 — แผนบทความ SEO (Auto-Synced Content Plan)
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                อัปเดตสถานะอัตโนมัติ (<code>PLANNED</code> ➔ <code>DRAFTING</code> ➔ <code>COMPLETED</code>) ทันทีเมื่อบทความที่มี Slug หรือ Focus Keyword ตรงกันถูกสร้างหรือเผยแพร่
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPlanKeyword.trim()) {
                  handleAddToPlan({ keyword: newPlanKeyword.trim() });
                }
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                value={newPlanKeyword}
                onChange={(e) => setNewPlanKeyword(e.target.value)}
                placeholder="เพิ่มคีย์เวิร์ดเป้าหมายใหม่..."
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  minWidth: '240px',
                }}
              />
              <button
                type="submit"
                disabled={addingPlan}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#091c3a',
                  color: '#fbbf24',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                + เพิ่มลงแผน
              </button>
            </form>
          </div>

          {contentPlan.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
              ยังไม่มีรายการในแผนบทความ กดปุ่ม &ldquo;+ เก็บเข้าแผน&rdquo; จากแท็บ Content Gap หรือพิมพ์เพิ่มด้านบนได้เลย
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contentPlan.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background:
                            plan.status === 'COMPLETED'
                              ? '#dcfce7'
                              : plan.status === 'DRAFTING'
                              ? '#fef3c7'
                              : '#dbeafe',
                          color:
                            plan.status === 'COMPLETED'
                              ? '#166534'
                              : plan.status === 'DRAFTING'
                              ? '#92400e'
                              : '#1e40af',
                        }}
                      >
                        {plan.status === 'COMPLETED'
                          ? '✓ COMPLETED (เผยแพร่แล้ว)'
                          : plan.status === 'DRAFTING'
                          ? '✍️ DRAFTING (กำลังร่าง)'
                          : '📌 PLANNED (รอเขียน)'}
                      </span>
                      <strong style={{ fontSize: '0.98rem', color: '#091c3a' }}>
                        {plan.keyword}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      พาดหัวแนะนำ: {plan.suggestedTitle} • Slug: <code>/knowledge/{plan.suggestedSlug}</code> • หมวด: {plan.category}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {plan.matchedArticleId ? (
                      <Link
                        href={`/admin/articles/${plan.matchedArticleId}`}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        เปิดดูบทความ (#{plan.matchedArticleId})
                      </Link>
                    ) : (
                      <Link
                        href={buildOneClickWriteUrl(plan)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: '#091c3a',
                          color: '#fbbf24',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        1-Click เขียนบทความนี้
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeletePlanItem(plan.id)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 6: MULTI-CHANNEL INSTANT INDEXING
         ===================================================================== */}
      {activeTab === 'INDEXING' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
                Tab 6 — ระบบส่งสัญญาณจัดทำดัชนี 3 ช่องทางอัตโนมัติ (Multi-Channel Instant Indexing)
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                ยิงสัญญาณพร้อมกัน (`Promise.all`) ไปยัง Google Web Search Indexing API + GSC Sitemap Submit + IndexNow (Bing, ChatGPT Search, Perplexity)
              </p>
            </div>

            <button
              type="button"
              onClick={handleBulkIndexNow}
              disabled={submittingIndexNow}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#091c3a',
                color: '#fbbf24',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} />
              <span>{submittingIndexNow ? 'กำลังส่งสัญญาณ...' : '1-Click Bulk Index ทุกหน้าพร้อมกัน'}</span>
            </button>
          </div>

          {/* 3 Channels Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#091c3a', marginBottom: '4px' }}>
                1. Google Web Search Indexing API
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ส่ง <code>URL_UPDATED</code> ไปยัง <code>indexing.googleapis.com</code> ด้วย RS256 JWT
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#091c3a', marginBottom: '4px' }}>
                2. GSC Sitemap Submit API
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                แจ้ง Googlebot ให้ดึง <code>/sitemap.xml</code> ชุดล่าสุดทันทีเมื่อเผยแพร่บทความ
              </div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#091c3a', marginBottom: '4px' }}>
                3. IndexNow AI Search Protocol
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                แจ้ง Bing, ChatGPT Search, Copilot และ Perplexity พร้อมไฟล์คีย์ยืนยันตัวตน
              </div>
            </div>
          </div>

          {/* Manual URL Submit */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSingleIndexNow(manualUrl);
            }}
            style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
          >
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="ระบุพาธหรือ URL เช่น /knowledge/5-things-to-know-before-company-registration หรือ /services/vat-registration"
              style={{
                flex: 1,
                minWidth: '280px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              disabled={submittingIndexNow}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              ส่งดัชนี 3 ช่องทางทันที
            </button>
          </form>

          {/* Recent Indexing Logs Table */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
              ประวัติการส่งสัญญาณจัดทำดัชนีล่าสุด
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>วัน-เวลา</th>
                    <th style={{ padding: '10px 12px' }}>ช่องทาง (Engine)</th>
                    <th style={{ padding: '10px 12px' }}>URL</th>
                    <th style={{ padding: '10px 12px' }}>สถานะ</th>
                    <th style={{ padding: '10px 12px' }}>รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {(statsData?.indexingLogs || []).map((log: any) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{log.engine}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <code>{log.url}</code>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background:
                              log.status === 'SUCCESS'
                                ? '#dcfce7'
                                : log.status === 'SKIPPED'
                                ? '#f1f5f9'
                                : '#fee2e2',
                            color:
                              log.status === 'SUCCESS'
                                ? '#166534'
                                : log.status === 'SKIPPED'
                                ? '#475569'
                                : '#991b1b',
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 7: PROACTIVE KEYWORD EXPLORER (GOOGLE THAILAND AUTOCOMPLETE)
         ===================================================================== */}
      {activeTab === 'EXPLORER' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
              Tab 7 — ค้นหาคีย์เวิร์ดใหม่เชิงรุก (Proactive Keyword Explorer — Google Thailand Autocomplete)
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              ดึงคำค้นหายอดนิยมสดจาก Google Search ประเทศไทย แตกคำขยาย 7 รูปแบบอัตโนมัติ จำแนก Search Intent และตรวจสอบเทียบกับคลังบทความในฐานข้อมูลทันที
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExploreKeywords();
            }}
            style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
          >
            <input
              type="text"
              value={explorerSeed}
              onChange={(e) => setExplorerSeed(e.target.value)}
              placeholder="พิมพ์หัวข้อหลัก เช่น จดทะเบียนบริษัท, ภ.พ.30, ภาษีหัก ณ ที่จ่าย, ตรวจสอบบัญชี..."
              style={{
                flex: 1,
                minWidth: '260px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.92rem',
              }}
            />
            <button
              type="submit"
              disabled={exploring}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#091c3a',
                color: '#fbbf24',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {exploring ? 'กำลังดึง Google Autocomplete...' : 'สแกนคีย์เวิร์ด Autocomplete'}
            </button>
          </form>

          {/* Quick Seed Topic Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              'จดทะเบียนบริษัท',
              'จดทะเบียนภาษีมูลค่าเพิ่ม vat',
              'ยื่นภาษี ภ.พ.30',
              'ภาษีหัก ณ ที่จ่าย',
              'ภ.ง.ด.51 ประมาณการกำไรสุทธิ',
              'ปิดงบการเงินประจำปี',
              'ตรวจสอบบัญชี CPA',
              'วางแผนภาษีนิติบุคคล',
            ].map((seed) => (
              <button
                key={seed}
                type="button"
                onClick={() => handleExploreKeywords(seed)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1',
                  background: explorerSeed === seed ? '#eff6ff' : '#f8fafc',
                  color: explorerSeed === seed ? '#1d4ed8' : '#334155',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔍 {seed}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {explorerResults.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.96rem', color: '#091c3a' }}>{item.keyword}</strong>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background:
                          item.coverageStatus === 'COVERED_PRIMARY'
                            ? '#dcfce7'
                            : item.coverageStatus === 'COVERED_IN_CONTENT'
                            ? '#fef3c7'
                            : '#dbeafe',
                        color:
                          item.coverageStatus === 'COVERED_PRIMARY'
                            ? '#166534'
                            : item.coverageStatus === 'COVERED_IN_CONTENT'
                            ? '#92400e'
                            : '#1e40af',
                      }}
                    >
                      {item.coverageStatus === 'COVERED_PRIMARY'
                        ? '✓ มีบทความหลักแล้ว (COVERED_PRIMARY)'
                        : item.coverageStatus === 'COVERED_IN_CONTENT'
                        ? '◐ มีกล่าวถึงในเนื้อหาย่อย (COVERED_IN_CONTENT)'
                        : '★ ช่องว่างเนื้อหาใหม่ (MISSING_GAP)'}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                      {item.intentLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    หมวดคำค้น: {item.sourcePattern} • Pillar Page: {item.pillarTitle}
                    {item.matchedArticleTitle && ` • พบในบทความ: "${item.matchedArticleTitle}"`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {item.coverageStatus === 'MISSING_GAP' ? (
                    <>
                      <Link
                        href={buildOneClickWriteUrl(item)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: '#091c3a',
                          color: '#fbbf24',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        1-Click เขียนบทความนี้
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleAddToPlan({
                            keyword: item.keyword,
                            suggestedTitle: item.suggestedTitle,
                            suggestedSlug: item.suggestedSlug,
                            category: item.suggestedCategory,
                            pillarUrl: item.pillarUrl,
                            pillarTitle: item.pillarTitle,
                          })
                        }
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + เก็บเข้าแผน
                      </button>
                    </>
                  ) : (
                    item.matchedArticleId && (
                      <Link
                        href={`/admin/articles/${item.matchedArticleId}`}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: '#2563eb',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        เปิดดูบทความเดิม
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 8: INTERNAL LINK MATRIX, ORPHAN DETECTOR & 1-CLICK LINK INSERTER
         ===================================================================== */}
      {activeTab === 'INTERNAL_LINKS' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
              Tab 8 — โครงข่าย Internal Link Matrix & ตรวจจับ Orphan Posts
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              สแกนบทความทั้งหมดเพื่อตรวจนับ Inbound Links, Outbound Blog Links และ Pillar Service Links พร้อมปุ่ม 1-Click แทรก Internal Link อัตโนมัติ
            </p>
          </div>

          {/* 1-Click Internal Link Opportunities */}
          {linkMatrix.opportunities && linkMatrix.opportunities.length > 0 && (
            <div style={{ padding: '18px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #86efac' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.96rem', fontWeight: 800, color: '#14532d' }}>
                ✨ โอกาสเชื่อมโยงลิงก์ภายในอัตโนมัติ (พบคำสำคัญในบทความอื่นที่ยังไม่ได้ผูกเป็นลิงก์)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {linkMatrix.opportunities.map((opp: any, i: number) => {
                  const key = `${opp.sourceArticleId}-${opp.targetArticleSlug}`;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#091c3a' }}>
                          จากบทความ: &ldquo;{opp.sourceArticleTitle}&rdquo; ➔ เชื่อมไปยัง: &ldquo;{opp.targetArticleTitle}&rdquo;
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                          พบคำสำคัญ: <strong style={{ color: '#15803d' }}>&ldquo;{opp.matchedPhrase}&rdquo;</strong> ในประโยค:{' '}
                          <em>{opp.contextSnippet}</em>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleOneClickInsertLink(
                            opp.sourceArticleId,
                            opp.targetArticleSlug,
                            opp.matchedPhrase
                          )
                        }
                        disabled={insertingLinkKey === key}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {insertingLinkKey === key ? 'กำลังแทรกลิงก์...' : '⚡ 1-Click แทรก Internal Link ทันที'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matrix Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>บทความ</th>
                  <th style={{ padding: '10px 12px' }}>หมวดหมู่</th>
                  <th style={{ padding: '10px 12px' }}>Inbound Links (รับเข้า)</th>
                  <th style={{ padding: '10px 12px' }}>Outbound Blog Links</th>
                  <th style={{ padding: '10px 12px' }}>Pillar Service Links</th>
                  <th style={{ padding: '10px 12px' }}>สถานะคลัสเตอร์</th>
                  <th style={{ padding: '10px 12px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {linkMatrix.matrix.map((row: any) => (
                  <tr key={row.articleId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#091c3a' }}>
                      {row.title}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                        <code>/knowledge/{row.slug}</code>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{row.category}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                      {row.inboundCount} ลิงก์
                    </td>
                    <td style={{ padding: '10px 12px' }}>{row.outboundBlogCount} ลิงก์</td>
                    <td style={{ padding: '10px 12px' }}>{row.pillarLinksCount} ลิงก์</td>
                    <td style={{ padding: '10px 12px' }}>
                      {row.isOrphan ? (
                        <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                          ⚠️ Orphan Post (ไม่มีลิงก์รับเข้า)
                        </span>
                      ) : (
                        <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#166534' }}>
                          ✓ เชื่อมโยงในคลัสเตอร์แล้ว
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Link
                        href={`/admin/articles/${row.articleId}`}
                        style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                      >
                        แก้ไขลิงก์ ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 9: SELF-HEALING 301 REDIRECTS, 404 MONITOR & BROKEN LINK SCANNER
         ===================================================================== */}
      {activeTab === 'REDIRECTS_404' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Broken Link & Missing Asset Scanner */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.12rem', fontWeight: 800, color: '#091c3a' }}>
              🔍 Broken Link, Citation & Missing Cover Asset Scanner
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#64748b' }}>
              สแกนบทความทั้งหมดเพื่อตรวจหา Internal Link ที่ชี้ไปหน้าที่ไม่มีอยู่จริง, แหล่งอ้างอิงที่ผิดรูปแบบ และรูปหน้าปก/Alt Text ที่ตกหล่น
            </p>

            {brokenLinks.length === 0 ? (
              <div style={{ padding: '18px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600 }}>
                ✓ ยอดเยี่ยม! ไม่พบลิงก์ภายในเสียหรือไฟล์รูปภาพสูญหายในคลังบทความทั้งหมด
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {brokenLinks.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #fde68a',
                      background: '#fffbeb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>
                        [{issue.issueType}] บทความ: &ldquo;{issue.articleTitle}&rdquo;
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#78350f' }}>
                        {issue.description} ({issue.targetValue})
                      </div>
                    </div>
                    <Link
                      href={issue.fixActionUrl}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#091c3a',
                        color: '#fbbf24',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      เปิดแก้ไขบทความ
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 301 Redirects Manager */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.12rem', fontWeight: 800, color: '#091c3a' }}>
                  🔀 ระบบจัดการ 301/302 Redirects & Auto Chain Flattening
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                  ยุบรวม Redirect ซ้อนหลายทอด (A → B → C เป็น A → C) อัตโนมัติทั้งเมื่อเปลี่ยน Slug บทความและเมื่อสร้าง Custom Redirect
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRedirectModalOpen(true)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#091c3a',
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                + เพิ่มกฎ Redirect ใหม่
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>ต้นทาง (Source Path)</th>
                    <th style={{ padding: '10px 12px' }}>ปลายทาง (Target Path)</th>
                    <th style={{ padding: '10px 12px' }}>ประเภท</th>
                    <th style={{ padding: '10px 12px' }}>จำนวนครั้งที่ส่งต่อ (Hits)</th>
                    <th style={{ padding: '10px 12px' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {(statsData?.customRedirects || []).map((r: any) => (
                    <tr key={`custom-${r.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <code>{r.sourcePath}</code>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <code>{r.targetPath}</code>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{r.statusCode} Custom</td>
                      <td style={{ padding: '10px 12px' }}>{r.hits} ครั้ง</td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteRedirect(r.id)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(statsData?.articleRedirects || []).map((ar: any) => (
                    <tr key={`art-${ar.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <code>/knowledge/{ar.fromSlug}</code>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <code>/knowledge/{ar.article?.slug}</code>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 700 }}>
                        301 Auto Slug
                      </td>
                      <td style={{ padding: '10px 12px' }}>อัตโนมัติ</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>ผูกกับบทความ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 404 Monitor */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.12rem', fontWeight: 800, color: '#091c3a' }}>
              🚨 Live 404 Not Found Monitor & 1-Click Redirect Converter
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#64748b' }}>
              ดักจับ URL ที่ผู้เข้าชมเปิดแล้วพบ 404 พร้อมปุ่มแปลงเป็น 301 Redirect ไปยังหน้าที่ถูกต้องได้ในคลิกเดียว
            </p>

            {(statsData?.error404Logs || []).length === 0 ? (
              <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                ยังไม่มีประวัติ 404 Error ที่ตรวจพบ
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>URL ที่เกิด 404</th>
                      <th style={{ padding: '10px 12px' }}>Referrer</th>
                      <th style={{ padding: '10px 12px' }}>จำนวนครั้ง (Hits)</th>
                      <th style={{ padding: '10px 12px' }}>สถานะ</th>
                      <th style={{ padding: '10px 12px' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(statsData?.error404Logs || []).map((log: any) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <code>{log.url}</code>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.referrer || 'Direct'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{log.hits}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {log.isResolved ? (
                            <span style={{ color: '#166534', fontWeight: 700 }}>✓ แก้ไขแล้ว</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>รอแก้ไข</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', display: 'flex', gap: '8px' }}>
                          {!log.isResolved && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelected404Log({ id: log.id, url: log.url });
                                setConvertTarget('/knowledge');
                                setConvert404ModalOpen(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#2563eb',
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              1-Click ทำ 301 Redirect
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete404(log.id)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 10: 100-POINT SEO AUDIT, SITEMAP & GEO (/llms.txt & /llms-full.txt)
         ===================================================================== */}
      {activeTab === 'AUDIT_GEO' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* GEO / LLM Knowledge Corpus Cards */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: '1.12rem', fontWeight: 800, color: '#091c3a' }}>
              🤖 โครงสร้างพื้นฐาน AEO & GEO (Generative Engine Optimization สำหรับ AI Search)
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>
              คลังความรู้ Markdown อัตโนมัติสำหรับ ChatGPT Search, Perplexity, Claude, Google Gemini พร้อมเปิดต้อนรับ AI Bots ทั้ง 8 ตัวใน <code>/robots.txt</code>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {[
                {
                  title: '/llms.txt (AI Index)',
                  desc: 'สารบัญข้อมูลบริษัท ผู้เชี่ยวชาญ CPA บริการทั้ง 16 รายการ และบทความพร้อม Quick Answer',
                  href: '/llms.txt',
                },
                {
                  title: '/llms-full.txt (Full Knowledge Corpus)',
                  desc: 'คลังความรู้ฉบับเต็มรวม FAQ กลาง เนื้อหาบทความเต็ม และแหล่งอ้างอิงกฎหมายกรมสรรพากร/DBD',
                  href: '/llms-full.txt',
                },
                {
                  title: '/sitemap.xml (Dynamic XML Sitemap)',
                  desc: `รวม URL ที่พร้อมจัดทำดัชนีทั้งหมด ${kpi.sitemapUrlCount || 0} หน้า`,
                  href: '/sitemap.xml',
                },
                {
                  title: '/robots.txt (AI Bot Rules)',
                  desc: 'เปิดสิทธิ์ต้อนรับ OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot, Google-Extended',
                  href: '/robots.txt',
                },
              ].map((endpoint) => (
                <div
                  key={endpoint.href}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#091c3a', marginBottom: '4px' }}>
                      {endpoint.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>{endpoint.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={endpoint.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '7px',
                        background: '#091c3a',
                        color: '#fbbf24',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>เปิดดูไฟล์สด</span>
                      <ExternalLink size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${window.location.origin}${endpoint.href}`, endpoint.href)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedKey === endpoint.href ? 'คัดลอกแล้ว ✓' : 'คัดลอก URL'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 100-Point Article SEO Audit Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.12rem', fontWeight: 800, color: '#091c3a' }}>
                  📊 ตารางคะแนนคุณภาพบทความ 100-Point SEO / AEO / GEO Audit
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                  ประเมิน 15 เกณฑ์ ใน 4 มิติ: Technical Eligibility (35) • Answer Quality & AEO (25) • E-E-A-T & Citations (20) • Content Depth & Cluster (20)
                </p>
              </div>
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="ค้นหาชื่อบทความหรือ Focus Keyword..."
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  minWidth: '240px',
                }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>บทความ</th>
                    <th style={{ padding: '10px 12px' }}>Focus Keyword</th>
                    <th style={{ padding: '10px 12px' }}>สถานะ</th>
                    <th style={{ padding: '10px 12px' }}>คะแนน SEO/AEO</th>
                    <th style={{ padding: '10px 12px' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {articles
                    .filter((a) => {
                      if (!auditSearch.trim()) return true;
                      const q = auditSearch.toLowerCase();
                      return (
                        a.title.toLowerCase().includes(q) ||
                        a.slug.toLowerCase().includes(q) ||
                        (a.focusKeyword || '').toLowerCase().includes(q)
                      );
                    })
                    .map((art) => (
                      <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#091c3a' }}>
                          {art.title}
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                            <code>/knowledge/{art.slug}</code>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{art.focusKeyword || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>{art.status}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              background:
                                art.seoScore >= 80
                                  ? '#dcfce7'
                                  : art.seoScore >= 50
                                  ? '#fef3c7'
                                  : '#fee2e2',
                              color:
                                art.seoScore >= 80
                                  ? '#166534'
                                  : art.seoScore >= 50
                                  ? '#92400e'
                                  : '#991b1b',
                            }}
                          >
                            {art.seoScore || 0} / 100
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', display: 'flex', gap: '10px' }}>
                          <Link
                            href={`/admin/articles/${art.id}`}
                            style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}
                          >
                            แก้ไข
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleSingleIndexNow(`/knowledge/${art.slug}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#15803d',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Index ทันที
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALS: GSC SERVICE ACCOUNT, CSV IMPORT, ADD REDIRECT, CONVERT 404
         ===================================================================== */}
      {gscModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
              ตั้งค่าเชื่อมต่อ Google Search Console & Indexing API (Zero-Dependency RS256 JWT)
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: '#64748b' }}>
              วางเนื้อหาไฟล์ JSON ของ Google Cloud Service Account ที่เพิ่มสิทธิ์ใน GSC Property แล้ว ระบบจะใช้ <code>node:crypto</code> เชื่อมต่อโดยตรง
            </p>
            <form onSubmit={handleSaveGscConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                  GSC Property URL (เช่น sc-domain:deethavorn.com หรือ https://www.deethavorn.com/):
                </label>
                <input
                  type="text"
                  value={gscSiteUrlInput}
                  onChange={(e) => setGscSiteUrlInput(e.target.value)}
                  placeholder="เว้นว่างไว้เพื่อค้นหา Property อัตโนมัติ"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                  Service Account JSON Key:
                </label>
                <textarea
                  rows={7}
                  required
                  value={serviceAccountJson}
                  onChange={(e) => setServiceAccountJson(e.target.value)}
                  placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setGscModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingGsc}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#091c3a', color: '#fbbf24', fontWeight: 700, cursor: 'pointer' }}
                >
                  {savingGsc ? 'กำลังตรวจสอบและซิงค์...' : 'บันทึกและซิงค์ข้อมูลทันที'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {csvModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: '#091c3a' }}>
              นำเข้าข้อมูลคำค้นหาจากไฟล์ CSV ของ Google Search Console
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#64748b' }}>
              รองรับไฟล์ CSV ที่ Export มาจากหน้า Performance ของ GSC (คอลัมน์ Query, Clicks, Impressions, CTR, Position)
            </p>
            <form onSubmit={handleImportCsv} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => setCsvText(String(ev.target?.result || ''));
                  reader.readAsText(file);
                }}
              />
              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="หรือวางข้อความ CSV ที่นี่..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={importingCsv}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#091c3a', color: '#fbbf24', fontWeight: 700, cursor: 'pointer' }}
                >
                  {importingCsv ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล CSV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {redirectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: '#091c3a' }}>
              เพิ่มกฎ 301 / 302 Redirect ใหม่
            </h3>
            <form onSubmit={handleSaveRedirect} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                required
                value={redirectSource}
                onChange={(e) => setRedirectSource(e.target.value)}
                placeholder="URL ต้นทาง เช่น /old-page"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input
                type="text"
                required
                value={redirectTarget}
                onChange={(e) => setRedirectTarget(e.target.value)}
                placeholder="URL ปลายทาง เช่น /services/accounting-tax"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <select
                value={redirectCode}
                onChange={(e) => setRedirectCode(Number(e.target.value))}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value={301}>301 Permanent Redirect (ถาวร - แนะนำสำหรับ SEO)</option>
                <option value={302}>302 Temporary Redirect (ชั่วคราว)</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRedirectModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingRedirect}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#091c3a', color: '#fbbf24', fontWeight: 700, cursor: 'pointer' }}
                >
                  บันทึก Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {convert404ModalOpen && selected404Log && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#091c3a' }}>
              แปลง 404 Not Found เป็น 301 Redirect
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: '#64748b' }}>
              ต้นทาง: <code>{selected404Log.url}</code>
            </p>
            <form onSubmit={handleConvert404Submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                required
                value={convertTarget}
                onChange={(e) => setConvertTarget(e.target.value)}
                placeholder="ระบุ URL ปลายทาง เช่น /knowledge หรือ /services"
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setConvert404ModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={converting404}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  ยืนยันแปลงเป็น 301 Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
