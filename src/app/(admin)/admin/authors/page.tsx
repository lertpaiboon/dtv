'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  X,
  Save,
  User,
  Upload,
} from 'lucide-react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';
import { slugify } from '@/lib/articles/validation';

interface AuthorData {
  id: number;
  name: string;
  slug: string;
  role: string | null;
  credentials: string | null;
  bio: string | null;
  profileImage: string | null;
  sameAs: any;
  isActive: boolean;
  createdAt: string;
  _count: {
    authoredArticles: number;
    reviewedArticles: number;
  };
}

export default function AdminAuthorsPage() {
  const { user } = useAdminSession();

  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorData | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCredentials, setFormCredentials] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formProfileImage, setFormProfileImage] = useState('');
  const [formSameAs, setFormSameAs] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canEdit = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:edit') || user?.permissions.includes('article:create'));
  const canDelete = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:delete'));

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/uploads/author-photo', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'อัปโหลดภาพไม่สำเร็จ');

      setFormProfileImage(json.data.url);
      setSuccessMsg('อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/authors');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ไม่สามารถโหลดข้อมูลผู้เขียนได้');
      setAuthors(json.data || []);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const openAddModal = () => {
    setEditingAuthor(null);
    setFormName('');
    setFormSlug('');
    setFormRole('');
    setFormCredentials('');
    setFormBio('');
    setFormProfileImage('');
    setFormSameAs('');
    setFormIsActive(true);
    setIsSlugCustomized(false);
    setModalOpen(true);
  };

  const openEditModal = (author: AuthorData) => {
    setEditingAuthor(author);
    setFormName(author.name);
    setFormSlug(author.slug);
    setFormRole(author.role || '');
    setFormCredentials(author.credentials || '');
    setFormBio(author.bio || '');
    setFormProfileImage(author.profileImage || '');
    setFormSameAs(Array.isArray(author.sameAs) ? author.sameAs.join('\n') : '');
    setFormIsActive(author.isActive);
    setIsSlugCustomized(true);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        role: formRole.trim() || null,
        credentials: formCredentials.trim() || null,
        bio: formBio.trim() || null,
        profileImage: formProfileImage.trim() || null,
        sameAs: formSameAs.trim() ? formSameAs.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        isActive: formIsActive,
      };

      const url = editingAuthor ? `/api/admin/authors/${editingAuthor.id}` : '/api/admin/authors';
      const method = editingAuthor ? 'PUT' : 'POST';

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
      fetchAuthors();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author: AuthorData) => {
    const total = author._count.authoredArticles + author._count.reviewedArticles;
    const msg = total > 0
      ? `ผู้เขียนท่านนี้มีบทความที่เกี่ยวข้องจำนวน ${total} บทความ การลบจะเปลี่ยนสถานะเป็น "ปิดใช้งาน" แทนเพื่อรักษาประวัติบทความเดิม ต้องการดำเนินการต่อหรือไม่?`
      : `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้เขียน "${author.name}"?`;

    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/authors/${author.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'ลบไม่สำเร็จ');

      setSuccessMsg(json.message || 'ลบข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAuthors();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="admin-page-stack">
      {/* Standard Page Header */}
      <header className="admin-page-header">
        <div className="admin-page-header__identity">
          <span className="admin-page-header__icon" aria-hidden="true">
            <UserCheck size={20} />
          </span>
          <div>
            <h1>จัดการผู้เขียนและผู้ตรวจทาน (Authors & Reviewers)</h1>
            <p>สร้างและจัดการโปรไฟล์ผู้เชี่ยวชาญ CPA, TA และทีมวิชาการ เพื่อเสริมเกณฑ์ความน่าเชื่อถือ E-E-A-T ของ Google</p>
          </div>
        </div>

        {canEdit && (
          <div className="admin-page-actions">
            <button
              type="button"
              onClick={openAddModal}
              className="admin-primary-button text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มผู้เขียน/ผู้ตรวจทานใหม่</span>
            </button>
          </div>
        )}
      </header>

      {/* Messages */}
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

      {/* Authors List Table */}
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
                <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  ผู้เขียน / ทีมงาน
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  ตำแหน่ง & คุณวุฒิวิชาชีพ
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  สถิติบัญชีงาน
                </th>
                <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.88rem', color: '#475569' }}>
                  สถานะ
                </th>
                <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: '0.88rem', color: '#475569', textAlign: 'right' }}>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                    <span>กำลังโหลดข้อมูลผู้เขียน...</span>
                  </td>
                </tr>
              ) : authors.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--dtv-ink)' }}>ยังไม่มีข้อมูลผู้เขียนในระบบ</p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--dtv-blue-600)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                      }}
                    >
                      + เพิ่มผู้เขียนคนแรก
                    </button>
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr
                    key={author.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    className="hover-bg-slate"
                  >
                    {/* Name & Avatar */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                            color: 'var(--dtv-blue-600)',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                          }}
                        >
                          {author.profileImage ? (
                            <Image
                              src={author.profileImage}
                              alt={author.name}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            author.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--dtv-navy-950)', fontSize: '0.98rem' }}>
                            {author.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            slug:{' '}
                            <Link
                              href={`/authors/${author.slug}`}
                              target="_blank"
                              style={{ color: '#2563eb', textDecoration: 'underline' }}
                              title="คลิกเพื่อเปิดหน้าโปรไฟล์สาธารณะ"
                            >
                              /authors/{author.slug}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Credentials */}
                    <td style={{ padding: '16px 16px', maxWidth: '380px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', marginBottom: '3px' }}>
                        {author.role || '-'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                        {author.credentials || '-'}
                      </div>
                    </td>

                    {/* Counts */}
                    <td style={{ padding: '16px 16px', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                          <BookOpen size={13} color="var(--dtv-blue-600)" />
                          <span>เขียน {author._count.authoredArticles} บทความ</span>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                          <ShieldCheck size={13} color="#16a34a" />
                          <span>ตรวจทาน {author._count.reviewedArticles} บทความ</span>
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: author.isActive ? '#ecfdf5' : '#f1f5f9',
                          color: author.isActive ? '#059669' : '#64748b',
                          border: `1px solid ${author.isActive ? '#a7f3d0' : '#cbd5e1'}`,
                        }}
                      >
                        {author.isActive ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Inactive)'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Link
                          href={`/authors/${author.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="เปิดดูหน้าโปรไฟล์สาธารณะ (แท็บใหม่)"
                          style={{
                            padding: '6px 12px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            color: '#1d4ed8',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={13} />
                          <span>ดูหน้าเว็บ</span>
                        </Link>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditModal(author)}
                            title="แก้ไขข้อมูลผู้เขียน"
                            style={{
                              padding: '6px 12px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              color: 'var(--dtv-ink)',
                              fontSize: '0.82rem',
                              fontWeight: 500,
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
                            onClick={() => handleDelete(author)}
                            title="ลบหรือปิดใช้งาน"
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

      {/* Add / Edit Author Modal */}
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
              maxWidth: '560px',
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
                {editingAuthor ? 'แก้ไขข้อมูลผู้เขียน/ผู้ตรวจทาน' : 'เพิ่มผู้เขียน/ผู้ตรวจทานใหม่'}
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

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ชื่อ-นามสกุล หรือชื่อทีมผู้เขียน *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณพิมพ์พิศา ชาญวสุนันท์ หรือ ทีมวิชาการภาษี ดีถาวรการบัญชี"
                  value={formName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormName(val);
                    if (!editingAuthor && !isSlugCustomized) {
                      setFormSlug(slugify(val));
                    }
                  }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                    URL Slug (คีย์ระบุตัวตนใน URL) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formName) {
                        setFormSlug(slugify(formName));
                        setIsSlugCustomized(false);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--dtv-navy-800)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                    title="แปลงชื่อด้านบนเป็น Slug อัตโนมัติ"
                  >
                    รีเซ็ต Slug ตามชื่อใหม่
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น pimpisa-chanwasunan หรือ deethavorn-tax-editorial"
                  value={formSlug}
                  onChange={(e) => {
                    setIsSlugCustomized(true);
                    setFormSlug(e.target.value.toLowerCase().replace(/[\s\t\n]+/g, '-'));
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontFamily: 'monospace',
                  }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  ใช้ระบุตัวตนผู้เขียนในระบบและการค้นหาบทความ (เช่น <code>/knowledge?author={formSlug || 'slug'}</code>)
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ตำแหน่ง / บทบาทในสำนักงาน
                </label>
                <input
                  type="text"
                  placeholder="เช่น ผู้ก่อตั้งและหัวหน้าคณะผู้สอบบัญชี, ผู้สอบบัญชีรับอนุญาต (CPA)"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
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
                  คุณวุฒิวิชาชีพ / ใบอนุญาต (สำหรับ E-E-A-T)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ผู้สอบบัญชีรับอนุญาต (CPA Thailand เลขทะเบียน xxxxx) ประสบการณ์กว่า 20 ปี"
                  value={formCredentials}
                  onChange={(e) => setFormCredentials(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ประวัติย่อและความเชี่ยวชาญ (Bio)
                </label>
                <textarea
                  rows={3}
                  placeholder="ประวัติการทำงาน ความเชี่ยวชาญด้านภาษีนิติบุคคล หรือการตรวจสอบบัญชี..."
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>
                  รูปโปรไฟล์ผู้เขียน (Profile Photo)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
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
                    {formProfileImage ? (
                      <Image src={formProfileImage} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                    ) : (
                      <User size={30} color="#3b82f6" />
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
                      <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพจากเครื่อง'}</span>
                    </button>

                    {formProfileImage && (
                      <button
                        type="button"
                        onClick={() => setFormProfileImage('')}
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
                  placeholder="/images/DTV LOGO.png หรือ URL รูปถ่าย"
                  value={formProfileImage}
                  onChange={(e) => setFormProfileImage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#64748b',
                  }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  รองรับไฟล์ JPG, PNG, WebP (สูงสุด 5 MB) หรือใส่ Path / URL รูปภาพ
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  ลิงก์อ้างอิงโปรไฟล์ภายนอก (SameAs URLs - แยกบรรทัดละ 1 ลิงก์)
                </label>
                <textarea
                  rows={2}
                  placeholder="https://deethavorn.com/#why-us&#10;https://www.tfac.or.th/..."
                  value={formSameAs}
                  onChange={(e) => setFormSameAs(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="author-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="author-is-active" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  เปิดใช้งานสำหรับให้เลือกในบทความ (Active)
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
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
