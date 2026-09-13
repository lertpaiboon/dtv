'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  ChevronRight,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Percent,
  PhoneCall,
  ReceiptText,
  Settings,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react';
import AdminModalController from '@/components/admin/AdminModalController';
import { AdminSessionProvider, type AdminSessionUser } from '@/components/admin/AdminSessionContext';
import '../admin.css';

const navItems = [
  { title: 'ภาพรวมงาน', href: '/admin', icon: LayoutDashboard, exact: true, group: 'พื้นที่ทำงาน' },
  { title: 'ทะเบียนลูกค้า', href: '/admin/companies', icon: Building2, permission: 'companies:view', group: 'ข้อมูลหลัก' },
  { title: 'ภ.ง.ด. 51', href: '/admin/tax-pnd51', icon: ReceiptText, permission: 'pnd51:view', group: 'รายการภาษี' },
  { title: 'ภาษีหัก ณ ที่จ่าย', href: '/admin/tax-wht', icon: FileSpreadsheet, permission: 'wht:view', group: 'รายการภาษี' },
  { title: 'ภาษีมูลค่าเพิ่ม', href: '/admin/tax-vat', icon: Percent, permission: 'vat:view', group: 'รายการภาษี' },
  { title: 'สรุปยอดวางบิล', href: '/admin/billing', icon: WalletCards, permissionAny: ['vat:view', 'wht:view', 'pnd51:view'], group: 'ติดตามลูกหนี้' },
  { title: 'ประวัติการติดตาม', href: '/admin/follow-ups', icon: PhoneCall, permission: 'followup:view', group: 'ติดตามลูกหนี้' },
  { title: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings, permission: '*', group: 'ดูแลระบบ' },
  { title: 'บทบาทและสิทธิ์', href: '/admin/roles', icon: ShieldCheck, permission: '*', group: 'ดูแลระบบ' },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [urgentCount, setUrgentCount] = useState<number>(0);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (user) return; // Session already loaded in memory, no need to re-query on every click!

    const controller = new AbortController();
    fetch('/api/admin/auth/me', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.user) throw new Error('Unauthenticated');
        setUser(data.user);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      });

    return () => {
      controller.abort();
    };
  }, [pathname, router, user]);

  useEffect(() => {
    if (pathname === '/admin/login' || !user) return;
    const canViewBilling = user.permissions.includes('*') || ['vat:view', 'wht:view', 'pnd51:view'].some((permission) => user.permissions.includes(permission));
    if (!canViewBilling) return;

    // Fetch urgent alerts for badge
    fetch('/api/admin/billing/alerts')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.urgentCount !== undefined) {
          setUrgentCount(res.data.urgentCount);
        }
      })
      .catch(() => null);
  }, [pathname, user]);

  const visibleItems = useMemo(() => {
    if (!user) return navItems.filter((item) => !('permission' in item) && !('permissionAny' in item));
    const can = (permission: string) => user.permissions.includes('*') || user.permissions.includes(permission);
    return navItems.filter((item) => {
      if ('permission' in item) return can(item.permission);
      if ('permissionAny' in item) return item.permissionAny.some(can);
      return true;
    });
  }, [user]);

  if (pathname === '/admin/login') return <>{children}</>;

  const currentTitle = navItems.find((item) => ('exact' in item && item.exact) ? pathname === item.href : pathname.startsWith(item.href))?.title || 'ระบบหลังบ้าน';

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <AdminSessionProvider user={user}>
      <div className="admin-shell">
        <a className="admin-skip-link" href="#admin-main-content">ข้ามไปยังเนื้อหาหลัก</a>
        <AdminModalController />
        {mobileOpen && (
        <button
          type="button"
          className="admin-shell__scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="ปิดเมนู"
        />
        )}

      <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar--open' : ''}`} aria-label="เมนูหลัก">
        <div className="admin-sidebar__brand">
          <Link href="/admin" onClick={() => setMobileOpen(false)}>
            <Image src="/images/DTV%20LOGO.png" alt="" width={64} height={42} priority />
            <span>
              <strong>ดีถาวรการบัญชี</strong>
              <small>ระบบงานภาษี</small>
            </span>
          </Link>
          <button type="button" className="admin-icon-button admin-sidebar__close" onClick={() => setMobileOpen(false)} aria-label="ปิดเมนู">
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {visibleItems.map((item, index) => {
            const previous = visibleItems[index - 1];
            const active = ('exact' in item && item.exact) ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <div key={item.href}>
                {(!previous || previous.group !== item.group) && <p className="admin-nav__group">{item.group}</p>}
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={active ? 'admin-nav__link admin-nav__link--active' : 'admin-nav__link'}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon aria-hidden="true" size={18} />
                  <span>{item.title}</span>
                  {item.href === '/admin/billing' && urgentCount > 0 && (
                    <span className="admin-nav__badge" title={`มี ${urgentCount} รายการนัดชำระ/เกินกำหนด`}>
                      {urgentCount}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user-card">
            <span className="admin-user-card__avatar" aria-hidden="true">{user?.fullName?.charAt(0) || '—'}</span>
            <span className="admin-user-card__identity">
              <strong>{user?.fullName || 'กำลังตรวจสอบสิทธิ์'}</strong>
              <small>{user?.roleName || '—'}</small>
            </span>
          </div>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut aria-hidden="true" size={17} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar__context">
            <button type="button" className="admin-icon-button admin-topbar__menu" onClick={() => setMobileOpen(true)} aria-label="เปิดเมนู">
              <Menu aria-hidden="true" size={20} />
            </button>
            <span>ระบบงานภาษี</span>
            <ChevronRight aria-hidden="true" size={15} />
            <strong>{currentTitle}</strong>
          </div>
          <div className="admin-topbar__user">
            <strong>{user?.fullName || 'เจ้าหน้าที่'}</strong>
            <span>{user?.email || 'กำลังโหลดข้อมูล…'}</span>
          </div>
        </header>

        <main id="admin-main-content" className="admin-content">{children}</main>
      </div>
      </div>
    </AdminSessionProvider>
  );
}
