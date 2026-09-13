'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Mail,
  UserCheck,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  X,
  AlertCircle,
  ReceiptText,
} from 'lucide-react';

interface FollowUpItem {
  id: number;
  companyId: number;
  channel: string;
  result?: string;
  promisedDate?: string;
  notes: string;
  createdAt: string;
  company: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  contact?: {
    id: number;
    name: string;
    roleTitle?: string;
    phone?: string;
  };
  createdBy: {
    id: number;
    fullName: string;
    email: string;
  };
  taxPayment?: {
    id: number;
    taxType: string;
    taxYear: string;
    taxMonth?: string | null;
    amount: number | string;
    billingStatus: string;
  };
}

const taxTypeDisplayMap: Record<string, string> = {
  VAT_PP30: 'ภ.พ. 30',
  WHT_PND1: 'ภ.ง.ด. 1',
  WHT_PND3: 'ภ.ง.ด. 3',
  WHT_PND53: 'ภ.ง.ด. 53',
  PND51: 'ภ.ง.ด. 51',
};

const outcomeMap: Record<string, { label: string; className: string }> = {
  PROMISED: { label: 'นัดชำระเงิน', className: 'followup-outcome-badge--promised' },
  PROMISED_TO_PAY: { label: 'นัดชำระเงิน', className: 'followup-outcome-badge--promised' },
  PAID: { label: 'ชำระแล้ว', className: 'followup-outcome-badge--paid' },
  NO_ANSWER: { label: 'ติดต่อไม่ได้ / ไม่รับสาย', className: 'followup-outcome-badge--no-answer' },
  REJECTED: { label: 'ปฏิเสธการชำระ', className: 'followup-outcome-badge--rejected' },
  DISPUTE: { label: 'มียอดโต้แย้ง / รอตรวจสอบ', className: 'followup-outcome-badge--dispute' },
  REQUESTED_BILL: { label: 'ขอใบวางบิลใหม่', className: 'followup-outcome-badge--bill' },
};

function money(value: string | number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value));
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok',
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatPromisedDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function FollowUpsPage() {
  const [logs, setLogs] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [urlReady, setUrlReady] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const query = new URLSearchParams({ page: String(currentPage), pageSize: '20' });
      if (channelFilter) query.set('channel', channelFilter);
      if (outcomeFilter) query.set('result', outcomeFilter);
      if (search) query.set('search', search);
      const res = await fetch(`/api/admin/follow-ups?${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'ไม่สามารถโหลดประวัติการติดตามได้');
      setLogs(data.data || []);
      setTotalItems(data.meta?.totalItems ?? data.data?.length ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
      setLoadError(err instanceof Error ? err.message : 'ไม่สามารถโหลดประวัติการติดตามได้');
    } finally {
      setLoading(false);
    }
  }, [channelFilter, currentPage, outcomeFilter, search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedChannel = params.get('channel');
    const requestedResult = params.get('result');
    const requestedSearch = params.get('q') || '';
    const requestedPage = Number(params.get('page'));
    if (requestedChannel && ['PHONE', 'LINE', 'EMAIL', 'IN_PERSON'].includes(requestedChannel)) {
      setChannelFilter(requestedChannel);
    }
    if (requestedResult && Object.hasOwn(outcomeMap, requestedResult)) setOutcomeFilter(requestedResult);
    if (Number.isInteger(requestedPage) && requestedPage > 0) setCurrentPage(requestedPage);
    setSearchQuery(requestedSearch);
    setSearch(requestedSearch);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (urlReady) void loadLogs();
  }, [loadLogs, urlReady]);

  useEffect(() => {
    if (!loading && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, loading, totalPages]);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    if (channelFilter) url.searchParams.set('channel', channelFilter);
    else url.searchParams.delete('channel');
    if (outcomeFilter) url.searchParams.set('result', outcomeFilter);
    else url.searchParams.delete('result');
    if (search) url.searchParams.set('q', search);
    else url.searchParams.delete('q');
    if (currentPage > 1) url.searchParams.set('page', String(currentPage));
    else url.searchParams.delete('page');
    window.history.replaceState(null, '', url);
  }, [channelFilter, currentPage, outcomeFilter, search, urlReady]);

  const renderChannelBadge = (channel: string) => {
    switch (channel) {
      case 'PHONE':
        return (
          <span className="followup-channel-badge followup-channel-badge--phone">
            <Phone size={12} aria-hidden="true" />
            <span>โทรศัพท์</span>
          </span>
        );
      case 'LINE':
        return (
          <span className="followup-channel-badge followup-channel-badge--line">
            <MessageSquare size={12} aria-hidden="true" />
            <span>LINE</span>
          </span>
        );
      case 'EMAIL':
        return (
          <span className="followup-channel-badge followup-channel-badge--email">
            <Mail size={12} aria-hidden="true" />
            <span>อีเมล</span>
          </span>
        );
      case 'IN_PERSON':
        return (
          <span className="followup-channel-badge followup-channel-badge--person">
            <UserCheck size={12} aria-hidden="true" />
            <span>พบต่อหน้า</span>
          </span>
        );
      default:
        return (
          <span className="followup-channel-badge followup-channel-badge--other">
            <span>{channel || 'ทั่วไป'}</span>
          </span>
        );
    }
  };

  const renderOutcomeBadge = (result?: string) => {
    const info = result ? outcomeMap[result] : null;
    if (info) {
      return (
        <span className={`followup-outcome-badge ${info.className}`}>
          {info.label}
        </span>
      );
    }
    return (
      <span className="followup-outcome-badge followup-outcome-badge--general">
        {result || 'บันทึกการติดตามทั่วไป'}
      </span>
    );
  };

  return (
    <div className="followups-workspace">
      {/* Hero Header */}
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
          <div className="admin-page-header__icon" aria-hidden="true">
            <PhoneCall size={22} />
          </div>
          <div>
            <h1>ประวัติการติดตามยอดค้างชำระ</h1>
            <p>
              รวมการโทร ส่ง LINE อีเมล และวันนัดชำระของลูกค้า
            </p>
          </div>
        </div>
      </header>

      {/* Inline Toolbar with Filters & Search */}
      <section className="followups-toolbar" aria-label="ตัวกรองและค้นหา">
        <div className="followups-toolbar__filters">
          <div className="followups-filter-select">
            <Filter size={13} aria-hidden="true" />
            <label htmlFor="channel-filter">ช่องทาง:</label>
            <select
              id="channel-filter"
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setCurrentPage(1); }}
              aria-label="กรองตามช่องทาง"
            >
              <option value="">ทั้งหมด</option>
              <option value="PHONE">โทรศัพท์</option>
              <option value="LINE">LINE</option>
              <option value="EMAIL">อีเมล</option>
              <option value="IN_PERSON">พบต่อหน้า</option>
            </select>
          </div>

          <div className="followups-filter-select">
            <label htmlFor="outcome-filter">ผลลัพธ์:</label>
            <select
              id="outcome-filter"
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value); setCurrentPage(1); }}
              aria-label="กรองตามผลลัพธ์"
            >
              <option value="">ทุกผลลัพธ์</option>
              <option value="PROMISED">นัดชำระเงิน</option>
              <option value="PAID">ชำระแล้ว</option>
              <option value="NO_ANSWER">ติดต่อไม่ได้ / ไม่รับสาย</option>
              <option value="REJECTED">ปฏิเสธการชำระ</option>
              <option value="DISPUTE">มียอดโต้แย้ง</option>
              <option value="REQUESTED_BILL">ขอใบวางบิลใหม่</option>
            </select>
          </div>

          <span className="followups-counter-badge">
            พบ {totalItems} รายการ
          </span>
        </div>

        <div className="followups-toolbar__search-box">
          <Search size={14} className="followups-toolbar__search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบริษัท, เจ้าหน้าที่ หรือรายละเอียด…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="ค้นหาประวัติการติดตาม"
          />
          {searchQuery && (
            <button
              type="button"
              className="followups-toolbar__clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="ล้างคำค้นหา"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </section>

      {/* Timeline Card Feed */}
      <section className="followups-feed" aria-busy={loading}>
        {loading ? (
          <div className="followup-empty">
            <span className="admin-spinner admin-spinner--dark" />
            <p className="followup-empty__subtitle" style={{ marginTop: 12 }}>
              กำลังโหลดบันทึกประวัติการติดตาม…
            </p>
          </div>
        ) : loadError ? (
          <div className="admin-inline-state admin-inline-state--error" role="alert">
            <AlertCircle aria-hidden="true" size={24} />
            <strong>โหลดประวัติการติดตามไม่สำเร็จ</strong>
            <span>{loadError}</span>
            <button type="button" className="admin-secondary-button" onClick={() => void loadLogs()}>ลองใหม่</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="followup-empty">
            <div className="followup-empty__icon">
              <ReceiptText size={26} aria-hidden="true" />
            </div>
            <h2 className="followup-empty__title">ยังไม่พบประวัติการทวงถาม</h2>
            <p className="followup-empty__subtitle">
              เมื่อมีการบันทึกการติดตามยอดค้างชำระจากหน้าภาษี ข้อมูลจะปรากฏที่นี่
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <article key={log.id} className="followup-card">
              <header className="followup-card__header">
                <div className="followup-card__identity">
                  {renderChannelBadge(log.channel)}
                  <span className="followup-card__company">{log.company?.name}</span>
                  {log.contact && (
                    <span className="followup-card__contact">
                      (ติดต่อ: {log.contact.name}
                      {log.contact.roleTitle ? ` - ${log.contact.roleTitle}` : ''})
                    </span>
                  )}
                  {log.taxPayment && (
                    <span className="followup-card__tax-badge" title="รายการภาษีที่ติดตาม">
                      <ReceiptText size={11} aria-hidden="true" />
                      <span>
                        {taxTypeDisplayMap[log.taxPayment.taxType] || log.taxPayment.taxType}
                        {log.taxPayment.taxMonth ? ` งวด ${log.taxPayment.taxMonth}/${log.taxPayment.taxYear}` : ` ปี ${log.taxPayment.taxYear}`} • {money(log.taxPayment.amount)}
                      </span>
                    </span>
                  )}
                </div>

                <div className="followup-card__meta">
                  <Clock size={13} aria-hidden="true" />
                  <span>{formatDate(log.createdAt)}</span>
                  <span>•</span>
                  <span>
                    โดย: <strong className="followup-card__meta-staff">{log.createdBy?.fullName || 'ไม่ระบุ'}</strong>
                  </span>
                </div>
              </header>

              <div className="followup-card__content">
                <div className="followup-card__outcome-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      ผลการติดตาม:
                    </span>
                    {renderOutcomeBadge(log.result)}
                  </div>

                  {log.promisedDate && (
                    <span className="followup-card__promised-date">
                      <Calendar size={13} aria-hidden="true" />
                      <span>นัดชำระ: {formatPromisedDate(log.promisedDate)}</span>
                    </span>
                  )}
                </div>

                <p className="followup-card__note-text">
                  {log.notes || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </p>
              </div>
            </article>
          ))
        )}
      </section>

      {!loading && !loadError && totalItems > 0 && (
        <nav className="admin-pagination followups-pagination" aria-label="เปลี่ยนหน้าประวัติการติดตาม">
          <span className="admin-pagination__info">หน้า <strong>{currentPage}</strong> จาก {totalPages}</span>
          <div className="admin-pagination__pages">
            <button type="button" className="admin-pagination__btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
              ก่อนหน้า
            </button>
            <button type="button" className="admin-pagination__btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
              ถัดไป
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
