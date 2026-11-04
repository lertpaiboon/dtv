'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  MessageSquareQuote,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  X,
  Save,
  User,
  Upload,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';

interface CustomerReviewData {
  id: number;
  headline: string;
  quote: string;
  authorName: string;
  authorImage: string | null;
  companyName: string | null;
  businessType: string | null;
  rating: number;
  sourceUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReviewsPage() {
  const { user } = useAdminSession();

  const [reviews, setReviews] = useState<CustomerReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReviewData | null>(null);
  const [formHeadline, setFormHeadline] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('');
  const [formAuthorImage, setFormAuthorImage] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formBusinessType, setFormBusinessType] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canEdit = Boolean(
    user?.permissions.includes('*') ||
      user?.permissions.includes('article:edit') ||
      user?.permissions.includes('article:create')
  );
  const canDelete = Boolean(
    user?.permissions.includes('*') ||
      user?.permissions.includes('article:delete') ||
      user?.permissions.includes('article:edit')
  );

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/reviews');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ไม่สามารถโหลดข้อมูลรีวิวลูกค้าได้');
      setReviews(json.data || []);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/uploads/review-photo', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'อัปโหลดภาพไม่สำเร็จ');

      setFormAuthorImage(json.data.url);
      setSuccessMsg('อัปโหลดรูปลูกค้า/โลโก้เรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSeedDefaults = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_defaults' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'นำเข้าข้อมูลไม่สำเร็จ');
      setReviews(json.data || []);
      setSuccessMsg(json.message || 'นำเข้ารีวิวเริ่มต้นเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormHeadline('');
    setFormQuote('');
    setFormAuthorName('');
    setFormAuthorImage('');
    setFormCompanyName('');
    setFormBusinessType('');
    setFormRating(5);
    setFormSourceUrl('');
    setFormSortOrder(reviews.length + 1);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (review: CustomerReviewData) => {
    setEditingReview(review);
    setFormHeadline(review.headline);
    setFormQuote(review.quote);
    setFormAuthorName(review.authorName);
    setFormAuthorImage(review.authorImage || '');
    setFormCompanyName(review.companyName || '');
    setFormBusinessType(review.businessType || '');
    setFormRating(review.rating || 5);
    setFormSourceUrl(review.sourceUrl || '');
    setFormSortOrder(review.sortOrder ?? 0);
    setFormIsActive(review.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        headline: formHeadline.trim(),
        quote: formQuote.trim(),
        authorName: formAuthorName.trim(),
        authorImage: formAuthorImage.trim() || null,
        companyName: formCompanyName.trim() || null,
        businessType: formBusinessType.trim() || null,
        rating: Number(formRating) || 5,
        sourceUrl: formSourceUrl.trim() || null,
        sortOrder: Number(formSortOrder) || 0,
        isActive: formIsActive,
      };

      const url = editingReview ? `/api/admin/reviews/${editingReview.id}` : '/api/admin/reviews';
      const method = editingReview ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.error || 'บันทึกข้อมูลไม่สำเร็จ');

      setSuccessMsg(json.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      setModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (review: CustomerReviewData) => {
    if (!canEdit) return;
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !review.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'อัปเดตสถานะไม่สำเร็จ');
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const handleDelete = async (review: CustomerReviewData) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวจาก "${review.authorName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');

      setSuccessMsg(json.message || 'ลบรีวิวเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="admin-page-stack">
      {/* Page Header */}
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
          <span className="admin-page-header__icon" aria-hidden="true">
            <MessageSquareQuote size={20} />
          </span>
          <div>
            <h1>จัดการรีวิวลูกค้า (Customer Reviews)</h1>
            <p>
              เพิ่ม ลบ แก้ไข และจัดลำดับรีวิวจากลูกค้าที่แสดงในหน้าแรกของเว็บไซต์ (รองรับรูปลูกค้า ชื่อบริษัท และประเภทธุรกิจ)
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="admin-page-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="/#reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-secondary-button text-xs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={15} />
              <span>ดูหน้าเว็บจริง</span>
            </a>
            <button type="button" onClick={openAddModal} className="admin-primary-button text-xs">
              <Plus className="w-4 h-4" />
              <span>เพิ่มรีวิวใหม่</span>
            </button>
          </div>
        )}
      </header>

      {/* Alerts */}
      {successMsg && (
        <div
          style={{
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.92rem',
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.92rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Reviews List Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--admin-card-border)',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.86rem', color: '#475569', width: '70px' }}>
                  ลำดับ
                </th>
                <th style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.86rem', color: '#475569', width: '260px' }}>
                  ลูกค้า / บริษัท / ประเภทธุรกิจ
                </th>
                <th style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.86rem', color: '#475569' }}>
                  พาดหัว & เนื้อหารีวิว
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.86rem', color: '#475569', width: '140px' }}>
                  สถานะแสดงผล
                </th>
                <th
                  style={{
                    padding: '14px 20px',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    color: '#475569',
                    textAlign: 'right',
                    width: '150px',
                  }}
                >
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                    <span>กำลังโหลดข้อมูลรีวิวลูกค้า...</span>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600, color: 'var(--dtv-ink)' }}>
                      ยังไม่มีข้อมูลรีวิวในฐานข้อมูล
                    </p>
                    <div style={{ display: 'inline-flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={handleSeedDefaults}
                        disabled={saving}
                        style={{
                          padding: '9px 16px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={15} />
                        <span>นำเข้ารีวิวเริ่มต้น 4 รายการ</span>
                      </button>
                      <button
                        type="button"
                        onClick={openAddModal}
                        style={{
                          padding: '9px 16px',
                          background: 'var(--dtv-navy-900)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                        }}
                      >
                        + เพิ่มรีวิวใหม่เอง
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-bg-slate">
                    {/* Sort Order */}
                    <td style={{ padding: '16px 16px', fontWeight: 700, color: '#475569', fontSize: '0.92rem' }}>
                      #{review.sortOrder}
                    </td>

                    {/* Customer & Business Info */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            fontSize: '1rem',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                          }}
                        >
                          {review.authorImage ? (
                            <Image
                              src={review.authorImage}
                              alt={review.authorName}
                              fill
                              style={{ objectFit: 'cover' }}
                              unoptimized
                            />
                          ) : (
                            review.authorName.replace(/^คุณ/, '').trim().charAt(0) || 'ล'
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--dtv-navy-950)', fontSize: '0.95rem' }}>
                            {review.authorName}
                          </div>
                          {review.companyName && (
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                              {review.companyName}
                            </div>
                          )}
                          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500 }}>
                            {review.businessType || 'ไม่ได้ระบุประเภทธุรกิจ'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Headline & Quote */}
                    <td style={{ padding: '16px 18px', maxWidth: '520px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                        {[...Array(Math.min(5, Math.max(1, review.rating || 5)))].map((_, idx) => (
                          <Star key={idx} size={14} color="#f59e0b" fill="#f59e0b" />
                        ))}
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem', marginBottom: '4px' }}>
                        {review.headline}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.55 }}>
                        {review.quote}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(review)}
                        disabled={!canEdit}
                        title={canEdit ? 'คลิกเพื่อสลับการแสดงผลบนหน้าเว็บไซต์' : undefined}
                        style={{
                          padding: '5px 11px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: review.isActive ? '#ecfdf5' : '#f1f5f9',
                          color: review.isActive ? '#059669' : '#64748b',
                          border: `1px solid ${review.isActive ? '#a7f3d0' : '#cbd5e1'}`,
                          cursor: canEdit ? 'pointer' : 'default',
                        }}
                      >
                        {review.isActive ? 'แสดงผลหน้าเว็บ' : 'ซ่อนไว้'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditModal(review)}
                            title="แก้ไขรีวิว"
                            style={{
                              padding: '6px 12px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              color: 'var(--dtv-ink)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit size={13} />
                            <span>แก้ไข</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(review)}
                            title="ลบรีวิว"
                            style={{
                              padding: '6px 8px',
                              background: '#ffffff',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              color: '#dc2626',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px 32px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--dtv-navy-950)' }}>
                {editingReview ? 'แก้ไขข้อมูลรีวิวลูกค้า' : 'เพิ่มรีวิวลูกค้าใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
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
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  พาดหัวรีวิว (Headline) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น “คืนใบเสร็จสรรพากรตัวจริงครบทุกเดือน สบายใจมาก”"
                  value={formHeadline}
                  onChange={(e) => setFormHeadline(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  เนื้อหารีวิว (Quote) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="ระบุความประทับใจของลูกค้า..."
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    lineHeight: 1.55,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    ชื่อลูกค้า (Author Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณธนกร ว."
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    ชื่อบริษัท (Company Name - ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น บจก. สยามเทรดดิ้ง"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ประเภทธุรกิจ (Business Type)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ธุรกิจนำเข้าและจำหน่ายสินค้าออนไลน์, บริษัทเอเจนซี่โฆษณา"
                  value={formBusinessType}
                  onChange={(e) => setFormBusinessType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              {/* Customer Photo / Logo */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                  รูปลูกค้า หรือ โลโก้บริษัท (ไม่บังคับ)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      border: '2px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {formAuthorImage ? (
                      <Image src={formAuthorImage} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                    ) : (
                      <User size={28} color="#3b82f6" />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadPhoto}
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '7px 14px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--dtv-navy-900)',
                        cursor: uploadingImage ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพจากเครื่อง'}</span>
                    </button>

                    {formAuthorImage && (
                      <button
                        type="button"
                        onClick={() => setFormAuthorImage('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.78rem',
                          textAlign: 'left',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        ลบรูปภาพนี้ออก
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="หรือวาง URL / Path รูปภาพ เช่น /uploads/reviews/customer1.jpg"
                  value={formAuthorImage}
                  onChange={(e) => setFormAuthorImage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#64748b',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    คะแนนดาว (1–5 ดาว)
                  </label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      background: '#fff',
                    }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 ดาว)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 ดาว)</option>
                    <option value={3}>⭐⭐⭐ (3 ดาว)</option>
                    <option value={2}>⭐⭐ (2 ดาว)</option>
                    <option value={1}>⭐ (1 ดาว)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                    ลำดับการแสดงผล (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ลิงก์ต้นทางรีวิว (เช่น ลิงก์รีวิวบน Google Maps - ไม่บังคับ)
                </label>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="review-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="review-is-active" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  เปิดแสดงผลบนหน้าเว็บไซต์ (Active)
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 22px',
                    background: 'var(--dtv-navy-900)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={16} />
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
