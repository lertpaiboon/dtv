'use client';

import React, { useState, useEffect } from 'react';
import { Check, Send } from 'lucide-react';

interface QuickLineCopyProps {
  companyName: string;
  contactName?: string | null;
  totalAmount: number;
  agingDays?: number;
  bankInfo?: string | null;
  lineTemplate?: string | null;
}

const DEFAULT_BANK_INFO = `ธนาคารกสิกรไทย (KBANK)
เลขที่บัญชี: 055-8-12345-6
ชื่อบัญชี: บจก. ดีถาวรการบัญชี`;

export default function QuickLineCopy({
  companyName,
  contactName,
  totalAmount,
  agingDays,
  bankInfo: initialBankInfo,
  lineTemplate: initialLineTemplate,
}: QuickLineCopyProps) {
  const [copied, setCopied] = useState(false);
  const [bankInfo, setBankInfo] = useState<string | null>(initialBankInfo || null);
  const [lineTemplate, setLineTemplate] = useState<string | null>(initialLineTemplate || null);

  useEffect(() => {
    if (initialBankInfo !== undefined) setBankInfo(initialBankInfo);
  }, [initialBankInfo]);

  useEffect(() => {
    if (initialLineTemplate !== undefined) setLineTemplate(initialLineTemplate);
  }, [initialLineTemplate]);

  useEffect(() => {
    if (!initialBankInfo && !initialLineTemplate) {
      fetch('/api/admin/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            if (data.data.company_bank_info) setBankInfo(data.data.company_bank_info);
            if (data.data.billing_line_template) setLineTemplate(data.data.billing_line_template);
          }
        })
        .catch(() => null);
    }
  }, [initialBankInfo, initialLineTemplate]);

  function handleCopy() {
    const formattedAmount = new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(totalAmount);

    const contactHeader = contactName ? `คุณ${contactName}` : 'ฝ่ายการเงิน';
    const agingText = agingDays && agingDays > 0 ? ` (ค้างชำระ ${agingDays} วัน)` : '';
    const bankStr = bankInfo && bankInfo.trim() ? bankInfo.trim() : DEFAULT_BANK_INFO;

    let message = '';
    if (lineTemplate && lineTemplate.trim()) {
      message = lineTemplate
        .replace(/\{companyName\}/g, companyName)
        .replace(/\{contactHeader\}/g, contactHeader)
        .replace(/\{monthYear\}/g, 'ยอดค้างรับสะสม')
        .replace(/\{taxList\}/g, `- ยอดรวมสำรองจ่ายภาษีคงค้างสะสม${agingText}: ${formattedAmount}`)
        .replace(/\{totalAmount\}/g, formattedAmount)
        .replace(/\{bankAccount\}/g, bankStr);
    } else {
      message = `เรียน ${contactHeader} (${companyName})

สำนักงานบัญชีดีถาวร ขอแจ้งสรุปยอดเงินทดรองจ่ายภาษีคงค้าง${agingText} ดังนี้ค่ะ:
- ยอดรวมสำรองจ่ายทั้งสิ้น: ${formattedAmount}

ท่านสามารถชำระคืนเงินทดรองจ่ายภาษีได้ที่บัญชี:
${bankStr}

เมื่อท่านดำเนินการเรียบร้อยแล้ว สามารถส่งสลิปแจ้งกลับทางนี้ได้เลยนะคะ ทางสำนักงานจะรีบนำส่งใบเสร็จรับเงินจากกรมสรรพากรให้ท่านต่อไปค่ะ

หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม แจ้งได้ตลอดนะคะ
ขอบพระคุณที่ไว้วางใจให้ดีถาวรการบัญชีดูแลค่ะ 🙏`;
    }

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
