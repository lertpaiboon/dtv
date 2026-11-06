'use client';

import { useState } from 'react';

const AMENDMENT_OPTIONS = [
  'เปลี่ยนกรรมการ',
  'ย้ายที่อยู่',
  'เปลี่ยนชื่อบริษัท',
  'เพิ่ม/ลดทุน',
  'แก้วัตถุประสงค์',
  'อื่นๆ',
];

export default function CompanyAmendmentQuoteForm() {
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['เปลี่ยนกรรมการ']);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const topicsText =
        selectedTopics.length > 0 ? selectedTopics.join(', ') : 'ยังไม่ระบุเรื่องที่ต้องการแก้';

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName.trim(),
          phone: phone.trim(),
          service: 'แก้ไขเปลี่ยนแปลงข้อมูลบริษัท (/services/company-amendment)',
          message: [
            `ชื่อบริษัท: ${companyName.trim()}`,
            `ต้องการแก้เรื่อง: ${topicsText}`,
            notes.trim() ? `รายละเอียดเพิ่มเติม: ${notes.trim()}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถส่งข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาติดต่อทางโทรศัพท์หรือ LINE',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="ma-quote-form ma-quote-form--success" role="status" aria-live="polite">
        <h3>ได้รับข้อมูลขอใบเสนอราคาแก้ไขข้อมูลบริษัทเรียบร้อยแล้ว</h3>
        <p>
          ทีมงานดีถาวรจะติดต่อกลับภายใน 1 วันทำการ พร้อมสรุปมติที่ต้องใช้
          วันที่ต้องยื่นให้ทันกำหนด และแจ้งค่าบริการล่วงหน้าครับ
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSubmitted(false);
            setCompanyName('');
            setPhone('');
            setSelectedTopics(['เปลี่ยนกรรมการ']);
            setNotes('');
          }}
        >
          ส่งข้อมูลเพิ่มเติม
        </button>
      </div>
    );
  }

  return (
    <form className="ma-quote-form" onSubmit={handleSubmit}>
      <h3>ขอราคาแก้ไขข้อมูลบริษัท</h3>

      <div className="ma-quote-form__row">
        <label className="ma-quote-form__field">
          <span>ชื่อบริษัท *</span>
          <input
            type="text"
            required
            placeholder="บริษัท ตัวอย่าง จำกัด"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </label>

        <label className="ma-quote-form__field">
          <span>เบอร์โทร *</span>
          <input
            type="tel"
            required
            placeholder="081-234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>

      <fieldset className="camd-quote-form__fieldset">
        <legend>ต้องการแก้เรื่องไหน (เลือกได้หลายข้อ)</legend>
        <div className="camd-quote-form__checks">
          {AMENDMENT_OPTIONS.map((option) => (
            <label key={option} className="camd-quote-form__check-label">
              <input
                type="checkbox"
                checked={selectedTopics.includes(option)}
                onChange={() => toggleTopic(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="ma-quote-form__field">
        <span>เล่าเพิ่มเติม (ไม่บังคับ)</span>
        <textarea
          rows={3}
          placeholder="เช่น ย้ายสำนักงานไปจังหวัดนนทบุรีต้นเดือนหน้า"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {errorMsg && (
        <p className="ma-quote-form__error" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary btn-large ma-quote-form__submit"
      >
        {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรับใบเสนอราคา'}
      </button>

      <p className="ma-quote-form__note">ใช้ข้อมูลนี้เพื่อติดต่อกลับและประเมินราคาเท่านั้น</p>
    </form>
  );
}
