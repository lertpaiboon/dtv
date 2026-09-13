'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Pencil,
  PhoneCall,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  Upload,
  UploadCloud,
  WalletCards,
  X,
} from 'lucide-react';
import { permissionForTaxType, type TaxType } from '@/lib/admin-domain';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

type TaxChoice = { value: string; label: string };
type WorkspaceConfig = {
  title: string;
  description: string;
  eyebrow: string;
  types: TaxChoice[];
  monthly?: boolean;
};

type Company = { id: number; name: string; taxId?: string | null; isActive: boolean };
type PaymentMethod = { id: number; code: string; name: string; cardLastDigits?: string | null };
type Payment = {
  id: number;
  taxType: string;
  taxYear: string;
  taxMonth?: string | null;
  paymentDate: string;
  amount: string | number;
  referenceNo?: string | null;
  billingStatus: string;
  reimbursementRef?: string | null;
  slipUrl?: string | null;
  slipFileName?: string | null;
  reimbursedAt?: string | null;
  note?: string | null;
  company: Company;
  paymentMethod: PaymentMethod;
  createdBy?: { id: number; fullName: string };
  _count?: { followUpLogs: number };
};

const statusLabels: Record<string, string> = {
  UNBILLED: 'รอวางบิล',
  BILLED: 'วางบิลแล้ว',
  WAITING_TRANSFER: 'รอโอน',
  PAID: 'จ่ายแล้ว',
  PENDING: 'รอดำเนินการ',
  ADVANCED: 'รอวางบิล',
};

const taxTypeDisplayMap: Record<string, string> = {
  VAT_PP30: 'ภ.พ. 30 (ภาษีมูลค่าเพิ่ม)',
  WHT_PND1: 'ภ.ง.ด. 1 (ภาษีหัก ณ ที่จ่าย)',
  WHT_PND3: 'ภ.ง.ด. 3 (ภาษีหัก ณ ที่จ่าย)',
  WHT_PND53: 'ภ.ง.ด. 53 (ภาษีหัก ณ ที่จ่าย)',
  PND51: 'ภ.ง.ด. 51 (ภาษีเงินได้นิติบุคคลครึ่งปี)',
};

const statusClassMap: Record<string, string> = {
  UNBILLED: 'tax-status--unbilled',
  BILLED: 'tax-status--waiting_transfer',
  WAITING_TRANSFER: 'tax-status--waiting_transfer',
  PAID: 'tax-status--paid',
  PENDING: 'tax-status--pending',
  ADVANCED: 'tax-status--unbilled',
};

const quickStatusOptions = [
  { value: 'UNBILLED', label: 'รอวางบิล (สนง. จ่ายแทน)', className: 'tax-status--unbilled' },
  { value: 'BILLED', label: 'วางบิลแล้ว (รอลูกค้าโอน)', className: 'tax-status--waiting_transfer' },
  { value: 'PAID', label: 'จ่ายแล้ว (เคลียร์ยอดแล้ว)', className: 'tax-status--paid' },
  { value: 'PENDING', label: 'รอดำเนินการ/มีปัญหา', className: 'tax-status--pending' },
] as const;

const monthLabels = [
  ['01', 'มกราคม'], ['02', 'กุมภาพันธ์'], ['03', 'มีนาคม'], ['04', 'เมษายน'],
  ['05', 'พฤษภาคม'], ['06', 'มิถุนายน'], ['07', 'กรกฎาคม'], ['08', 'สิงหาคม'],
  ['09', 'กันยายน'], ['10', 'ตุลาคม'], ['11', 'พฤศจิกายน'], ['12', 'ธันวาคม'],
] as const;

function bangkokDate() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function money(value: string | number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value));
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) throw new Error(data?.error || 'ไม่สามารถโหลดข้อมูลได้');
  return data;
}

interface CsvPreviewRow {
  id: string;
  rawTaxId: string;
  rawCompanyName: string;
  companyId: number | null;
  matchedCompanyName: string;
  matchType: 'TAX_ID' | 'NAME' | 'MANUAL' | 'NONE';
  amount: number;
  paymentDate: string;
  paymentMethodId: number;
  billingStatus: string;
  referenceNo: string;
  note: string;
  isDuplicate: boolean;
  isZero: boolean;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

function normalizeThaiName(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(บริษัท|บจก\.|บจก|ห้างหุ้นส่วนจำกัด|หจก\.|หจก)/g, '')
    .replace(/(จำกัด|\(มหาชน\)|มหาชน)$/g, '')
    .replace(/[^a-zA-Z0-9ก-๙]/g, '')
    .trim();
}

function matchCompany(
  rawTaxId: string,
  rawName: string,
  companiesList: Company[]
): { matchedCompany: Company | null; method: 'TAX_ID' | 'NAME' | 'NONE' } {
  const cleanId = rawTaxId.replace(/\D/g, '');
  if (cleanId.length === 13) {
    const byId = companiesList.find((c) => (c.taxId || '').replace(/\D/g, '') === cleanId);
    if (byId) return { matchedCompany: byId, method: 'TAX_ID' };
  }

  const normInput = normalizeThaiName(rawName);
  if (normInput) {
    const byName = companiesList.find((c) => normalizeThaiName(c.name) === normInput);
    if (byName) return { matchedCompany: byName, method: 'NAME' };

    const bySub = companiesList.find((c) => {
      const normC = normalizeThaiName(c.name);
      return (normC.length >= 3 && normInput.includes(normC)) || (normInput.length >= 3 && normC.includes(normInput));
    });
    if (bySub) return { matchedCompany: bySub, method: 'NAME' };
  }

  return { matchedCompany: null, method: 'NONE' };
}

function parseFlexibleDate(dateStr: string, fallbackDate: string): string {
  if (!dateStr || !dateStr.trim()) return fallbackDate;
  const clean = dateStr.trim().replace(/\s+/g, '');

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number);
    const realY = y > 2400 ? y - 543 : y;
    return `${realY}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const slashMatch = clean.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (slashMatch) {
    const d = Number(slashMatch[1]);
    const m = Number(slashMatch[2]);
    let y = Number(slashMatch[3]);
    if (y > 2400) y -= 543;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return fallbackDate;
}

function matchPaymentMethod(str: string, fallbackId: number, methodsList: PaymentMethod[]): number {
  if (!str || !str.trim()) return fallbackId;
  const q = str.trim().toLowerCase();
  const found = methodsList.find(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      (m.cardLastDigits && q.includes(m.cardLastDigits))
  );
  return found ? found.id : fallbackId;
}

function matchBillingStatus(str: string, fallbackStatus: string): string {
  if (!str || !str.trim()) return fallbackStatus;
  const q = str.trim();
  if (q.includes('จ่าย') || q.toUpperCase() === 'PAID') return 'PAID';
  if (q.includes('รอโอน') || q.toUpperCase() === 'WAITING_TRANSFER') return 'WAITING_TRANSFER';
  if (q.includes('สำรอง') || q.includes('วางบิล') || q.toUpperCase() === 'UNBILLED' || q.toUpperCase() === 'ADVANCED') return 'UNBILLED';
  if (q.includes('ดำเนิน') || q.toUpperCase() === 'PENDING') return 'PENDING';
  return fallbackStatus;
}

// Client-side in-memory cache for static lookups across tax page navigation
let cachedCompanies: Company[] | null = null;
let cachedMethods: PaymentMethod[] | null = null;

export default function TaxPaymentsWorkspace({ config }: { config: WorkspaceConfig }) {
  const { can } = useAdminSession();
  const currentGregorianYear = new Date().getUTCFullYear();
  const [taxType, setTaxType] = useState(config.types[0].value);
  const [taxYear, setTaxYear] = useState(String(currentGregorianYear + 543));
  const [taxMonth, setTaxMonth] = useState(String(new Date().getUTCMonth() + 1).padStart(2, '0'));
  const [status, setStatus] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [urlReady, setUrlReady] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [companies, setCompanies] = useState<Company[]>(() => cachedCompanies || []);
  const [methods, setMethods] = useState<PaymentMethod[]>(() => cachedMethods || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companyResultsOpen, setCompanyResultsOpen] = useState(false);
  const [activeCompanyIndex, setActiveCompanyIndex] = useState(0);
  const [createError, setCreateError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editTaxType, setEditTaxType] = useState('');
  const [editError, setEditError] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const [activeStatusPopoverId, setActiveStatusPopoverId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const followUpFirstFieldRef = useRef<HTMLSelectElement>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // CSV Import State
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'OVERWRITE' | 'SKIP'>('OVERWRITE');
  const [batchDefaults, setBatchDefaults] = useState({
    paymentDate: bangkokDate(),
    paymentMethodId: 0,
    billingStatus: 'UNBILLED',
  });
  const [importRows, setImportRows] = useState<CsvPreviewRow[]>([]);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Modal State: Mark as PAID & Attach Slip
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [paidTarget, setPaidTarget] = useState<{
    companyNames: string[];
    paymentIds: number[];
    totalAmount: number;
  } | null>(null);
  const [paidDate, setPaidDate] = useState(() => bangkokDate());
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
  const permissionType = taxType as TaxType;
  const canCreate = can(permissionForTaxType(permissionType, 'create'));
  const canEdit = can(permissionForTaxType(permissionType, 'edit'));
  const canDelete = can(permissionForTaxType(permissionType, 'delete'));
  const canCreateFollowUp = can('followup:create');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('type');
    const requestedYear = params.get('year');
    const requestedMonth = params.get('month');
    const requestedStatus = params.get('status');
    const requestedSearch = params.get('q') || '';
    const validStatuses = ['', 'ADVANCED', 'WAITING_TRANSFER', 'PAID', 'PENDING', 'UNBILLED', 'BILLED'];

    if (requestedType && config.types.some((item) => item.value === requestedType)) setTaxType(requestedType);
    if (requestedYear && /^\d{4}$/.test(requestedYear)) setTaxYear(requestedYear);
    if (requestedMonth && monthLabels.some(([value]) => value === requestedMonth)) setTaxMonth(requestedMonth);
    if (requestedStatus && validStatuses.includes(requestedStatus)) setStatus(requestedStatus);
    setSearchDraft(requestedSearch);
    setSearch(requestedSearch);
    setUrlReady(true);
  }, [config.types]);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set('year', taxYear);
    if (config.monthly) url.searchParams.set('month', taxMonth);
    else url.searchParams.delete('month');
    if (taxType !== config.types[0].value) url.searchParams.set('type', taxType);
    else url.searchParams.delete('type');
    if (status) url.searchParams.set('status', status);
    else url.searchParams.delete('status');
    if (search) url.searchParams.set('q', search);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, [config.monthly, config.types, search, status, taxMonth, taxType, taxYear, urlReady]);

  // Client-side image compression: downscale to max 1600px, shrinks 5-10MB phone camera images to ~200-400KB
  async function compressImageFile(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
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
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(selectedFile.type.toLowerCase())) {
      alert('กรุณาเลือกไฟล์ JPG, PNG, WEBP หรือ PDF เท่านั้น');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 15 MB');
      return;
    }

    if (selectedFile.type.startsWith('image/')) {
      setCompressingSlip(true);
      try {
        const compressed = await compressImageFile(selectedFile);
        setSlipFile(compressed);
        setSlipPreviewUrl(URL.createObjectURL(compressed));
      } catch {
        setSlipFile(selectedFile);
        setSlipPreviewUrl(URL.createObjectURL(selectedFile));
      } finally {
        setCompressingSlip(false);
      }
    } else {
      setSlipFile(selectedFile);
      setSlipPreviewUrl(null);
    }
  }

  function openPaidModalForSingle(payment: Payment) {
    setPaidTarget({
      companyNames: [payment.company.name],
      paymentIds: [payment.id],
      totalAmount: Number(payment.amount),
    });
    setPaidDate(bangkokDate());
    setPaidRef(payment.reimbursementRef || payment.referenceNo || '');
    setSlipFile(null);
    setSlipPreviewUrl(payment.slipUrl || null);
    setPaidModalOpen(true);
  }

  function openPaidModalForBulk() {
    if (selectedIds.size === 0) return;
    const selectedPayments = payments.filter((p) => selectedIds.has(p.id));
    const companyNames = Array.from(new Set(selectedPayments.map((p) => p.company.name)));
    const totalAmount = selectedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    setPaidTarget({
      companyNames,
      paymentIds: Array.from(selectedIds),
      totalAmount,
    });
    setPaidDate(bangkokDate());
    setPaidRef('');
    setSlipFile(null);
    setSlipPreviewUrl(null);
    setPaidModalOpen(true);
  }

  async function handleSubmitPaid(e: FormEvent) {
    e.preventDefault();
    if (!paidTarget || !paidTarget.paymentIds || paidTarget.paymentIds.length === 0) return;

    setPaidSubmitting(true);
    try {
      let uploadedSlipUrl: string | null = slipPreviewUrl && !slipFile ? slipPreviewUrl : null;
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
      }).then(readJson);

      setNotice(res.message);
      setPaidModalOpen(false);
      setPaidTarget(null);
      setSlipFile(null);
      setSlipPreviewUrl(null);
      setPaidRef('');
      setSelectedIds(new Set());
      void loadData(true);
      if (selected && paidTarget.paymentIds.includes(selected.id)) {
        setSelected((curr) =>
          curr
            ? {
                ...curr,
                billingStatus: 'PAID',
                slipUrl: uploadedSlipUrl || curr.slipUrl,
                reimbursementRef: paidRef.trim() || curr.reimbursementRef,
                reimbursedAt: paidDate,
              }
            : null
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setPaidSubmitting(false);
    }
  }

  // Fetch companies & payment methods once on initial mount with caching
  useEffect(() => {
    let isMounted = true;
    if (!cachedCompanies) {
      fetch('/api/admin/companies')
        .then(readJson)
        .then((res) => {
          const list = (res.data || []).filter((c: Company) => c.isActive);
          cachedCompanies = list;
          if (isMounted) setCompanies(list);
        })
        .catch(() => null);
    }
    if (!cachedMethods) {
      fetch('/api/admin/payment-methods')
        .then(readJson)
        .then((res) => {
          const list = (res.data || []) as PaymentMethod[];
          cachedMethods = list;
          if (isMounted) {
            setMethods(list);
            setBatchDefaults((prev) => ({
              ...prev,
              paymentMethodId: prev.paymentMethodId || (list[0]?.id ?? 0),
            }));
          }
        })
        .catch(() => null);
    }
    return () => { isMounted = false; };
  }, []);

  const selectedSummary = useMemo(() => {
    let amt = 0;
    for (const p of payments) {
      if (selectedIds.has(p.id)) amt += Number(p.amount);
    }
    return { count: selectedIds.size, totalAmount: amt };
  }, [payments, selectedIds]);

  async function handleBulkStatus(targetStatus: 'BILLED' | 'PAID' | 'UNBILLED') {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const res = await fetch('/api/admin/tax-payments/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIds: Array.from(selectedIds),
          billingStatus: targetStatus,
        }),
      }).then(readJson);

      setNotice(res.message);
      setSelectedIds(new Set());
      void loadData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setBulkUpdating(false);
    }
  }

  useEffect(() => {
    if (!activeStatusPopoverId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.tax-status-quick-select')) {
        setActiveStatusPopoverId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeStatusPopoverId]);

  // Primary data loader - only fetches payments, zero double-fetch!
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    const query = new URLSearchParams({ taxType, taxYear, pageSize: '200' });
    if (config.monthly) query.set('taxMonth', taxMonth);
    if (status) query.set('billingStatus', status);
    if (search) query.set('search', search);

    try {
      const paymentData = await fetch(`/api/admin/tax-payments?${query}`).then(readJson);
      setPayments(paymentData.data || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [config.monthly, search, status, taxMonth, taxType, taxYear]);

  useEffect(() => {
    if (urlReady) void loadData();
  }, [loadData, urlReady]);

  useEffect(() => {
    setSelectedIds(new Set());
    setActiveStatusPopoverId(null);
  }, [search, status, taxMonth, taxType, taxYear]);

  // Handle open import modal
  function handleOpenImport() {
    setImportError('');
    setImportRows([]);
    if (methods.length > 0 && !batchDefaults.paymentMethodId) {
      setBatchDefaults((prev) => ({ ...prev, paymentMethodId: methods[0].id }));
    }
    if (importFileInputRef.current) importFileInputRef.current.value = '';
    setImportOpen(true);
  }

  // Download CSV template
  function handleDownloadTemplate(withCompanies: boolean) {
    const periodStr = config.monthly ? `${taxYear}_${taxMonth}` : `${taxYear}`;
    const filename = `template_${taxType}_${periodStr}.csv`;
    const header = 'เลขประจำตัวผู้เสียภาษี,ชื่อบริษัท,ยอดเงินภาษี,วันที่ชำระ,ช่องทางชำระ,สถานะ,เลขที่อ้างอิง,หมายเหตุ\n';
    let content = header;

    if (withCompanies && companies.length > 0) {
      const rows = companies.map((c) => {
        const cleanTax = (c.taxId || '').replace(/\D/g, '');
        const escapedName = c.name.includes(',') ? `"${c.name}"` : c.name;
        return `${cleanTax},${escapedName},,,,,,\n`;
      });
      content += rows.join('');
    } else {
      content += '0105550000000,"บจก. ตัวอย่างการค้า",15000.00,08/09/2569,บัตร SCB,สำรอง,REF12345,ชำระภาษีงวดนี้\n';
    }

    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Parse CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim());
      if (lines.length <= 1) {
        setImportError('ไฟล์ไม่มีข้อมูล หรือมีเฉพาะหัวตาราง');
        return;
      }

      const headerParts = parseCsvLine(lines[0]);
      let taxIdCol = -1;
      let nameCol = -1;
      let amountCol = -1;
      let dateCol = -1;
      let methodCol = -1;
      let statusCol = -1;
      let refCol = -1;
      let noteCol = -1;

      headerParts.forEach((h, idx) => {
        const clean = h.trim().toLowerCase();
        if (clean.includes('เลข') || clean.includes('tax') || clean.includes('13')) taxIdCol = idx;
        else if (clean.includes('ชื่อ') || clean.includes('company') || clean.includes('บริษัท') || clean.includes('ลูกค้า')) nameCol = idx;
        else if (clean.includes('ยอด') || clean.includes('เงิน') || clean.includes('amount') || clean.includes('ภาษี')) amountCol = idx;
        else if (clean.includes('วัน') || clean.includes('date')) dateCol = idx;
        else if (clean.includes('ช่องทาง') || clean.includes('วิธี') || clean.includes('method') || clean.includes('บัตร')) methodCol = idx;
        else if (clean.includes('สถานะ') || clean.includes('status')) statusCol = idx;
        else if (clean.includes('อ้างอิง') || clean.includes('สลิป') || clean.includes('ref')) refCol = idx;
        else if (clean.includes('หมายเหตุ') || clean.includes('note')) noteCol = idx;
      });

      if (taxIdCol === -1) taxIdCol = 0;
      if (nameCol === -1) nameCol = 1;
      if (amountCol === -1) amountCol = 2;
      if (dateCol === -1) dateCol = 3;
      if (methodCol === -1) methodCol = 4;
      if (statusCol === -1) statusCol = 5;
      if (refCol === -1) refCol = 6;
      if (noteCol === -1) noteCol = 7;

      const parsed: CsvPreviewRow[] = [];
      const currentPayments = payments;

      for (let i = 1; i < lines.length; i++) {
        const parts = parseCsvLine(lines[i]);
        if (parts.length === 0 || parts.every((p) => !p)) continue;

        const rawTaxId = parts[taxIdCol] || '';
        const rawCompanyName = parts[nameCol] || '';
        const rawAmount = (parts[amountCol] || '').replace(/,/g, '').trim();
        const rawDate = parts[dateCol] || '';
        const rawMethod = parts[methodCol] || '';
        const rawStatus = parts[statusCol] || '';
        const rawRef = parts[refCol] || '';
        const rawNote = parts[noteCol] || '';

        const amountNum = Number(rawAmount);
        const isZero = !rawAmount || isNaN(amountNum) || amountNum <= 0;

        const match = matchCompany(rawTaxId, rawCompanyName, companies);
        const matchedComp = match.matchedCompany;

        const paymentDate = parseFlexibleDate(rawDate, batchDefaults.paymentDate);
        const paymentMethodId = matchPaymentMethod(rawMethod, batchDefaults.paymentMethodId, methods);
        const billingStatus = matchBillingStatus(rawStatus, batchDefaults.billingStatus);
        const isDuplicate = Boolean(matchedComp && currentPayments.some((p) => p.company.id === matchedComp.id));

        parsed.push({
          id: `row-${i}-${Date.now()}`,
          rawTaxId,
          rawCompanyName,
          companyId: matchedComp ? matchedComp.id : null,
          matchedCompanyName: matchedComp ? matchedComp.name : '',
          matchType: match.method,
          amount: isZero ? 0 : amountNum,
          paymentDate,
          paymentMethodId,
          billingStatus,
          referenceNo: rawRef,
          note: rawNote,
          isDuplicate,
          isZero,
        });
      }

      setImportRows(parsed);
      setImportError('');
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Inline company selection in preview
  function handleSelectRowCompany(rowId: string, newCompanyId: number) {
    const comp = companies.find((c) => c.id === newCompanyId);
    setImportRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const isDuplicate = Boolean(comp && payments.some((p) => p.company.id === comp.id));
        return {
          ...r,
          companyId: comp ? comp.id : null,
          matchedCompanyName: comp ? comp.name : '',
          matchType: 'MANUAL',
          isDuplicate,
        };
      })
    );
  }

  // Computed stats for preview
  const importStats = useMemo(() => {
    let validCount = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;
    let duplicateCount = 0;
    let zeroCount = 0;
    let totalAmount = 0;

    for (const r of importRows) {
      if (r.isZero) {
        zeroCount++;
        continue;
      }
      validCount++;
      totalAmount += r.amount;
      if (r.companyId) {
        matchedCount++;
        if (r.isDuplicate) duplicateCount++;
      } else {
        unmatchedCount++;
      }
    }

    return {
      totalRows: importRows.length,
      validCount,
      matchedCount,
      unmatchedCount,
      duplicateCount,
      zeroCount,
      totalAmount,
    };
  }, [importRows]);

  // Confirm and submit batch import
  async function handleConfirmImport() {
    const validRows = importRows.filter((r) => !r.isZero);
    if (validRows.length === 0) {
      setImportError('ไม่มีรายการที่มียอดเงินสำหรับนำเข้า');
      return;
    }

    const unmapped = validRows.filter((r) => !r.companyId);
    if (unmapped.length > 0) {
      setImportError(`ยังมี ${unmapped.length} รายการที่ยังไม่ได้เลือกบริษัทในระบบ กรุณาเลือกบริษัทให้ครบถ้วน`);
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      const payload = {
        taxType,
        taxYear,
        taxMonth: config.monthly ? taxMonth : null,
        duplicateStrategy,
        items: validRows.map((r) => ({
          companyId: r.companyId,
          amount: r.amount.toFixed(2),
          paymentDate: r.paymentDate,
          paymentMethodId: r.paymentMethodId,
          billingStatus: r.billingStatus,
          referenceNo: r.referenceNo || null,
          note: r.note || null,
        })),
      };

      const res = await fetch('/api/admin/tax-payments/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(readJson);

      setImportOpen(false);
      setImportRows([]);
      if (importFileInputRef.current) importFileInputRef.current.value = '';
      setNotice(res.message || 'นำเข้าข้อมูลภาษีสำเร็จ');
      void loadData(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการนำเข้า');
    } finally {
      setImporting(false);
    }
  }

  useEffect(() => {
    if (!createOpen) return;
    setCompanyQuery('');
    setSelectedCompanyId(null);
    setCompanyResultsOpen(true);
    setActiveCompanyIndex(0);
    setCreateError('');
  }, [createOpen]);

  const filteredCompanies = useMemo(() => {
    const query = companyQuery.normalize('NFKC').toLocaleLowerCase('th-TH').replace(/\s+/g, '');
    if (!query) return companies;
    return companies.filter((company) => {
      const name = company.name.normalize('NFKC').toLocaleLowerCase('th-TH').replace(/\s+/g, '');
      const taxId = (company.taxId || '').replace(/\D/g, '');
      const numericQuery = query.replace(/\D/g, '');
      return name.includes(query) || Boolean(numericQuery && taxId.includes(numericQuery));
    });
  }, [companies, companyQuery]);

  useEffect(() => { setActiveCompanyIndex(0); }, [companyQuery]);

  function selectCompany(company: Company) {
    setSelectedCompanyId(company.id);
    setCompanyQuery(company.name);
    setCompanyResultsOpen(false);
    setCreateError('');
  }

  function handleCompanyKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!companyResultsOpen) {
        setCompanyResultsOpen(true);
        setActiveCompanyIndex(0);
      } else {
        setActiveCompanyIndex((index) => Math.min(index + 1, filteredCompanies.length - 1));
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!companyResultsOpen) {
        setCompanyResultsOpen(true);
        setActiveCompanyIndex(Math.max(filteredCompanies.length - 1, 0));
      } else {
        setActiveCompanyIndex((index) => Math.max(index - 1, 0));
      }
    } else if (event.key === 'Enter' && companyResultsOpen && filteredCompanies[activeCompanyIndex]) {
      event.preventDefault();
      selectCompany(filteredCompanies[activeCompanyIndex]);
    } else if (event.key === 'Escape' && companyResultsOpen) {
      event.preventDefault();
      event.stopPropagation();
      setCompanyResultsOpen(false);
    }
  }

  const totals = useMemo(() => {
    const result = {
      total: 0,
      totalCount: payments.length,
      advanced: 0,
      advancedCount: 0,
      waiting: 0,
      waitingCount: 0,
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
    };
    for (const payment of payments) {
      const amount = Number(payment.amount);
      result.total += amount;
      if (payment.billingStatus === 'ADVANCED' || payment.billingStatus === 'UNBILLED' || payment.billingStatus === 'BILLED') {
        result.advanced += amount;
        result.advancedCount += 1;
      } else if (payment.billingStatus === 'WAITING_TRANSFER') {
        result.waiting += amount;
        result.waitingCount += 1;
      } else if (payment.billingStatus === 'PAID') {
        result.paid += amount;
        result.paidCount += 1;
      } else if (payment.billingStatus === 'PENDING') {
        result.pending += amount;
        result.pendingCount += 1;
      }
    }
    return result;
  }, [payments]);

  async function createPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCompanyId) {
      setCreateError('กรุณาค้นหาและเลือกบริษัทจากรายการ');
      setCompanyResultsOpen(true);
      companyInputRef.current?.focus();
      return;
    }
    setSaving(true);
    setCreateError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch('/api/admin/tax-payments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, taxType, taxYear, taxMonth: config.monthly ? taxMonth : null }),
      }).then(readJson);
      if (res?.data) {
        setPayments((prev) => [res.data, ...prev]);
      }
      setCreateOpen(false);
      setNotice('บันทึกรายการชำระภาษีแล้ว');
      void loadData(true);
    } catch (saveError) {
      setCreateError(saveError instanceof Error ? saveError.message : 'บันทึกรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(payment: Payment, nextStatus: string) {
    if (nextStatus === 'PAID') {
      openPaidModalForSingle(payment);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await fetch(`/api/admin/tax-payments/${payment.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingStatus: nextStatus }),
      }).then(readJson);
      setPayments((items) => items.map((item) => item.id === payment.id ? { ...item, ...data.data } : item));
      setSelected((current) => current?.id === payment.id ? { ...current, ...data.data } : current);
      setNotice(`อัปเดตสถานะเป็น "${statusLabels[nextStatus] || nextStatus}" เรียบร้อยแล้ว`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'เปลี่ยนสถานะไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function createFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await fetch('/api/admin/follow-ups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), companyId: selected.company.id, taxPaymentId: selected.id }),
      }).then(readJson);
      setSelected(null);
      setNotice('บันทึกผลการติดตามแล้ว');
      void loadData(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'บันทึกการติดตามไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  function openEdit(payment: Payment) {
    setEditingPayment(payment);
    setEditTaxType(payment.taxType);
    setEditError('');
    setEditOpen(true);
  }

  async function handleUpdatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPayment) return;
    setSaving(true);
    setEditError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch(`/api/admin/tax-payments/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(readJson);

      if (res?.data) {
        const updated = res.data;
        const isCurrentTaxType = updated.taxType === taxType;
        const isCurrentYear = updated.taxYear === taxYear;
        const isCurrentMonth = !config.monthly || updated.taxMonth === taxMonth;

        if (!isCurrentTaxType || !isCurrentYear || !isCurrentMonth) {
          setPayments((prev) => prev.filter((item) => item.id !== editingPayment.id));
          if (updated.taxType !== editingPayment.taxType) {
            setNotice(`เปลี่ยนประเภทภาษีเป็น "${taxTypeDisplayMap[updated.taxType] || updated.taxType}" เรียบร้อยแล้ว (รายการถูกย้ายไปยังหมวดภาษีดังกล่าว)`);
          } else {
            setNotice('แก้ไขข้อมูลรายการชำระภาษีเรียบร้อยแล้ว');
          }
          if (selected?.id === editingPayment.id) setSelected(null);
        } else {
          setPayments((prev) => prev.map((item) => (item.id === editingPayment.id ? { ...item, ...updated } : item)));
          setSelected((curr) => (curr?.id === editingPayment.id ? { ...curr, ...updated } : curr));
          setNotice('แก้ไขข้อมูลรายการชำระภาษีเรียบร้อยแล้ว');
        }
      }
      setEditOpen(false);
      setEditingPayment(null);
      void loadData(true);
    } catch (saveError) {
      setEditError(saveError instanceof Error ? saveError.message : 'แก้ไขรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePayment(payment: Payment) {
    const confirmMsg = `คุณต้องการลบรายการชำระภาษีของ "${payment.company.name}" ยอดเงิน ${money(payment.amount)} หรือไม่?\n\n(หากมีประวัติการติดตาม ระบบจะลบประวัติที่เกี่ยวข้องไปด้วย)`;
    if (!confirm(confirmMsg)) return;

    setSaving(true);
    setError('');
    try {
      await fetch(`/api/admin/tax-payments/${payment.id}`, {
        method: 'DELETE',
      }).then(readJson);

      setPayments((prev) => prev.filter((item) => item.id !== payment.id));
      if (selected?.id === payment.id) setSelected(null);
      if (editOpen && editingPayment?.id === payment.id) {
        setEditOpen(false);
        setEditingPayment(null);
      }
      setNotice('ลบรายการชำระภาษีเรียบร้อยแล้ว');
      void loadData(true);
    } catch (delError) {
      setError(delError instanceof Error ? delError.message : 'ไม่สามารถลบรายการได้');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tax-workspace">
      <header className="tax-page-head">
        <div>
          <p>{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <span>{config.description}</span>
        </div>
        <div className="admin-page-actions">
          {canCreate && <button
            type="button"
            className="admin-secondary-button"
            onClick={handleOpenImport}
            style={{ minHeight: '38px', gap: '7px' }}
          >
            <Upload aria-hidden="true" size={17} color="#1689bd" /> นำเข้าข้อมูล CSV
          </button>}
          {canCreate && <button type="button" className="admin-primary-button" onClick={() => setCreateOpen(true)}>
            <FilePlus2 aria-hidden="true" size={18} /> บันทึกรายการ
          </button>}
        </div>
      </header>

      {config.types.length > 1 && (
        <div className="tax-type-switcher" role="tablist" aria-label="ประเภทแบบภาษี">
          {config.types.map((type) => (
            <button key={type.value} type="button" role="tab" aria-selected={taxType === type.value}
              className={taxType === type.value ? 'is-active' : ''} onClick={() => setTaxType(type.value)}>
              {type.label}
            </button>
          ))}
        </div>
      )}

      <section className="tax-summary" aria-label="สรุปยอด">
        <button type="button"
          className={`is-clickable ${status === '' ? 'is-active-total' : ''}`}
          onClick={() => setStatus('')}
          title="คลิกเพื่อแสดงทุกรายการ"
        >
          <span>ยอดในงวดทั้งหมด</span>
          <strong>{money(totals.total)}</strong>
          <small>{totals.totalCount} รายการ</small>
          <div className="kpi-indicator kpi-indicator--total" />
        </button>

        <button type="button"
          className={`is-clickable ${status === 'ADVANCED' ? 'is-active-advanced' : ''}`}
          onClick={() => setStatus(status === 'ADVANCED' ? '' : 'ADVANCED')}
          title="คลิกเพื่อกรองเฉพาะรายการสำรองจ่าย"
        >
          <span>สำรองจ่าย (สนง. จ่ายแทน)</span>
          <strong style={{ color: '#e11d48' }}>{money(totals.advanced)}</strong>
          <small>{totals.advancedCount} รายการ (ต้องตามเก็บ)</small>
          <div className="kpi-indicator kpi-indicator--advanced" />
        </button>

        <button type="button"
          className={`is-clickable ${status === 'WAITING_TRANSFER' ? 'is-active-waiting' : ''}`}
          onClick={() => setStatus(status === 'WAITING_TRANSFER' ? '' : 'WAITING_TRANSFER')}
          title="คลิกเพื่อกรองเฉพาะรายการรอโอน"
        >
          <span>รอโอน (ลูกค้ารอโอน)</span>
          <strong style={{ color: '#d97706' }}>{money(totals.waiting)}</strong>
          <small>{totals.waitingCount} รายการ</small>
          <div className="kpi-indicator kpi-indicator--waiting" />
        </button>

        <button type="button"
          className={`is-clickable ${status === 'PAID' ? 'is-active-paid' : ''}`}
          onClick={() => setStatus(status === 'PAID' ? '' : 'PAID')}
          title="คลิกเพื่อกรองเฉพาะรายการที่จ่ายแล้ว"
        >
          <span>จ่ายแล้ว (เคลียร์ยอดแล้ว)</span>
          <strong style={{ color: '#16a34a' }}>{money(totals.paid)}</strong>
          <small>{totals.paidCount} รายการ</small>
          <div className="kpi-indicator kpi-indicator--paid" />
        </button>
      </section>

      <section className="tax-ledger">
        <div className="tax-toolbar">
          <div className="tax-toolbar__period">
            <label><CalendarDays aria-hidden="true" size={16} /><span className="sr-only">ปีภาษี</span>
              <select value={taxYear} onChange={(event) => setTaxYear(event.target.value)}>
                {[0, 1, 2, 3].map((offset) => <option key={offset} value={currentGregorianYear + 543 - offset}>{currentGregorianYear + 543 - offset}</option>)}
              </select>
            </label>
            {config.monthly && <select aria-label="เดือนภาษี" value={taxMonth} onChange={(event) => setTaxMonth(event.target.value)}>
              {monthLabels.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>}
            <select aria-label="สถานะเรียกเก็บ" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">ทุกสถานะ</option>
              <option value="ADVANCED">สำรอง (สนง. จ่ายแทน)</option>
              <option value="WAITING_TRANSFER">รอโอน (ลูกค้ารอโอน)</option>
              <option value="PAID">จ่ายแล้ว (เคลียร์ยอดแล้ว)</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="UNBILLED">สำรอง (รอวางบิล - เดิม)</option>
              <option value="BILLED">สำรอง (วางบิลแล้ว - เดิม)</option>
            </select>
          </div>
          <form className="tax-search" onSubmit={(event) => { event.preventDefault(); setSearch(searchDraft.trim()); }}>
            <Search aria-hidden="true" size={17} />
            <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="ค้นหาบริษัทหรือเลขอ้างอิง" aria-label="ค้นหารายการ" />
            <button type="submit">ค้นหา</button>
          </form>
        </div>

        {error && <div className="admin-alert admin-alert--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{error}</div>}
        {notice && <div className="admin-alert admin-alert--success" role="status"><CheckCircle2 aria-hidden="true" size={18} />{notice}</div>}

        <div className="tax-table-wrap" aria-busy={loading}>
          <table className={`tax-table ${config.monthly ? 'has-monthly' : ''}`}>
            <colgroup>
              <col style={{ width: '40px' }} />
              <col />
              {config.monthly && <col style={{ width: '85px' }} />}
              <col style={{ width: '105px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '125px' }} />
              <col style={{ width: '190px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  {canEdit && <input
                    type="checkbox"
                    checked={selectedIds.size === payments.length && payments.length > 0}
                    onChange={() => {
                      if (selectedIds.size === payments.length) setSelectedIds(new Set());
                      else setSelectedIds(new Set(payments.map((p) => p.id)));
                    }}
                    aria-label="เลือกทั้งหมด"
                  />}
                </th>
                <th className="col-company">บริษัท</th>
                {config.monthly && <th className="col-period">งวด</th>}
                <th className="col-date">วันที่ชำระ</th>
                <th className="col-channel">ช่องทาง</th>
                <th className="col-amount">จำนวนเงิน</th>
                <th className="col-status">สถานะ</th>
                <th className="col-actions">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {!loading && payments.map((payment) => (
                <tr
                  key={payment.id}
                  className={`tax-table-row ${selectedIds.has(payment.id) ? 'is-selected' : ''}`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button, input, a, .tax-status-quick-select, .tax-actions-cell')) return;
                    setSelected(payment);
                  }}
                  title="คลิกที่แถวเพื่อเปิดดูรายละเอียด"
                >
                  <td style={{ textAlign: 'center' }}>
                    {canEdit && <input
                      type="checkbox"
                      checked={selectedIds.has(payment.id)}
                      onChange={() => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(payment.id)) next.delete(payment.id);
                          else next.add(payment.id);
                          return next;
                        });
                      }}
                      aria-label={`เลือก ${payment.company.name}`}
                    />}
                  </td>
                  <td className="col-company"><strong>{payment.company.name}</strong><small>{payment.referenceNo || 'ไม่มีเลขอ้างอิง'}</small></td>
                  {config.monthly && <td className="col-period">{monthLabels.find(([value]) => value === payment.taxMonth)?.[1] || payment.taxMonth}</td>}
                  <td className="col-date">{displayDate(payment.paymentDate)}</td>
                  <td className="col-channel">{payment.paymentMethod.name}</td>
                  <td className="col-amount"><strong>{money(payment.amount)}</strong></td>
                  <td className="col-status">
                    {canEdit ? <div className="tax-status-quick-select">
                      <button
                        type="button"
                        className={`tax-status-btn ${statusClassMap[payment.billingStatus] || 'tax-status--pending'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStatusPopoverId(activeStatusPopoverId === payment.id ? null : payment.id);
                        }}
                        title="คลิกเพื่อเปลี่ยนสถานะด่วน"
                        aria-haspopup="listbox"
                        aria-expanded={activeStatusPopoverId === payment.id}
                      >
                        <span>{statusLabels[payment.billingStatus] || payment.billingStatus}</span>
                        <ChevronDown size={11} aria-hidden="true" />
                      </button>
                      {activeStatusPopoverId === payment.id && (
                        <div className="tax-status-popover" role="listbox" aria-label="เปลี่ยนสถานะ">
                          {quickStatusOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="option"
                              aria-selected={payment.billingStatus === opt.value}
                              className={`tax-status-option ${opt.className} ${payment.billingStatus === opt.value ? 'is-selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveStatusPopoverId(null);
                                if (payment.billingStatus !== opt.value) {
                                  if (opt.value === 'PAID') {
                                    openPaidModalForSingle(payment);
                                  } else {
                                    void updateStatus(payment, opt.value);
                                  }
                                }
                              }}
                            >
                              <span>{opt.label}</span>
                              {payment.billingStatus === opt.value && <Check size={12} aria-hidden="true" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div> : <span className={`tax-status ${statusClassMap[payment.billingStatus] || 'tax-status--pending'}`}>
                      {statusLabels[payment.billingStatus] || payment.billingStatus}
                    </span>}
                  </td>
                  <td className="col-actions">
                    <div className="tax-actions-cell" onClick={(e) => e.stopPropagation()}>
                      {payment.slipUrl && (
                        <button
                          type="button"
                          className="slip-badge-btn"
                          onClick={() => setSlipViewerData({ url: payment.slipUrl!, title: payment.company.name, ref: payment.reimbursementRef || payment.referenceNo })}
                          title="คลิกเพื่อดูหลักฐานสลิปการโอนเงิน"
                        >
                          <FileText size={13} />
                          <span>สลิป</span>
                        </button>
                      )}
                      {payment.billingStatus !== 'PAID' && (
                        <button
                          type="button"
                          className="btn-mark-paid"
                          onClick={() => openPaidModalForSingle(payment)}
                          title="บันทึกการรับเงินคืนและแนบสลิป"
                        >
                          <Check size={13} />
                          <span>รับเงิน</span>
                        </button>
                      )}
                      {canEdit && <button
                        type="button"
                        className="admin-action-btn admin-action-btn--icon admin-action-btn--view"
                        onClick={() => setSelected(payment)}
                        title="ดูรายละเอียดรายการ"
                        aria-label="ดูรายละเอียดรายการ"
                      >
                        <Eye size={15} aria-hidden="true" />
                      </button>}
                      {canDelete && <button
                        type="button"
                        className="admin-action-btn admin-action-btn--icon admin-action-btn--edit"
                        onClick={() => openEdit(payment)}
                        title="แก้ไขข้อมูล / วันที่ชำระ"
                        aria-label="แก้ไขข้อมูล / วันที่ชำระ"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>}
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--icon admin-action-btn--delete"
                        onClick={() => handleDeletePayment(payment)}
                        title="ลบรายการ"
                        aria-label="ลบรายการ"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="tax-state"><span className="admin-spinner admin-spinner--dark" />กำลังโหลดรายการ…</div>}
          {!loading && payments.length === 0 && (
            <div className="tax-state"><ReceiptText aria-hidden="true" size={30} /><strong>ยังไม่มีรายการในงวดนี้</strong><span>{canCreate ? 'เริ่มต้นด้วยการบันทึกรายการชำระภาษี' : 'ลองเปลี่ยนงวดหรือตัวกรองเพื่อค้นหารายการ'}</span>{canCreate && <button type="button" onClick={() => setCreateOpen(true)}>บันทึกรายการแรก</button>}</div>
          )}
        </div>
      </section>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-floating-bar" role="toolbar" aria-label="แถบการจัดการหลายรายการ">
          <div className="bulk-actions__info">
            <span className="bulk-actions__count">{selectedSummary.count} รายการ</span>
            <span>ยอดรวม:</span>
            <strong className="bulk-actions__amount">{money(selectedSummary.totalAmount)}</strong>
          </div>

          <div className="bulk-actions__buttons">
            <button
              type="button"
              className="bulk-btn bulk-btn--billed"
              disabled={bulkUpdating}
              onClick={() => handleBulkStatus('BILLED')}
            >
              <Clock size={14} /> วางบิลแล้ว
            </button>
            <button
              type="button"
              className="bulk-btn bulk-btn--paid"
              disabled={bulkUpdating}
              onClick={openPaidModalForBulk}
            >
              <Check size={14} /> เคลียร์ยอดแล้ว (PAID) / แนบสลิป
            </button>
            <button
              type="button"
              className="bulk-btn bulk-btn--clear"
              onClick={() => setSelectedIds(new Set())}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {createOpen && canCreate && (
        <div className="admin-dialog-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}>
          <section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="create-payment-title">
            <header><div><p>รายการใหม่</p><h2 id="create-payment-title">บันทึกการชำระภาษี</h2></div><button type="button" className="admin-icon-button" onClick={() => setCreateOpen(false)} aria-label="ปิด"><X aria-hidden="true" size={20} /></button></header>
            <form onSubmit={createPayment}>
              <div className="admin-form-grid">
                <div className="admin-field admin-field--wide">
                  <label htmlFor="payment-company">บริษัท</label>
                  <div
                    className="company-combobox"
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCompanyResultsOpen(false);
                    }}
                  >
                    <div className="company-combobox__input">
                      <Search aria-hidden="true" size={17} />
                      <input
                        ref={companyInputRef}
                        id="payment-company"
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={companyResultsOpen}
                        aria-controls="company-search-results"
                        aria-activedescendant={companyResultsOpen && filteredCompanies[activeCompanyIndex] ? `company-option-${filteredCompanies[activeCompanyIndex].id}` : undefined}
                        value={companyQuery}
                        onFocus={() => setCompanyResultsOpen(true)}
                        onChange={(event) => {
                          setCompanyQuery(event.target.value);
                          setSelectedCompanyId(null);
                          setCompanyResultsOpen(true);
                        }}
                        onKeyDown={handleCompanyKeyDown}
                        placeholder="พิมพ์ชื่อบริษัทหรือเลขผู้เสียภาษี"
                        autoComplete="off"
                        required
                      />
                      {selectedCompanyId && <Check aria-hidden="true" size={18} className="company-combobox__selected" />}
                    </div>
                    <input type="hidden" name="companyId" value={selectedCompanyId || ''} />
                    {companyResultsOpen && (
                      <div className="company-combobox__popover">
                        {filteredCompanies.length > 0 ? (
                          <ul id="company-search-results" role="listbox" aria-label="ผลการค้นหาบริษัท">
                            {filteredCompanies.map((company, index) => (
                              <li
                                id={`company-option-${company.id}`}
                                key={company.id}
                                role="option"
                                aria-selected={selectedCompanyId === company.id}
                                className={index === activeCompanyIndex ? 'is-active' : ''}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseEnter={() => setActiveCompanyIndex(index)}
                                onClick={() => selectCompany(company)}
                              >
                                <Building2 aria-hidden="true" size={17} />
                                <span><strong>{company.name}</strong><small>{company.taxId ? `เลขผู้เสียภาษี ${company.taxId}` : 'ยังไม่ได้ระบุเลขผู้เสียภาษี'}</small></span>
                                {selectedCompanyId === company.id && <Check aria-hidden="true" size={17} />}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="company-combobox__empty">
                            <strong>ไม่พบบริษัทที่ค้นหา</strong>
                            <span>ตรวจสอบคำค้น หรือเพิ่มบริษัทในทะเบียนลูกค้า</span>
                          </div>
                        )}
                        <a href="/admin/companies" className="company-combobox__add"><Plus aria-hidden="true" size={16} /> เพิ่มบริษัทใหม่</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-field"><label htmlFor="payment-method">ช่องทางชำระ</label><select id="payment-method" name="paymentMethodId" required defaultValue=""><option value="" disabled>เลือกช่องทาง</option>{methods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}</select></div>
                <div className="admin-field">
                  <label htmlFor="payment-status">สถานะ</label>
                  <select id="payment-status" name="billingStatus" defaultValue="ADVANCED">
                    <option value="ADVANCED">สำรอง (สนง. จ่ายแทน)</option>
                    <option value="WAITING_TRANSFER">รอโอน (ลูกค้ารอโอน)</option>
                    <option value="PAID">จ่ายแล้ว (เคลียร์ยอดแล้ว)</option>
                    <option value="PENDING">รอดำเนินการ</option>
                  </select>
                </div>
                <div className="admin-field"><label htmlFor="payment-date">วันที่ชำระ</label><input id="payment-date" name="paymentDate" type="date" required defaultValue={bangkokDate()} /></div>
                <div className="admin-field"><label htmlFor="payment-amount">จำนวนเงิน</label><input id="payment-amount" name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" required placeholder="0.00" /></div>
                <div className="admin-field"><label htmlFor="payment-reference">เลขอ้างอิง</label><input id="payment-reference" name="referenceNo" maxLength={100} placeholder="เลขสลิปหรือเลขรายการ" /></div>
                <div className="admin-field admin-field--wide"><label htmlFor="payment-note">หมายเหตุ</label><textarea id="payment-note" name="note" rows={3} maxLength={2000} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" /></div>
              </div>
              {createError && <div className="admin-alert admin-alert--error" role="alert"><AlertCircle aria-hidden="true" size={18} />{createError}</div>}
              <footer><button type="button" className="admin-secondary-button" onClick={() => setCreateOpen(false)}>ยกเลิก</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึกรายการ'}</button></footer>
            </form>
          </section>
        </div>
      )}

      {editOpen && editingPayment && canEdit && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditOpen(false);
          }}
        >
          <section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-payment-title">
            <header>
              <div>
                <p>แก้ไขข้อมูลรายการชำระภาษี</p>
                <h2 id="edit-payment-title">{editingPayment.company.name}</h2>
              </div>
              <button type="button" className="admin-icon-button" onClick={() => setEditOpen(false)} aria-label="ปิด">
                <X aria-hidden="true" size={20} />
              </button>
            </header>
            <form onSubmit={handleUpdatePayment}>
              <div className="admin-form-grid">
                <div className="admin-field admin-field--wide">
                  <label htmlFor="edit-tax-type">
                    ประเภทภาษี <span style={{ color: 'var(--dtv-blue-600, #1689bd)', fontWeight: 'normal', fontSize: '12px' }}>(สามารถปรับเปลี่ยนเป็น ภ.ง.ด. 1, 3, 53 หรือ ภ.พ. 30 หากบันทึกผิดประเภท)</span>
                  </label>
                  <select
                    id="edit-tax-type"
                    name="taxType"
                    value={editTaxType}
                    onChange={(e) => setEditTaxType(e.target.value)}
                    required
                  >
                    <option value="VAT_PP30">ภ.พ. 30 (ภาษีมูลค่าเพิ่ม)</option>
                    <option value="WHT_PND1">ภ.ง.ด. 1 (ภาษีหัก ณ ที่จ่าย)</option>
                    <option value="WHT_PND3">ภ.ง.ด. 3 (ภาษีหัก ณ ที่จ่าย)</option>
                    <option value="WHT_PND53">ภ.ง.ด. 53 (ภาษีหัก ณ ที่จ่าย)</option>
                    <option value="PND51">ภ.ง.ด. 51 (ภาษีเงินได้นิติบุคคลครึ่งปี)</option>
                  </select>
                </div>
                {editTaxType !== 'PND51' ? (
                  <div className="admin-field">
                    <label htmlFor="edit-tax-month">เดือนภาษี (งวด)</label>
                    <select
                      id="edit-tax-month"
                      name="taxMonth"
                      defaultValue={editingPayment.taxMonth || taxMonth}
                      required
                    >
                      {monthLabels.map(([val, label]) => (
                        <option key={val} value={val}>
                          {val} - {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input type="hidden" name="taxMonth" value="" />
                )}
                <div className={editTaxType === 'PND51' ? 'admin-field admin-field--wide' : 'admin-field'}>
                  <label htmlFor="edit-tax-year">ปีภาษี (พ.ศ.)</label>
                  <input
                    id="edit-tax-year"
                    name="taxYear"
                    type="text"
                    defaultValue={editingPayment.taxYear || taxYear}
                    maxLength={4}
                    pattern="^(?:25|26)\d{2}$"
                    placeholder="เช่น 2569"
                    required
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="edit-payment-date">วันที่ชำระ (สามารถเปลี่ยนวันได้)</label>
                  <input
                    id="edit-payment-date"
                    name="paymentDate"
                    type="date"
                    required
                    defaultValue={typeof editingPayment.paymentDate === 'string' ? editingPayment.paymentDate.split('T')[0] : ''}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="edit-payment-amount">จำนวนเงิน (บาท)</label>
                  <input
                    id="edit-payment-amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    required
                    defaultValue={editingPayment.amount}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="edit-payment-method">ช่องทางชำระ</label>
                  <select id="edit-payment-method" name="paymentMethodId" required defaultValue={editingPayment.paymentMethod.id}>
                    {methods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label htmlFor="edit-billing-status">สถานะ</label>
                  <select id="edit-billing-status" name="billingStatus" required defaultValue={editingPayment.billingStatus}>
                    <option value="ADVANCED">สำรอง (สนง. จ่ายแทน)</option>
                    <option value="WAITING_TRANSFER">รอโอน (ลูกค้ารอโอน)</option>
                    <option value="PAID">จ่ายแล้ว (เคลียร์ยอดแล้ว)</option>
                    <option value="PENDING">รอดำเนินการ</option>
                    <option value="UNBILLED">สำรอง (รอวางบิล - เดิม)</option>
                    <option value="BILLED">สำรอง (วางบิลแล้ว - เดิม)</option>
                  </select>
                </div>
                <div className="admin-field admin-field--wide">
                  <label htmlFor="edit-payment-reference">เลขอ้างอิง / สลิป</label>
                  <input
                    id="edit-payment-reference"
                    name="referenceNo"
                    maxLength={100}
                    defaultValue={editingPayment.referenceNo || ''}
                    placeholder="เลขสลิปหรือเลขรายการ"
                  />
                </div>
                <div className="admin-field admin-field--wide">
                  <label htmlFor="edit-payment-note">หมายเหตุ</label>
                  <textarea
                    id="edit-payment-note"
                    name="note"
                    rows={3}
                    maxLength={2000}
                    defaultValue={editingPayment.note || ''}
                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                  />
                </div>
              </div>
              {editError && (
                <div className="admin-alert admin-alert--error" role="alert">
                  <AlertCircle aria-hidden="true" size={18} />
                  {editError}
                </div>
              )}
              <footer className="admin-dialog-footer--split">
                <button
                  type="button"
                  className="admin-button--danger-outline"
                  onClick={() => handleDeletePayment(editingPayment)}
                >
                  <Trash2 aria-hidden="true" size={16} />
                  <span>ลบรายการนี้</span>
                </button>
                <div className="admin-dialog-footer-actions">
                  <button type="button" className="admin-secondary-button" onClick={() => setEditOpen(false)}>
                    ยกเลิก
                  </button>
                  <button type="submit" className="admin-primary-button" disabled={saving}>
                    {saving ? 'กำลังบันทึก…' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </footer>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div className="admin-drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <aside className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title">
            <header>
              <div>
                <p>{config.types.find((type) => type.value === selected.taxType)?.label || config.title}</p>
                <h2 id="payment-detail-title">{selected.company.name}</h2>
              </div>
              <div className="admin-drawer__header-actions">
                {canEdit && <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => openEdit(selected)}
                  title="แก้ไขข้อมูล / วันที่ชำระ"
                  aria-label="แก้ไขข้อมูลรายการ"
                >
                  <Pencil aria-hidden="true" size={17} />
                </button>}
                {canDelete && <button
                  type="button"
                  className="admin-icon-button admin-icon-button--danger"
                  onClick={() => handleDeletePayment(selected)}
                  title="ลบรายการนี้"
                  aria-label="ลบรายการนี้"
                >
                  <Trash2 aria-hidden="true" size={17} />
                </button>}
                <button type="button" className="admin-icon-button" onClick={() => setSelected(null)} aria-label="ปิด">
                  <X aria-hidden="true" size={20} />
                </button>
              </div>
            </header>
            <div className="admin-drawer__body">
              {(canEdit || canDelete) && <div className="tax-drawer-action-strip">
                {canEdit && <button
                  type="button"
                  className="admin-drawer-btn admin-drawer-btn--edit"
                  onClick={() => openEdit(selected)}
                >
                  <Pencil size={15} aria-hidden="true" />
                  <span>แก้ไขข้อมูล / วันที่ชำระ</span>
                </button>}
                {canDelete && <button
                  type="button"
                  className="admin-drawer-btn admin-drawer-btn--danger"
                  onClick={() => handleDeletePayment(selected)}
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>ลบรายการนี้</span>
                </button>}
              </div>}
              <dl className="tax-detail-list">
                <div><dt>จำนวนเงิน</dt><dd>{money(selected.amount)}</dd></div>
                <div><dt>วันที่ชำระ</dt><dd>{displayDate(selected.paymentDate)}</dd></div>
                <div><dt>ช่องทาง</dt><dd>{selected.paymentMethod.name}</dd></div>
                <div><dt>เลขอ้างอิง</dt><dd>{selected.referenceNo || '—'}</dd></div>
                {selected.reimbursedAt && (
                  <div><dt>วันที่รับเงินคืน</dt><dd>{displayDate(selected.reimbursedAt)}</dd></div>
                )}
                {selected.reimbursementRef && (
                  <div><dt>อ้างอิงรับเงิน</dt><dd>{selected.reimbursementRef}</dd></div>
                )}
              </dl>
              <section className="admin-drawer__section">
                <div className="drawer-status-header">
                  <h3><WalletCards aria-hidden="true" size={18} /> สถานะเรียกเก็บ / ดำเนินการ</h3>
                  {canEdit && <span className="drawer-status-hint">บันทึกอัตโนมัติเมื่อเลือก</span>}
                </div>
                {canEdit ? <div className="tax-status-actions">
                  {[
                    { value: 'ADVANCED', label: 'สำรอง', cls: 'is-advanced' },
                    { value: 'WAITING_TRANSFER', label: 'รอโอน', cls: 'is-waiting' },
                    { value: 'PAID', label: 'จ่ายแล้ว', cls: 'is-paid' },
                    { value: 'PENDING', label: 'รอดำเนินการ', cls: 'is-pending' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={saving}
                      className={`${selected.billingStatus === item.value ? `is-active ${item.cls}` : ''}`}
                      onClick={() => {
                        if (item.value === 'PAID') {
                          openPaidModalForSingle(selected);
                        } else {
                          void updateStatus(selected, item.value);
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div> : <div className="admin-readonly-note">สิทธิ์ของคุณดูสถานะได้อย่างเดียว</div>}

                {canEdit && <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selected.slipUrl ? (
                    <div className="slip-preview-card" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} style={{ color: 'var(--dtv-primary)' }} />
                        <div>
                          <strong style={{ fontSize: '12px', display: 'block' }}>มีหลักฐานสลิปการโอนเงิน</strong>
                          {selected.reimbursementRef && (
                            <small style={{ color: '#64748b', fontSize: '11px' }}>
                              เลขที่อ้างอิง: {selected.reimbursementRef}
                            </small>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="slip-badge-btn"
                        onClick={() => setSlipViewerData({ url: selected.slipUrl!, title: selected.company.name, ref: selected.reimbursementRef || selected.referenceNo })}
                      >
                        <Eye size={12} /> ดูสลิป
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      style={{ width: '100%', justifyContent: 'center', gap: '6px', minHeight: '36px' }}
                      onClick={() => openPaidModalForSingle(selected)}
                    >
                      <Check size={14} /> บันทึกการรับเงินคืน (PAID) / แนบสลิป
                    </button>
                  )}
                </div>}
              </section>

              {canCreateFollowUp && <section className="admin-drawer__section">
                <h3><PhoneCall aria-hidden="true" size={18} /> บันทึกผลการติดตามลูกค้า (โทร / LINE)</h3>
                <form onSubmit={createFollowUp} className="admin-followup-form">
                  <div className="admin-form-grid">
                    <div className="admin-field"><label htmlFor="follow-channel">ช่องทาง</label><select ref={followUpFirstFieldRef} id="follow-channel" name="channel" defaultValue="PHONE"><option value="PHONE">โทรศัพท์</option><option value="LINE">LINE</option><option value="EMAIL">อีเมล</option><option value="IN_PERSON">เข้าพบ</option><option value="OTHER">อื่น ๆ</option></select></div>
                    <div className="admin-field"><label htmlFor="follow-result">ผลการติดตาม</label><select id="follow-result" name="result" defaultValue="PROMISED"><option value="PROMISED">นัดชำระ</option><option value="NO_ANSWER">ติดต่อไม่ได้</option><option value="REJECTED">ขอข้อมูลเพิ่ม/มีปัญหา</option><option value="PAID">แจ้งว่าชำระแล้ว</option></select></div>
                    <div className="admin-field admin-field--wide"><label htmlFor="follow-date">วันที่นัดชำระ (ถ้ามี)</label><input id="follow-date" name="promisedDate" type="date" /></div>
                    <div className="admin-field admin-field--wide">
                      <label htmlFor="follow-notes">รายละเอียดการพูดคุย (ถ้ามี)</label>
                      <textarea id="follow-notes" name="notes" rows={3} maxLength={2000} placeholder="เช่น โทรแจ้งยอดแล้ว ลูกค้าแจ้งจะโอนเงินช่วงบ่าย" />
                    </div>
                  </div>
                  <button type="submit" className="admin-primary-button" disabled={saving}>
                    {saving ? 'กำลังบันทึก…' : 'บันทึกประวัติการติดตาม'}
                  </button>
                </form>
              </section>}

              <div className="drawer-close-footer">
                <button type="button" className="admin-secondary-button" onClick={() => setSelected(null)}>
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* CSV Import Modal */}
      {importOpen && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !importing) setImportOpen(false);
          }}
        >
          <section
            className="admin-dialog admin-dialog--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-tax-title"
          >
            <header>
              <div>
                <p>นำเข้าข้อมูลภาษีจาก CSV</p>
                <h2 id="import-tax-title">
                  {taxTypeDisplayMap[taxType] || taxType} • ปี {taxYear}
                  {config.monthly ? ` (เดือน ${monthLabels.find(([m]) => m === taxMonth)?.[1] || taxMonth})` : ''}
                </h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setImportOpen(false)}
                disabled={importing}
                aria-label="ปิด"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </header>

            <div className="tax-import-steps">
              {importError && (
                <div className="admin-alert admin-alert--error" role="status">
                  <AlertCircle aria-hidden="true" size={18} />
                  <span>{importError}</span>
                </div>
              )}

              {/* Step 1: Template Download Bar */}
              <div className="tax-import-template-box">
                <div className="tax-import-template-box__info">
                  <strong>ขั้นตอนที่ 1: เตรียมไฟล์ข้อมูลภาษี</strong>
                  <span>ดาวน์โหลดเทมเพลต CSV แล้วกรอกยอดเงินภาษี วันที่ชำระ และช่องทางชำระ</span>
                </div>
                <div className="tax-import-template-box__actions">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate(true)}
                    className="admin-secondary-button"
                    style={{ minHeight: '34px', fontSize: '12px', gap: '6px' }}
                  >
                    <Download size={14} color="#1689bd" />
                    <span>ดาวน์โหลดเทมเพลต (พร้อมรายชื่อลูกค้าในระบบ)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate(false)}
                    className="admin-secondary-button"
                    style={{ minHeight: '34px', fontSize: '12px', gap: '6px' }}
                  >
                    <FileSpreadsheet size={14} color="#64748b" />
                    <span>เทมเพลตเปล่า</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Batch Defaults */}
              <div className="tax-import-defaults-box">
                <div className="tax-import-defaults-box__title">
                  <WalletCards size={16} color="#1689bd" />
                  <span>ขั้นตอนที่ 2: กำหนดค่าตั้งต้นส่วนกลาง (ใช้กรณีในไฟล์ CSV แถวใดเว้นว่างไว้)</span>
                </div>
                <div className="tax-import-defaults-grid">
                  <label>
                    <span>วันที่ชำระเริ่มต้น</span>
                    <input
                      type="date"
                      value={batchDefaults.paymentDate}
                      onChange={(e) =>
                        setBatchDefaults((prev) => ({ ...prev, paymentDate: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>ช่องทางชำระเริ่มต้น</span>
                    <select
                      value={batchDefaults.paymentMethodId}
                      onChange={(e) =>
                        setBatchDefaults((prev) => ({ ...prev, paymentMethodId: Number(e.target.value) }))
                      }
                    >
                      {methods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.cardLastDigits ? `(*${m.cardLastDigits})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>สถานะเรียกเก็บเริ่มต้น</span>
                    <select
                      value={batchDefaults.billingStatus}
                      onChange={(e) =>
                        setBatchDefaults((prev) => ({ ...prev, billingStatus: e.target.value }))
                      }
                    >
                      {quickStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Step 3: Upload or Preview */}
              {importRows.length === 0 ? (
                <div>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <div
                    className="tax-import-upload-zone"
                    onClick={() => importFileInputRef.current?.click()}
                  >
                    <Upload size={32} />
                    <strong style={{ fontSize: '14px', color: 'var(--dtv-navy-900)', marginBottom: '4px' }}>
                      คลิกเพื่อเลือกไฟล์ CSV หรือลากไฟล์มาวางที่นี่
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--dtv-muted)' }}>
                      รองรับไฟล์ .csv (การเข้ารหัสภาษาไทย UTF-8)
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {/* Stats bar */}
                  <div className="tax-import-stats-bar">
                    <div className="tax-import-stats-badges">
                      <span className="tax-import-stat-pill tax-import-stat-pill--total">
                        ทั้งหมด {importStats.totalRows} แถว
                      </span>
                      <span className="tax-import-stat-pill tax-import-stat-pill--matched">
                        พร้อมนำเข้า {importStats.validCount} รายการ
                      </span>
                      {importStats.unmatchedCount > 0 && (
                        <span className="tax-import-stat-pill tax-import-stat-pill--unmatched">
                          ต้องเลือกบริษัท {importStats.unmatchedCount} รายการ
                        </span>
                      )}
                      {importStats.duplicateCount > 0 && (
                        <span className="tax-import-stat-pill tax-import-stat-pill--duplicate">
                          มีรายการเดิมในงวดนี้ {importStats.duplicateCount} รายการ
                        </span>
                      )}
                      {importStats.zeroCount > 0 && (
                        <span className="tax-import-stat-pill tax-import-stat-pill--skipped">
                          ข้ามแถวยอด 0 หรือว่าง {importStats.zeroCount} แถว
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label className="tax-import-strategy-toggle">
                        <span>เมื่อพบรายการเดิม:</span>
                        <select
                          value={duplicateStrategy}
                          onChange={(e) => setDuplicateStrategy(e.target.value as 'OVERWRITE' | 'SKIP')}
                        >
                          <option value="OVERWRITE">อัปเดตทับข้อมูลเดิม</option>
                          <option value="SKIP">ข้ามรายการเดิม</option>
                        </select>
                      </label>

                      <input
                        ref={importFileInputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        className="admin-secondary-button"
                        style={{ minHeight: '30px', fontSize: '11px' }}
                        onClick={() => importFileInputRef.current?.click()}
                      >
                        เลือกไฟล์ใหม่
                      </button>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="tax-import-preview-table-wrap">
                    <table className="tax-import-preview-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '22%' }}>ข้อมูลบริษัทจาก CSV</th>
                          <th style={{ width: '28%' }}>จับคู่กับทะเบียนลูกค้าในระบบ</th>
                          <th style={{ width: '13%', textAlign: 'right' }}>ยอดเงินภาษี</th>
                          <th style={{ width: '12%' }}>วันที่ชำระ</th>
                          <th style={{ width: '13%' }}>ช่องทางชำระ</th>
                          <th style={{ width: '12%' }}>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.map((row, idx) => {
                          if (row.isZero) {
                            return (
                              <tr key={row.id} style={{ opacity: 0.5, background: '#f8fafc' }}>
                                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                <td>
                                  <div>{row.rawCompanyName || '(ไม่ระบุชื่อ)'}</div>
                                  <small style={{ color: '#8a98a7' }}>{row.rawTaxId || '-'}</small>
                                </td>
                                <td>
                                  <span style={{ color: '#8a98a7', fontSize: '11px' }}>
                                    ข้าม (ยอดเงินว่างหรือ 0.00 บาท)
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                  0.00
                                </td>
                                <td>{row.paymentDate}</td>
                                <td>-</td>
                                <td>-</td>
                              </tr>
                            );
                          }

                          return (
                            <tr
                              key={row.id}
                              className={`${!row.companyId ? 'is-unmatched' : ''} ${row.isDuplicate ? 'is-duplicate' : ''}`}
                            >
                              <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                              <td>
                                <strong>{row.rawCompanyName || '(ไม่ระบุชื่อ)'}</strong>
                                {row.rawTaxId && (
                                  <small style={{ color: '#64748b' }}>เลข 13 หลัก: {row.rawTaxId}</small>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'grid', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {row.companyId ? (
                                      <>
                                        <span
                                          className={`match-badge ${row.matchType === 'MANUAL' ? 'match-badge--matched' : 'match-badge--matched'}`}
                                        >
                                          <Check size={11} /> {row.matchType === 'TAX_ID' ? 'ตรงเลข 13 หลัก' : row.matchType === 'NAME' ? 'ตรงชื่อบริษัท' : 'เลือกด้วยตนเอง'}
                                        </span>
                                        {row.isDuplicate && (
                                          <span className="match-badge match-badge--duplicate">
                                            {duplicateStrategy === 'OVERWRITE' ? 'จะอัปเดตทับ' : 'จะข้ามรายการ'}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="match-badge match-badge--unmatched">
                                        <AlertCircle size={11} /> ไม่พบบริษัทในระบบ
                                      </span>
                                    )}
                                  </div>

                                  <select
                                    value={row.companyId || ''}
                                    onChange={(e) => handleSelectRowCompany(row.id, Number(e.target.value))}
                                  >
                                    <option value="">-- คลิกเพื่อเลือกบริษัทในระบบ --</option>
                                    {companies.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name} {c.taxId ? `(${c.taxId})` : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                {money(row.amount)}
                              </td>
                              <td>{displayDate(row.paymentDate)}</td>
                              <td>
                                {methods.find((m) => m.id === row.paymentMethodId)?.name || 'ค่าตั้งต้น'}
                              </td>
                              <td>
                                <span className={`tax-status-pill ${statusClassMap[row.billingStatus] || ''}`}>
                                  {statusLabels[row.billingStatus] || row.billingStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Submit */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--dtv-line)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--dtv-muted)' }}>ยอดรวมที่จะนำเข้า: </span>
                      <strong style={{ fontSize: '16px', color: 'var(--dtv-navy-900)' }}>
                        {money(importStats.totalAmount)}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--dtv-muted)', marginLeft: '6px' }}>
                        ({importStats.validCount} รายการ)
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => setImportOpen(false)}
                        disabled={importing}
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        className="admin-primary-button"
                        onClick={handleConfirmImport}
                        disabled={importing || importStats.validCount === 0 || importStats.unmatchedCount > 0}
                      >
                        {importing
                          ? 'กำลังนำเข้าข้อมูล…'
                          : `ยืนยันนำเข้าข้อมูล (${importStats.validCount} รายการ)`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      {/* Modal: Mark as PAID & Attach Slip */}
      {paidModalOpen && paidTarget && (
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
                    <label htmlFor="tax-paid-date-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                      วันที่รับเงินคืน *
                    </label>
                    <input
                      id="tax-paid-date-input"
                      type="date"
                      className="admin-input"
                      value={paidDate}
                      onChange={(e) => setPaidDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="tax-paid-ref-input" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                      เลขที่สลิป / อ้างอิง
                    </label>
                    <input
                      id="tax-paid-ref-input"
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
                  ) : slipFile || slipPreviewUrl ? (
                    <div className="slip-preview-card" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {slipPreviewUrl && !slipPreviewUrl.toLowerCase().endsWith('.pdf') ? (
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
                            {slipFile ? slipFile.name : 'สลิปเดิมที่แนบไว้'}
                          </strong>
                          <small style={{ color: slipFile ? '#64748b' : '#16a34a', fontSize: '12.5px' }}>
                            {slipFile ? `ขนาดไฟล์: ${(slipFile.size / 1024).toFixed(0)} KB` : '✓ มีหลักฐานในระบบแล้ว (คลิก X เพื่อเปลี่ยน)'}
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
                      <UploadCloud size={32} style={{ color: 'var(--dtv-primary)', marginBottom: '4px' }} />
                      <strong style={{ fontSize: '14px', color: 'var(--dtv-navy-900)' }}>
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                      </strong>
                      <span style={{ fontSize: '13px', color: '#475569' }}>
                        รองรับไฟล์ JPG, PNG, WEBP หรือ PDF (ขนาดไม่เกิน 15 MB)
                      </span>
                      <small style={{ fontSize: '12px', color: '#16a34a', marginTop: '2px' }}>
                        ⚡ ระบบจะบีบอัดรูปภาพให้อัตโนมัติ เพื่อความเร็วในการดาวน์โหลด
                      </small>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) void handleFileSelect(e.target.files[0]);
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--dtv-line)' }}>
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => !paidSubmitting && setPaidModalOpen(false)}
                  disabled={paidSubmitting}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={paidSubmitting}
                  style={{ minWidth: '160px' }}
                >
                  {paidSubmitting ? (
                    <>
                      <span className="admin-spinner" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> ยืนยันบันทึกยอดชำระแล้ว
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
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSlipViewerData(null);
          }}
        >
          <section className="admin-dialog" role="dialog" aria-modal="true" style={{ width: 'min(700px, 95vw)', padding: 0 }}>
            <header style={{ padding: '16px 20px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--dtv-blue-600)', fontWeight: 600 }}>
                  หลักฐานการโอนเงิน (สลิป/ใบเสร็จ)
                </p>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--dtv-navy-900)' }}>
                  {slipViewerData.title}
                </h3>
                {slipViewerData.ref && (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    เลขอ้างอิง: {slipViewerData.ref}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setSlipViewerData(null)}
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </header>

            <div className="slip-viewer-content">
              {slipViewerData.url.toLowerCase().endsWith('.pdf') ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <FileText size={48} style={{ color: 'var(--dtv-primary)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#334155', marginBottom: '16px' }}>
                    ไฟล์หลักฐานนี้เป็นเอกสาร PDF
                  </p>
                  <a
                    href={slipViewerData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-primary-button"
                    style={{ textDecoration: 'none' }}
                  >
                    <ExternalLink size={16} /> เปิดดูไฟล์ PDF ในแท็บใหม่
                  </a>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slipViewerData.url}
                  alt={`สลิป ${slipViewerData.title}`}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--dtv-line)', background: '#f8fafc' }}>
              <a
                href={slipViewerData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-text-button"
                style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <ExternalLink size={14} /> เปิดไฟล์ต้นฉบับ
              </a>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setSlipViewerData(null)}
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
