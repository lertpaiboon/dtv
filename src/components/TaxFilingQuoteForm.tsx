'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const VAT_OPTIONS = ['จดแล้ว', 'ยังไม่จด', 'ไม่แน่ใจ'] as const;

const STAFF_OPTIONS = ['ไม่มี', '1–5 คน', '6–20 คน', 'มากกว่า 20 คน'] as const;

const SCOPE_OPTIONS = [
  'ยื่นภาษีรายเดือน (ภ.พ.30 / ภ.ง.ด.)',
  'ยื่นภาษีประจำปี (ภ.ง.ด.50 / 51)',
  'ทั้งรายเดือนและรายปี',
  'ยังไม่แน่ใจ อยากให้ช่วยดู',
] as const;

const initialState = {
  fullName: '',
  phone: '',
  vatStatus: 'จดแล้ว',
  staffCount: '1–5 คน',
  taxScope: 'ยื่นภาษีรายเดือน (ภ.พ.30 / ภ.ง.ด.)',
  message: '',
};

export default function TaxFilingQuoteForm() {
  const [formData, setFormData] = useState(initialState);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || formData.fullName.trim();
      const lastName = nameParts.slice(1).join(' ') || '-';

      const formattedMessage = [
        `[ขอราคายื่นภาษีบริษัท]`,
        `• สถานะ VAT: ${formData.vatStatus}`,
        `• จำนวนพนักงาน: ${formData.staffCount}`,
        `• ขอบเขตที่ต้องการให้ช่วย: ${formData.taxScope}`,
        formData.message.trim() ? `• รายละเอียดเพิ่มเติม: ${formData.message.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: 'lead@deethavorn.com',
          phone: formData.phone.trim(),
          serviceType: 'บริการยื่นภาษี',
          message: formattedMessage,
          website: honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }

      setFormData(initialState);
      setStatus({
        type: 'success',
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับเพื่อแจ้งราคาภายใน 1 วันทำการครับ',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'ส่งข้อมูลไม่สำเร็จ กรุณาโทร 099-149-5656 หรือ 091-941-5656',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ma-quote-form" onSubmit={handleSubmit}>
      <h3>ขอราคายื่นภาษี</h3>

      {status.type !== 'idle' && (
        <div
          className={`form-status form-status--${status.type}`}
          role="status"
          aria-live="polite"
        >
          {status.type === 'success' ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <AlertCircle aria-hidden="true" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <div aria-hidden="true" className="honeypot" style={{ display: 'none' }}>
        <label htmlFor="tf-website">Website</label>
        <input
          id="tf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="t-name">ชื่อ-นามสกุล *</label>
          <input
            id="t-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="t-tel">เบอร์โทร *</label>
          <input
            id="t-tel"
            type="tel"
            required
            placeholder="081-234-5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="t-vat">จด VAT แล้วหรือยัง</label>
          <select
            id="t-vat"
            value={formData.vatStatus}
            onChange={(e) => setFormData({ ...formData, vatStatus: e.target.value })}
            disabled={loading}
          >
            {VAT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="t-staff">จำนวนพนักงาน</label>
          <select
            id="t-staff"
            value={formData.staffCount}
            onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
            disabled={loading}
          >
            {STAFF_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="t-scope">ต้องการให้ช่วยเรื่องไหน</label>
        <select
          id="t-scope"
          value={formData.taxScope}
          onChange={(e) => setFormData({ ...formData, taxScope: e.target.value })}
          disabled={loading}
        >
          {SCOPE_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="t-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="t-msg"
          rows={3}
          placeholder="เช่น จด VAT ปีนี้ ยังไม่เคยยื่น ภ.พ.30 เอง"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-large ma-quote-form__submit" disabled={loading}>
        <Send size={18} aria-hidden="true" />
        <span>{loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรับใบเสนอราคา'}</span>
      </button>

      <p className="ma-quote-form__note">ใช้ข้อมูลนี้เพื่อติดต่อกลับและประเมินราคาเท่านั้น</p>
    </form>
  );
}
