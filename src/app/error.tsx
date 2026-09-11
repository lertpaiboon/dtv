'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for diagnostics
    console.error('Unhandled Application Error:', error);
  }, [error]);

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
        border: '1px solid #fee2e2',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#dc2626'
        }}>
          <AlertTriangle size={32} />
        </div>

        <h1 style={{
          fontSize: '1.7rem',
          fontWeight: 800,
          color: 'var(--primary)',
          marginBottom: '12px'
        }}>
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </h1>

        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          marginBottom: '32px'
        }}>
          ขออภัยในความไม่สะดวก ระบบพบปัญหาชั่วคราวในการประมวลผล กรุณาลองโหลดใหม่อีกครั้ง หรือกลับสู่หน้าหลัก
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <RefreshCw size={18} />
            <span>ลองใหม่อีกครั้ง</span>
          </button>
          <Link href="/" className="btn btn-secondary" style={{ padding: '12px 22px' }}>
            <Home size={18} style={{ color: 'var(--accent)' }} />
            <span>กลับหน้าแรก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
