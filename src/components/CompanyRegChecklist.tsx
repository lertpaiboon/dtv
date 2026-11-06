'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const COMPANY_REG_DOC_LABELS = [
  'ชื่อบริษัทที่ต้องการ (เตรียมชื่อสำรอง 2–3 ชื่อ)',
  'ที่อยู่สำนักงานใหญ่ และเอกสารสถานที่ตั้ง',
  'วัตถุประสงค์ในการประกอบธุรกิจ',
  'ทุนจดทะเบียนและจำนวนหุ้น',
  'ข้อมูลผู้เริ่มก่อการและผู้ถือหุ้น (อย่างน้อย 2 คน)',
  'ข้อมูลกรรมการและอำนาจลงนาม',
  'ผู้สอบบัญชีที่จะแต่งตั้ง',
  'บัตรประชาชนหรือพาสปอร์ตของผู้เกี่ยวข้อง',
] as const;

export default function CompanyRegChecklist() {
  const [checks, setChecks] = useState<boolean[]>(() => COMPANY_REG_DOC_LABELS.map(() => false));
  const [copied, setCopied] = useState(false);

  const toggleItem = (idx: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleCopy = async () => {
    const text =
      'เอกสารเตรียมจดทะเบียนบริษัท\n' +
      COMPANY_REG_DOC_LABELS.map((label, idx) => `${idx + 1}. ${label}`).join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback ignored if clipboard permission denied
    }
  };

  const doneCount = checks.filter(Boolean).length;
  const pct = Math.round((doneCount / COMPANY_REG_DOC_LABELS.length) * 100);

  return (
    <div className="afs-checklist">
      <div className="afs-checklist__head">
        <h3>เช็กลิสต์เตรียมจดบริษัท</h3>
        <span className="afs-checklist__counter" aria-live="polite">
          {doneCount}/{COMPANY_REG_DOC_LABELS.length} รายการ
        </span>
      </div>

      <div className="afs-checklist__progress" aria-hidden="true">
        <div className="afs-checklist__progress-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="afs-checklist__items">
        {COMPANY_REG_DOC_LABELS.map((label, idx) => {
          const isChecked = checks[idx];
          const inputId = `rdoc-${idx}`;
          return (
            <label
              key={label}
              htmlFor={inputId}
              className={`afs-checklist__item ${isChecked ? 'afs-checklist__item--done' : ''}`}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleItem(idx)}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>

      <div className="afs-checklist__foot">
        <span>ถ้ายังไม่มีผู้สอบบัญชี ทีมช่วยประสานให้ได้</span>
        <button type="button" className="afs-checklist__copy-btn" onClick={handleCopy}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรายการเอกสาร'}</span>
        </button>
      </div>
    </div>
  );
}
