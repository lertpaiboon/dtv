'use client';

import { useState } from 'react';

const VAT_QUICK_OPTIONS = [
  {
    label: 'รายรับเกิน 1.8 ล้านแล้ว',
    title: 'ต้องจด VAT ภายใน 30 วัน',
    body: 'นับจากวันที่รายรับเกิน 1.8 ล้านบาท ถ้าเลยกำหนดมีเบี้ยปรับ ติดต่อเราให้เริ่มเตรียมเอกสารวันนี้',
  },
  {
    label: 'รายรับใกล้ 1.8 ล้าน',
    title: 'ควรเตรียมไว้ก่อน',
    body: 'ติดตามยอดรายเดือน และเตรียมเอกสารล่วงหน้า พอเกินเกณฑ์จะจดได้ทันใน 30 วัน',
  },
  {
    label: 'รายรับยังน้อย แต่ลูกค้าขอใบกำกับภาษี',
    title: 'จดโดยสมัครใจได้',
    body: 'ถ้ากิจการอยู่ในระบบ VAT จดได้ แต่ต้องยื่น ภ.พ.30 ทุกเดือน ควรคุยเรื่องความคุ้มค่าก่อน',
  },
  {
    label: 'ยังไม่ได้จดบริษัท',
    title: 'เริ่มจากจดบริษัทก่อน',
    body: 'จดทะเบียนบริษัทให้เสร็จ แล้วค่อยดูเรื่อง VAT เราดูแลทั้งสองงานได้',
  },
] as const;

export default function VatQuickCheck() {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const selected = selectedIndex >= 0 ? VAT_QUICK_OPTIONS[selectedIndex] : null;

  return (
    <div className="vreg-quick-check">
      <h3>เช็กเร็ว: ธุรกิจของคุณต้องจด VAT ไหม</h3>
      <span className="vreg-quick-check__sub">เลือกข้อที่ตรงกับคุณที่สุด</span>

      <div className="vreg-quick-check__btns">
        {VAT_QUICK_OPTIONS.map((opt, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={opt.label}
              type="button"
              className={`vreg-quick-check__btn ${isSelected ? 'vreg-quick-check__btn--active' : ''}`}
              aria-pressed={isSelected}
              onClick={() => setSelectedIndex(idx)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="vreg-quick-check__result" aria-live="polite">
        <strong>{selected ? selected.title : 'เลือกสถานการณ์ด้านบน'}</strong>
        <span>{selected ? selected.body : 'แล้วเราจะบอกว่าควรทำอะไรต่อ'}</span>
      </div>
    </div>
  );
}
