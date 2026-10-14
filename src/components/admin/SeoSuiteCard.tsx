'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Share2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Globe,
  Smartphone,
  Monitor,
  Target,
  Settings,
} from 'lucide-react';
import { SeoAnalysisResult, SeoCheckItem } from '@/lib/articles/seo-engine';

interface SeoSuiteCardProps {
  formData: {
    title: string;
    slug: string;
    summary: string;
    coverImage?: string;
    coverImageAlt?: string;
    focusKeyword?: string | null;
    seoScore?: number | null;
    isNoIndex?: boolean;
    canonicalUrl?: string | null;
    ogImage?: string | null;
  };
  analysis: SeoAnalysisResult;
  onChangeFocusKeyword: (kw: string) => void;
  onChangeNoIndex: (val: boolean) => void;
  onChangeCanonicalUrl: (url: string) => void;
  onChangeOgImage: (url: string) => void;
}

export default function SeoSuiteCard({
  formData,
  analysis,
  onChangeFocusKeyword,
  onChangeNoIndex,
  onChangeCanonicalUrl,
  onChangeOgImage,
}: SeoSuiteCardProps) {
  // Preview platform tab: 'google' | 'line' | 'facebook'
  const [previewTab, setPreviewTab] = useState<'google' | 'line' | 'facebook'>('google');
  // Google preview device: 'mobile' | 'desktop'
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Accordion section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    additional: true,
    eeat: true,
    readability: true,
    advanced: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group checks by category
  const basicChecks = analysis.checks.filter((c) => c.category === 'basic');
  const additionalChecks = analysis.checks.filter((c) => c.category === 'additional');
  const eeatChecks = analysis.checks.filter((c) => c.category === 'eeat');
  const readabilityChecks = analysis.checks.filter((c) => c.category === 'readability');

  // Score styling tokens
  const score = analysis.score;
  const badgeColor = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const badgeBg = score >= 80 ? '#dcfce7' : score >= 50 ? '#fef3c7' : '#fee2e2';
  const badgeBorder = score >= 80 ? '#bbf7d0' : score >= 50 ? '#fde68a' : '#fecaca';
  const scoreLabel =
    score >= 80
      ? 'ดีเยี่ยม (Great SEO)'
      : score >= 50
      ? 'พอใช้ (Needs Improvement)'
      : 'ควรปรับปรุง (Poor)';

  const activeOgImage = formData.ogImage || formData.coverImage || '/images/hero-tax.png';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Top Executive Banner: Score Overview & Focus Keyword Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #091c3a 0%, #102a56 100%)',
          borderRadius: '14px',
          color: '#ffffff',
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(9, 28, 58, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              วิเคราะห์ความพร้อม SEO & Social Sharing (Rank Math Suite)
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
              ระบบประเมินคะแนนคุณภาพเนื้อหา E-E-A-T ทางภาษีและการกระจายคำค้นหาแบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Big Score Gauge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              คะแนนคุณภาพบทความ
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: badgeColor }}>
              {scoreLabel}
            </div>
          </div>
          <div
            style={{
              background: badgeBg,
              color: badgeColor,
              border: `1.5px solid ${badgeBorder}`,
              padding: '6px 14px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {score >= 80 ? (
              <CheckCircle2 size={20} />
            ) : score >= 50 ? (
              <AlertTriangle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span style={{ whiteSpace: 'nowrap' }}>{score} / 100</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Balanced Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Focus Keyword & 4 Audit Checklists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Focus Keyword Input Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Target size={18} color="#2563eb" />
                <span>Focus Keyword (คำสำคัญหลักที่ต้องการดันอันดับบน Google)</span>
              </label>
              {analysis.stats.keywordCount > 0 ? (
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: '#16a34a',
                    fontWeight: 700,
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  พบ {analysis.stats.keywordCount} ครั้ง ({analysis.stats.keywordDensity.toFixed(2)}%)
                </span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ยังไม่พบในเนื้อหา</span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={formData.focusKeyword || ''}
                onChange={(e) => onChangeFocusKeyword(e.target.value)}
                placeholder="เช่น จดทะเบียน vat, ยื่นภาษีมูลค่าเพิ่ม ภ.พ.30, ตรวจสอบบัญชี"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>

            <div
              style={{
                marginTop: '10px',
                fontSize: '0.82rem',
                color: '#64748b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                ความหนาแน่นที่แนะนำ: <strong>0.7% - 2.5%</strong> เพื่อป้องกันข้อหา Keyword Stuffing
              </span>
              {formData.title && !formData.focusKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    const words = formData.title.trim().split(/\s+/).slice(0, 3).join(' ');
                    onChangeFocusKeyword(words);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.82rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  ใช้คำสำคัญจากหัวข้อ
                </button>
              )}
            </div>
          </div>

          {/* 4 Categorized Checklists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <ChecklistAccordion
              title="1. Basic SEO (เกณฑ์พื้นฐานบน Search Engine)"
              badge={`${basicChecks.filter((c) => c.passed).length} / ${basicChecks.length}`}
              isOpen={openSections.basic}
              onToggle={() => toggleSection('basic')}
              checks={basicChecks}
            />

            <ChecklistAccordion
              title="2. Additional SEO (โครงสร้างหัวข้อและการกระจายคำ)"
              badge={`${additionalChecks.filter((c) => c.passed).length} / ${additionalChecks.length}`}
              isOpen={openSections.additional}
              onToggle={() => toggleSection('additional')}
              checks={additionalChecks}
            />

            <ChecklistAccordion
              title="3. E-E-A-T & Citations (ความน่าเชื่อถือทางวิชาชีพภาษี/บัญชี)"
              badge={`${eeatChecks.filter((c) => c.passed).length} / ${eeatChecks.length}`}
              isOpen={openSections.eeat}
              onToggle={() => toggleSection('eeat')}
              checks={eeatChecks}
            />

            <ChecklistAccordion
              title="4. Readability & Engagement (การอ่านง่ายและ AI Overviews)"
              badge={`${readabilityChecks.filter((c) => c.passed).length} / ${readabilityChecks.length}`}
              isOpen={openSections.readability}
              onToggle={() => toggleSection('readability')}
              checks={readabilityChecks}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-Platform Previews & Advanced Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Multi-Platform Preview Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Platform Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '8px 12px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewTab('google')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: previewTab === 'google' ? '#ffffff' : 'transparent',
                    color: previewTab === 'google' ? '#091c3a' : '#64748b',
                    fontWeight: previewTab === 'google' ? 700 : 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: previewTab === 'google' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Search size={15} color="#2563eb" />
                  <span>Google SERP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('line')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: previewTab === 'line' ? '#ffffff' : 'transparent',
                    color: previewTab === 'line' ? '#06C755' : '#64748b',
                    fontWeight: previewTab === 'line' ? 700 : 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: previewTab === 'line' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: '#06C755',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    L
                  </span>
                  <span>LINE Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('facebook')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: previewTab === 'facebook' ? '#ffffff' : 'transparent',
                    color: previewTab === 'facebook' ? '#1877F2' : '#64748b',
                    fontWeight: previewTab === 'facebook' ? 700 : 500,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: previewTab === 'facebook' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <Share2 size={14} color="#1877F2" />
                  <span>Facebook / OG</span>
                </button>
              </div>

              {previewTab === 'google' && (
                <div style={{ display: 'flex', gap: '2px', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setGoogleDevice('desktop')}
                    title="Desktop Preview"
                    style={{
                      padding: '4px 10px',
                      border: 'none',
                      borderRadius: '4px',
                      background: googleDevice === 'desktop' ? '#ffffff' : 'transparent',
                      color: googleDevice === 'desktop' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleDevice('mobile')}
                    title="Mobile Preview"
                    style={{
                      padding: '4px 10px',
                      border: 'none',
                      borderRadius: '4px',
                      background: googleDevice === 'mobile' ? '#ffffff' : 'transparent',
                      color: googleDevice === 'mobile' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Preview Canvas */}
            <div style={{ padding: '20px' }}>
              {/* Google SERP Preview */}
              {previewTab === 'google' && (
                <div
                  style={{
                    fontFamily: 'arial, sans-serif',
                    maxWidth: googleDevice === 'mobile' ? '380px' : '100%',
                    margin: googleDevice === 'mobile' ? '0 auto' : '0',
                    border: googleDevice === 'mobile' ? '1px solid #cbd5e1' : 'none',
                    borderRadius: googleDevice === 'mobile' ? '14px' : '0',
                    padding: googleDevice === 'mobile' ? '16px' : '0',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#091c3a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fbbf24',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      D
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#202124', fontWeight: 600, lineHeight: 1.2 }}>
                        บริษัท ดีถาวรการบัญชี จำกัด
                      </div>
                      <div style={{ fontSize: '11px', color: '#4d5156', lineHeight: 1.2 }}>
                        https://deethavorn.com › knowledge › {formData.slug || 'url-slug'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: googleDevice === 'mobile' ? '17px' : '20px',
                      color: '#1a0dab',
                      fontWeight: 400,
                      lineHeight: 1.3,
                      marginBottom: '6px',
                      wordBreak: 'break-word',
                      cursor: 'pointer',
                    }}
                  >
                    {formData.title ? `${formData.title} | Deethavorn Accounting` : 'หัวข้อบทความจะปรากฏบนผลการค้นหาของ Google'}
                  </div>

                  <div
                    style={{
                      fontSize: '13.5px',
                      color: '#4d5156',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {formData.summary || 'คำอธิบายสรุปความยาว 120-160 ตัวอักษรจะแสดงตรงนี้ เพื่อดึงดูดให้ผู้ค้นหาคลิกเข้าชมเว็บไซต์'}
                  </div>

                  <div
                    style={{
                      marginTop: '14px',
                      paddingTop: '10px',
                      borderTop: '1px dashed #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: '#64748b',
                    }}
                  >
                    <span>
                      ความยาวหัวข้อ: <strong>{formData.title.length}</strong> / 60 ตัวอักษร
                    </span>
                    <span>
                      ความยาวสรุปย่อ: <strong>{formData.summary.length}</strong> / 160 ตัวอักษร
                    </span>
                  </div>
                </div>
              )}

              {/* LINE Share Preview */}
              {previewTab === 'line' && (
                <div
                  style={{
                    background: '#7288a2',
                    padding: '24px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      maxWidth: '320px',
                      width: '100%',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    }}
                  >
                    <div
                      style={{
                        height: '160px',
                        background: '#091c3a',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {activeOgImage ? (
                        <img
                          src={activeOgImage}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No Cover Image</div>
                      )}
                    </div>

                    <div style={{ padding: '14px 16px' }}>
                      <div
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 700,
                          color: '#111827',
                          lineHeight: 1.35,
                          marginBottom: '6px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {formData.title || 'ชื่อบทความสำหรับแชร์บน LINE'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          lineHeight: 1.4,
                          marginBottom: '10px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {formData.summary || 'สรุปเนื้อหาบทความโดยย่อสำหรับแสดงบนการแชร์แชท LINE'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Globe size={12} />
                        <span>deethavorn.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Facebook / OG Card Preview */}
              {previewTab === 'facebook' && (
                <div
                  style={{
                    border: '1px solid #dadde1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f0f2f5',
                    maxWidth: '460px',
                    margin: '0 auto',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      height: '240px',
                      background: '#091c3a',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {activeOgImage ? (
                      <img
                        src={activeOgImage}
                        alt="Facebook OG"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No OG Image</div>
                    )}
                  </div>

                  <div style={{ padding: '12px 16px', background: '#f0f2f5' }}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#606770',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '3px',
                      }}
                    >
                      DEETHAVORN.COM
                    </div>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1d2129',
                        lineHeight: 1.3,
                        marginBottom: '4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {formData.title || 'หัวข้อบทความบนฟีด Facebook'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: '#606770',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {formData.summary || 'คำอธิบายสรุปสั้นๆ สำหรับ Social Feed'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced SEO & Social Settings Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Settings size={17} color="#475569" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                Advanced SEO & Social Sharing (การตั้งค่าชั้นสูง)
              </h4>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* NoIndex Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(formData.isNoIndex)}
                  onChange={(e) => onChangeNoIndex(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <div>
                  <strong>Robots Meta: noindex</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    สั่งให้ Google และ Search Engines ห้ามนำหน้านี้ไปแสดงในผลการค้นหา (เหมาะกับเอกสารภายใน)
                  </div>
                </div>
              </label>

              {/* Canonical URL Input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '6px',
                  }}
                >
                  Canonical URL (กำหนดในกรณีเนื้อหาคัดลอกหรือมาจากแหล่งอื่น):
                </label>
                <input
                  type="text"
                  value={formData.canonicalUrl || ''}
                  onChange={(e) => onChangeCanonicalUrl(e.target.value)}
                  placeholder="https://deethavorn.com/knowledge/original-slug"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                  }}
                />
              </div>

              {/* Custom OG Image URL Input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#475569',
                    marginBottom: '6px',
                  }}
                >
                  Custom Social Share Image URL (หากต้องการใช้ภาพแชร์แยกต่างหาก):
                </label>
                <input
                  type="text"
                  value={formData.ogImage || ''}
                  onChange={(e) => onChangeOgImage(e.target.value)}
                  placeholder="https://deethavorn.com/uploads/custom-og.jpg"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                  }}
                />
                {formData.coverImage && (
                  <button
                    type="button"
                    onClick={() => onChangeOgImage(formData.coverImage || '')}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      fontWeight: 500,
                    }}
                  >
                    ใช้รูปเดียวกับภาพหน้าปกบทความ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Accordion Component for Checklist Items
 */
function ChecklistAccordion({
  title,
  badge,
  isOpen,
  onToggle,
  checks,
}: {
  title: string;
  badge: string;
  isOpen: boolean;
  onToggle: () => void;
  checks: SeoCheckItem[];
}) {
  const allPassed = checks.every((c) => c.passed);

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '13px 18px',
          background: '#f8fafc',
          border: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {allPassed ? (
            <CheckCircle2 size={18} color="#16a34a" />
          ) : (
            <AlertCircle size={18} color="#d97706" />
          )}
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: allPassed ? '#dcfce7' : '#fef3c7',
              color: allPassed ? '#15803d' : '#b45309',
            }}
          >
            {badge}
          </span>
          {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {checks.map((check) => (
            <div
              key={check.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                paddingBottom: '10px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                {check.passed ? (
                  <CheckCircle2 size={17} color="#16a34a" />
                ) : (
                  <AlertCircle size={17} color="#dc2626" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: check.passed ? '#15803d' : '#991b1b',
                    fontWeight: 600,
                  }}
                >
                  {check.label}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                  {check.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
