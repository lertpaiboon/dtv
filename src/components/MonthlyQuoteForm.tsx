'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const BUSINESS_TYPES = [
  'บริษัท / หจก.',
  'ร้านค้าออนไลน์',
  'ร้านค้าหรือธุรกิจบริการ',
  'ฟรีแลนซ์',
] as const;

const VAT_OPTIONS = ['จดแล้ว', 'ยังไม่จด', 'ไม่แน่ใจ'] as const;

const DOC_VOLUMES = ['ไม่เกิน 30 ใบ', '31–100 ใบ', 'มากกว่า 100 ใบ', 'ไม่แน่ใจ'] as const;

const initialState = {
  fullName: '',
  phone: '',
  businessType: 'บริษัท / หจก.',
  vatStatus: 'จดแล้ว',
  docVolume: 'ไม่เกิน 30 ใบ',
  message: '',
};

export default function MonthlyQuoteForm() {
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
        `[ขอราคาทำบัญชีรายเดือน]`,
        `• รูปแบบธุรกิจ: ${formData.businessType}`,
        `• สถานะ VAT: ${formData.vatStatus}`,
        `• เอกสารต่อเดือนประมาณ: ${formData.docVolume}`,
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
          serviceType: 'รับทำบัญชีรายเดือน',
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับเพื่อแจ้งใบเสนอราคาภายใน 1 วันทำการครับ',
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
      <h3>ขอราคาทำบัญชีรายเดือน</h3>

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
        <label htmlFor="ma-website">Website</label>
        <input
          id="ma-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="m-name">ชื่อ-นามสกุล *</label>
          <input
            id="m-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="m-tel">เบอร์โทร *</label>
          <input
            id="m-tel"
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
          <label htmlFor="m-type">รูปแบบธุรกิจ</label>
          <select
            id="m-type"
            value={formData.businessType}
            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
            disabled={loading}
          >
            {BUSINESS_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="m-vat">จด VAT แล้วหรือยัง</label>
          <select
            id="m-vat"
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
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="m-docs">เอกสารต่อเดือนประมาณ</label>
        <select
          id="m-docs"
          value={formData.docVolume}
          onChange={(e) => setFormData({ ...formData, docVolume: e.target.value })}
          disabled={loading}
        >
          {DOC_VOLUMES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="m-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="m-msg"
          rows={3}
          placeholder="เช่น ขายผ่าน Shopee กับ TikTok Shop พนักงาน 3 คน"
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
