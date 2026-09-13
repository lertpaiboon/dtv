'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, LockKeyhole } from 'lucide-react';

function safeAdminRedirect(value: string | null) {
  return value && /^\/admin(?:\/|$)/.test(value) && !value.startsWith('//') ? value : '/admin';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        setError(data?.error || 'ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง');
        return;
      }

      router.replace(safeAdminRedirect(searchParams.get('redirect')));
      router.refresh();
    } catch {
      setError('เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login__intro" aria-labelledby="login-title">
        <Image
          src="/images/DTV%20LOGO.png"
          alt="ดีถาวรการบัญชี"
          width={320}
          height={180}
          className="admin-login__logo"
          priority
        />
        <p className="admin-login__eyebrow">ระบบงานภาษีสำหรับเจ้าหน้าที่</p>
        <h1 id="login-title">จัดการทุกงวดภาษี<br />ในที่เดียว</h1>
        <p className="admin-login__summary">
          บันทึกเงินทดรอง ติดตามการวางบิล และตรวจสอบยอดรับคืนของลูกค้าอย่างเป็นระบบ
        </p>
        <div className="admin-login__trust">
          <LockKeyhole aria-hidden="true" size={18} />
          <span>ข้อมูลนี้ใช้ภายในสำนักงานเท่านั้น</span>
        </div>
      </section>

      <section className="admin-login__panel" aria-label="เข้าสู่ระบบ">
        <div className="admin-login__panel-head">
          <p>ยินดีต้อนรับ</p>
          <h2>เข้าสู่ระบบหลังบ้าน</h2>
          <span>ใช้บัญชีเจ้าหน้าที่ที่ได้รับอนุญาต</span>
        </div>

        {error && (
          <div className="admin-alert admin-alert--error" role="alert" aria-live="assertive">
            <AlertCircle aria-hidden="true" size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="admin-field">
            <label htmlFor="admin-email">อีเมลเจ้าหน้าที่</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              placeholder="name@company.com"
              required
              autoFocus
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">รหัสผ่าน</label>
            <div className="admin-password-field">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </div>
          </div>

          <button className="admin-primary-button" type="submit" disabled={loading}>
            {loading ? <span className="admin-spinner" aria-hidden="true" /> : null}
            {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="admin-login__help">หากเข้าใช้งานไม่ได้ กรุณาติดต่อผู้ดูแลระบบของสำนักงาน</p>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="admin-login admin-login--loading">กำลังโหลด…</main>}>
      <LoginForm />
    </Suspense>
  );
}
