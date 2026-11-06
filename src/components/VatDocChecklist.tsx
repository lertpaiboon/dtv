'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const VAT_DOC_LABELS = [
  'หนังสือรับรองบริษัท และข้อมูลบริษัท',
  'ข้อมูลกรรมการหรือผู้มีอำนาจลงนาม',
  'เอกสารสิทธิใช้สถานที่ เช่น สัญญาเช่า หรือหนังสือยินยอม',
  'ที่ตั้งและแผนที่สถานประกอบการ',
  'รูปถ่ายสถานประกอบการตามที่กำหนด',
  'ข้อมูลลักษณะการประกอบกิจการ',
  'หนังสือมอบอำนาจและเอกสารผู้รับมอบ (ถ้ามี)',
  'เอกสารอื่นที่กรมสรรพากรขอเพิ่ม',
] as const;

export default function VatDocChecklist() {
  const [checks, setChecks] = useState<boolean[]>(() => VAT_DOC_LABELS.map(() => false));
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
      'เอกสารจดทะเบียน VAT\n' +
      VAT_DOC_LABELS.map((label, idx) => `${idx + 1}. ${label}`).join('\n');

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
  const pct = Math.round((doneCount / VAT_DOC_LABELS.length) * 100);

  return (
    <div className="afs-checklist">
      <div className="afs-checklist__head">
        <h3>เช็กลิสต์เอกสารจด VAT</h3>
        <span className="afs-checklist__counter" aria-live="polite">
          {doneCount}/{VAT_DOC_LABELS.length} รายการ
        </span>
      </div>

      <div className="afs-checklist__progress" aria-hidden="true">
        <div className="afs-checklist__progress-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="afs-checklist__items">
        {VAT_DOC_LABELS.map((label, idx) => {
          const isChecked = checks[idx];
          const inputId = `vdoc-${idx}`;
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
        <span>ตรวจรายการล่าสุดกับกรมสรรพากรก่อนยื่นจริง</span>
        <button type="button" className="afs-checklist__copy-btn" onClick={handleCopy}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรายการเอกสาร'}</span>
        </button>
      </div>
    </div>
  );
}
