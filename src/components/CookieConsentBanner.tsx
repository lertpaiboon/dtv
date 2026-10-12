'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, Settings, Check, X, Lock } from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
  version?: string;
}

const STORAGE_KEY = 'dtv_cookie_consent';
const CONSENT_VERSION = '1.0';

export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  }
}

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  // Load saved consent or prompt user
  useEffect(() => {
    setMounted(true);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CookiePreferences;
        setPreferences({
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
        });
      } else {
        // Show banner after brief delay for smooth entrance
        const timer = setTimeout(() => {
          setBannerVisible(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access fallback
      setBannerVisible(true);
    }
  }, []);

  // Listen to open-cookie-preferences event from anywhere (e.g., footer link)
  useEffect(() => {
    const handleOpen = () => {
      setModalVisible(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpen);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpen);
    };
  }, []);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalVisible) {
        setModalVisible(false);
      }
    };

    if (modalVisible) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalVisible]);

  const saveConsent = (updated: CookiePreferences) => {
    const payload: CookiePreferences = {
      ...updated,
      necessary: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore localStorage quota error
    }

    setPreferences(payload);
    setBannerVisible(false);
    setModalVisible(false);

    // Notify any third-party or internal listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dtv-cookie-consent-updated', { detail: payload }));
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveModalPreferences = () => {
    saveConsent(preferences);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Cookie Banner */}
      {bannerVisible && !modalVisible && (
        <aside
          className="cookie-banner-wrapper"
          aria-label="การขอความยินยอมใช้งานคุกกี้ (Cookie Consent)"
          role="region"
        >
          <div className="cookie-banner">
            <div className="cookie-banner__header">
              <span className="cookie-banner__badge">
                <Cookie size={14} aria-hidden="true" />
                นโยบายคุกกี้และความเป็นส่วนตัว (PDPA)
              </span>
              <button
                type="button"
                className="cookie-banner__close"
                onClick={() => setBannerVisible(false)}
                aria-label="ปิดกล่องข้อความคุกกี้ชั่วคราว"
                title="ปิดชั่วคราว"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <h2 className="cookie-banner__title">
              เราใส่ใจในความเป็นส่วนตัวของคุณ
            </h2>

            <p className="cookie-banner__text">
              เว็บไซต์ บริษัท ดีถาวรการบัญชี จำกัด มีการใช้งานคุกกี้เพื่อส่งมอบประสบการณ์ที่ดียิ่งขึ้น 
              รักษาความปลอดภัย และวิเคราะห์สถิติการใช้งานตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) 
              ท่านสามารถเลือกตั้งค่าความยินยอมได้ตามความต้องการ
              <Link href="/privacy-policy" className="cookie-banner__link">
                อ่านนโยบายความเป็นส่วนตัว
              </Link>
            </p>

            <div className="cookie-banner__actions">
              <div className="cookie-banner__btn-group">
                <button
                  type="button"
                  className="cookie-btn cookie-btn--primary"
                  onClick={handleAcceptAll}
                  id="cookie-accept-all-btn"
                >
                  <Check size={14} aria-hidden="true" />
                  ยอมรับทั้งหมด
                </button>
                <button
                  type="button"
                  className="cookie-btn cookie-btn--secondary"
                  onClick={handleAcceptEssentialOnly}
                  id="cookie-essential-only-btn"
                >
                  เฉพาะที่จำเป็น
                </button>
              </div>

              <button
                type="button"
                className="cookie-btn cookie-btn--text"
                onClick={() => setModalVisible(true)}
                id="cookie-settings-btn"
              >
                <Settings size={13} aria-hidden="true" />
                ตั้งค่าคุกกี้ (Preferences)
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal Dialog */}
      {modalVisible && (
        <div
          className="cookie-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalVisible(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div className="cookie-modal">
            {/* Modal Header */}
            <div className="cookie-modal__header">
              <div className="cookie-modal__title-row">
                <div className="cookie-modal__icon-pill" aria-hidden="true">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="cookie-modal__title">
                    ตั้งค่าความเป็นส่วนตัวและความยินยอมคุกกี้
                  </h3>
                  <p className="cookie-modal__desc">
                    ปรับแต่งการใช้งานคุกกี้บนเว็บไซต์ บริษัท ดีถาวรการบัญชี จำกัด เพื่อการปกป้องข้อมูลส่วนบุคคลของคุณ
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cookie-modal__close"
                onClick={() => setModalVisible(false)}
                aria-label="ปิดหน้าต่างตั้งค่าคุกกี้"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="cookie-modal__body">
              {/* Category 1: Strictly Necessary */}
              <div className="cookie-item">
                <div className="cookie-item__header">
                  <div className="cookie-item__title-group">
                    <span className="cookie-item__name">1. คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary Cookies)</span>
                    <span className="cookie-item__badge cookie-item__badge--locked">
                      <Lock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
                      จำเป็นเสมอ
                    </span>
                  </div>
                  <label className="cookie-switch" aria-label="คุกกี้ที่จำเป็น เปิดใช้งานตลอดเวลา">
                    <input type="checkbox" checked disabled readOnly />
                    <span className="cookie-slider" />
                  </label>
                </div>
                <p className="cookie-item__desc">
                  คุกกี้ประเภทนี้มีความจำเป็นต่อการทำงานขั้นพื้นฐานของเว็บไซต์ เช่น การรักษาความปลอดภัย การนำทางในหน้าเพจ 
                  การโหลดทรัพยากร และการบันทึกสถานะความยินยอมของผู้ใช้งาน เว็บไซต์ไม่สามารถทำงานได้อย่างถูกต้องหากไม่มีคุกกี้เหล่านี้
                </p>
              </div>

              {/* Category 2: Analytics & Performance */}
              <div className="cookie-item">
                <div className="cookie-item__header">
                  <div className="cookie-item__title-group">
                    <span className="cookie-item__name">2. คุกกี้เพื่อการวิเคราะห์และวัดผล (Analytics Cookies)</span>
                    <span className="cookie-item__badge">สถิติและประสิทธิภาพ</span>
                  </div>
                  <label className="cookie-switch" htmlFor="toggle-analytics-cookies">
                    <input
                      id="toggle-analytics-cookies"
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          analytics: e.target.checked,
                        }))
                      }
                      aria-label="เปิดหรือปิดคุกกี้เพื่อการวิเคราะห์และวัดผล"
                    />
                    <span className="cookie-slider" />
                  </label>
                </div>
                <p className="cookie-item__desc">
                  ช่วยให้เราเข้าใจการโต้ตอบของผู้ใช้งาน การนับจำนวนผู้เข้าชม และหน้าเว็บที่มีความสนใจสูงสุด 
                  เพื่อนำข้อมูลเชิงสถิติแบบไม่ระบุตัวตน (Anonymized Data) มาพัฒนาและยกระดับคุณภาพบริการของเว็บไซต์ให้ดียิ่งขึ้น
                </p>
              </div>

              {/* Category 3: Marketing & Communication */}
              <div className="cookie-item">
                <div className="cookie-item__header">
                  <div className="cookie-item__title-group">
                    <span className="cookie-item__name">3. คุกกี้เพื่อการตลาดและการประชาสัมพันธ์ (Marketing Cookies)</span>
                    <span className="cookie-item__badge">การสื่อสาร</span>
                  </div>
                  <label className="cookie-switch" htmlFor="toggle-marketing-cookies">
                    <input
                      id="toggle-marketing-cookies"
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          marketing: e.target.checked,
                        }))
                      }
                      aria-label="เปิดหรือปิดคุกกี้เพื่อการตลาดและการสื่อสาร"
                    />
                    <span className="cookie-slider" />
                  </label>
                </div>
                <p className="cookie-item__desc">
                  ใช้เพื่อนำเสนอเนื้อหา ข่าวสารภาษี สิทธิประโยชน์ทางบัญชี และบริการที่สอดคล้องกับความต้องการของท่าน 
                  รวมถึงการเชื่อมโยงกับช่องทางการสื่อสารทางธุรกิจ เช่น LINE Official Account หรือ Facebook
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="cookie-modal__footer">
              <div className="cookie-modal__footer-links">
                ศึกษารายละเอียดเพิ่มเติมได้ที่{' '}
                <Link href="/privacy-policy" onClick={() => setModalVisible(false)}>
                  นโยบายความเป็นส่วนตัว
                </Link>
              </div>

              <div className="cookie-modal__footer-actions">
                <button
                  type="button"
                  className="cookie-btn cookie-btn--secondary"
                  onClick={handleSaveModalPreferences}
                  id="cookie-modal-save-btn"
                >
                  บันทึกการตั้งค่า
                </button>
                <button
                  type="button"
                  className="cookie-btn cookie-btn--primary"
                  onClick={handleAcceptAll}
                  id="cookie-modal-accept-all-btn"
                >
                  <Check size={14} aria-hidden="true" />
                  ยอมรับทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
