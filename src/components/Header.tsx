'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, MapPin, Menu, Phone, X } from 'lucide-react';

const navLinks = [
  { label: 'บริการ', href: '/#services' },
  { label: 'ทำไมต้องดีถาวร', href: '/#why-us' },
  { label: 'ค่าบริการ', href: '/#pricing' },
  { label: 'คำถามที่พบบ่อย', href: '/#faq' },
  { label: 'คลังความรู้', href: '/knowledge' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-bar__inner">
          <div className="utility-bar__details">
            <span><Clock3 aria-hidden="true" /> จันทร์–เสาร์ 08:30–18:00 น.</span>
            <span><MapPin aria-hidden="true" /> ใกล้ MRT เพชรบุรี ทางออก 1</span>
          </div>
          <div className="utility-bar__phones">
            <Phone aria-hidden="true" />
            <a href="tel:0919415656">091-941-5656</a>
            <span aria-hidden="true">/</span>
            <a href="tel:0991495656">099-149-5656</a>
          </div>
        </div>
      </div>

      <div className="main-nav">
        <div className="container main-nav__inner">
          <Link className="brand" href="/" aria-label="ดีถาวรการบัญชี หน้าแรก">
            <span className="brand__mark" aria-hidden="true">
              <Image
                className="brand__logo"
                src="/images/DTV%20LOGO.png"
                alt=""
                width={3508}
                height={2480}
                sizes="58px"
                priority
              />
            </span>
            <span className="brand__copy">
              <strong>ดีถาวรการบัญชี</strong>
              <small>Deethavorn Accounting</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="เมนูหลัก">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </nav>

          <div className="main-nav__actions">
            <Link className="btn btn-primary nav-cta" href="/#contact">ขอคำปรึกษา</Link>
            <button
              className="mobile-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav" id="mobile-nav">
          <nav className="container" aria-label="เมนูบนมือถือ">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link className="mobile-nav__contact" href="/#contact" onClick={() => setMobileMenuOpen(false)}>
              ส่งรายละเอียดให้เราประเมินราคา
            </Link>
            <a className="mobile-nav__phone" href="tel:0919415656">
              <Phone aria-hidden="true" /> โทร 091-941-5656
            </a>
            <a className="mobile-nav__phone" href="tel:0991495656">
              <Phone aria-hidden="true" /> โทร 099-149-5656
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
