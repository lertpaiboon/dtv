'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Upload,
  Download,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

interface ContactPerson {
  id?: number;
  name: string;
  roleTitle?: string;
  phone?: string;
  email?: string;
  lineId?: string;
  isPrimary?: boolean;
}

interface CompanyItem {
  id: number;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  contacts: ContactPerson[];
  _count: {
    taxPayments: number;
    followUpLogs: number;
  };
}

export default function CompaniesPage() {
  const { can } = useAdminSession();
  const canCreate = can('companies:create');
  const canEdit = can('companies:edit');
  const canDelete = can('companies:delete');
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlReady, setUrlReady] = useState(false);

  // Add/Edit Company Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContacts, setFormContacts] = useState<ContactPerson[]>([
    { name: '', roleTitle: 'ฝ่ายการเงิน', phone: '', email: '', isPrimary: true },
  ]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const loadCompanies = async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/admin/companies');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'ไม่สามารถโหลดข้อมูลบริษัทได้');
      setCompanies(data.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setLoadError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลบริษัทได้');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPage = Number(params.get('page'));
    const requestedSize = Number(params.get('size'));
    setSearchQuery(params.get('q') || '');
    if (Number.isInteger(requestedPage) && requestedPage > 0) setCurrentPage(requestedPage);
    if ([10, 25, 50].includes(requestedSize)) setPageSize(requestedSize);
    setUrlReady(true);
    void loadCompanies();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.taxId?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const totalItems = filteredCompanies.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedCompanies = useMemo(() => {
    return filteredCompanies.slice(startIndex, endIndex);
  }, [filteredCompanies, startIndex, endIndex]);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    if (searchQuery) url.searchParams.set('q', searchQuery);
    else url.searchParams.delete('q');
    if (safeCurrentPage > 1) url.searchParams.set('page', String(safeCurrentPage));
    else url.searchParams.delete('page');
    if (pageSize !== 10) url.searchParams.set('size', String(pageSize));
    else url.searchParams.delete('size');
    window.history.replaceState(null, '', url);
  }, [pageSize, safeCurrentPage, searchQuery, urlReady]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditId(null);
    setFormName('');
    setFormTaxId('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormContacts([
      { name: '', roleTitle: 'ฝ่ายการเงิน', phone: '', email: '', isPrimary: true },
    ]);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (comp: CompanyItem) => {
    setEditId(comp.id);
    setFormName(comp.name);
    setFormTaxId(comp.taxId || '');
    setFormEmail(comp.email || '');
    setFormPhone(comp.phone || '');
    setFormAddress(comp.address || '');
    setFormContacts(
      comp.contacts.length > 0
        ? comp.contacts
        : [{ name: '', roleTitle: 'ฝ่ายการเงิน', phone: '', email: '', isPrimary: true }]
    );
    setFormError('');
    setIsModalOpen(true);
  };

  // Contact list helper
  const handleAddContactRow = () => {
    setFormContacts([
      ...formContacts,
      { name: '', roleTitle: '', phone: '', email: '', isPrimary: false },
    ]);
  };

  const handleRemoveContactRow = (index: number) => {
    setFormContacts(formContacts.filter((_, i) => i !== index));
  };

  const handleUpdateContactRow = (index: number, field: keyof ContactPerson, val: any) => {
    const updated = [...formContacts];
    updated[index] = { ...updated[index], [field]: val };
    setFormContacts(updated);
  };

  // Submit Company Form
  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const url = editId ? `/api/admin/companies/${editId}` : '/api/admin/companies';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          taxId: formTaxId,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          contacts: formContacts.filter((c) => c.name.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'ไม่สามารถบันทึกข้อมูลได้');
        setFormSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      if (editId) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === editId
              ? {
                  ...c,
                  ...data.data,
                  contacts: data.data?.contacts ?? c.contacts ?? [],
                  _count: data.data?._count ?? c._count ?? { taxPayments: 0, followUpLogs: 0 },
                }
              : c
          )
        );
      } else if (data.data) {
        setCompanies((prev) => [
          {
            ...data.data,
            contacts: data.data.contacts ?? [],
            _count: data.data._count ?? { taxPayments: 0, followUpLogs: 0 },
          },
          ...prev,
        ]);
      }
      void loadCompanies(true);
    } catch (err) {
      console.error(err);
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบข้อมูลบริษัท "${name}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'ไม่สามารถลบข้อมูลได้');
        return;
      }
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      void loadCompanies(true);
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Template Download
  const handleDownloadTemplate = () => {
    const header = 'ชื่อบริษัท,เลขประจำตัวผู้เสียภาษี,อีเมลบริษัท,เบอร์โทร,ที่อยู่,ชื่อผู้ติดต่อหลัก,ตำแหน่งผู้ติดต่อ,เบอร์ผู้ติดต่อ,อีเมลผู้ติดต่อ\n';
    const sample = 'บจก.ตัวอย่างการค้า,0105550000000,contact@example.com,021234567,123 ถ.สุขุมวิท กทม.,คุณสมศรี มีสุข,ฝ่ายการเงิน,0812345678,somsri@example.com\n';
    const blob = new Blob(['\uFEFF' + header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_companies_deethavorn.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File Upload / Parsing (CSV simple parser)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim());
      if (lines.length <= 1) {
        alert('ไฟล์ไม่มีข้อมูล');
        return;
      }

      // Skip header line
      const parsedItems = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts[0]) {
          parsedItems.push({
            name: parts[0],
            taxId: parts[1] || '',
            email: parts[2] || '',
            phone: parts[3] || '',
            address: parts[4] || '',
            contactName: parts[5] || '',
            contactRole: parts[6] || '',
            contactPhone: parts[7] || '',
            contactEmail: parts[8] || '',
          });
        }
      }

      setImportPreview(parsedItems);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Submit Import
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch('/api/admin/companies/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: importPreview }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'การนำเข้าล้มเหลว');
        setImporting(false);
        return;
      }

      setImportResult(data.message);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportPreview([]);
        setImportResult(null);
        loadCompanies();
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการนำเข้า');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="admin-page-stack">
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
          <span className="admin-page-header__icon" aria-hidden="true"><Building2 size={20} /></span>
          <div>
            <h1>ทะเบียนบริษัทลูกค้า</h1>
            <p>ข้อมูลบริษัท ผู้ติดต่อ และช่องทางสำหรับติดตามยอดค้างชำระ</p>
          </div>
        </div>
        <div className="admin-page-actions">
          {canCreate && <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="admin-secondary-button text-xs"
          >
            <Upload className="w-4 h-4 text-[#1689bd]" />
            <span>นำเข้าข้อมูล</span>
          </button>}

          {canCreate && <button
            type="button"
            onClick={handleOpenCreate}
            className="admin-primary-button text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบริษัท</span>
          </button>}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="companies-search-box">
          <Search size={15} aria-hidden="true" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบริษัท, เลขประจำตัวผู้เสียภาษี, อีเมล หรือเบอร์โทร..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="ค้นหาชื่อบริษัท"
          />
          {searchQuery && (
            <button
              type="button"
              className="companies-search-clear"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              aria-label="ล้างคำค้นหา"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          พบทั้งหมด <span className="text-[#102a56] font-bold">{filteredCompanies.length}</span> บริษัท
        </div>
      </div>

      {/* Companies List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">กำลังโหลดข้อมูลบริษัท...</div>
        ) : loadError ? (
          <div className="admin-inline-state admin-inline-state--error" role="alert">
            <AlertCircle aria-hidden="true" size={24} />
            <strong>โหลดข้อมูลบริษัทไม่สำเร็จ</strong>
            <span>{loadError}</span>
            <button type="button" className="admin-secondary-button" onClick={() => void loadCompanies()}>ลองใหม่</button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-slate-800 font-bold text-sm">ไม่พบบริษัทในระบบ</div>
            <p className="text-slate-500 text-xs mt-1">
              เพิ่มข้อมูลหรือนำเข้าผ่านไฟล์ Excel / CSV เพื่อเริ่มใช้งาน
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" tabIndex={0} aria-label="ตารางบริษัท เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
            <table className="companies-table w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ชื่อบริษัท</th>
                  <th className="py-3 px-4">เลขประจำตัวผู้เสียภาษี</th>
                  <th className="py-3 px-4">ช่องทางติดต่อ / อีเมลทวงถาม</th>
                  <th className="py-3 px-4">ผู้ติดต่อในบริษัท</th>
                  <th className="py-3 px-4 text-center">ประวัติภาษี</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCompanies.map((c) => {
                  const contacts = Array.isArray(c.contacts) ? c.contacts : [];
                  const primaryContact = contacts.find((cnt) => cnt.isPrimary) || contacts[0];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                        {c.address && (
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{c.address}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {c.taxId || '-'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-slate-800">
                              <Mail className="w-3 h-3 text-[#1689bd] shrink-0" />
                              <span className="text-xs">{c.email}</span>
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                          {!c.email && !c.phone && <span className="text-slate-400">-</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {primaryContact ? (
                          <div>
                            <div className="font-medium text-slate-800 flex items-center gap-1.5">
                              <span>{primaryContact.name}</span>
                              {primaryContact.roleTitle && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                  {primaryContact.roleTitle}
                                </span>
                              )}
                            </div>
                            {primaryContact.phone && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {primaryContact.phone}
                              </div>
                            )}
                            {contacts.length > 1 && (
                              <div className="text-[10px] text-[#1689bd] font-medium mt-1">
                                + อีก {contacts.length - 1} ผู้ติดต่อ
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">ยังไม่มีผู้ติดต่อ</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-[#1B2A80] text-xs font-semibold">
                          <span>{c._count?.taxPayments ?? 0} รายการ</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="tax-actions-cell justify-center">
                          {canEdit && <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            title="แก้ไขข้อมูล"
                            className="admin-action-btn admin-action-btn--edit"
                          >
                            <Edit2 size={13} aria-hidden="true" />
                            <span>แก้ไข</span>
                          </button>}
                          {canDelete && <button
                            type="button"
                            onClick={() => handleDeleteCompany(c.id, c.name)}
                            title="ลบบริษัท"
                            className="admin-action-btn admin-action-btn--delete"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            <span>ลบ</span>
                          </button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredCompanies.length > 0 && (
          <div className="admin-pagination">
            <div className="admin-pagination__info">
              แสดง <strong>{startIndex + 1} - {endIndex}</strong> จากทั้งหมด <strong>{filteredCompanies.length}</strong> บริษัท
            </div>

            <div className="admin-pagination__controls">
              <div className="admin-pagination__per-page">
                <label htmlFor="per-page-select">แสดงต่อหน้า:</label>
                <select
                  id="per-page-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="admin-pagination__pages">
                <button
                  type="button"
                  className="admin-pagination__btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={14} />
                  <span>ก่อนหน้า</span>
                </button>

                {pageNumbers.map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      type="button"
                      className={`admin-pagination__page-number ${safeCurrentPage === page ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={`dots-${idx}`} className="admin-pagination__ellipsis">
                      …
                    </span>
                  )
                )}

                <button
                  type="button"
                  className="admin-pagination__btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="หน้าถัดไป"
                >
                  <span>ถัดไป</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Modal 1: เพิ่ม / แก้ไขข้อมูลบริษัท พร้อมหลายผู้ติดต่อ */}
      {/* ========================================================================= */}
      {isModalOpen && (editId ? canEdit : canCreate) && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <section className="admin-dialog" role="dialog" aria-modal="true">
            <header>
              <div>
                <p>จัดการข้อมูลบริษัท</p>
                <h2>{editId ? 'แก้ไขข้อมูลบริษัท' : 'เพิ่มบริษัทใหม่'}</h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setIsModalOpen(false)}
                aria-label="ปิด"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmitCompany}>
              {formError && (
                <div className="admin-alert admin-alert--error" role="alert">
                  <AlertCircle aria-hidden="true" size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-form-grid">
                <div className="admin-field admin-field--wide">
                  <label htmlFor="company-name">
                    ชื่อบริษัท <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input
                    id="company-name"
                    name="companyName"
                    type="text"
                    required
                    placeholder="เช่น บริษัท ตัวอย่าง จำกัด"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="company-tax-id">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                  <input
                    id="company-tax-id"
                    name="taxId"
                    inputMode="numeric"
                    type="text"
                    placeholder="เช่น 0105550000000"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="company-email">อีเมลกลาง (สำหรับส่งทวงถามยอดค้าง)</label>
                  <input
                    id="company-email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    type="email"
                    placeholder="account@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="company-phone">เบอร์โทรสำนักงาน</label>
                  <input
                    id="company-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="เช่น 02-123-4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="company-address">ที่อยู่ออกใบเสร็จ / ใบกำกับภาษี</label>
                  <input
                    id="company-address"
                    name="address"
                    type="text"
                    placeholder="เช่น 123/45 แขวง... เขต... กทม."
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                {/* Multiple Contacts Section */}
                <div
                  className="admin-field--wide"
                  style={{
                    marginTop: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--dtv-line)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <label
                      style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--dtv-navy-900)',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      <Users size={16} color="#1689bd" />
                      รายชื่อผู้ติดต่อในบริษัท (ฝ่ายการเงิน, กรรมการ, บัญชี)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddContactRow}
                      className="admin-text-button"
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      <Plus size={14} /> เพิ่มผู้ติดต่อ
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {formContacts.map((cnt, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px',
                          background: 'var(--dtv-ice-50)',
                          border: '1px solid var(--dtv-line)',
                          borderRadius: '8px',
                          display: 'grid',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--dtv-navy-900)',
                            }}
                          >
                            ผู้ติดต่อคนที่ {idx + 1}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                color: 'var(--dtv-primary)',
                                fontWeight: 600,
                              }}
                            >
                              <input
                                type="radio"
                                name="primary-contact"
                                checked={!!cnt.isPrimary}
                                onChange={() => {
                                  const updated = formContacts.map((c, i) => ({
                                    ...c,
                                    isPrimary: i === idx,
                                  }));
                                  setFormContacts(updated);
                                }}
                              />
                              ผู้ติดต่อหลัก
                            </label>
                            {formContacts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveContactRow(idx)}
                                style={{
                                  background: 'transparent',
                                  border: 0,
                                  color: '#e11d48',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                                title="ลบผู้ติดต่อ"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            name={`contactName-${idx}`}
                            aria-label={`ชื่อผู้ติดต่อคนที่ ${idx + 1}`}
                            autoComplete="name"
                            placeholder="ชื่อ-นามสกุล เช่น คุณสมศรี…"
                            value={cnt.name}
                            onChange={(e) => handleUpdateContactRow(idx, 'name', e.target.value)}
                            style={{
                              padding: '6px 9px',
                              borderRadius: '6px',
                              border: '1px solid var(--dtv-line)',
                              fontSize: '12px',
                            }}
                          />
                          <input
                            type="text"
                            name={`contactRole-${idx}`}
                            aria-label={`ตำแหน่งผู้ติดต่อคนที่ ${idx + 1}`}
                            placeholder="ตำแหน่ง เช่น ฝ่ายการเงิน / บัญชี…"
                            value={cnt.roleTitle || ''}
                            onChange={(e) => handleUpdateContactRow(idx, 'roleTitle', e.target.value)}
                            style={{
                              padding: '6px 9px',
                              borderRadius: '6px',
                              border: '1px solid var(--dtv-line)',
                              fontSize: '12px',
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '8px',
                          }}
                        >
                          <input
                            type="tel"
                            name={`contactPhone-${idx}`}
                            aria-label={`เบอร์โทรผู้ติดต่อคนที่ ${idx + 1}`}
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="เบอร์โทรศัพท์…"
                            value={cnt.phone || ''}
                            onChange={(e) => handleUpdateContactRow(idx, 'phone', e.target.value)}
                            style={{
                              padding: '6px 9px',
                              borderRadius: '6px',
                              border: '1px solid var(--dtv-line)',
                              fontSize: '12px',
                            }}
                          />
                          <input
                            type="email"
                            name={`contactEmail-${idx}`}
                            aria-label={`อีเมลผู้ติดต่อคนที่ ${idx + 1}`}
                            autoComplete="email"
                            spellCheck={false}
                            placeholder="อีเมล…"
                            value={cnt.email || ''}
                            onChange={(e) => handleUpdateContactRow(idx, 'email', e.target.value)}
                            style={{
                              padding: '6px 9px',
                              borderRadius: '6px',
                              border: '1px solid var(--dtv-line)',
                              fontSize: '12px',
                            }}
                          />
                          <input
                            type="text"
                            name={`contactLine-${idx}`}
                            aria-label={`LINE ID ผู้ติดต่อคนที่ ${idx + 1}`}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="LINE ID…"
                            value={cnt.lineId || ''}
                            onChange={(e) => handleUpdateContactRow(idx, 'lineId', e.target.value)}
                            style={{
                              padding: '6px 9px',
                              borderRadius: '6px',
                              border: '1px solid var(--dtv-line)',
                              fontSize: '12px',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <footer>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-secondary-button"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="admin-primary-button"
                >
                  {formSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal 2: นำเข้ารายชื่อบริษัทผ่านไฟล์ Excel / CSV */}
      {/* ========================================================================= */}
      {isImportModalOpen && canCreate && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsImportModalOpen(false);
          }}
        >
          <section
            className="admin-dialog"
            style={{ width: 'min(920px, 95vw)' }}
            role="dialog"
            aria-modal="true"
          >
            <header>
              <div>
                <p>นำเข้าข้อมูล</p>
                <h2>นำเข้ารายชื่อบริษัทผ่านไฟล์ CSV / Excel</h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setIsImportModalOpen(false)}
                aria-label="ปิด"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </header>

            <div style={{ padding: '21px 22px', display: 'grid', gap: '18px' }}>
              {importResult && (
                <div className="admin-alert admin-alert--success" role="status">
                  <CheckCircle2 aria-hidden="true" size={18} />
                  <span>{importResult}</span>
                </div>
              )}

              {/* Step 1: Download Template */}
              <div
                style={{
                  padding: '16px',
                  background: 'var(--dtv-ice-50)',
                  border: '1px solid var(--dtv-line)',
                  borderRadius: '9px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: 'var(--dtv-navy-900)',
                    }}
                  >
                    ขั้นตอนที่ 1: ดาวน์โหลดไฟล์ต้นแบบ
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--dtv-muted)' }}>
                    ไฟล์ CSV เทมเพลตมาตรฐาน มีคอลัมน์ชื่อบริษัท เลขประจำตัวผู้เสียภาษี และข้อมูลติดต่อ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="admin-secondary-button"
                  style={{ minHeight: '34px', fontSize: '12px' }}
                >
                  <Download size={14} color="#1689bd" />
                  <span>ดาวน์โหลดเทมเพลต (.csv)</span>
                </button>
              </div>

              {/* Step 2: Upload Area */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--dtv-navy-900)',
                  }}
                >
                  ขั้นตอนที่ 2: อัปโหลดไฟล์
                </label>
                <label
                  style={{
                    border: '2px dashed var(--dtv-line)',
                    borderRadius: '10px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#fbfcfd',
                    transition: 'all 150ms ease',
                  }}
                >
                  <Upload size={32} color="var(--dtv-primary)" style={{ marginBottom: '8px' }} />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--dtv-navy-900)',
                    }}
                  >
                    คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--dtv-muted)',
                      marginTop: '4px',
                    }}
                  >
                    รองรับไฟล์รูปแบบ .csv
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Step 3: Live Preview Table */}
              {importPreview.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <strong style={{ color: 'var(--dtv-navy-900)' }}>
                      พรีวิวข้อมูลที่ตรวจพบ ({importPreview.length} บริษัท)
                    </strong>
                    <span style={{ color: '#16835b', fontWeight: 600, fontSize: '11px' }}>
                      ระบบจะตรวจจับและข้ามชื่อบริษัทที่ซ้ำในระบบให้อัตโนมัติ
                    </span>
                  </div>

                  <div
                    className="import-preview-wrap"
                  >
                    <table className="import-preview-table">
                      <thead>
                        <tr>
                          <th className="col-imp-name">ชื่อบริษัท</th>
                          <th className="col-imp-tax">เลขประจำตัวผู้เสียภาษี</th>
                          <th className="col-imp-email">อีเมล</th>
                          <th className="col-imp-contact">ผู้ติดต่อ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item, idx) => (
                          <tr key={idx}>
                            <td className="col-imp-name">
                              <strong>{item.name}</strong>
                            </td>
                            <td className="col-imp-tax">{item.taxId || '-'}</td>
                            <td className="col-imp-email">{item.email || '-'}</td>
                            <td className="col-imp-contact">{item.contactName || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <footer
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '9px',
                  marginTop: '10px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--dtv-line)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="admin-secondary-button"
                >
                  ปิด
                </button>
                {importPreview.length > 0 && (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={importing}
                    className="admin-primary-button"
                  >
                    {importing
                      ? 'กำลังนำเข้าข้อมูล...'
                      : `ยืนยันนำเข้า ${importPreview.length} บริษัท`}
                  </button>
                )}
              </footer>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
