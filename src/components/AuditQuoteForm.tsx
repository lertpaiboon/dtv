'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const ENTITY_TYPES = ['บริษัทจำกัด', 'ห้างหุ้นส่วนจำกัด', 'อื่นๆ'] as const;

const REVENUE_RANGES = [
  'ไม่เกิน 5 ล้านบาท',
  '5–30 ล้านบาท',
  '30–100 ล้านบาท',
  'มากกว่า 100 ล้านบาท',
] as const;

const FISCAL_YEAR_ENDS = ['31 ธันวาคม', 'วันอื่น'] as const;

const READINESS_OPTIONS = ['พร้อมแล้ว', 'กำลังปิดงบ', 'ยังไม่ได้เริ่ม'] as const;

const initialState = {
  fullName: '',
  phone: '',
  entityType: 'บริษัทจำกัด',
  revenue: 'ไม่เกิน 5 ล้านบาท',
  fiscalYearEnd: '31 ธันวาคม',
  readiness: 'พร้อมแล้ว',
  message: '',
};

export default function AuditQuoteForm() {
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
        `[ขอใบเสนอราคาตรวจสอบบัญชี (CPA)]`,
        `• ประเภทกิจการ: ${formData.entityType}`,
        `• รายได้ต่อปีโดยประมาณ: ${formData.revenue}`,
        `• วันสิ้นรอบบัญชี: ${formData.fiscalYearEnd}`,
        `• งบการเงินพร้อมหรือยัง: ${formData.readiness}`,
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
          serviceType: 'รับตรวจสอบบัญชี (CPA)',
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับภายใน 1 วันทำการพร้อมแจ้งค่าตรวจสอบบัญชีครับ',
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
      <h3>ขอราคาตรวจสอบบัญชี</h3>

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
        <label htmlFor="au-website">Website</label>
        <input
          id="au-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="au-name">ชื่อ-นามสกุล *</label>
          <input
            id="au-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="au-tel">เบอร์โทร *</label>
          <input
            id="au-tel"
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
          <label htmlFor="au-type">ประเภทกิจการ</label>
          <select
            id="au-type"
            value={formData.entityType}
            onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
            disabled={loading}
          >
            {ENTITY_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="au-rev">รายได้ต่อปีโดยประมาณ</label>
          <select
            id="au-rev"
            value={formData.revenue}
            onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
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

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="au-fye">วันสิ้นรอบบัญชี</label>
          <select
            id="au-fye"
            value={formData.fiscalYearEnd}
            onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
            disabled={loading}
          >
            {FISCAL_YEAR_ENDS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="au-ready">งบการเงินพร้อมหรือยัง</label>
          <select
            id="au-ready"
            value={formData.readiness}
            onChange={(e) => setFormData({ ...formData, readiness: e.target.value })}
            disabled={loading}
          >
            {READINESS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="au-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="au-msg"
          rows={3}
          placeholder="เช่น ต้องการรายงานผู้สอบบัญชีก่อนประชุมผู้ถือหุ้นปลายเมษายน"
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
        <Send size={16} aria-hidden="true" />
        <span>{loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรับใบเสนอราคา'}</span>
      </button>

      <p className="ma-quote-form__note">
        ใช้ข้อมูลนี้เพื่อติดต่อกลับและประเมินราคาเท่านั้น
      </p>
    </form>
  );
}
