'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CONSULTING_DOC_LABELS = [
  'หนังสือรับรองบริษัท และข้อมูลกิจการโดยย่อ',
  'งบการเงินปีล่าสุดและงบทดลองปัจจุบัน',
  'สรุปรายได้และค่าใช้จ่ายหลักของปีนี้',
  'แบบภาษีที่ยื่นไปแล้ว (ภ.พ.30 / ภ.ง.ด. / ภ.ง.ด.50)',
  'ใบกำกับภาษีและหนังสือรับรองหัก ณ ที่จ่ายที่เกี่ยวข้อง',
  'สัญญาหรือเอกสารของธุรกรรมที่อยากปรึกษา',
  'หนังสือจากกรมสรรพากร (ถ้ามี)',
  'คำถามที่อยากถาม จดไว้เป็นข้อๆ',
] as const;

export default function TaxConsultingDocChecklist() {
  const [checks, setChecks] = useState<boolean[]>(() => CONSULTING_DOC_LABELS.map(() => false));
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
      'เอกสารที่ควรเตรียมก่อนปรึกษาภาษี\n' +
      CONSULTING_DOC_LABELS.map((label, idx) => `${idx + 1}. ${label}`).join('\n');

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
  const pct = Math.round((doneCount / CONSULTING_DOC_LABELS.length) * 100);

  return (
    <div className="afs-checklist">
      <div className="afs-checklist__head">
        <h3>เช็กลิสต์เอกสารเบื้องต้น</h3>
        <span className="afs-checklist__counter" aria-live="polite">
          {doneCount}/{CONSULTING_DOC_LABELS.length} รายการ
        </span>
      </div>

      <div className="afs-checklist__progress" aria-hidden="true">
        <div className="afs-checklist__progress-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="afs-checklist__items">
        {CONSULTING_DOC_LABELS.map((label, idx) => {
          const isChecked = checks[idx];
          const inputId = `tc-doc-${idx}`;
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
        <span>เอกสารจริงขึ้นกับเรื่องที่ปรึกษา</span>
        <button type="button" className="afs-checklist__copy-btn" onClick={handleCopy}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรายการเอกสาร'}</span>
        </button>
      </div>
    </div>
  );
}
