'use client';

import React from 'react';
import { openCookiePreferences } from './CookieConsentBanner';

interface CookiePreferencesButtonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function CookiePreferencesButton({
  className,
  style,
  children = 'ตั้งค่าคุกกี้',
}: CookiePreferencesButtonProps) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={openCookiePreferences}
      aria-label="เปิดหน้าต่างตั้งค่าความยินยอมคุกกี้ (Cookie Preferences)"
    >
      {children}
    </button>
  );
}
