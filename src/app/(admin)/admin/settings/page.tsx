'use client';

import React, { useEffect, useMemo, useState, useId } from 'react';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Edit2,
  HelpCircle,
  MessageSquare,
  Plus,
  Power,
  RotateCcw,
  Save,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

interface PaymentMethodItem {
  id: number;
  code: string;
  name: string;
  cardLastDigits: string | null;
  isActive: boolean;
  _count?: {
    taxPayments: number;
  };
}

const SAMPLE_DATA = {
  companyName: 'บจก. ตัวอย่างการค้า (ไทยแลนด์)',
  contactHeader: 'คุณสมชาย ใจดี (ฝ่ายการเงิน)',
  monthYear: 'สิงหาคม 2569',
  taxList: `1. ภ.พ. 30 (VAT): 12,500.00 บาท
2. ภ.ง.ด. 3 (หักบุคคล): 1,850.00 บาท
3. ภ.ง.ด. 53 (หักนิติบุคคล): 3,420.00 บาท`,
  totalAmount: '17,770.00 บาท',
};

export default function SettingsPage() {
  const methodCodeInputId = useId();
  const methodNameInputId = useId();
  const methodCardDigitsInputId = useId();
  const methodIsActiveInputId = useId();
  const lineTemplateTextareaId = useId();
  const bankInfoTextareaId = useId();

  const [activeTab, setActiveTab] = useState<'methods' | 'line'>('methods');
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Settings State
  const [lineTemplate, setLineTemplate] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [defaultLineTemplate, setDefaultLineTemplate] = useState('');
  const [defaultBankInfo, setDefaultBankInfo] = useState('');
  const [savedLineTemplate, setSavedLineTemplate] = useState('');
  const [savedBankInfo, setSavedBankInfo] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Notifications
  const [notice, setNotice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State for Payment Methods
  const [editingMethod, setEditingMethod] = useState<PaymentMethodItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    cardLastDigits: '',
    isActive: true,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Copy Preview State
  const [previewCopied, setPreviewCopied] = useState(false);
  const settingsDirty = useMemo(
    () => lineTemplate !== savedLineTemplate || bankInfo !== savedBankInfo,
    [bankInfo, lineTemplate, savedBankInfo, savedLineTemplate]
  );

  function selectTab(tab: 'methods' | 'line') {
    if (activeTab === 'line' && tab !== 'line' && settingsDirty) {
      const leave = confirm('การตั้งค่ายังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?');
      if (!leave) return;
    }
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  }

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (requestedTab === 'line' || requestedTab === 'methods') setActiveTab(requestedTab);
    void loadPaymentMethods();
    void loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsDirty) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const warnInternalNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.origin !== window.location.origin) return;
      if (!confirm('การตั้งค่ายังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', warnBeforeUnload);
    document.addEventListener('click', warnInternalNavigation, true);
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
      document.removeEventListener('click', warnInternalNavigation, true);
    };
  }, [settingsDirty]);

  async function loadPaymentMethods() {
    setLoadingMethods(true);
    try {
      const response = await fetch('/api/admin/payment-methods?all=true');
      const res = await response.json();
      if (!response.ok || !res.success || !Array.isArray(res.data)) {
        throw new Error(res.error || 'ไม่สามารถโหลดข้อมูลช่องทางชำระเงินได้');
      }
      setMethods(res.data);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลช่องทางชำระเงินได้');
    } finally {
      setLoadingMethods(false);
    }
  }

  async function loadSettings() {
    setLoadingSettings(true);
    try {
      const response = await fetch('/api/admin/settings');
      const res = await response.json();
      if (!response.ok || !res.success || !res.data) {
        throw new Error(res.error || 'ไม่สามารถโหลดการตั้งค่าระบบได้');
      }
      const nextLineTemplate = res.data.billing_line_template || '';
      const nextBankInfo = res.data.company_bank_info || '';
      setLineTemplate(nextLineTemplate);
      setBankInfo(nextBankInfo);
      setSavedLineTemplate(nextLineTemplate);
      setSavedBankInfo(nextBankInfo);
      if (res.defaults) {
        setDefaultLineTemplate(res.defaults.billing_line_template || '');
        setDefaultBankInfo(res.defaults.company_bank_info || '');
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'ไม่สามารถโหลดการตั้งค่าระบบได้');
    } finally {
      setLoadingSettings(false);
    }
  }

  // Handle Save Settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billing_line_template: lineTemplate,
          company_bank_info: bankInfo,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setSavedLineTemplate(lineTemplate);
        setSavedBankInfo(bankInfo);
        setNotice('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
      } else {
        setErrorMsg(res.error || 'ไม่สามารถบันทึกได้');
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSavingSettings(false);
    }
  }

  // Handle Reset to Default
  function handleResetTemplate() {
    if (confirm('คุณต้องการคืนค่าเริ่มต้นของแม่แบบข้อความ LINE ใช่หรือไม่?')) {
      setLineTemplate(defaultLineTemplate);
      setBankInfo(defaultBankInfo);
      setNotice('คืนค่าแม่แบบเริ่มต้นเรียบร้อยแล้ว (อย่าลืมกดบันทึก)');
    }
  }

  // Insert Variable Token into textarea
  function insertToken(token: string) {
    const textarea = document.getElementById(lineTemplateTextareaId) as HTMLTextAreaElement;
    if (!textarea) {
      setLineTemplate((prev) => prev + token);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + token + after;
    setLineTemplate(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  // Render Live Preview Message
  function getPreviewMessage(): string {
    return lineTemplate
      .replace(/\{companyName\}/g, SAMPLE_DATA.companyName)
      .replace(/\{contactHeader\}/g, SAMPLE_DATA.contactHeader)
      .replace(/\{monthYear\}/g, SAMPLE_DATA.monthYear)
      .replace(/\{taxList\}/g, SAMPLE_DATA.taxList)
      .replace(/\{totalAmount\}/g, SAMPLE_DATA.totalAmount)
      .replace(/\{bankAccount\}/g, bankInfo.trim());
  }

  function handleCopyPreview() {
    navigator.clipboard.writeText(getPreviewMessage());
    setPreviewCopied(true);
    setTimeout(() => setPreviewCopied(false), 2000);
  }

  // Modal actions for payment methods
  function openAddModal() {
    setEditingMethod(null);
    setFormData({ code: '', name: '', cardLastDigits: '', isActive: true });
    setModalOpen(true);
  }

  function openEditModal(method: PaymentMethodItem) {
    setEditingMethod(method);
    setFormData({
      code: method.code,
      name: method.name,
      cardLastDigits: method.cardLastDigits || '',
      isActive: method.isActive,
    });
    setModalOpen(true);
  }

  async function handleToggleMethodActive(method: PaymentMethodItem) {
    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !method.isActive }),
      }).then((r) => r.json());

      if (res.success) {
        setMethods((prev) =>
          prev.map((m) => (m.id === method.id ? { ...m, isActive: !method.isActive } : m))
        );
        setNotice(`อัปเดตสถานะของ "${method.name}" เรียบร้อยแล้ว`);
      } else {
        alert(res.error || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  }

  async function handleDeleteMethod(method: PaymentMethodItem) {
    const hasHistory = (method._count?.taxPayments || 0) > 0;
    const confirmMsg = hasHistory
      ? `ช่องทาง "${method.name}" มีรายการภาษีผูกอยู่ ${method._count?.taxPayments} รายการ การลบจะเปลี่ยนสถานะเป็น "ปิดใช้งาน" เพื่อรักษาความถูกต้องของประวัติ คุณต้องการดำเนินการต่อหรือไม่?`
      : `คุณต้องการลบช่องทางชำระเงิน "${method.name}" ใช่หรือไม่?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'DELETE',
      }).then((r) => r.json());

      if (res.success) {
        setNotice(res.message);
        void loadPaymentMethods();
      } else {
        alert(res.error || 'ไม่สามารถลบได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการลบช่องทาง');
    }
  }

  async function handleSubmitMethod(e: React.FormEvent) {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const url = editingMethod
        ? `/api/admin/payment-methods/${editingMethod.id}`
        : '/api/admin/payment-methods';
      const method = editingMethod ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).then((r) => r.json());

      if (res.success) {
        setNotice(res.message || 'บันทึกช่องทางชำระเงินเรียบร้อยแล้ว');
        setModalOpen(false);
        void loadPaymentMethods();
      } else {
        alert(res.error || 'ไม่สามารถบันทึกได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setModalSubmitting(false);
    }
  }

  return (
    <div className="tax-workspace">
      {/* Header */}
      <header className="tax-page-head admin-page-header">
        <div>
          <p>การจัดการระบบ</p>
          <h1>ตั้งค่าระบบ</h1>
          <span>จัดการช่องทางชำระเงินและข้อความ LINE สำหรับติดตามเงินคืน</span>
        </div>
      </header>

      {/* Notifications */}
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

      {errorMsg && (
        <div className="admin-alert admin-alert--danger" role="alert" style={{ margin: 0 }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
          <button
            type="button"
            className="admin-icon-button"
            style={{ marginLeft: 'auto' }}
            onClick={() => setErrorMsg('')}
            aria-label="ปิด"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="settings-tab-bar" role="tablist" aria-label="หมวดการตั้งค่าระบบ">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'methods' ? 'settings-tab-btn--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'methods'}
          onClick={() => selectTab('methods')}
        >
          <CreditCard size={18} />
          <span>ช่องทางชำระเงิน ({methods.length})</span>
        </button>
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'line' ? 'settings-tab-btn--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'line'}
          onClick={() => selectTab('line')}
        >
          <MessageSquare size={18} />
          <span>แม่แบบข้อความ LINE แจ้งยอด</span>
        </button>
      </div>

      {/* TAB 1: Payment Methods */}
      {activeTab === 'methods' && (
        <div className="tax-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--dtv-navy-900)' }}>
                รายการช่องทางชำระเงินสำรองจ่าย
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
                กำหนดบัตรเครดิตสำนักงาน บัญชีโอน หรือเงินสดที่ใช้ในการจ่ายภาษีแทนลูกค้า
              </p>
            </div>
            <button
              type="button"
              className="admin-primary-button"
              onClick={openAddModal}
              style={{ minHeight: '42px', gap: '8px', fontSize: '14.5px' }}
            >
              <Plus size={18} />
              <span>เพิ่มช่องทางใหม่</span>
            </button>
          </div>

          {loadingMethods ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>กำลังโหลดข้อมูลช่องทาง...</div>
          ) : methods.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>ยังไม่มีช่องทางชำระเงินในระบบ</div>
          ) : (
            <div className="tax-table-container">
              <table className="tax-table settings-methods-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ลำดับ</th>
                    <th>รหัสช่องทาง (Code)</th>
                    <th>ชื่อช่องทาง</th>
                    <th>เลข 4 ตัวท้าย</th>
                    <th>รายการที่ใช้งาน</th>
                    <th style={{ textAlign: 'center' }}>สถานะ</th>
                    <th style={{ textAlign: 'right' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m, idx) => (
                    <tr key={m.id} style={{ opacity: m.isActive ? 1 : 0.6 }}>
                      <td>{idx + 1}</td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>
                          {m.code}
                        </code>
                      </td>
                      <td>
                        <strong style={{ fontSize: '14.5px' }}>{m.name}</strong>
                      </td>
                      <td>
                        {m.cardLastDigits ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: '#334155' }}>
                            •••• {m.cardLastDigits}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '13.5px', color: '#475569' }}>
                          {m._count?.taxPayments || 0} รายการ
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => void handleToggleMethodActive(m)}
                          className={`settings-status-badge ${m.isActive ? 'settings-status-badge--active' : 'settings-status-badge--inactive'}`}
                          title="คลิกเพื่อสลับสถานะเปิด/ปิดการใช้งาน"
                        >
                          <Power size={13} />
                          {m.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-icon-button"
                            onClick={() => openEditModal(m)}
                            title="แก้ไข"
                            aria-label="แก้ไขช่องทาง"
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-button"
                            style={{ color: '#ef4444' }}
                            onClick={() => void handleDeleteMethod(m)}
                            title="ลบ / ปิดการใช้งาน"
                            aria-label="ลบช่องทาง"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LINE Template Editor & Live Preview */}
      {activeTab === 'line' && (
        <div className="settings-line-grid">
          {/* Editor Column */}
          <div className="tax-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: 'var(--color-primary-dark)' }}>
                แก้ไขแม่แบบข้อความแจ้งยอด
              </h2>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleResetTemplate}
                style={{ fontSize: '12px', padding: '4px 10px', height: '32px', gap: '5px' }}
              >
                <RotateCcw size={14} />
                คืนค่าเริ่มต้น
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              คลิกปุ่มตัวแปรด้านล่าง เพื่อแทรกข้อมูลจริงจากระบบลงในตำแหน่งที่ต้องการ:
            </p>

            {/* Token Chips */}
            <div className="settings-token-container">
              {[
                { token: '{companyName}', label: 'ชื่อบริษัทลูกค้า' },
                { token: '{contactHeader}', label: 'คำนำหน้าผู้ติดต่อ' },
                { token: '{monthYear}', label: 'งวดเดือนและปีภาษี' },
                { token: '{taxList}', label: 'รายการภาษีที่สำรองจ่าย' },
                { token: '{totalAmount}', label: 'ยอดรวมทั้งสิ้น' },
                { token: '{bankAccount}', label: 'บัญชีธนาคารรับเงิน' },
              ].map((t) => (
                <button
                  key={t.token}
                  type="button"
                  className="settings-token-chip"
                  onClick={() => insertToken(t.token)}
                  title={`คลิกเพื่อแทรก ${t.token}`}
                >
                  <code>{t.token}</code>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label
                  htmlFor={lineTemplateTextareaId}
                  style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
                >
                  ข้อความแม่แบบ (LINE Message Body):
                </label>
                <textarea
                  id={lineTemplateTextareaId}
                  className="admin-input"
                  style={{
                    width: '100%',
                    minHeight: '220px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.65',
                    padding: '14px',
                    resize: 'vertical',
                  }}
                  value={lineTemplate}
                  onChange={(e) => setLineTemplate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor={bankInfoTextareaId}
                  style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
                >
                  ข้อมูลบัญชีธนาคารรับโอนเงินคืน (`{'{bankAccount}'}`):
                </label>
                <textarea
                  id={bankInfoTextareaId}
                  className="admin-input"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    padding: '12px',
                  }}
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  placeholder="เช่น ธนาคารกสิกรไทย เลขที่บัญชี..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <span className={`admin-save-indicator ${settingsDirty ? 'is-dirty' : ''}`} role="status" aria-live="polite">
                  {settingsDirty ? 'มีการแก้ไขที่ยังไม่ได้บันทึก' : 'บันทึกข้อมูลล่าสุดแล้ว'}
                </span>
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={savingSettings || loadingSettings || !settingsDirty}
                  style={{ minHeight: '44px', gap: '8px', padding: '0 26px', fontSize: '14.5px' }}
                >
                  <Save size={18} />
                  <span>{savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าแม่แบบ'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="tax-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="line-indicator-dot" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#166534' }}>
                  ตัวอย่างข้อความจริง (Live LINE Preview)
                </h3>
              </div>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCopyPreview}
                style={{ fontSize: '13px', padding: '6px 12px', height: '34px', gap: '6px' }}
              >
                {previewCopied ? <Check size={15} style={{ color: '#16a34a' }} /> : <Copy size={15} />}
                <span>{previewCopied ? 'คัดลอกแล้ว!' : 'ทดสอบคัดลอก'}</span>
              </button>
            </div>

            <div className="line-chat-bubble-container">
              <div className="line-chat-bubble">
                <pre className="line-chat-text">{getPreviewMessage()}</pre>
                <div className="line-chat-time">10:42 น.</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', background: '#f1f5f9', padding: '12px 14px', borderRadius: '8px', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
              <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
              <span>
                เมื่อกดปุ่ม <strong>&quot;ส่ง LINE&quot;</strong> ในหน้าสรุปยอดวางบิล ระบบจะนำข้อมูลจริงของลูกค้ารายนั้นมาแทนที่ตัวแปรเหล่านี้อัตโนมัติ พร้อมให้กด Paste ในแอป LINE ได้ทันที
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Payment Method */}
      {modalOpen && (
        <div
          className="admin-dialog-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section className="admin-dialog" role="dialog" aria-modal="true" style={{ width: 'min(540px, 100%)' }}>
            <header>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                  การจัดการระบบ (Settings)
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dtv-navy-900)' }}>
                  {editingMethod ? 'แก้ไขช่องทางชำระเงิน' : 'เพิ่มช่องทางชำระเงินใหม่'}
                </h2>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setModalOpen(false)}
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmitMethod}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label
                    htmlFor={methodCodeInputId}
                    style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
                  >
                    รหัสช่องทาง (Code) *
                  </label>
                  <input
                    id={methodCodeInputId}
                    type="text"
                    className="admin-input"
                    style={{ textTransform: 'uppercase' }}
                    placeholder="เช่น SCB_CARD, BBL_CARD, CASH"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '5px', display: 'block' }}>
                    เป็นตัวพิมพ์ใหญ่ภาษาอังกฤษและ _ เช่น KBANK_CARD, TRANSFER
                  </small>
                </div>

                <div>
                  <label
                    htmlFor={methodNameInputId}
                    style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
                  >
                    ชื่อช่องทาง (Display Name) *
                  </label>
                  <input
                    id={methodNameInputId}
                    type="text"
                    className="admin-input"
                    placeholder="เช่น บัตรเครดิต SCB สำนักงาน, โอนเงินสำรองจ่าย"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={methodCardDigitsInputId}
                    style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
                  >
                    เลข 4 ตัวท้ายบัตร (ถ้ามี)
                  </label>
                  <input
                    id={methodCardDigitsInputId}
                    type="text"
                    maxLength={4}
                    className="admin-input"
                    style={{ fontFamily: 'monospace', fontSize: '15px' }}
                    placeholder="เช่น 1234"
                    value={formData.cardLastDigits}
                    onChange={(e) => setFormData({ ...formData, cardLastDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input
                    id={methodIsActiveInputId}
                    type="checkbox"
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label
                    htmlFor={methodIsActiveInputId}
                    style={{ fontSize: '14.5px', cursor: 'pointer', fontWeight: 500, color: '#1e293b' }}
                  >
                    เปิดใช้งานในระบบ (พร้อมให้เลือกในงานบันทึกภาษี)
                  </label>
                </div>
              </div>

              <footer>
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setModalOpen(false)}
                  style={{ minHeight: '44px', paddingInline: '20px', fontSize: '14.5px' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={modalSubmitting}
                  style={{ minHeight: '44px', paddingInline: '24px', fontSize: '14.5px' }}
                >
                  {modalSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
