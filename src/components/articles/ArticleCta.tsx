'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ArrowRight, CheckCircle2, QrCode, X, ExternalLink } from 'lucide-react';

interface ArticleCtaProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  lineMessage?: string;
  articleSlug: string;
  articleTitle?: string;
  category: string;
}

export default function ArticleCta({
  headline = 'ต้องการผู้เชี่ยวชาญดูแลบัญชีและวางแผนภาษีอย่างถูกต้อง?',
  subheadline = 'บริษัท ดีถาวรการบัญชี จำกัด ให้บริการทำบัญชี ยื่นภาษี จดทะเบียน และตรวจสอบบัญชีโดย CPA มืออาชีพ',
  buttonText = 'ขอคำปรึกษาเบื้องต้นฟรี',
  articleSlug,
  articleTitle,
  category,
}: ArticleCtaProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const lineDirectUrl = 'https://line.me/ti/p/DliAyJfUXd';
  // Send article title (or headline fallback) in query param 'topic' and jump to '#contact'
  const topic = articleTitle || headline;
  const contactUrl = `/?topic=${encodeURIComponent(topic)}&source=article&slug=${encodeURIComponent(articleSlug)}#contact`;

  // Close QR modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowQrModal(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowQrModal(false);
      }
    };

    if (showQrModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showQrModal]);

  const handleLineClick = (e: React.MouseEvent) => {
    trackCtaEvent('line');

    // On mobile screens, open LINE app link directly
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      window.open(lineDirectUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // On desktop, show the QR code modal for convenient scanning
    e.preventDefault();
    setShowQrModal(true);
  };

  const trackCtaEvent = (ctaType: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dtv_analytics_event', {
          detail: {
            eventName: `article_${ctaType}_click`,
            article_slug: articleSlug,
            article_category: category,
            cta_type: ctaType,
          },
        })
      );
    }
  };

  return (
    <>
      <section
        className="article-cta-box"
        aria-labelledby="cta-headline"
        style={{
          marginTop: '60px',
          padding: '44px 32px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #172a45 100%)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '5px 16px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '18px',
              letterSpacing: '0.05em',
            }}
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>DEETHAVORN ADVISORY SERVICES</span>
          </div>

          <h3
            id="cta-headline"
            style={{
              fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: '12px',
              color: '#ffffff',
            }}
          >
            {headline}
          </h3>

          <p
            style={{
              fontSize: '0.98rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.65,
              marginBottom: '32px',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {subheadline}
          </p>

          {/* Action Buttons Group */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* 1. LINE QR / Add Friend Button */}
            <button
              type="button"
              onClick={handleLineClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#06C755',
                color: '#ffffff',
                border: 'none',
                padding: '13px 22px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6, 199, 85, 0.4)',
                transition: 'var(--transition)',
              }}
              className="hover-lift"
              title="แอด LINE ด้วย QR Code"
            >
              <QrCode size={19} aria-hidden="true" />
              <span>แอด LINE ด้วย QR Code</span>
            </button>

            {/* 2. Go to Contact Form with Auto-fill Topic */}
            <Link
              href={contactUrl}
              onClick={() => trackCtaEvent('form')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent)',
                color: '#0B192C',
                padding: '13px 24px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(197, 160, 89, 0.4)',
                transition: 'var(--transition)',
              }}
              className="hover-lift"
            >
              <span>{buttonText}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>

            {/* 3. Real Primary Phone Number */}
            <a
              href="tel:0991495656"
              onClick={() => trackCtaEvent('phone')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '13px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.92rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                transition: 'var(--transition)',
              }}
              className="hover-lift"
              title="โทรติดต่อทีมงานทันที"
            >
              <Phone size={16} aria-hidden="true" />
              <span>โทร 099-149-5656</span>
            </a>
          </div>

          {/* Secondary phone notice */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.65)',
            }}
          >
            หรือติดต่อเบอร์สำรอง:{' '}
            <a
              href="tel:0919415656"
              onClick={() => trackCtaEvent('phone_secondary')}
              style={{ color: 'var(--accent)', textDecoration: 'underline' }}
            >
              091-941-5656
            </a>{' '}
            (จันทร์–ศุกร์ 08:30–17:30 น.)
          </div>
        </div>
      </section>

      {/* LINE QR Code Modal Popup (Desktop View) */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <div
            ref={modalRef}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px 28px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
              aria-label="ปิดหน้าต่าง QR Code"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {/* Modal Content */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#06C755',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '14px',
              }}
            >
              LINE OFFICIAL CONTACT
            </div>

            <h4
              id="qr-modal-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0B192C',
                margin: '0 0 6px',
              }}
            >
              สแกน QR เพื่อคุยกับเรา
            </h4>

            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 18px', lineHeight: 1.5 }}>
              เปิดกล้องมือถือเพื่อสแกน QR Code หรือกดปุ่มด้านล่างเพื่อเปิดแอป LINE ได้ทันที
            </p>

            {/* QR Image Box */}
            <div
              style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
                display: 'inline-block',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
                marginBottom: '18px',
              }}
            >
              <Image
                src="/images/line-qr.png"
                alt="สแกน LINE QR Code ดีถาวรการบัญชี"
                width={190}
                height={190}
                style={{ display: 'block', borderRadius: '8px' }}
                priority
              />
            </div>

            {/* Direct Open Link */}
            <div>
              <a
                href={lineDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  background: '#06C755',
                  color: '#ffffff',
                  padding: '11px 18px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span>เปิดแชท LINE ในเบราว์เซอร์</span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
