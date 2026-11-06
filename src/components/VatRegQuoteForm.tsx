'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const BUSINESS_TYPES = [
  'ขายสินค้า',
  'ร้านค้าออนไลน์',
  'ธุรกิจบริการ',
  'อื่นๆ',
] as const;

const REVENUE_RANGES = [
  'ต่ำกว่า 1.8 ล้านบาท',
  'ใกล้ 1.8 ล้านบาท',
  'เกิน 1.8 ล้านบาทแล้ว',
] as const;

const CURRENT_STATUSES = [
  'มีบริษัทแล้ว ยังไม่จด VAT',
  'อยากจด VAT โดยสมัครใจ',
  'ยังไม่ได้จดบริษัท',
  'ไม่แน่ใจ ขอคำปรึกษา',
] as const;

const initialState = {
  companyName: '',
  phone: '',
  businessType: 'ขายสินค้า',
  revenueRange: 'ต่ำกว่า 1.8 ล้านบาท',
  currentStatus: 'มีบริษัทแล้ว ยังไม่จด VAT',
  message: '',
};

export default function VatRegQuoteForm() {
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
      const formattedMessage = [
        `[ขอใบเสนอราคาจดทะเบียน VAT]`,
        `• ชื่อบริษัท / ผู้ติดต่อ: ${formData.companyName.trim()}`,
        `• ประเภทธุรกิจ: ${formData.businessType}`,
        `• รายรับต่อปีโดยประมาณ: ${formData.revenueRange}`,
        `• สถานะตอนนี้: ${formData.currentStatus}`,
        formData.message.trim() ? `• รายละเอียดเพิ่มเติม: ${formData.message.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.companyName.trim(),
          lastName: '(จดทะเบียน VAT)',
          email: 'lead@deethavorn.com',
          phone: formData.phone.trim(),
          serviceType: 'รับจดทะเบียน VAT',
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับภายใน 1 วันทำการพร้อมแจ้งรายละเอียดการจดทะเบียน VAT ครับ',
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
      <h3>ขอราคาจดทะเบียน VAT</h3>

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
        <label htmlFor="vt-website">Website</label>
        <input
          id="vt-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="vt-co">ชื่อบริษัท *</label>
          <input
            id="vt-co"
            type="text"
            required
            placeholder="บริษัท ตัวอย่าง จำกัด"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="vt-tel">เบอร์โทร *</label>
          <input
            id="vt-tel"
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
          <label htmlFor="vt-type">ประเภทธุรกิจ</label>
          <select
            id="vt-type"
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
          <label htmlFor="vt-rev">รายรับต่อปีโดยประมาณ</label>
          <select
            id="vt-rev"
            value={formData.revenueRange}
            onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
            disabled={loading}
          >
            {REVENUE_RANGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="vt-status">สถานะตอนนี้</label>
        <select
          id="vt-status"
          value={formData.currentStatus}
          onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
          disabled={loading}
        >
          {CURRENT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="vt-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="vt-msg"
          rows={3}
          placeholder="เช่น ยอดขายเดือนนี้ทำให้รายรับเกิน 1.8 ล้านแล้ว"
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
