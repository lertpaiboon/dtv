'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingLineButton() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const togglePopover = () => {
    // If screen is narrow (mobile), directly open line app
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      window.open('https://line.me/ti/p/DliAyJfUXd', '_blank', 'noopener,noreferrer');
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="floating-line-wrapper" ref={popoverRef}>
      {/* Popover for Desktop */}
      {isOpen && (
        <div className="floating-line-popover" role="dialog" aria-modal="true" aria-label="LINE QR Code ดีถาวรการบัญชี">
          <div className="floating-line-popover__header">
            <div className="floating-line-popover__brand">
              <span className="floating-line-badge-pill">
                <MessageCircle size={14} aria-hidden="true" /> LINE
              </span>
              <strong>ดีถาวรการบัญชี</strong>
            </div>
            <button
              type="button"
              className="floating-line-popover__close"
              onClick={() => setIsOpen(false)}
              aria-label="ปิดหน้าต่าง LINE QR Code"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="floating-line-popover__body">
            <div className="floating-line-popover__qr-frame">
              <Image
                src="/images/line-qr.png"
                alt="สแกน LINE QR Code เพื่อแอดคุยกับดีถาวรการบัญชี"
                width={140}
                height={140}
                className="floating-line-popover__qr-img"
                priority
              />
            </div>
            <p className="floating-line-popover__title">สแกน QR เพื่อแอด LINE</p>
            <p className="floating-line-popover__desc">
              ปรึกษาเรื่องบัญชี ภาษี หรือเปิดบริษัทได้ทันที
            </p>
            <a
              href="https://line.me/ti/p/DliAyJfUXd"
              target="_blank"
              rel="noopener noreferrer"
              className="floating-line-popover__link"
            >
              เปิดแชท LINE ในเบราว์เซอร์
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        className="floating-line-btn"
        onClick={togglePopover}
        aria-label="ติดต่อดีถาวรการบัญชีผ่าน LINE"
        aria-expanded={isOpen}
      >
        <span className="floating-line-btn__icon">
          <MessageCircle size={22} aria-hidden="true" />
        </span>
        <span className="floating-line-btn__label">ปรึกษาผ่าน LINE</span>
      </button>
    </div>
  );
}
