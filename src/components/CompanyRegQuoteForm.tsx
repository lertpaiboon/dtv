'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const SERVICE_OPTIONS = [
  'จดทะเบียนบริษัทจำกัด',
  'จดทะเบียนห้างหุ้นส่วนจำกัด',
  'จดทะเบียนเลิกบริษัท',
  'ยังไม่แน่ใจ ขอคำปรึกษา',
] as const;

const SHAREHOLDER_COUNTS = [
  '2 คน',
  '3–5 คน',
  'มากกว่า 5 คน',
  'มีผู้ถือหุ้นต่างชาติ',
] as const;

const CAPITAL_RANGES = [
  'ไม่เกิน 1 ล้านบาท',
  '1–5 ล้านบาท',
  'มากกว่า 5 ล้านบาท',
  'ยังไม่ได้กำหนด',
] as const;

const initialState = {
  fullName: '',
  phone: '',
  serviceOption: 'จดทะเบียนบริษัทจำกัด',
  shareholderCount: '2 คน',
  capitalRange: 'ไม่เกิน 1 ล้านบาท',
  message: '',
};

export default function CompanyRegQuoteForm() {
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
        `[ขอใบเสนอราคาจดทะเบียนบริษัท]`,
        `• ต้องการบริการ: ${formData.serviceOption}`,
        `• จำนวนผู้ถือหุ้น: ${formData.shareholderCount}`,
        `• ทุนจดทะเบียนโดยประมาณ: ${formData.capitalRange}`,
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
          serviceType: formData.serviceOption,
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับภายใน 1 วันทำการพร้อมแจ้งค่าจดทะเบียนบริษัทครับ',
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
      <h3>ขอราคาจดทะเบียนบริษัท</h3>

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
        <label htmlFor="rg-website">Website</label>
        <input
          id="rg-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="rg-name">ชื่อ-นามสกุล *</label>
          <input
            id="rg-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="rg-tel">เบอร์โทร *</label>
          <input
            id="rg-tel"
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
          <label htmlFor="rg-svc">ต้องการบริการ</label>
          <select
            id="rg-svc"
            value={formData.serviceOption}
            onChange={(e) => setFormData({ ...formData, serviceOption: e.target.value })}
            disabled={loading}
          >
            {SERVICE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="rg-sh">จำนวนผู้ถือหุ้น</label>
          <select
            id="rg-sh"
            value={formData.shareholderCount}
            onChange={(e) => setFormData({ ...formData, shareholderCount: e.target.value })}
            disabled={loading}
          >
            {SHAREHOLDER_COUNTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="rg-cap">ทุนจดทะเบียนโดยประมาณ</label>
        <select
          id="rg-cap"
          value={formData.capitalRange}
          onChange={(e) => setFormData({ ...formData, capitalRange: e.target.value })}
          disabled={loading}
        >
          {CAPITAL_RANGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="rg-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="rg-msg"
          rows={3}
          placeholder="เช่น ขายของออนไลน์ อยากเปิดบริษัทภายในเดือนหน้า"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-large ma-quote-form__submit"
        disabled={loading}
      >
        <Send size={18} aria-hidden="true" />
        <span>{loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรับใบเสนอราคา'}</span>
      </button>

      <p className="ma-quote-form__note">ใช้ข้อมูลนี้เพื่อติดต่อกลับและประเมินราคาเท่านั้น</p>
    </form>
  );
}
