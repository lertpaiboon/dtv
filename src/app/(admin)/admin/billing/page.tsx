'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  MessageSquare,
  Phone,
  PhoneCall,
  RefreshCw,
  Search,
  Send,
  UploadCloud,
  UserCheck,
  WalletCards,
  X,
} from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

interface TaxItem {
  id: number;
  amount: number;
  status: string;
}

interface BillingStatement {
  company: {
    id: number;
    name: string;
    taxId: string | null;
    phone: string | null;
    email: string | null;
    primaryContact: {
      name: string;
      roleTitle: string | null;
      phone: string | null;
      email: string | null;
      lineId: string | null;
    } | null;
  };
  taxes: {
    vat: TaxItem | null;
    pnd1: TaxItem | null;
    pnd3: TaxItem | null;
    pnd53: TaxItem | null;
    pnd51: TaxItem | null;
  };
  totalAmount: number;
  overallStatus: 'UNBILLED' | 'BILLED' | 'PAID' | 'PENDING' | 'ADVANCED' | 'WAITING_TRANSFER';
  agingDays?: number;
  slipUrl?: string | null;
  reimbursementRef?: string | null;
  paymentIds: number[];
  payments: {
    id: number;
    taxType: string;
    taxYear: string;
    taxMonth: string | null;
    paymentDate: string;
    amount: number;
    billingStatus: string;
    paymentMethod: string;
    referenceNo: string | null;
    reimbursementRef?: string | null;
    slipUrl?: string | null;
    slipFileName?: string | null;
    reimbursedAt?: string | null;
    note: string | null;
  }[];
  followUpCount: number;
  lastFollowUp: {
    channel: string;
    result: string;
    promisedDate: string | null;
    notes: string | null;
    createdAt: string;
  } | null;
}

interface BillingMeta {
  taxYear: string;
  taxMonth: string;
  isAllOutstanding?: boolean;
  totalCompanies: number;
  grandTotal: number;
  advanced?: { count: number; amount: number };
  waiting?: { count: number; amount: number };
  unbilled: { count: number; amount: number };
  billed: { count: number; amount: number };
  paid: { count: number; amount: number };
  pending: { count: number; amount: number };
}

const statusDisplayMap: Record<string, { label: string; className: string }> = {
  ADVANCED: { label: 'สำรองจ่าย', className: 'tax-status--unbilled' },
  WAITING_TRANSFER: { label: 'รอโอนเงิน', className: 'tax-status--waiting_transfer' },
  PAID: { label: 'จ่ายแล้ว', className: 'tax-status--paid' },
  PENDING: { label: 'รอดำเนินการ', className: 'tax-status--pending' },
  UNBILLED: { label: 'สำรองจ่าย', className: 'tax-status--unbilled' },
  BILLED: { label: 'รอโอนเงิน', className: 'tax-status--waiting_transfer' },
};

const taxTypeNames: Record<string, string> = {
  VAT_PP30: 'ภ.พ. 30 (VAT)',
  WHT_PND1: 'ภ.ง.ด. 1 (เงินเดือน)',
  WHT_PND3: 'ภ.ง.ด. 3 (บุคคล)',
  WHT_PND53: 'ภ.ง.ด. 53 (นิติบุคคล)',
  PND51: 'ภ.ง.ด. 51 (ครึ่งปี)',
};

const monthLabels = [
  ['01', 'มกราคม'], ['02', 'กุมภาพันธ์'], ['03', 'มีนาคม'], ['04', 'เมษายน'],
  ['05', 'พฤษภาคม'], ['06', 'มิถุนายน'], ['07', 'กรกฎาคม'], ['08', 'สิงหาคม'],
  ['09', 'กันยายน'], ['10', 'ตุลาคม'], ['11', 'พฤศจิกายน'], ['12', 'ธันวาคม'],
] as const;

function money(value: number | string) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value || 0));
}

function displayDate(val: string) {
  if (!val) return '-';
  try {
    return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(val));
  } catch {
    return val;
  }
}

function editPermissionForTaxType(taxType: string) {
  if (taxType === 'VAT_PP30') return 'vat:edit';
  if (taxType === 'PND51') return 'pnd51:edit';
  if (taxType === 'WHT_PND1' || taxType === 'WHT_PND3' || taxType === 'WHT_PND53') return 'wht:edit';
  return null;
}

export default function ConsolidatedBillingPage() {
  const { can } = useAdminSession();
  const canEditPayments = can('vat:edit') || can('wht:edit') || can('pnd51:edit');
  const canCreateFollowUp = can('followup:create');
  const currentGregorianYear = new Date().getUTCFullYear();
  const [taxYear, setTaxYear] = useState(String(currentGregorianYear + 543));
  const [taxMonth, setTaxMonth] = useState(String(new Date().getUTCMonth() + 1).padStart(2, '0'));
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [urlReady, setUrlReady] = useState(false);

  const [statements, setStatements] = useState<BillingStatement[]>([]);
  const [meta, setMeta] = useState<BillingMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedYear = params.get('year');
    const requestedMonth = params.get('month');
    const requestedStatus = params.get('status');
    const requestedSearch = params.get('q') || '';
    if (requestedYear && /^\d{4}$/.test(requestedYear)) setTaxYear(requestedYear);
    if (requestedMonth && (requestedMonth === 'ALL_OUTSTANDING' || monthLabels.some(([value]) => value === requestedMonth))) {
      setTaxMonth(requestedMonth);
    }
    if (requestedStatus && ['UNBILLED', 'BILLED', 'PAID', 'PENDING', 'ADVANCED', 'WAITING_TRANSFER'].includes(requestedStatus)) {
      setStatusFilter(requestedStatus);
    }
    setSearch(requestedSearch);
    setSearchInput(requestedSearch);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set('year', taxYear);
    url.searchParams.set('month', taxMonth);
    if (statusFilter) url.searchParams.set('status', statusFilter);
    else url.searchParams.delete('status');
    if (search) url.searchParams.set('q', search);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, [search, statusFilter, taxMonth, taxYear, urlReady]);

  // Selection for bulk actions
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<number>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  function canEditStatement(statement: BillingStatement) {
    return statement.payments.length > 0 && statement.payments.every((payment) => {
      const permission = editPermissionForTaxType(payment.taxType);
      return permission ? can(permission) : false;
    });
  }

  // Drawer
  const [selectedStatement, setSelectedStatement] = useState<BillingStatement | null>(null);
  const [followUpSaving, setFollowUpSaving] = useState(false);

  // Alerts
  const [alerts, setAlerts] = useState<{
    urgentCount: number;
    promisedTodayCount: number;
    overduePromisesCount: number;
  } | null>(null);

  // Load Billing Statements
  const loadBillingData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    const query = new URLSearchParams({
      taxYear,
      taxMonth,
    });
    if (statusFilter) query.set('status', statusFilter);
    if (search) query.set('search', search);

    try {
      const [res, alertRes] = await Promise.all([
        fetch(`/api/admin/billing?${query}`).then((r) => r.json()),
        fetch('/api/admin/billing/alerts').then((r) => r.json()),
      ]);

      if (res.success) {
        setStatements(res.data || []);
        setMeta(res.meta || null);
      } else {
        setError(res.error || 'ไม่สามารถโหลดข้อมูลได้');
      }

      if (alertRes.success) {
        setAlerts(alertRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, statusFilter, taxMonth, taxYear]);

  useEffect(() => {
    if (urlReady) {
      void loadBillingData();
      setSelectedCompanyIds(new Set());
    }
  }, [loadBillingData, urlReady]);

  // Selected totals
  const selectedInfo = useMemo(() => {
    let totalAmt = 0;
    const allPaymentIds: number[] = [];
    for (const stmt of statements) {
      if (selectedCompanyIds.has(stmt.company.id)) {
        totalAmt += stmt.totalAmount;
        const pIds = stmt.paymentIds?.length ? stmt.paymentIds : stmt.payments?.map((p) => p.id) || [];
        allPaymentIds.push(...pIds);
      }
    }
    return {
      count: selectedCompanyIds.size,
      totalAmount: totalAmt,
      paymentIds: allPaymentIds,
    };
  }, [selectedCompanyIds, statements]);

  // Select all toggle
  function handleToggleSelectAll() {
    const editableCompanyIds = statements.filter(canEditStatement).map((statement) => statement.company.id);
    if (editableCompanyIds.length > 0 && editableCompanyIds.every((id) => selectedCompanyIds.has(id))) {
      setSelectedCompanyIds(new Set());
    } else {
      setSelectedCompanyIds(new Set(editableCompanyIds));
    }
  }

  function handleToggleRow(companyId: number) {
    const statement = statements.find((item) => item.company.id === companyId);
    if (!statement || !canEditStatement(statement)) return;
    setSelectedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
  }

  // Settings & LINE Template state
  const [lineTemplate, setLineTemplate] = useState<string>('');
  const [bankInfo, setBankInfo] = useState<string>('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setLineTemplate(res.data.billing_line_template || '');
          setBankInfo(res.data.company_bank_info || '');
        }
      })
      .catch(() => null);
  }, []);

  // Modal State: Mark as PAID & Attach Slip
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [paidTarget, setPaidTarget] = useState<{
    companyNames: string[];
    paymentIds: number[];
    totalAmount: number;
  } | null>(null);
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidRef, setPaidRef] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [compressingSlip, setCompressingSlip] = useState(false);
  const [paidSubmitting, setPaidSubmitting] = useState(false);

  // Modal State: View Slip Lightbox
  const [slipViewerData, setSlipViewerData] = useState<{
    url: string;
    title: string;
    ref?: string | null;
  } | null>(null);

  // Client-side image compression: downscale to max 1600px, 0.85 quality, shrinks 5-10MB phone camera images to ~200-400KB!
  async function compressImageFile(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }

  async function handleFileSelect(selectedFile: File) {
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert(`ขนาดไฟล์เกิน 5 MB (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5 MB`);
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type.toLowerCase())) {
      alert('อนุญาตเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) หรือไฟล์เอกสาร PDF เท่านั้น');
      return;
    }

    if (selectedFile.type.startsWith('image/')) {
      setCompressingSlip(true);
      try {
        const compressed = await compressImageFile(selectedFile);
        setSlipFile(compressed);
        setSlipPreviewUrl(URL.createObjectURL(compressed));
      } finally {
        setCompressingSlip(false);
      }
    } else {
      setSlipFile(selectedFile);
      setSlipPreviewUrl(null);
    }
  }

  function openPaidModalForBulk() {
    const selectedStatements = statements.filter((s) => selectedCompanyIds.has(s.company.id));
    if (selectedStatements.length === 0) return;
    setPaidTarget({
      companyNames: selectedStatements.map((s) => s.company.name),
      paymentIds: selectedInfo.paymentIds,
      totalAmount: selectedInfo.totalAmount,
    });
    setPaidDate(new Date().toISOString().slice(0, 10));
    setPaidRef('');
    setSlipFile(null);
    setSlipPreviewUrl(null);
    setPaidModalOpen(true);
  }

  function openPaidModalForSingle(stmt: BillingStatement) {
    const paymentIds = stmt.paymentIds?.length ? stmt.paymentIds : stmt.payments?.map((p) => p.id) || [];
    setPaidTarget({
      companyNames: [stmt.company.name],
      paymentIds,
      totalAmount: stmt.totalAmount,
    });
    setPaidDate(new Date().toISOString().slice(0, 10));
    setPaidRef(stmt.reimbursementRef || '');
    setSlipFile(null);
    setSlipPreviewUrl(null);
    setPaidModalOpen(true);
  }

  function openViewSlip(url: string, title: string, ref?: string | null) {
    setSlipViewerData({ url, title, ref });
  }

  async function handleSubmitPaid(e: React.FormEvent) {
    e.preventDefault();
    if (!paidTarget || !paidTarget.paymentIds || paidTarget.paymentIds.length === 0) return;

    setPaidSubmitting(true);
    try {
      let uploadedSlipUrl: string | null = null;
      let uploadedFileName: string | null = null;

      if (slipFile) {
        const uploadData = new FormData();
        uploadData.append('file', slipFile);
        const upRes = await fetch('/api/admin/uploads/slip', {
          method: 'POST',
          body: uploadData,
        }).then((r) => r.json());

        if (!upRes.success) {
          alert(upRes.error || 'ไม่สามารถอัปโหลดสลิปได้');
          setPaidSubmitting(false);
          return;
        }
        uploadedSlipUrl = upRes.data.url;
        uploadedFileName = upRes.data.fileName;
      }

      const res = await fetch('/api/admin/tax-payments/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: paidTarget.paymentIds,
          billingStatus: 'PAID',
          reimbursedAt: paidDate,
          reimbursementRef: paidRef.trim() || null,
          slipUrl: uploadedSlipUrl,
          slipFileName: uploadedFileName,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setNotice(res.message);
        setPaidModalOpen(false);
        setPaidTarget(null);
        setSlipFile(null);
        setSlipPreviewUrl(null);
        setPaidRef('');
        setSelectedCompanyIds(new Set());
        void loadBillingData(true);
        if (selectedStatement) {
          setSelectedStatement((curr) =>
            curr
              ? {
                  ...curr,
                  overallStatus: 'PAID',
                  slipUrl: uploadedSlipUrl || curr.slipUrl,
                  reimbursementRef: paidRef.trim() || curr.reimbursementRef,
                }
              : null
          );
        }
      } else {
        alert(res.error || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setPaidSubmitting(false);
    }
  }

  // Bulk status update for WAITING_TRANSFER or ADVANCED
  async function handleBulkStatus(targetStatus: 'WAITING_TRANSFER' | 'ADVANCED' | 'BILLED' | 'UNBILLED') {
    if (selectedInfo.paymentIds.length === 0) return;
    setBulkUpdating(true);
    try {
      const res = await fetch('/api/admin/tax-payments/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: selectedInfo.paymentIds,
          billingStatus: targetStatus,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setNotice(res.message);
        setSelectedCompanyIds(new Set());
        void loadBillingData(true);
      } else {
        alert(res.error || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setBulkUpdating(false);
    }
  }

  // Export Table Data to Excel / CSV with UTF-8 BOM
  function handleExportCsv() {
    if (statements.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก CSV');
      return;
    }

    const csvRows: string[] = [];
    csvRows.push([
      'ลำดับ',
      'บริษัทลูกค้า',
      'เลขประจำตัวผู้เสียภาษี',
      'ผู้ติดต่อ',
      'เบอร์โทรศัพท์',
      'LINE ID',
      'ภ.พ. 30',
      'ภ.ง.ด. 1',
      'ภ.ง.ด. 3',
      'ภ.ง.ด. 53',
      'ภ.ง.ด. 51',
      'ยอดรวมทั้งสิ้น (บาท)',
      'สถานะ',
      'ค้างชำระ (วัน)',
    ].map((header) => `"${header}"`).join(','));

    statements.forEach((stmt, idx) => {
      const contact = stmt.company.primaryContact;
      const statusText = statusDisplayMap[stmt.overallStatus]?.label || stmt.overallStatus;
      const row = [
        idx + 1,
        `"${(stmt.company.name || '').replace(/"/g, '""')}"`,
        `"${stmt.company.taxId || ''}"`,
        `"${(contact?.name ? `${contact.name}${contact.roleTitle ? ` (${contact.roleTitle})` : ''}` : '').replace(/"/g, '""')}"`,
        `"${contact?.phone || stmt.company.phone || ''}"`,
        `"${contact?.lineId || ''}"`,
        stmt.taxes.vat ? stmt.taxes.vat.amount.toFixed(2) : '0.00',
        stmt.taxes.pnd1 ? stmt.taxes.pnd1.amount.toFixed(2) : '0.00',
        stmt.taxes.pnd3 ? stmt.taxes.pnd3.amount.toFixed(2) : '0.00',
        stmt.taxes.pnd53 ? stmt.taxes.pnd53.amount.toFixed(2) : '0.00',
        stmt.taxes.pnd51 ? stmt.taxes.pnd51.amount.toFixed(2) : '0.00',
        stmt.totalAmount.toFixed(2),
        `"${statusText}"`,
        stmt.agingDays !== undefined && stmt.agingDays > 0 ? stmt.agingDays : '0',
      ];
      csvRows.push(row.join(','));
    });

    // Summary row
    const sumVat = statements.reduce((acc, s) => acc + (s.taxes.vat?.amount || 0), 0);
    const sumPnd1 = statements.reduce((acc, s) => acc + (s.taxes.pnd1?.amount || 0), 0);
    const sumPnd3 = statements.reduce((acc, s) => acc + (s.taxes.pnd3?.amount || 0), 0);
    const sumPnd53 = statements.reduce((acc, s) => acc + (s.taxes.pnd53?.amount || 0), 0);
    const sumPnd51 = statements.reduce((acc, s) => acc + (s.taxes.pnd51?.amount || 0), 0);
    const sumGrand = statements.reduce((acc, s) => acc + s.totalAmount, 0);

    csvRows.push([
      '""',
      '"รวมทั้งสิ้น"',
      '""',
      '""',
      '""',
      '""',
      sumVat.toFixed(2),
      sumPnd1.toFixed(2),
      sumPnd3.toFixed(2),
      sumPnd53.toFixed(2),
      sumPnd51.toFixed(2),
      sumGrand.toFixed(2),
      '""',
      '""',
    ].join(','));

    // Prepend UTF-8 BOM so Excel displays Thai characters correctly
    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const periodLabel = taxMonth === 'ALL_OUTSTANDING' ? 'หนี้ค้างรับทั้งหมด_สะสมทุกงวด' : `งวด_${taxMonth}_${taxYear}`;
    link.setAttribute('download', `รายงานยอดวางบิล_${periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Copy LINE Message Generator with Dynamic Template
  function handleCopyLineMessage(stmt: BillingStatement) {
    const monthName = monthLabels.find(([m]) => m === taxMonth)?.[1] || taxMonth;
    const periodString = taxMonth === 'ALL_OUTSTANDING' ? 'ยอดหนี้ค้างรับสะสมทุกงวด' : `${monthName} ${taxYear}`;
    const contactName = stmt.company.primaryContact?.name;
    const contactRole = stmt.company.primaryContact?.roleTitle;
    const contactHeader = contactName
      ? `คุณ${contactName}${contactRole ? ` (${contactRole})` : ''}`
      : `ฝ่ายการเงิน`;

    const taxLines: string[] = [];
    let index = 1;
    if (stmt.taxes.vat) {
      taxLines.push(`${index++}. ภ.พ. 30 (VAT): ${money(stmt.taxes.vat.amount)}`);
    }
    if (stmt.taxes.pnd1) {
      taxLines.push(`${index++}. ภ.ง.ด. 1 (เงินเดือน): ${money(stmt.taxes.pnd1.amount)}`);
    }
    if (stmt.taxes.pnd3) {
      taxLines.push(`${index++}. ภ.ง.ด. 3 (หักบุคคล): ${money(stmt.taxes.pnd3.amount)}`);
    }
    if (stmt.taxes.pnd53) {
      taxLines.push(`${index++}. ภ.ง.ด. 53 (หักนิติบุคคล): ${money(stmt.taxes.pnd53.amount)}`);
    }
    if (stmt.taxes.pnd51) {
      taxLines.push(`${index++}. ภ.ง.ด. 51 (ครึ่งปี): ${money(stmt.taxes.pnd51.amount)}`);
    }

    const taxListStr = taxLines.join('\n');
    const bankStr = bankInfo.trim() || `ธนาคารกสิกรไทย (KBANK)\nเลขที่บัญชี: 055-8-12345-6\nชื่อบัญชี: บจก. ดีถาวรการบัญชี`;

    const templateToUse = lineTemplate.trim() || `เรียน {contactHeader} - {companyName}
สำนักงานบัญชีดีถาวร ได้ดำเนินการชำระภาษีงวด {monthYear} แทนท่านเรียบร้อยแล้ว ดังนี้:

{taxList}
-------------------------------------------
รวมยอดสำรองจ่ายทั้งสิ้น: {totalAmount}

กรุณาโอนเงินคืนเข้าบัญชี:
{bankAccount}

(เมื่อโอนเงินแล้ว รบกวนส่งสลิปแจ้งทางนี้ได้เลยนะคะ ขอบคุณค่ะ)`;

    const message = templateToUse
      .replace(/\{companyName\}/g, stmt.company.name)
      .replace(/\{contactHeader\}/g, contactHeader)
      .replace(/\{monthYear\}/g, periodString)
      .replace(/\{taxList\}/g, taxListStr)
      .replace(/\{totalAmount\}/g, money(stmt.totalAmount))
      .replace(/\{bankAccount\}/g, bankStr);

    navigator.clipboard.writeText(message);
    setNotice(`คัดลอกข้อความสรุปยอดส่ง LINE ของ "${stmt.company.name}" เรียบร้อยแล้ว (สามารถนำไปกด Paste ใน LINE ได้ทันที)`);
  }

  // Create Follow-up in Drawer
  async function handleCreateFollowUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedStatement) return;

    setFollowUpSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/admin/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedStatement.company.id,
          channel: formData.get('channel'),
          result: formData.get('result'),
          promisedDate: formData.get('promisedDate') || null,
          notes: formData.get('notes') || '',
        }),
      }).then((r) => r.json());

      if (res.success) {
        setNotice('บันทึกประวัติการติดตามเรียบร้อยแล้ว');
        form.reset();
        void loadBillingData(true);
        setSelectedStatement((curr) =>
          curr
            ? {
                ...curr,
                followUpCount: curr.followUpCount + 1,
                lastFollowUp: {
                  channel: String(formData.get('channel')),
                  result: String(formData.get('result')),
                  promisedDate: formData.get('promisedDate') ? String(formData.get('promisedDate')) : null,
                  notes: String(formData.get('notes') || ''),
                  createdAt: new Date().toISOString(),
                },
              }
            : null
        );
      } else {
        alert(res.error || 'ไม่สามารถบันทึกได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setFollowUpSaving(false);
    }
  }

  return (
    <div className="tax-workspace">
      {/* Page Header */}
      <header className="tax-page-head admin-page-header">
        <div>
          <p>ระบบติดตามเงินทดรองจ่าย</p>
          <h1>สรุปยอดวางบิลรายบริษัท</h1>
          <span>รวมยอดภาษีในงวดเดียว เพื่อแจ้งยอดและติดตามเงินคืน</span>
        </div>
        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => void loadBillingData()}
          style={{ minHeight: '38px', gap: '7px' }}
        >
          <RefreshCw size={16} /> รีเฟรชข้อมูล
        </button>
      </header>

      {/* Notice Banner */}
      {notice && (
        <div className="admin-alert admin-alert--success" role="status" style={{ margin: 0 }}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            className="admin-icon-button"
            style={{ marginLeft: 'auto' }}
            onClick={() => setNotice('')}
            aria-label="ปิด"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Urgent Alerts Banner */}
      {alerts && (alerts.promisedTodayCount > 0 || alerts.overduePromisesCount > 0) && (
        <div className="billing-alert-banner">
          <div className="billing-alert-banner__content">
            <AlertCircle size={20} />
            <div>
              <strong>งานติดตามเร่งด่วน: </strong>
              <span>
                {alerts.promisedTodayCount > 0 && `มี ${alerts.promisedTodayCount} บริษัทที่นัดชำระเงินวันนี้ `}
                {alerts.overduePromisesCount > 0 && `(และมี ${alerts.overduePromisesCount} บริษัทที่เกินกำหนดนัดชำระ)`}
              </span>
            </div>
          </div>
          <Link href="/admin/follow-ups" className="billing-alert-banner__link">ดูประวัติการติดตาม</Link>
        </div>
      )}

      {/* Summary KPI Cards */}
      <section className="tax-summary" aria-label="สรุปยอดวางบิล">
        <button
          type="button"
          className={`is-clickable ${statusFilter === '' ? 'is-active-total' : ''}`}
          onClick={() => setStatusFilter('')}
          title="คลิกเพื่อแสดงทุกบริษัท"
        >
          <span>{meta?.isAllOutstanding ? 'ยอดหนี้ค้างรับสะสมทุกงวด' : 'ยอดรวมทั้งสิ้นในงวดนี้'}</span>
          <strong>{money(meta?.grandTotal || 0)}</strong>
          <small>{meta?.totalCompanies || 0} บริษัท{meta?.isAllOutstanding ? ' ที่มียอดค้างรับ' : ' ที่มียอดภาษี'}</small>
          <div className="kpi-indicator kpi-indicator--total" />
        </button>

        <button
          type="button"
          className={`is-clickable ${statusFilter === 'ADVANCED' || statusFilter === 'UNBILLED' ? 'is-active-advanced' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'ADVANCED' || statusFilter === 'UNBILLED' ? '' : 'ADVANCED')}
          title="คลิกเพื่อกรองเฉพาะยอดสำรองจ่าย"
        >
          <span>สำรองจ่าย (สนง. จ่ายแทนแล้ว)</span>
          <strong style={{ color: '#0284c7' }}>{money(meta?.advanced?.amount ?? meta?.unbilled?.amount ?? 0)}</strong>
          <small>{(meta?.advanced?.count ?? meta?.unbilled?.count ?? 0)} บริษัท (รอเรียกเก็บ)</small>
          <div className="kpi-indicator" style={{ background: '#0284c7' }} />
        </button>

        <button
          type="button"
          className={`is-clickable ${statusFilter === 'WAITING_TRANSFER' || statusFilter === 'BILLED' ? 'is-active-waiting' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'WAITING_TRANSFER' || statusFilter === 'BILLED' ? '' : 'WAITING_TRANSFER')}
          title="คลิกเพื่อกรองเฉพาะยอดรอโอนเงิน"
        >
          <span>รอโอนเงิน (แจ้งยอดแล้ว)</span>
          <strong style={{ color: '#d97706' }}>{money(meta?.waiting?.amount ?? meta?.billed?.amount ?? 0)}</strong>
          <small>{(meta?.waiting?.count ?? meta?.billed?.count ?? 0)} บริษัท (ติดตามเงินคืน)</small>
          <div className="kpi-indicator kpi-indicator--waiting" />
        </button>

        <button
          type="button"
          className={`is-clickable ${statusFilter === 'PAID' ? 'is-active-paid' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'PAID' ? '' : 'PAID')}
          title="คลิกเพื่อกรองเฉพาะยอดจ่ายแล้ว"
        >
          <span>จ่ายแล้ว (ได้รับเงินคืน)</span>
          <strong style={{ color: '#16a34a' }}>{money(meta?.paid?.amount ?? 0)}</strong>
          <small>{meta?.paid?.count || 0} บริษัท (เคลียร์ครบแล้ว)</small>
          <div className="kpi-indicator kpi-indicator--paid" />
        </button>
      </section>

      {/* Ledger & Toolbar */}
      <section className="tax-ledger">
        <div className="tax-toolbar">
          <div className="tax-toolbar__period">
            <label>
              <CalendarDays aria-hidden="true" size={16} />
              <span className="sr-only">ปีภาษี</span>
              <select
                value={taxYear}
                disabled={taxMonth === 'ALL_OUTSTANDING'}
                onChange={(e) => setTaxYear(e.target.value)}
                title={taxMonth === 'ALL_OUTSTANDING' ? 'โหมดค้างรับทุกงวดครอบคลุมทุกปีภาษี' : 'เลือกปีภาษี'}
              >
                {taxMonth === 'ALL_OUTSTANDING' ? (
                  <option value="ทุกปี">ทุกปีภาษี</option>
                ) : (
                  [0, 1, 2, 3].map((offset) => (
                    <option key={offset} value={currentGregorianYear + 543 - offset}>
                      {currentGregorianYear + 543 - offset}
                    </option>
                  ))
                )}
              </select>
            </label>

            <select
              aria-label="เดือนภาษี"
              value={taxMonth}
              onChange={(e) => setTaxMonth(e.target.value)}
            >
              <optgroup label="มุมมองผู้บริหาร (Executive)">
                <option value="ALL_OUTSTANDING">🔥 หนี้ค้างรับทั้งหมด (สะสมทุกงวด)</option>
              </optgroup>
              <optgroup label="เลือกตามงวดรายเดือน">
                {monthLabels.map(([num, name]) => (
                  <option key={num} value={num}>
                    {num} - {name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="tax-search">
            <Search aria-hidden="true" size={16} />
            <input
              type="search"
              name="billingSearch"
              aria-label="ค้นหาบริษัทหรือผู้ติดต่อ"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearch(searchInput);
              }}
              placeholder="ค้นหาชื่อบริษัท, เลข 13 หลัก, ผู้ติดต่อ..."
            />
            <button type="button" onClick={() => setSearch(searchInput)}>
              ค้นหา
            </button>
          </div>

          <button
            type="button"
            className="btn-export-csv"
            onClick={handleExportCsv}
            title="ดาวน์โหลดรายงานสรุปยอดเป็นไฟล์ Excel / CSV พร้อมตัวกรองปัจจุบัน"
          >
            <Download size={15} />
            <span>ดาวน์โหลด Excel</span>
          </button>
        </div>

        {/* Statements Table */}
        <div className="billing-table-wrap">
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '300px', gap: '8px' }}>
              <span className="admin-spinner admin-spinner--dark" />
              <span style={{ fontSize: '13px', color: 'var(--dtv-muted)' }}>กำลังรวบรวมยอดวางบิล...</span>
            </div>
          ) : error ? (
            <div className="admin-inline-state admin-inline-state--error" role="alert">
              <AlertCircle aria-hidden="true" size={24} />
              <strong>โหลดข้อมูลวางบิลไม่สำเร็จ</strong>
              <span>{error}</span>
              <button type="button" className="admin-secondary-button" onClick={() => void loadBillingData()}>ลองใหม่</button>
            </div>
          ) : statements.length === 0 ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '300px', gap: '8px', color: 'var(--dtv-muted)' }}>
              <WalletCards size={40} strokeWidth={1.5} />
              <strong>{meta?.isAllOutstanding ? 'ไม่พบหนี้ค้างรับสะสมในระบบ (ยอดค้างเป็น 0)' : 'ไม่พบรายการภาษีในงวดนี้'}</strong>
              <small>{meta?.isAllOutstanding ? 'ทุกบริษัทชำระเงินคืนสำนักงานบัญชีครบถ้วนแล้ว' : 'สามารถนำเข้าหรือบันทึกรายการภาษีในหน้า ภ.พ. 30 หรือ ภ.ง.ด. 1, 3, 53, 51 ได้'}</small>
            </div>
          ) : (
            <table className="billing-table">
              <colgroup>
                <col style={{ width: '38px' }} />
                <col style={{ minWidth: '180px' }} />
                <col style={{ width: '82px' }} />
                <col style={{ width: '78px' }} />
                <col style={{ width: '78px' }} />
                <col style={{ width: '78px' }} />
                <col style={{ width: '84px' }} />
                <col style={{ width: '105px' }} />
                <col style={{ width: '95px' }} />
                <col style={{ width: '185px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    {canEditPayments && <input
                      type="checkbox"
                      checked={statements.some(canEditStatement) && statements.filter(canEditStatement).every((statement) => selectedCompanyIds.has(statement.company.id))}
                      onChange={handleToggleSelectAll}
                      aria-label="เลือกทั้งหมด"
                    />}
                  </th>
                  <th className="col-company">
                    บริษัทลูกค้า & ผู้ติดต่อ
                  </th>
                  <th>ภ.พ. 30</th>
                  <th>ภ.ง.ด. 1</th>
                  <th>ภ.ง.ด. 3</th>
                  <th>ภ.ง.ด. 53</th>
                  <th>ภ.ง.ด. 51</th>
                  <th>ยอดรวมทั้งสิ้น</th>
                  <th>สถานะ</th>
                  <th className="col-actions">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((stmt) => {
                  const isSelected = selectedCompanyIds.has(stmt.company.id);
                  const statusInfo = statusDisplayMap[stmt.overallStatus] || statusDisplayMap.UNBILLED;

                  return (
                    <tr key={stmt.company.id} className={isSelected ? 'is-selected' : ''}>
                      <td>
                        {canEditStatement(stmt) && <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(stmt.company.id)}
                          aria-label={`เลือก ${stmt.company.name}`}
                        />}
                      </td>
                      <td className="col-company">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--dtv-navy-900)', fontSize: '15px' }}>
                            {stmt.company.name}
                          </strong>
                          {stmt.agingDays !== undefined && stmt.agingDays > 0 && stmt.overallStatus !== 'PAID' && (
                            <span
                              className={`aging-badge ${
                                stmt.agingDays > 30
                                  ? 'aging-badge--danger'
                                  : stmt.agingDays >= 15
                                  ? 'aging-badge--warning'
                                  : 'aging-badge--normal'
                              }`}
                              title={`ค้างชำระมาแล้ว ${stmt.agingDays} วัน นับจากวันที่สำรองจ่าย`}
                            >
                              ค้าง {stmt.agingDays} วัน
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', color: '#475569', fontSize: '13px' }}>
                          {stmt.company.primaryContact ? (
                            <span>
                              {stmt.company.primaryContact.name} ({stmt.company.primaryContact.roleTitle || 'การเงิน'})
                              {stmt.company.primaryContact.phone && ` • 📞 ${stmt.company.primaryContact.phone}`}
                              {stmt.company.primaryContact.lineId && ` • LINE: ${stmt.company.primaryContact.lineId}`}
                            </span>
                          ) : (
                            <span>{stmt.company.taxId ? `เลข 13 หลัก: ${stmt.company.taxId}` : 'ไม่มีข้อมูลผู้ติดต่อ'}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {stmt.taxes.vat ? (
                          <span className={`tax-amount-tag ${stmt.taxes.vat.status === 'PAID' ? 'tax-amount-tag--paid' : stmt.taxes.vat.status === 'BILLED' || stmt.taxes.vat.status === 'WAITING_TRANSFER' ? 'tax-amount-tag--billed' : 'tax-amount-tag--unbilled'}`}>
                            {money(stmt.taxes.vat.amount)}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      <td>
                        {stmt.taxes.pnd1 ? (
                          <span className={`tax-amount-tag ${stmt.taxes.pnd1.status === 'PAID' ? 'tax-amount-tag--paid' : stmt.taxes.pnd1.status === 'BILLED' || stmt.taxes.pnd1.status === 'WAITING_TRANSFER' ? 'tax-amount-tag--billed' : 'tax-amount-tag--unbilled'}`}>
                            {money(stmt.taxes.pnd1.amount)}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      <td>
                        {stmt.taxes.pnd3 ? (
                          <span className={`tax-amount-tag ${stmt.taxes.pnd3.status === 'PAID' ? 'tax-amount-tag--paid' : stmt.taxes.pnd3.status === 'BILLED' || stmt.taxes.pnd3.status === 'WAITING_TRANSFER' ? 'tax-amount-tag--billed' : 'tax-amount-tag--unbilled'}`}>
                            {money(stmt.taxes.pnd3.amount)}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      <td>
                        {stmt.taxes.pnd53 ? (
                          <span className={`tax-amount-tag ${stmt.taxes.pnd53.status === 'PAID' ? 'tax-amount-tag--paid' : stmt.taxes.pnd53.status === 'BILLED' || stmt.taxes.pnd53.status === 'WAITING_TRANSFER' ? 'tax-amount-tag--billed' : 'tax-amount-tag--unbilled'}`}>
                            {money(stmt.taxes.pnd53.amount)}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      <td>
                        {stmt.taxes.pnd51 ? (
                          <span className={`tax-amount-tag ${stmt.taxes.pnd51.status === 'PAID' ? 'tax-amount-tag--paid' : stmt.taxes.pnd51.status === 'BILLED' || stmt.taxes.pnd51.status === 'WAITING_TRANSFER' ? 'tax-amount-tag--billed' : 'tax-amount-tag--unbilled'}`}>
                            {money(stmt.taxes.pnd51.amount)}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      <td>
                        <strong className="grand-total-amount">
                          {money(stmt.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span className={`tax-status-pill ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="col-actions">
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                          {stmt.slipUrl && (
                            <button
                              type="button"
                              className="slip-badge-btn"
                              onClick={() => openViewSlip(stmt.slipUrl!, stmt.company.name, stmt.reimbursementRef)}
                              title="คลิกเพื่อดูหลักฐานสลิปการโอนเงิน"
                            >
                              <FileText size={14} /> สลิป
                            </button>
                          )}
                          {canEditStatement(stmt) && stmt.overallStatus !== 'PAID' && (
                            <button
                              type="button"
                              className="btn-mark-paid"
                              onClick={() => openPaidModalForSingle(stmt)}
                              title="บันทึกการรับเงินคืนและแนบสลิป"
                            >
                              <Check size={14} /> รับเงิน
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-line-copy"
                            onClick={() => handleCopyLineMessage(stmt)}
                            title="คลิกเพื่อคัดลอกข้อความสรุปยอดส่งทาง LINE"
                          >
                            <Send size={14} /> LINE
                          </button>
                          <button
                            type="button"
                            className="admin-icon-button"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => setSelectedStatement(stmt)}
                            title="เปิดดูรายละเอียดและบันทึกการติดตาม"
                            aria-label={`เปิดรายละเอียด ${stmt.company.name}`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="billing-table__total-row">
                  <td></td>
                  <td className="col-company">
                    <strong>รวมทั้งหมด ({statements.length} บริษัท)</strong>
                  </td>
                  <td>
                    <strong>
                      {statements.reduce((acc, s) => acc + (s.taxes.vat?.amount || 0), 0) > 0
                        ? money(statements.reduce((acc, s) => acc + (s.taxes.vat?.amount || 0), 0))
                        : '-'}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {statements.reduce((acc, s) => acc + (s.taxes.pnd1?.amount || 0), 0) > 0
                        ? money(statements.reduce((acc, s) => acc + (s.taxes.pnd1?.amount || 0), 0))
                        : '-'}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {statements.reduce((acc, s) => acc + (s.taxes.pnd3?.amount || 0), 0) > 0
                        ? money(statements.reduce((acc, s) => acc + (s.taxes.pnd3?.amount || 0), 0))
                        : '-'}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {statements.reduce((acc, s) => acc + (s.taxes.pnd53?.amount || 0), 0) > 0
                        ? money(statements.reduce((acc, s) => acc + (s.taxes.pnd53?.amount || 0), 0))
                        : '-'}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {statements.reduce((acc, s) => acc + (s.taxes.pnd51?.amount || 0), 0) > 0
                        ? money(statements.reduce((acc, s) => acc + (s.taxes.pnd51?.amount || 0), 0))
                        : '-'}
                    </strong>
                  </td>
                  <td>
                    <strong className="grand-total-amount">
                      {money(statements.reduce((acc, s) => acc + s.totalAmount, 0))}
                    </strong>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </section>

      {/* Floating Bulk Actions Bar */}
      {canEditPayments && selectedCompanyIds.size > 0 && (
        <div className="bulk-actions-floating-bar" role="toolbar" aria-label="แถบการจัดการหลายรายการ">
          <div className="bulk-actions__info">
            <span className="bulk-actions__count">{selectedInfo.count} บริษัท</span>
            <span>ยอดรวม:</span>
            <strong className="bulk-actions__amount">{money(selectedInfo.totalAmount)}</strong>
          </div>

          <div className="bulk-actions__buttons">
            <button
              type="button"
              className="bulk-btn bulk-btn--billed"
              disabled={bulkUpdating}
              onClick={() => handleBulkStatus('WAITING_TRANSFER')}
            >
              <Clock size={14} /> รอโอนเงิน (แจ้งแล้ว)
            </button>
            <button
              type="button"
              className="bulk-btn bulk-btn--paid"
              disabled={bulkUpdating}
              onClick={openPaidModalForBulk}
            >
              <Check size={14} /> จ่ายแล้ว (PAID)
            </button>
            <button
              type="button"
              className="bulk-btn bulk-btn--clear"
              onClick={() => setSelectedCompanyIds(new Set())}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Company Billing Detail Drawer */}
      {selectedStatement && (
        <div
          className="admin-drawer-layer"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedStatement(null);
          }}
        >
          <aside className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-company-title">
            <header>
              <div>
                <p>รายละเอียดการวางบิล</p>
                <h2 id="drawer-company-title">{selectedStatement.company.name}</h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setSelectedStatement(null)}
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </header>

            <div className="admin-drawer__body">
              {/* Grand Total Card */}
              <section className="admin-drawer__section">
                <h3>สรุปยอดงวด {monthLabels.find(([m]) => m === taxMonth)?.[1] || taxMonth} {taxYear}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span>ยอดสำรองจ่ายรวมทั้งสิ้น:</span>
                  <strong style={{ fontSize: '20px', color: 'var(--dtv-navy-900)' }}>
                    {money(selectedStatement.totalAmount)}
                  </strong>
                </div>

                <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                  {selectedStatement.payments.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        border: '1px solid var(--dtv-line)',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <strong>{taxTypeNames[p.taxType] || p.taxType}</strong>
                        <div style={{ color: '#64748b', fontSize: '10px' }}>
                          จ่ายเมื่อ: {displayDate(p.paymentDate)} ({p.paymentMethod})
                          {p.referenceNo && ` • อ้างอิง: ${p.referenceNo}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>{money(p.amount)}</strong>
                        <div style={{ fontSize: '10px' }}>
                          <span className={`tax-status-pill ${statusDisplayMap[p.billingStatus]?.className || ''}`}>
                            {statusDisplayMap[p.billingStatus]?.label || p.billingStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-line-copy"
                    style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                    onClick={() => handleCopyLineMessage(selectedStatement)}
                  >
                    <Send size={14} /> คัดลอกข้อความสรุปยอดส่ง LINE
                  </button>

                  {selectedStatement.slipUrl ? (
                    <div className="slip-preview-card" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} style={{ color: 'var(--dtv-primary)' }} />
                        <div>
                          <strong style={{ fontSize: '12px', display: 'block' }}>มีหลักฐานสลิปการโอนเงิน</strong>
                          {selectedStatement.reimbursementRef && (
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              เลขที่อ้างอิง: {selectedStatement.reimbursementRef}
                            </small>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="slip-badge-btn"
                        onClick={() => openViewSlip(selectedStatement.slipUrl!, selectedStatement.company.name, selectedStatement.reimbursementRef)}
                      >
                        <Eye size={12} /> ดูสลิป
                      </button>
                    </div>
                  ) : canEditStatement(selectedStatement) ? (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      style={{ width: '100%', justifyContent: 'center', gap: '6px', minHeight: '36px' }}
                      onClick={() => openPaidModalForSingle(selectedStatement)}
                    >
                      <Check size={14} /> บันทึกการรับเงินคืน (PAID) / แนบสลิป
                    </button>
                  ) : null}
                </div>
              </section>

              {/* Follow-up Section */}
              {canCreateFollowUp && <section className="admin-drawer__section">
                <h3><PhoneCall size={17} /> บันทึกการติดตาม (โทร / LINE)</h3>
                <form onSubmit={handleCreateFollowUp} className="admin-followup-form">
                  <div className="admin-form-grid">
                    <div className="admin-field">
                      <label htmlFor="follow-channel">ช่องทาง</label>
                      <select id="follow-channel" name="channel" defaultValue="LINE">
                        <option value="LINE">LINE</option>
                        <option value="PHONE">โทรศัพท์</option>
                        <option value="EMAIL">อีเมล</option>
                        <option value="IN_PERSON">เข้าพบ</option>
                        <option value="OTHER">อื่น ๆ</option>
                      </select>
                    </div>

                    <div className="admin-field">
                      <label htmlFor="follow-result">ผลการติดต่อ</label>
                      <select id="follow-result" name="result" defaultValue="PROMISED">
                        <option value="PROMISED">นัดชำระเงิน</option>
                        <option value="NO_ANSWER">ติดต่อไม่ได้</option>
                        <option value="REJECTED">ขอเอกสารเพิ่ม/มีปัญหา</option>
                        <option value="PAID">แจ้งว่าโอนแล้ว</option>
                      </select>
                    </div>

                    <div className="admin-field admin-field--wide">
                      <label htmlFor="follow-date">วันที่นัดชำระ (ถ้ามี)</label>
                      <input id="follow-date" name="promisedDate" type="date" />
                    </div>

                    <div className="admin-field admin-field--wide">
                      <label htmlFor="follow-notes">บันทึกข้อความ</label>
                      <textarea
                        id="follow-notes"
                        name="notes"
                        rows={2}
                        placeholder="เช่น ส่งยอดทางไลน์แล้ว ลูกค้าแจ้งจะโอนช่วงสิ้นวัน"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="admin-primary-button"
                    disabled={followUpSaving}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    {followUpSaving ? 'กำลังบันทึก…' : 'บันทึกประวัติ'}
                  </button>
                </form>
              </section>}

              <div className="drawer-close-footer">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setSelectedStatement(null)}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Modal: Mark as PAID & Attach Slip */}
      {paidModalOpen && paidTarget && canEditPayments && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (!paidSubmitting && event.target === event.currentTarget) setPaidModalOpen(false);
          }}
        >
          <section className="admin-dialog" role="dialog" aria-modal="true" style={{ width: 'min(560px, 100%)' }}>
            <header>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <CheckCircle2 size={15} /> บันทึกการรับชำระเงินคืน (Reimbursement)
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dtv-navy-900)' }}>
                  {paidTarget.companyNames.length === 1
                    ? paidTarget.companyNames[0]
                    : `เลือกชำระพร้อมกัน ${paidTarget.companyNames.length} บริษัท`}
                </h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => !paidSubmitting && setPaidModalOpen(false)}
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmitPaid}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#166534' }}>ยอดเงินที่รับชำระคืน:</span>
                  <strong style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
                    {money(paidTarget.totalAmount)}
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="paid-date-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                      วันที่รับเงินคืน *
                    </label>
                    <input
                      id="paid-date-input"
                      type="date"
                      className="admin-input"
                      value={paidDate}
                      onChange={(e) => setPaidDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="paid-ref-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                      เลขที่สลิป / อ้างอิง
                    </label>
                    <input
                      id="paid-ref-input"
                      type="text"
                      className="admin-input"
                      placeholder="เช่น 20260908xxxx"
                      value={paidRef}
                      onChange={(e) => setPaidRef(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                    แนบหลักฐานการโอนเงิน (สลิป/ใบเสร็จ)
                  </label>

                  {compressingSlip ? (
                    <div style={{ padding: '28px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                      <div className="admin-spinner admin-spinner--dark" style={{ marginBottom: '10px', width: '22px', height: '22px' }} />
                      <div style={{ fontSize: '13.5px', color: '#475569' }}>กำลังปรับขนาดและบีบอัดรูปภาพให้เหมาะสม...</div>
                    </div>
                  ) : slipFile ? (
                    <div className="slip-preview-card" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {slipPreviewUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={slipPreviewUrl}
                            alt="Slip Preview"
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <FileText size={36} style={{ color: 'var(--dtv-primary)' }} />
                        )}
                        <div>
                          <strong style={{ fontSize: '14px', display: 'block', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {slipFile.name}
                          </strong>
                          <small style={{ color: '#64748b', fontSize: '12.5px' }}>
                            ขนาดไฟล์: {(slipFile.size / 1024).toFixed(0)} KB
                          </small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="admin-icon-button"
                        style={{ color: '#ef4444' }}
                        onClick={() => {
                          setSlipFile(null);
                          setSlipPreviewUrl(null);
                        }}
                        title="ลบไฟล์นี้"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="slip-dropzone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) void handleFileSelect(e.dataTransfer.files[0]);
                      }}
                    >
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) void handleFileSelect(e.target.files[0]);
                        }}
                        style={{ display: 'none' }}
                      />
                      <UploadCloud size={38} style={{ color: 'var(--dtv-primary)', margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--dtv-navy-900)' }}>
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์สลิปมาวางที่นี่
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                        รองรับ JPG, PNG, WEBP (ย่อขนาดอัตโนมัติ) หรือ PDF ขนาดสูงสุดไม่เกิน 5 MB
                      </div>
                    </label>
                  )}
                  <small style={{ color: '#64748b', fontSize: '13px', display: 'block', marginTop: '7px' }}>
                    * การแนบหลักฐานเป็นตัวเลือก (Optional) สามารถกดยืนยันได้ทันทีแม้ไม่มีไฟล์แนบ
                  </small>
                </div>
              </div>

              <footer>
                <button
                  type="button"
                  className="admin-secondary-button"
                  disabled={paidSubmitting}
                  onClick={() => setPaidModalOpen(false)}
                  style={{ minHeight: '44px', paddingInline: '20px', fontSize: '14.5px' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={paidSubmitting}
                  style={{ minHeight: '44px', paddingInline: '22px', fontSize: '14.5px', gap: '8px' }}
                >
                  {paidSubmitting ? (
                    <>
                      <div className="admin-spinner" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>ยืนยันบันทึกยอดชำระแล้ว</span>
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* Modal: View Slip Lightbox */}
      {slipViewerData && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSlipViewerData(null);
          }}
        >
          <section className="admin-dialog" role="dialog" aria-modal="true" style={{ width: 'min(640px, 100%)', padding: '0' }}>
            <header>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                  หลักฐานการโอนเงิน (สลิป)
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{slipViewerData.title}</h2>
                {slipViewerData.ref && (
                  <small style={{ color: '#475569', fontSize: '13px', display: 'block', marginTop: '3px' }}>
                    เลขที่อ้างอิง: <strong>{slipViewerData.ref}</strong>
                  </small>
                )}
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setSlipViewerData(null)}
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </header>

            <div className="slip-viewer-content" style={{ padding: '20px' }}>
              {slipViewerData.url.toLowerCase().endsWith('.pdf') ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <FileText size={48} style={{ color: 'var(--dtv-primary)', marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 16px 0', fontSize: '15px' }}>เอกสารแนบเป็นไฟล์ PDF</p>
                  <a
                    href={slipViewerData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-primary-button"
                    style={{ display: 'inline-flex', gap: '8px', minHeight: '44px', fontSize: '14.5px' }}
                  >
                    <ExternalLink size={16} />
                    เปิดไฟล์ PDF ในหน้าต่างใหม่
                  </a>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={slipViewerData.url} alt={`สลิป ${slipViewerData.title}`} />
              )}
            </div>

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--dtv-line)' }}>
              <a
                href={slipViewerData.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--dtv-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={15} /> เปิดไฟล์ต้นฉบับในแท็บใหม่
              </a>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setSlipViewerData(null)}
                style={{ minHeight: '40px', fontSize: '14px', paddingInline: '18px' }}
              >
                ปิดหน้าต่าง
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
