'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="admin-page-state" role="alert">
      <AlertCircle aria-hidden="true" size={32} />
      <h1>เปิดหน้านี้ไม่สำเร็จ</h1>
      <p>ข้อมูลยังไม่ได้ถูกเปลี่ยนแปลง ลองโหลดหน้าอีกครั้ง หรือติดต่อผู้ดูแลระบบหากยังพบปัญหา</p>
      <button type="button" className="admin-primary-button" onClick={reset}><RotateCcw aria-hidden="true" size={17} /> ลองอีกครั้ง</button>
    </section>
  );
}
