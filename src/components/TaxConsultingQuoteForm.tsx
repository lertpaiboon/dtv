'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const TOPIC_OPTIONS = [
  'วางแผนภาษีทั้งปี',
  'ได้รับหนังสือจากสรรพากร',
  'ยื่นภาษีผิดหรือยื่นช้า',
  'VAT / ภาษีซื้อภาษีขาย',
  'ภาษีหัก ณ ที่จ่าย',
  'จะเปิดบริษัทหรือเปลี่ยนโครงสร้างธุรกิจ',
  'เรื่องอื่น',
] as const;

const MODE_OPTIONS = ['ปรึกษาครั้งเดียว', 'ปรึกษาต่อเนื่อง', 'ยังไม่แน่ใจ'] as const;

const URGENT_OPTIONS = ['ไม่มี', 'ภายใน 7 วัน', 'ภายในเดือนนี้'] as const;

const initialState = {
  fullName: '',
  phone: '',
  topic: 'วางแผนภาษีทั้งปี',
  mode: 'ปรึกษาครั้งเดียว',
  urgent: 'ไม่มี',
  message: '',
};

export default function TaxConsultingQuoteForm() {
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
        `[นัดปรึกษาภาษี]`,
        `• เรื่องที่อยากปรึกษา: ${formData.topic}`,
        `• รูปแบบที่สนใจ: ${formData.mode}`,
        `• กำหนดเวลาเร่งด่วน: ${formData.urgent}`,
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
          serviceType: 'ที่ปรึกษาภาษี',
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับภายใน 1 วันทำการเพื่อนัดวันและแจ้งราคาครับ',
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
      <h3>นัดปรึกษาภาษี</h3>

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
        <label htmlFor="tc-website">Website</label>
        <input
          id="tc-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="c-name">ชื่อ-นามสกุล *</label>
          <input
            id="c-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="c-tel">เบอร์โทร *</label>
          <input
            id="c-tel"
            type="tel"
            required
            placeholder="081-234-5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="c-topic">อยากปรึกษาเรื่อง</label>
        <select
          id="c-topic"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          disabled={loading}
        >
          {TOPIC_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="c-mode">รูปแบบที่สนใจ</label>
          <select
            id="c-mode"
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            disabled={loading}
          >
            {MODE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="c-urgent">มีกำหนดเวลาไหม</label>
          <select
            id="c-urgent"
            value={formData.urgent}
            onChange={(e) => setFormData({ ...formData, urgent: e.target.value })}
            disabled={loading}
          >
            {URGENT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="c-msg">เล่าเรื่องสั้นๆ (ไม่บังคับ)</label>
        <textarea
          id="c-msg"
          rows={3}
          placeholder="เช่น ได้หนังสือเชิญพบจากสรรพากรเรื่อง VAT ปี 2568 ต้องไปภายในสิ้นเดือน"
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
        <span>{loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อนัดปรึกษา'}</span>
      </button>

      <p className="ma-quote-form__note">ใช้ข้อมูลนี้เพื่อติดต่อกลับและประเมินราคาเท่านั้น</p>
    </form>
  );
}
