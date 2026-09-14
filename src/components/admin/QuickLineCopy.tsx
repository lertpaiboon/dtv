'use client';

import React, { useState } from 'react';
import { Check, Send } from 'lucide-react';

interface QuickLineCopyProps {
  companyName: string;
  contactName?: string | null;
  totalAmount: number;
  agingDays?: number;
}

export default function QuickLineCopy({
  companyName,
  contactName,
  totalAmount,
  agingDays,
}: QuickLineCopyProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const formattedAmount = new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(totalAmount);

    const contactHeader = contactName ? `คุณ${contactName}` : 'ฝ่ายการเงิน';
    const agingText = agingDays && agingDays > 0 ? ` (ค้างชำระ ${agingDays} วัน)` : '';

    const message = `เรียน ${contactHeader} (${companyName})

สำนักงานบัญชีดีถาวร ขอแจ้งสรุปยอดเงินทดรองจ่ายภาษีคงค้าง${agingText} ดังนี้ค่ะ:
- ยอดรวมสำรองจ่ายทั้งสิ้น: ${formattedAmount}

ท่านสามารถชำระคืนเงินทดรองจ่ายภาษีได้ที่บัญชี:
ธนาคารกสิกรไทย (KBANK)
เลขที่บัญชี: 055-8-12345-6
ชื่อบัญชี: บจก. ดีถาวรการบัญชี

เมื่อท่านดำเนินการเรียบร้อยแล้ว สามารถส่งสลิปแจ้งกลับทางนี้ได้เลยนะคะ ทางสำนักงานจะรีบนำส่งใบเสร็จรับเงินจากกรมสรรพากรให้ท่านต่อไปค่ะ

หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม แจ้งได้ตลอดนะคะ
ขอบพระคุณที่ไว้วางใจให้ดีถาวรการบัญชีดูแลค่ะ 🙏`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      className={`btn-line-copy ${copied ? 'btn-line-copy--copied' : ''}`}
      onClick={handleCopy}
      title="คัดลอกข้อความสรุปยอดส่งทาง LINE"
      style={{
        padding: '5px 9px',
        fontSize: '12px',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {copied ? (
        <>
          <Check size={13} />
          <span>คัดลอกแล้ว</span>
        </>
      ) : (
        <>
          <Send size={13} />
          <span>LINE</span>
        </>
      )}
    </button>
  );
}
