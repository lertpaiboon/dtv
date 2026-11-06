'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

const ASSET_OPTIONS = [
  'หุ้นบริษัท / ธุรกิจครอบครัว',
  'บ้านและที่ดิน',
  'เงินฝาก หุ้น กองทุน',
  'หลายประเภทรวมกัน',
] as const;

const CONCERN_OPTIONS = [
  'ภาษีมรดกและภาษีการให้',
  'แบ่งให้ลูกอย่างเป็นธรรม',
  'ส่งต่อธุรกิจ',
  'ประกันชีวิตเพื่อวางแผนมรดก',
] as const;

const MODE_OPTIONS = ['ที่สำนักงาน', 'ออนไลน์', 'โทรศัพท์'] as const;

const initialState = {
  fullName: '',
  phone: '',
  assets: 'หุ้นบริษัท / ธุรกิจครอบครัว',
  concern: 'ภาษีมรดกและภาษีการให้',
  mode: 'ที่สำนักงาน',
  message: '',
};

export default function WealthTransferQuoteForm() {
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
        `[นัดปรึกษาวางแผนมรดกและภาษี]`,
        `• ทรัพย์สินหลักที่อยากวางแผน: ${formData.assets}`,
        `• กังวลเรื่องไหนที่สุด: ${formData.concern}`,
        `• สะดวกคุยแบบไหน: ${formData.mode}`,
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
          serviceType: 'วางแผนมรดกและภาษี',
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
        message: 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับภายใน 1 วันทำการเพื่อนัดวันพูดคุยครับ',
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
      <h3>นัดปรึกษาวางแผนมรดก</h3>

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
        <label htmlFor="wt-website">Website</label>
        <input
          id="wt-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="w-name">ชื่อ-นามสกุล *</label>
          <input
            id="w-name"
            type="text"
            required
            placeholder="สมชาย ใจดี"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="w-tel">เบอร์โทร *</label>
          <input
            id="w-tel"
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
        <label htmlFor="w-assets">ทรัพย์สินหลักที่อยากวางแผน</label>
        <select
          id="w-assets"
          value={formData.assets}
          onChange={(e) => setFormData({ ...formData, assets: e.target.value })}
          disabled={loading}
        >
          {ASSET_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="ma-quote-form__row">
        <div className="ma-quote-form__field">
          <label htmlFor="w-topic">กังวลเรื่องไหนที่สุด</label>
          <select
            id="w-topic"
            value={formData.concern}
            onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
            disabled={loading}
          >
            {CONCERN_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="ma-quote-form__field">
          <label htmlFor="w-mode">สะดวกคุยแบบไหน</label>
          <select
            id="w-mode"
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
      </div>

      <div className="ma-quote-form__field">
        <label htmlFor="w-msg">เล่าเพิ่มเติม (ไม่บังคับ)</label>
        <textarea
          id="w-msg"
          rows={3}
          placeholder="เช่น มีบริษัท 1 แห่งและที่ดิน 3 แปลง ลูก 2 คน อยากให้ลูกคนโตดูแลบริษัทต่อ"
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

      <p className="ma-quote-form__note">
        ข้อมูลครอบครัวและทรัพย์สินเก็บเป็นความลับ ใช้เพื่อติดต่อกลับเท่านั้น
      </p>
    </form>
  );
}
