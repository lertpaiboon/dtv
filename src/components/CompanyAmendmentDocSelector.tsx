'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface AmendmentDocType {
  label: string;
  resolution: string;
  due: string;
  note: string;
  docs: string[];
  notify: string;
}

const AMENDMENT_TYPES: AmendmentDocType[] = [
  {
    label: 'เปลี่ยนกรรมการ',
    resolution: 'มติที่ประชุมผู้ถือหุ้น',
    due: '14 วันนับจากวันลงมติ',
    note: 'ถ้าเปลี่ยนอำนาจกรรมการผู้ลงนามด้วย ต้องระบุในคำขอเดียวกัน',
    docs: [
      'รายงานการประชุมที่มีมติแต่งตั้งหรือถอดถอน',
      'หนังสือลาออกของกรรมการ (ถ้ามี)',
      'สำเนาบัตรประชาชนกรรมการใหม่',
      'คำขอจดทะเบียนเปลี่ยนแปลง',
    ],
    notify: 'ธนาคาร (ผู้มีอำนาจลงนามในบัญชี)',
  },
  {
    label: 'ย้ายที่อยู่',
    resolution: 'ในจังหวัดเดิม: ตามข้อบังคับ · ข้ามจังหวัด: มติพิเศษ',
    due: '14 วัน (กรณีมติพิเศษ)',
    note: 'ย้ายข้ามจังหวัดต้องแก้หนังสือบริคณห์สนธิ จึงใช้มติพิเศษ',
    docs: [
      'รายงานการประชุมหรือมติกรรมการ',
      'สำเนาทะเบียนบ้าน หรือสัญญาเช่าที่ตั้งใหม่',
      'หนังสือยินยอมให้ใช้สถานที่',
      'แผนที่ที่ตั้งสำนักงานใหม่',
    ],
    notify: 'สรรพากร (ถ้าจด VAT ต้องแจ้งล่วงหน้าไม่น้อยกว่า 15 วัน), ประกันสังคม, ธนาคาร',
  },
  {
    label: 'เปลี่ยนชื่อบริษัท',
    resolution: 'มติพิเศษ',
    due: '14 วันนับจากวันลงมติ',
    note: 'ต้องจองชื่อใหม่ให้ผ่านก่อนประชุม เลขนิติบุคคลยังเป็นเลขเดิม',
    docs: [
      'ผลการจองชื่อใหม่',
      'หนังสือนัดประชุมและรายงานการประชุม',
      'หนังสือบริคณห์สนธิฉบับแก้ไข',
      'คำขอจดทะเบียนเปลี่ยนแปลง',
    ],
    notify: 'สรรพากร, ธนาคาร, คู่ค้า, ป้ายและเอกสารบริษัท',
  },
  {
    label: 'เพิ่ม/ลดทุน',
    resolution: 'มติพิเศษ',
    due: '14 วันนับจากวันลงมติ (เพิ่มทุน)',
    note: 'ลดทุนมีขั้นตอนแจ้งเจ้าหนี้และโฆษณาเพิ่ม ใช้เวลานานกว่า',
    docs: [
      'หนังสือนัดประชุมและรายงานการประชุม',
      'หลักฐานการชำระค่าหุ้นเพิ่ม',
      'บัญชีรายชื่อผู้ถือหุ้นฉบับใหม่',
      'คำขอจดทะเบียนเปลี่ยนแปลงทุน',
    ],
    notify: 'บันทึกบัญชีทุน และแจ้งผู้สอบบัญชี',
  },
  {
    label: 'แก้วัตถุประสงค์',
    resolution: 'มติพิเศษ',
    due: '14 วันนับจากวันลงมติ',
    note: 'ควรแก้ก่อนเริ่มทำธุรกิจใหม่ที่ไม่อยู่ในวัตถุประสงค์เดิม',
    docs: [
      'หนังสือนัดประชุมและรายงานการประชุม',
      'วัตถุประสงค์ฉบับใหม่',
      'คำขอจดทะเบียนเปลี่ยนแปลง',
    ],
    notify: 'หน่วยงานออกใบอนุญาต (ถ้าเป็นธุรกิจควบคุม)',
  },
  {
    label: 'แก้ข้อบังคับ',
    resolution: 'มติพิเศษ',
    due: '14 วันนับจากวันลงมติ',
    note: 'เช่น เปลี่ยนเงื่อนไขการโอนหุ้น หรือจำนวนกรรมการ',
    docs: [
      'หนังสือนัดประชุมและรายงานการประชุม',
      'ข้อบังคับฉบับแก้ไข',
      'คำขอจดทะเบียนเปลี่ยนแปลง',
    ],
    notify: 'ขึ้นกับเรื่องที่แก้',
  },
];

export default function CompanyAmendmentDocSelector() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const current = AMENDMENT_TYPES[selectedIndex];

  return (
    <div className="camd-doc-selector">
      <div className="camd-doc-selector__header">
        <h3>เลือกเรื่องที่ต้องการแก้ ดูเอกสาร มติ และกำหนดเวลา</h3>
        <div className="camd-doc-selector__tabs" role="tablist" aria-label="ประเภทการแก้ไขข้อมูลบริษัท">
          {AMENDMENT_TYPES.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`camd-doc-selector__tab ${isSelected ? 'camd-doc-selector__tab--active' : ''}`}
                onClick={() => setSelectedIndex(idx)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="camd-doc-selector__body" aria-live="polite">
        <div className="camd-doc-selector__meta">
          <div className="camd-doc-selector__meta-cards">
            <div className="camd-doc-selector__meta-card">
              <span>มติที่ใช้</span>
              <strong>{current.resolution}</strong>
            </div>
            <div className="camd-doc-selector__meta-card camd-doc-selector__meta-card--due">
              <span>ต้องจดภายใน</span>
              <strong>{current.due}</strong>
            </div>
          </div>
          <p className="camd-doc-selector__note">{current.note}</p>
        </div>

        <div className="camd-doc-selector__docs">
          <span className="camd-doc-selector__docs-title">เอกสารสำคัญ</span>
          <ul className="camd-doc-selector__docs-list">
            {current.docs.map((doc) => (
              <li key={doc}>
                <Check size={18} aria-hidden="true" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
          <p className="camd-doc-selector__notify">
            <strong>แจ้งต่อ:</strong> {current.notify}
          </p>
        </div>
      </div>

      <p className="camd-doc-selector__disclaimer">
        เป็นตัวอย่างเอกสารสำหรับกรณีทั่วไป รายการเอกสารจริงอาจแตกต่างกันตามข้อบังคับของบริษัทและแนวทางของกรมพัฒนาธุรกิจการค้า (DBD)
        ทีมงานจะตรวจเช็กรายการที่ต้องใช้ให้ก่อนเริ่มงาน
      </p>
    </div>
  );
}
