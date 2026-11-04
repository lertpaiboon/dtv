'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const ENTITY_TYPES = ['บริษัทจำกัด', 'ห้างหุ้นส่วนจำกัด', 'อื่นๆ'] as const;

const FYE_OPTIONS = ['31 ธันวาคม', 'วันอื่น', 'ไม่แน่ใจ'] as const;

const ACCOUNT_STATUSES = [
  'ทำบัญชีรายเดือนกับดีถาวรอยู่แล้ว',
  'ทำบัญชีเอง ลงไว้ครบ',
  'มีสำนักงานบัญชีเดิม',
  'ยังไม่ได้ลงบัญชีเลย',
] as const;

const initialState = {
  fullName: '',
  phone: '',
  entityType: 'บริษัทจำกัด',
  fiscalYearEnd: '31 ธันวาคม',
  accountStatus: 'ทำบัญชีรายเดือนกับดีถาวรอยู่แล้ว',
  message: '',
};

export default function AnnualQuoteForm() {
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
        `[ขอราคาปิดงบการเงินประจำปี]`,
        `• ประเภทกิจการ: ${formData.entityType}`,
        `• วันสิ้นรอบบัญชี: ${formData.fiscalYearEnd}`,
        `• สถานะบัญชีปัจจุบัน: ${formData.accountStatus}`,
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
          serviceType: 'รับปิดงบการเงิน',
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับเพื่อประเมินราคาภายใน 1 วันทำการครับ',
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
      <h3>ขอราคาปิดงบการเงิน</h3>

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
        <label htmlFor="afs-website">Website</label>
        <input
          id="afs-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="a-name">ชื่อ-นามสกุล *</label>
          <input
            id="a-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="a-tel">เบอร์โทร *</label>
          <input
            id="a-tel"
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
          <label htmlFor="a-type">ประเภทกิจการ</label>
          <select
            id="a-type"
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
          <label htmlFor="a-fye">วันสิ้นรอบบัญชี</label>
          <select
            id="a-fye"
            value={formData.fiscalYearEnd}
            onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
            disabled={loading}
          >
            {FYE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="a-status">บัญชีตอนนี้เป็นอย่างไร</label>
        <select
          id="a-status"
          value={formData.accountStatus}
          onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
          disabled={loading}
        >
          {ACCOUNT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="a-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="a-msg"
          rows={3}
          placeholder="เช่น บริษัทเปิดปี 2568 ยังไม่เคยปิดงบ มีพนักงาน 4 คน"
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
