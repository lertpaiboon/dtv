import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #f0f6fd 0%, #ffffff 100%)',
      padding: '60px 24px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '560px',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '50px 36px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 800,
          color: 'var(--primary)',
          lineHeight: 1,
          marginBottom: '16px',
          letterSpacing: '-0.03em'
        }} className="gradient-text">
          404
        </div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--primary)',
          marginBottom: '12px'
        }}>
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          marginBottom: '32px'
        }}>
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือคุณอาจพิมพ์ URL ไม่ถูกต้อง กรุณากลับสู่หน้าหลักหรือติดต่อทีมงานดีถาวรการบัญชี
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <Home size={18} />
            <span>กลับสู่หน้าแรก</span>
          </Link>
          <Link href="/#contact" className="btn btn-secondary" style={{ padding: '12px 22px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent)' }} />
            <span>ติดต่อเรา</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
