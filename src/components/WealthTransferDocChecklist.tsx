'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const WEALTH_DOC_LABELS = [
  'บัตรประชาชน ทะเบียนบ้าน และทะเบียนสมรส',
  'รายชื่อทายาทและผู้ที่ต้องการดูแล',
  'โฉนดที่ดินและเอกสารบ้าน',
  'สมุดบัญชีเงินฝาก หุ้น และกองทุน',
  'หนังสือรับรองบริษัทและบัญชีรายชื่อผู้ถือหุ้น (บอจ.5)',
  'กรมธรรม์ประกันชีวิตที่มีอยู่',
  'รายการหนี้สินและภาระค้ำประกัน',
  'พินัยกรรมฉบับเดิม (ถ้ามี)',
] as const;

export default function WealthTransferDocChecklist() {
  const [checks, setChecks] = useState<boolean[]>(() => WEALTH_DOC_LABELS.map(() => false));
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
      'เอกสารที่ควรเตรียมก่อนวางแผนมรดก\n' +
      WEALTH_DOC_LABELS.map((label, idx) => `${idx + 1}. ${label}`).join('\n');

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
  const pct = Math.round((doneCount / WEALTH_DOC_LABELS.length) * 100);

  return (
    <div className="afs-checklist">
      <div className="afs-checklist__head">
        <h3>เช็กลิสต์เอกสารเบื้องต้น</h3>
        <span className="afs-checklist__counter" aria-live="polite">
          {doneCount}/{WEALTH_DOC_LABELS.length} รายการ
        </span>
      </div>

      <div className="afs-checklist__progress" aria-hidden="true">
        <div className="afs-checklist__progress-bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="afs-checklist__items">
        {WEALTH_DOC_LABELS.map((label, idx) => {
          const isChecked = checks[idx];
          const inputId = `wt-doc-${idx}`;
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
        <span>เอกสารจริงขึ้นกับทรัพย์สินที่มี</span>
        <button type="button" className="afs-checklist__copy-btn" onClick={handleCopy}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรายการเอกสาร'}</span>
        </button>
      </div>
    </div>
  );
}
