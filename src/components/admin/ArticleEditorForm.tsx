'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  ShieldCheck,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Upload,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Search,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Link2,
  Table,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code,
  Lightbulb,
  UserCheck,
  X,
  Layers,
  ImageIcon,
} from 'lucide-react';
import { slugify, analyzeContentQuality } from '@/lib/articles/validation';
import { analyzeSeoScore } from '@/lib/articles/seo-engine';
import ArticleBody from '@/components/articles/ArticleBody';
import { useAdminSession } from '@/components/admin/AdminSessionContext';
import SeoSuiteCard from '@/components/admin/SeoSuiteCard';

interface AuthorOption {
  id: number;
  name: string;
  role: string | null;
}

interface FaqItem {
  id?: number;
  question: string;
  answer: string;
  sortOrder: number;
}

interface CitationItem {
  id?: number;
  title: string;
  publisher: string;
  url: string;
  referenceDate: string;
  sortOrder: number;
}

export interface ArticleFormData {
  id?: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  contentMarkdown: string;
  coverImage: string;
  coverImageAlt: string;
  quickAnswer: string;
  authorId: number | null;
  reviewerId: number | null;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  nextReviewAt: string;
  publishedAt?: string | null;
  faqs: FaqItem[];
  citations: CitationItem[];
  focusKeyword?: string | null;
  seoScore?: number | null;
  isNoIndex?: boolean;
  canonicalUrl?: string | null;
  ogImage?: string | null;
}

interface ArticleEditorFormProps {
  initialData?: ArticleFormData;
  authors: AuthorOption[];
  isNew?: boolean;
}

const CATEGORIES = [
  'ภาษีและสรรพากร',
  'จดทะเบียนธุรกิจ',
  'ตรวจสอบบัญชี',
  'วางแผนภาษี',
  'บัญชีและงบการเงิน',
  'ทรัพยากรบุคคล',
];

export default function ArticleEditorForm({
  initialData,
  authors,
  isNew = false,
}: ArticleEditorFormProps) {
  const router = useRouter();
  const { user } = useAdminSession();

  const [formData, setFormData] = useState<ArticleFormData>(
    initialData || {
      title: '',
      slug: '',
      category: 'ภาษีและสรรพากร',
      summary: '',
      contentMarkdown: '',
      coverImage: '',
      coverImageAlt: '',
      quickAnswer: '',
      authorId: authors[0]?.id || null,
      reviewerId: null,
      status: 'DRAFT',
      nextReviewAt: '',
      faqs: [],
      citations: [],
      focusKeyword: '',
      seoScore: 0,
      isNoIndex: false,
      canonicalUrl: '',
      ogImage: '',
    }
  );

  const [activeTab, setActiveTab] = useState<'content' | 'faqs' | 'citations' | 'seo' | 'editorial'>('content');
  const [metaCollapsed, setMetaCollapsed] = useState(true);
  const [markdownViewMode, setMarkdownViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSlugManual, setIsSlugManual] = useState(!isNew);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Body Image Insertion Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [bodyImageUrl, setBodyImageUrl] = useState('');
  const [bodyImageAlt, setBodyImageAlt] = useState('');
  const [uploadingBodyImage, setUploadingBodyImage] = useState(false);
  const [bodyImageUploadError, setBodyImageUploadError] = useState('');
  const bodyImageInputRef = useRef<HTMLInputElement>(null);

  // Author Management & Quick Add
  const [authorList, setAuthorList] = useState<AuthorOption[]>(authors);
  const [quickAuthorModalOpen, setQuickAuthorModalOpen] = useState(false);
  const [quickAuthorTarget, setQuickAuthorTarget] = useState<'author' | 'reviewer'>('author');
  const [quickAuthorName, setQuickAuthorName] = useState('');
  const [quickAuthorRole, setQuickAuthorRole] = useState('');
  const [quickAuthorCredentials, setQuickAuthorCredentials] = useState('');
  const [quickAuthorBio, setQuickAuthorBio] = useState('');
  const [quickAuthorSaving, setQuickAuthorSaving] = useState(false);
  const [quickAuthorError, setQuickAuthorError] = useState('');

  useEffect(() => {
    if (authors && authors.length > 0) {
      setAuthorList(authors);
    }
  }, [authors]);

  const handleOpenQuickAuthor = (target: 'author' | 'reviewer') => {
    setQuickAuthorTarget(target);
    setQuickAuthorName('');
    setQuickAuthorRole(target === 'reviewer' ? 'ผู้สอบบัญชีรับอนุญาต (CPA)' : 'ผู้เชี่ยวชาญด้านบัญชีและภาษี');
    setQuickAuthorCredentials('');
    setQuickAuthorBio('');
    setQuickAuthorError('');
    setQuickAuthorModalOpen(true);
  };

  const handleQuickAddAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAuthorName.trim()) {
      setQuickAuthorError('กรุณากรอกชื่อผู้เขียน/ผู้ตรวจทาน');
      return;
    }
    setQuickAuthorSaving(true);
    setQuickAuthorError('');
    try {
      const res = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickAuthorName.trim(),
          role: quickAuthorRole.trim() || null,
          credentials: quickAuthorCredentials.trim() || null,
          bio: quickAuthorBio.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      }
      const newAuthor: AuthorOption = {
        id: data.data.id,
        name: data.data.name,
        role: data.data.role,
      };
      setAuthorList((prev) => [...prev, newAuthor]);
      if (quickAuthorTarget === 'author') {
        setFormData((prev) => ({ ...prev, authorId: newAuthor.id }));
      } else {
        setFormData((prev) => ({ ...prev, reviewerId: newAuthor.id }));
      }
      setQuickAuthorModalOpen(false);
    } catch (err: any) {
      setQuickAuthorError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    } finally {
      setQuickAuthorSaving(false);
    }
  };

  // Helper to insert markdown tags around selection or at cursor
  const insertMarkdown = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.contentMarkdown || '';
    const selectedText = currentText.substring(start, end);

    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${defaultText}${suffix}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    setFormData((prev) => ({ ...prev, contentMarkdown: newContent }));

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultText.length);
      }
    }, 40);
  };

  const insertTable = () => {
    const tableTemplate = `\n| หัวข้อคอลัมน์ 1 | หัวข้อคอลัมน์ 2 | รายละเอียด |\n| :--- | :--- | :--- |\n| ข้อมูลแถวที่ 1 | 100,000 | อัตราปกติ |\n| ข้อมูลแถวที่ 2 | 200,000 | ได้รับการยกเว้น |\n`;
    insertMarkdown(tableTemplate, '', '');
  };

  const insertLink = () => {
    const url = window.prompt('กรุณากรอก URL ลิงก์ปลายทาง:', 'https://');
    if (!url) return;
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;
    const selectedText = (formData.contentMarkdown || '').substring(start, end) || 'ข้อความลิงก์';
    insertMarkdown(`[${selectedText}](${url})`, '', '');
  };

  // Upload image to be inserted into body content
  const handleBodyImageUpload = async (file: File) => {
    setUploadingBodyImage(true);
    setBodyImageUploadError('');
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/uploads/article-cover', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'อัปโหลดภาพไม่สำเร็จ');
      }

      setBodyImageUrl(json.data.url);
      if (!bodyImageAlt && file.name) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setBodyImageAlt(cleanName);
      }
    } catch (err: any) {
      setBodyImageUploadError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดภาพ');
    } finally {
      setUploadingBodyImage(false);
    }
  };

  // Insert image markdown into textarea
  const handleInsertImage = () => {
    if (!bodyImageUrl.trim()) {
      setBodyImageUploadError('กรุณาระบุ URL ของรูปภาพ หรืออัปโหลดไฟล์ภาพก่อนแทรก');
      return;
    }
    const altText = bodyImageAlt.trim() || 'ภาพประกอบบทความ';
    insertMarkdown(`\n\n![${altText}](${bodyImageUrl.trim()})\n\n`, '', '');
    setImageModalOpen(false);
    setBodyImageUrl('');
    setBodyImageAlt('');
    setBodyImageUploadError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'ข้อความตัวหนา');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', 'ข้อความตัวเอียง');
    }
  };

  // Permissions
  const canEdit = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:edit') || user?.permissions.includes('article:create'));
  const canReview = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:review'));
  const canPublish = Boolean(user?.permissions.includes('*') || user?.permissions.includes('article:publish'));

  // Auto-slug from title if not manually edited
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!isSlugManual) {
        updated.slug = slugify(val);
      }
      return updated;
    });
  };

  // Content Quality Analysis
  const quality = useMemo(() => {
    return analyzeContentQuality({
      title: formData.title,
      summary: formData.summary,
      contentMarkdown: formData.contentMarkdown,
      quickAnswer: formData.quickAnswer,
      coverImage: formData.coverImage,
      coverImageAlt: formData.coverImageAlt,
      faqs: formData.faqs,
      citations: formData.citations,
    });
  }, [formData]);

  // Real-time Rank Math SEO Suite Analysis
  const seoAnalysis = useMemo(() => {
    return analyzeSeoScore({
      title: formData.title,
      slug: formData.slug || formData.title,
      summary: formData.summary,
      contentMarkdown: formData.contentMarkdown,
      focusKeyword: formData.focusKeyword || '',
      coverImage: formData.coverImage,
      coverImageAlt: formData.coverImageAlt,
      faqs: formData.faqs,
      citations: formData.citations,
      authorId: formData.authorId,
      reviewerId: formData.reviewerId,
    });
  }, [formData]);

  // Upload cover image
  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setErrorMessage('');
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/uploads/article-cover', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'อัปโหลดภาพไม่สำเร็จ');
      }

      setFormData((prev) => ({
        ...prev,
        coverImage: json.data.url,
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดภาพ');
    } finally {
      setUploadingCover(false);
    }
  };

  // Add FAQ item
  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: '', answer: '', sortOrder: prev.faqs.length },
      ],
    }));
  };

  // Remove FAQ item
  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Update FAQ item
  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }));
  };

  // Add Citation item
  const handleAddCitation = () => {
    setFormData((prev) => ({
      ...prev,
      citations: [
        ...prev.citations,
        { title: '', publisher: '', url: '', referenceDate: '', sortOrder: prev.citations.length },
      ],
    }));
  };

  // Remove Citation item
  const handleRemoveCitation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      citations: prev.citations.filter((_, i) => i !== index),
    }));
  };

  // Update Citation item
  const handleUpdateCitation = (index: number, field: keyof CitationItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      citations: prev.citations.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  // Save Article (Draft / Edit)
  const handleSave = async (targetStatus?: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED') => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        slug: slugify(formData.slug || formData.title),
        status: targetStatus || formData.status,
        focusKeyword: formData.focusKeyword ? formData.focusKeyword.trim() : null,
        seoScore: seoAnalysis.score,
        isNoIndex: Boolean(formData.isNoIndex),
        canonicalUrl: formData.canonicalUrl ? formData.canonicalUrl.trim() : null,
        ogImage: formData.ogImage ? formData.ogImage.trim() : null,
      };

      let res: Response;
      if (isNew) {
        res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/articles/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'บันทึกบทความไม่สำเร็จ');
      }

      setSuccessMessage(json.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMessage(''), 4000);

      if (isNew && json.data?.id) {
        router.push(`/admin/articles/${json.data.id}`);
      } else if (json.data) {
        setFormData((prev) => ({
          ...prev,
          ...json.data,
          faqs: json.data.faqs || prev.faqs,
          citations: json.data.citations || prev.citations,
        }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // Workflow Action Handlers
  const handleWorkflowAction = async (action: 'submit' | 'approve' | 'publish' | 'unpublish' | 'archive') => {
    if (!formData.id) return;
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let res: Response;
      if (action === 'submit') {
        res = await fetch(`/api/admin/articles/${formData.id}/submit`, { method: 'POST' });
      } else if (action === 'approve') {
        res = await fetch(`/api/admin/articles/${formData.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewerId: formData.reviewerId }),
        });
      } else {
        res = await fetch(`/api/admin/articles/${formData.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'การดำเนินการไม่สำเร็จ');
      }

      setSuccessMessage(json.message || 'ดำเนินการสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 4000);
      if (json.data) {
        setFormData((prev) => ({
          ...prev,
          status: json.data.status,
          publishedAt: json.data.publishedAt,
          reviewerId: json.data.reviewerId ?? prev.reviewerId,
        }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '0 32px 48px' }}>
      {/* 1. Sticky Top Action Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 32px',
          margin: '0 -32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Left: Back Link & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/articles"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              color: '#475569',
              textDecoration: 'none',
              fontWeight: 500,
            }}
            className="hover-gold"
          >
            <ArrowLeft size={16} />
            <span>กลับรายการบทความ</span>
          </Link>

          <div style={{ width: '1px', height: '20px', background: '#cbd5e1' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background:
                  formData.status === 'PUBLISHED'
                    ? '#ecfdf5'
                    : formData.status === 'APPROVED'
                    ? '#eff6ff'
                    : formData.status === 'IN_REVIEW'
                    ? '#fefce8'
                    : formData.status === 'ARCHIVED'
                    ? '#fef2f2'
                    : '#f1f5f9',
                color:
                  formData.status === 'PUBLISHED'
                    ? '#059669'
                    : formData.status === 'APPROVED'
                    ? '#2563eb'
                    : formData.status === 'IN_REVIEW'
                    ? '#ca8a04'
                    : formData.status === 'ARCHIVED'
                    ? '#dc2626'
                    : '#475569',
                border: '1px solid currentColor',
              }}
            >
              {formData.status}
            </span>

            {formData.status === 'PUBLISHED' && (
              <a
                href={`/knowledge/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem',
                  color: 'var(--dtv-blue-600)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                <span>เปิดดูหน้าจริง</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Right: Quick SEO Score Pill + Workflow Transition Buttons + Primary Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick SEO Score Pill (clickable to jump to SEO tab) */}
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            title="คลิกเพื่อเปิดหน้าต่างวิเคราะห์ SEO & Social Preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background:
                seoAnalysis.score >= 80 ? '#dcfce7' : seoAnalysis.score >= 50 ? '#fef3c7' : '#fee2e2',
              color:
                seoAnalysis.score >= 80 ? '#15803d' : seoAnalysis.score >= 50 ? '#b45309' : '#b91c1c',
              border: `1.5px solid ${
                seoAnalysis.score >= 80 ? '#bbf7d0' : seoAnalysis.score >= 50 ? '#fde68a' : '#fecaca'
              }`,
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} />
            <span style={{ whiteSpace: 'nowrap' }}>SEO: {seoAnalysis.score} / 100</span>
          </button>

          {/* Workflow Transitions */}
          {!isNew && (
            <>
              {formData.status === 'DRAFT' && canEdit && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleWorkflowAction('submit')}
                  style={{
                    padding: '8px 14px',
                    background: '#fefce8',
                    color: '#ca8a04',
                    border: '1px solid #fef08a',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} />
                  <span>ส่งตรวจ</span>
                </button>
              )}

              {formData.status === 'IN_REVIEW' && canReview && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleWorkflowAction('approve')}
                  style={{
                    padding: '8px 14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>อนุมัติเนื้อหา</span>
                </button>
              )}

              {(formData.status === 'APPROVED' || formData.status === 'DRAFT' || formData.status === 'IN_REVIEW') && canPublish && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleWorkflowAction('publish')}
                  style={{
                    padding: '8px 14px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>เผยแพร่</span>
                </button>
              )}

              {formData.status === 'PUBLISHED' && canPublish && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleWorkflowAction('unpublish')}
                  style={{
                    padding: '8px 12px',
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  กลับไปเป็น Draft
                </button>
              )}
            </>
          )}

          {/* Primary Save Button */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            style={{
              padding: '8px 18px',
              background: 'var(--dtv-navy-900)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(9, 28, 58, 0.2)',
            }}
          >
            <Save size={15} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกบทความ'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
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
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
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
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Main Full-Width Container (No cramping right sidebar!) */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Form Tabs Navigation Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '24px',
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            style={{
              padding: '11px 18px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'content' ? 'var(--dtv-navy-950)' : '#64748b',
              borderBottom: activeTab === 'content' ? '3px solid var(--dtv-blue-600)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <FileText size={16} />
            <span>1. เขียนเนื้อหาบทความ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            style={{
              padding: '11px 18px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'faqs' ? 'var(--dtv-navy-950)' : '#64748b',
              borderBottom: activeTab === 'faqs' ? '3px solid var(--dtv-blue-600)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <HelpCircle size={16} />
            <span>2. คำถามที่พบบ่อย (FAQs)</span>
            {formData.faqs.length > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  background: '#e2e8f0',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {formData.faqs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('citations')}
            style={{
              padding: '11px 18px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'citations' ? 'var(--dtv-navy-950)' : '#64748b',
              borderBottom: activeTab === 'citations' ? '3px solid var(--dtv-blue-600)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <BookOpen size={16} />
            <span>3. แหล่งอ้างอิงกฎหมาย</span>
            {formData.citations.length > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  background: '#e2e8f0',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {formData.citations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            style={{
              padding: '11px 18px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'seo' ? 'var(--dtv-navy-950)' : '#64748b',
              borderBottom: activeTab === 'seo' ? '3px solid var(--dtv-blue-600)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="#2563eb" />
            <span>4. วิเคราะห์ SEO & Social Preview</span>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                background:
                  seoAnalysis.score >= 80 ? '#dcfce7' : seoAnalysis.score >= 50 ? '#fef3c7' : '#fee2e2',
                color:
                  seoAnalysis.score >= 80 ? '#15803d' : seoAnalysis.score >= 50 ? '#b45309' : '#b91c1c',
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                flexShrink: 0,
                lineHeight: 1.2,
              }}
            >
              {seoAnalysis.score} / 100
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('editorial')}
            style={{
              padding: '11px 18px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'editorial' ? 'var(--dtv-navy-950)' : '#64748b',
              borderBottom: activeTab === 'editorial' ? '3px solid var(--dtv-blue-600)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <UserCheck size={16} />
            <span>5. ตรวจทาน & นัดหมายรอบทบทวน</span>
          </button>
        </div>

          {/* TAB 1: CONTENT & COVER */}
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Title & Category Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid var(--admin-card-border)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '18px', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'var(--dtv-navy-950)' }}>
                      หัวข้อบทความ (Article Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ภาษีมูลค่าเพิ่ม (VAT 7%) ธุรกิจแบบไหนต้องจด..."
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '1.15rem',
                        fontWeight: 600,
                        color: '#0f172a',
                      }}
                    />
                    <div style={{ fontSize: '0.8rem', color: quality.titleStatus === 'good' ? '#16a34a' : '#ca8a04', marginTop: '6px' }}>
                      {formData.title.length} ตัวอักษร ({quality.titleMessage})
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'var(--dtv-navy-950)' }}>
                      หมวดหมู่ (Category) *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        color: '#0f172a',
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Cover Image Upload Card */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid var(--admin-card-border)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                }}
              >
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: 'var(--dtv-navy-950)' }}>
                  ภาพหน้าปกบทความ (Cover Image) & Alt Text
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'center' }}>
                  <div>
                    {formData.coverImage ? (
                      <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#0f172a' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.coverImage}
                          alt={formData.coverImageAlt || 'Cover image'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: '140px',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '2px dashed #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: '0.85rem',
                        }}
                      >
                        <Upload size={24} style={{ marginBottom: '6px' }} />
                        <span>ยังไม่มีภาพหน้าปก</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      type="file"
                      id="cover-file-input"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCoverUpload(file);
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={() => document.getElementById('cover-file-input')?.click()}
                        disabled={uploadingCover}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Upload size={14} />
                        <span>{uploadingCover ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ภาพหน้าปก'}</span>
                      </button>
                      {formData.coverImage && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImage: '', coverImageAlt: '' })}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ลบภาพ
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="คำอธิบายภาพหน้าปก (Alt Text สำหรับผู้พิการทางสายตา & SEO) *"
                      value={formData.coverImageAlt}
                      onChange={(e) => setFormData({ ...formData, coverImageAlt: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Collapsible Meta & Snippet Drawer (Slug, Summary, Quick Answer) */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMetaCollapsed(!metaCollapsed)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: '#f8fafc',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: metaCollapsed ? 'none' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Layers size={18} color="#2563eb" />
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                      ข้อมูลเสริมและสรุปบทความ (URL Slug, บทสรุปย่อ Meta, Quick Answer)
                    </span>
                    {metaCollapsed && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                        /knowledge/{formData.slug || 'slug'}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                    <span>{metaCollapsed ? 'คลิกเพื่อเปิดแก้ไขข้อมูลย่อย' : 'ย่อเก็บเพื่อโฟกัสการเขียน'}</span>
                    {metaCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </div>
                </button>

                {!metaCollapsed && (
                  <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Slug Input */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          URL Slug *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsSlugManual(!isSlugManual)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--dtv-blue-600)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {isSlugManual ? 'เปลี่ยนเป็นสร้างอัตโนมัติ' : 'แก้ไข Slug ด้วยตนเอง'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                          style={{
                            padding: '10px 12px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRight: 'none',
                            borderRadius: '8px 0 0 8px',
                            fontSize: '0.85rem',
                            color: '#64748b',
                          }}
                        >
                          /knowledge/
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          readOnly={!isSlugManual}
                          onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '0 8px 8px 0',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.92rem',
                            background: isSlugManual ? '#ffffff' : '#f8fafc',
                          }}
                        />
                      </div>
                      {!isNew && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                          * หากเปลี่ยน Slug ระบบจะสร้าง 301 Permanent Redirect จาก URL เดิมให้อัตโนมัติ เพื่อรักษา SEO
                        </div>
                      )}
                    </div>

                    {/* Summary / Meta Description */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '6px' }}>
                        บทสรุปบทความ (Summary / Meta Description) *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="สรุปเนื้อหาสำคัญ 2–3 ประโยค สำหรับแสดงบน Google Search และหัวการ์ดบทความ..."
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          lineHeight: 1.5,
                        }}
                      />
                      <div style={{ fontSize: '0.8rem', color: quality.summaryStatus === 'good' ? '#16a34a' : '#ca8a04', marginTop: '4px' }}>
                        {formData.summary.length} ตัวอักษร ({quality.summaryMessage})
                      </div>
                    </div>

                    {/* Quick Answer (AEO / BLUF) Box */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
                        padding: '18px 20px',
                        borderRadius: '10px',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Sparkles size={16} color="#2563eb" />
                        <label style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e40af' }}>
                          สรุปประเด็นสำคัญใน 1 นาที (Quick Answer / Key Takeaways for AEO)
                        </label>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 8px', lineHeight: 1.45 }}>
                        ข้อความสรุปด่วนตรงนี้จะแสดงเด่นอยู่บนสุดของบทความ ช่วยให้ผู้อ่านและ AI Overviews ดึงคำตอบที่ชัดเจนไปใช้ได้ทันที
                      </p>
                      <textarea
                        rows={3}
                        placeholder="เช่น กิจการที่มีรายรับเกิน 1.8 ล้านบาทต่อปี ต้องยื่นจดทะเบียนภาษีมูลค่าเพิ่มภายใน 30 วันนับแต่วันที่มีรายรับถึงเกณฑ์..."
                        value={formData.quickAnswer}
                        onChange={(e) => setFormData({ ...formData, quickAnswer: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #93c5fd',
                          fontSize: '0.92rem',
                          background: '#ffffff',
                          lineHeight: 1.6,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Markdown Editor with Split / Preview modes */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid var(--admin-card-border)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    เนื้อหาบทความ (Restricted Markdown) *
                  </label>
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setMarkdownViewMode('edit')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: markdownViewMode === 'edit' ? '#ffffff' : 'transparent',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: markdownViewMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      เขียนอย่างเดียว
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkdownViewMode('split')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: markdownViewMode === 'split' ? '#ffffff' : 'transparent',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: markdownViewMode === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      แบ่งหน้าจอ (Split)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkdownViewMode('preview')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: markdownViewMode === 'preview' ? '#ffffff' : 'transparent',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: markdownViewMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      ดูผลลัพธ์จริง
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      markdownViewMode === 'split' ? '1fr 1fr' : '1fr',
                    gap: '16px',
                    minHeight: '480px',
                  }}
                >
                  {/* Editor Column with Visual Toolbar + Textarea */}
                  {(markdownViewMode === 'edit' || markdownViewMode === 'split') && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Visual Formatting Toolbar */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderBottom: 'none',
                          borderRadius: '8px 8px 0 0',
                          padding: '8px 12px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {/* Heading Group */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('\n## ', '\n', 'หัวข้อย่อยหลัก')}
                            title="หัวข้อย่อยหลัก (H2)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          >
                            <Heading2 size={15} />
                            <span>H2</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('\n### ', '\n', 'หัวข้อย่อยรอง')}
                            title="หัวข้อย่อยรอง (H3)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          >
                            <Heading3 size={15} />
                            <span>H3</span>
                          </button>
                        </div>

                        <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 3px' }} />

                        {/* Inline Formatting Group */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('**', '**', 'ข้อความตัวหนา')}
                            title="ตัวหนา (Bold - Ctrl+B)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <Bold size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('*', '*', 'ข้อความตัวเอียง')}
                            title="ตัวเอียง (Italic - Ctrl+I)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <Italic size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('`', '`', 'คำศัพท์เฉพาะ')}
                            title="เน้นคำศัพท์ (Code/Tag)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <Code size={15} />
                          </button>
                        </div>

                        <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 3px' }} />

                        {/* Link & Table Group */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={insertLink}
                            title="แทรกลิงก์ (Insert Link)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                            }}
                          >
                            <Link2 size={14} />
                            <span>ลิงก์</span>
                          </button>
                          <button
                            type="button"
                            onClick={insertTable}
                            title="แทรกตารางข้อมูล (Insert Table)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                            }}
                          >
                            <Table size={14} />
                            <span>ตาราง</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBodyImageUploadError('');
                              setImageModalOpen(true);
                            }}
                            title="แทรกรูปภาพประกอบในเนื้อหา (Insert Image)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              borderRadius: '5px',
                              color: '#0284c7',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            <ImageIcon size={14} />
                            <span>รูปภาพ</span>
                          </button>
                        </div>

                        <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 3px' }} />

                        {/* Lists Group */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('\n- ', '', 'รายการหัวข้อย่อย')}
                            title="รายการแบบจุดไข่ปลา (Bullet List)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <List size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('\n1. ', '', 'รายการลำดับที่ 1')}
                            title="รายการแบบตัวเลข (Numbered List)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <ListOrdered size={15} />
                          </button>
                        </div>

                        <div style={{ width: '1px', height: '18px', background: '#cbd5e1', margin: '0 3px' }} />

                        {/* Callout & Divider */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('\n> ', '', 'ข้อคิดเห็นหรือประเด็นทางภาษีสำคัญ')}
                            title="กล่องข้อความเน้น (Quote / Callout)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <Quote size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('\n\n---\n\n', '', '')}
                            title="เส้นคั่นแบ่งส่วนเนื้อหา (Horizontal Divider)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '5px 8px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            <Minus size={15} />
                          </button>
                        </div>

                        {/* Help Toggle */}
                        <div style={{ marginLeft: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                            title="แนะนำวิธีใช้แถบเครื่องมือ"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              background: showMarkdownHelp ? '#e0f2fe' : '#ffffff',
                              border: '1px solid',
                              borderColor: showMarkdownHelp ? '#bae6fd' : '#cbd5e1',
                              borderRadius: '5px',
                              color: showMarkdownHelp ? '#0369a1' : '#64748b',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Lightbulb size={13} />
                            <span>วิธีใช้</span>
                          </button>
                        </div>
                      </div>

                      {/* Visual Toolbar Help Banner */}
                      {showMarkdownHelp && (
                        <div
                          style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderBottom: 'none',
                            padding: '10px 14px',
                            fontSize: '0.82rem',
                            color: '#0369a1',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong>💡 เคล็ดลับการจัดรูปแบบ:</strong>
                          <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
                            <li>ใช้เมาส์<strong>คลุมดำข้อความ</strong> แล้วกดปุ่มบนแถบเครื่องมือ เช่น [B] ตัวหนา หรือ [H2] เพื่อจัดรูปแบบทันที</li>
                            <li>คลิกปุ่ม <strong>[รูปภาพ]</strong> เพื่ออัปโหลดภาพแบบฟอร์ม/Infographic หรือใส่ URL พร้อมระบุคำอธิบาย Alt Text ช่วยดันคะแนน Image SEO</li>
                            <li>หากใครถนัดพิมพ์โค้ด <code>##</code>, <code>**</code>, <code>-</code>, <code>![คำอธิบาย](url)</code> หรือตาราง Markdown โดยตรง ก็สามารถพิมพ์ได้ตามปกติ</li>
                            <li>รองรับคีย์ลัด <code>Ctrl+B</code> (ตัวหนา) และ <code>Ctrl+I</code> (ตัวเอียง) เหมือนใน Microsoft Word</li>
                          </ul>
                        </div>
                      )}

                      {/* Textarea */}
                      <textarea
                        ref={textareaRef}
                        rows={22}
                        placeholder="พิมพ์เนื้อหาบทความ: สามารถคลิกปุ่มบนแถบเครื่องมือด้านบนเพื่อจัดรูปแบบ หรือพิมพ์โค้ด Markdown (##, **, -, ตาราง) ได้โดยตรง..."
                        value={formData.contentMarkdown}
                        onChange={(e) => setFormData({ ...formData, contentMarkdown: e.target.value })}
                        onKeyDown={handleKeyDown}
                        style={{
                          width: '100%',
                          height: '100%',
                          minHeight: '440px',
                          padding: '14px',
                          borderRadius: '0 0 8px 8px',
                          border: '1px solid #cbd5e1',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}

                  {/* Live Rendered Markdown Preview */}
                  {(markdownViewMode === 'preview' || markdownViewMode === 'split') && (
                    <div
                      style={{
                        padding: '20px 24px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        overflowY: 'auto',
                        maxHeight: '600px',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Live Reader Preview
                      </div>
                      {formData.contentMarkdown ? (
                        <ArticleBody contentMarkdown={formData.contentMarkdown} />
                      ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          ยังไม่มีข้อความพิมพ์ในช่องเนื้อหา...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAQS BUILDER */}
          {activeTab === 'faqs' && (
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--dtv-navy-950)' }}>
                    คำถามที่พบบ่อย (Frequently Asked Questions - FAQPage Schema)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    สร้าง FAQ สำหรับแสดงผลบนหน้าบทความ และแปลงเป็น JSON-LD FAQPage Schema อัตโนมัติ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: 'var(--dtv-blue-600)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={16} />
                  <span>เพิ่มคำถาม FAQ</span>
                </button>
              </div>

              {formData.faqs.length === 0 ? (
                <div
                  style={{
                    padding: '36px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#94a3b8',
                  }}
                >
                  <HelpCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>ยังไม่มีคำถามที่พบบ่อย กดปุ่ม &quot;เพิ่มคำถาม FAQ&quot; ด้านบนเพื่อเพิ่มข้อซักถาม</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.faqs.map((faq, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dtv-navy-900)' }}>
                          คำถามที่ {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="ลบคำถามนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="คำถาม เช่น จดทะเบียน VAT แล้วต้องยื่นแบบทุกเดือนหรือไม่?"
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                          }}
                        />
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          placeholder="คำตอบที่ถูกต้องและกระชับ..."
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CITATIONS BUILDER */}
          {activeTab === 'citations' && (
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--dtv-navy-950)' }}>
                    แหล่งอ้างอิงทางกฎหมายและระเบียบวิชาชีพ (E-E-A-T Citations)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    อ้างอิงแหล่งกฎหมายจริง เช่น ประมวลรัษฎากร กรมสรรพากร หรือ DBD เพื่อความน่าเชื่อถือ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCitation}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: 'var(--dtv-blue-600)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={16} />
                  <span>เพิ่มแหล่งอ้างอิง</span>
                </button>
              </div>

              {formData.citations.length === 0 ? (
                <div
                  style={{
                    padding: '36px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    color: '#94a3b8',
                  }}
                >
                  <BookOpen size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>ยังไม่มีรายการอ้างอิง กดปุ่ม &quot;เพิ่มแหล่งอ้างอิง&quot; เพื่อสร้างความโปร่งใสและหลักฐานทางกฎหมาย</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.citations.map((c, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dtv-navy-900)' }}>
                          แหล่งอ้างอิงที่ {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCitation(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '10px' }}>
                        <div>
                          <input
                            type="text"
                            placeholder="ชื่อกฎหมายหรือเอกสาร เช่น ประมวลรัษฎากร มาตรา 81/1"
                            value={c.title}
                            onChange={(e) => handleUpdateCitation(index, 'title', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="หน่วยงาน เช่น กรมสรรพากร"
                            value={c.publisher}
                            onChange={(e) => handleUpdateCitation(index, 'publisher', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.88rem',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                        <div>
                          <input
                            type="url"
                            placeholder="ลิงก์ URL อ้างอิง เช่น https://www.rd.go.th/..."
                            value={c.url}
                            onChange={(e) => handleUpdateCitation(index, 'url', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            placeholder="วันที่เข้าถึง"
                            value={c.referenceDate ? c.referenceDate.split('T')[0] : ''}
                            onChange={(e) => handleUpdateCitation(index, 'referenceDate', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EDITORIAL & GOVERNANCE */}
          {activeTab === 'editorial' && (
            <div
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--dtv-navy-950)' }}>
                  การตรวจทานและผู้เชี่ยวชาญ (Editorial Governance)
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  ระบบติดตามผู้เขียน ผู้ตรวจความถูกต้องทางภาษี และกำหนดรอบการทบทวนกฎหมายที่อาจเปลี่ยนแปลง
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      ผู้เขียนบทความ (Author) *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAuthor('author')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--dtv-navy-800)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                      title="เพิ่มผู้เขียนบทความคนใหม่เข้าระบบ"
                    >
                      <Plus size={14} /> เพิ่มผู้เขียนใหม่
                    </button>
                  </div>
                  <select
                    value={formData.authorId || ''}
                    onChange={(e) => setFormData({ ...formData, authorId: Number(e.target.value) || null })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  >
                    <option value="">-- เลือกผู้เขียนบทความ --</option>
                    {authorList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role || 'ไม่มีตำแหน่ง'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                      ผู้ตรวจทานความถูกต้อง (Expert Reviewer)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAuthor('reviewer')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--dtv-navy-800)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                      title="เพิ่มผู้ตรวจทานคนใหม่เข้าระบบ"
                    >
                      <Plus size={14} /> เพิ่มผู้ตรวจทานใหม่
                    </button>
                  </div>
                  <select
                    value={formData.reviewerId || ''}
                    onChange={(e) => setFormData({ ...formData, reviewerId: Number(e.target.value) || null })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  >
                    <option value="">-- เลือกผู้ตรวจทาน (CPA / ที่ปรึกษาภาษี) --</option>
                    {authorList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role || 'ไม่มีตำแหน่ง'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
                <a
                  href="/admin/authors"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ExternalLink size={13} /> ไปที่หน้าจัดการผู้เขียนและผู้ตรวจทานทั้งหมด ↗
                </a>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  กำหนดวันทบทวนกฎหมายรอบถัดไป (Next Review Date)
                </label>
                <input
                  type="date"
                  value={formData.nextReviewAt ? formData.nextReviewAt.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, nextReviewAt: e.target.value })}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    maxWidth: '260px',
                  }}
                />
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  ระบบจะแจ้งเตือนเมื่อบทความนี้ใกล้ถึงวันกำหนดทบทวน เพื่อป้องกันข้อมูลภาษีล้าสมัย
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO SUITE & SOCIAL PREVIEWS */}
          {activeTab === 'seo' && (
            <SeoSuiteCard
              formData={formData}
              analysis={seoAnalysis}
              onChangeFocusKeyword={(kw) => setFormData((prev) => ({ ...prev, focusKeyword: kw }))}
              onChangeNoIndex={(val) => setFormData((prev) => ({ ...prev, isNoIndex: val }))}
              onChangeCanonicalUrl={(url) => setFormData((prev) => ({ ...prev, canonicalUrl: url }))}
              onChangeOgImage={(url) => setFormData((prev) => ({ ...prev, ogImage: url }))}
            />
          )}
      </div>

      {/* Quick Add Author / Reviewer Modal */}
      {quickAuthorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickAuthorModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'adminModalIn 0.2s ease-out',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--dtv-navy-950)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck size={20} style={{ color: 'var(--dtv-gold-400)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  {quickAuthorTarget === 'author' ? 'เพิ่มผู้เขียนใหม่ (Quick Add Author)' : 'เพิ่มผู้ตรวจทานใหม่ (Quick Add Reviewer)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickAuthorModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickAddAuthor} style={{ padding: '24px' }}>
              {quickAuthorError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.88rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{quickAuthorError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>
                    ชื่อ-นามสกุล หรือชื่อทีมงาน *
                  </label>
                  <input
                    type="text"
                    value={quickAuthorName}
                    onChange={(e) => setQuickAuthorName(e.target.value)}
                    placeholder="เช่น ศิริพร ดีถาวร หรือ ทีมงานภาษีดีถาวร"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>
                    ตำแหน่ง / บทบาท (Role)
                  </label>
                  <input
                    type="text"
                    value={quickAuthorRole}
                    onChange={(e) => setQuickAuthorRole(e.target.value)}
                    placeholder="เช่น ผู้สอบบัญชีรับอนุญาต (CPA), ที่ปรึกษาภาษีอาวุโส"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>
                    คุณวุฒิ / ใบอนุญาต (Credentials)
                  </label>
                  <input
                    type="text"
                    value={quickAuthorCredentials}
                    onChange={(e) => setQuickAuthorCredentials(e.target.value)}
                    placeholder="เช่น CPA (Thailand) ทะเบียนเลขที่ xxxxx, CPD, เนติบัณฑิต"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '5px' }}>
                    ประวัติหรือความเชี่ยวชาญย่อ (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={quickAuthorBio}
                    onChange={(e) => setQuickAuthorBio(e.target.value)}
                    placeholder="ประสบการณ์ทำงาน เช่น เชี่ยวชาญการตรวจสอบภาษีและโครงสร้างบริษัทกว่า 15 ปี..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuickAuthorModalOpen(false)}
                  disabled={quickAuthorSaving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={quickAuthorSaving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--dtv-navy-950)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: quickAuthorSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {quickAuthorSaving ? 'กำลังบันทึก...' : 'บันทึกและเลือกทันที'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Body Image Insertion Modal */}
      {imageModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--dtv-navy-950)' }}>
                    แทรกรูปภาพประกอบในเนื้อหาบทความ
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    รองรับภาพตัวอย่างแบบฟอร์ม แผนผังขั้นตอน หรือ Infographic
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {bodyImageUploadError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#b91c1c',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{bodyImageUploadError}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px', color: '#334155' }}>
                  1. เลือกอัปโหลดไฟล์ภาพจากเครื่อง หรือใส่ URL
                </label>
                <div
                  onClick={() => bodyImageInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: uploadingBodyImage ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    ref={bodyImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBodyImageUpload(file);
                    }}
                  />
                  <Upload size={28} color="#64748b" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--dtv-navy-950)' }}>
                    {uploadingBodyImage ? 'กำลังอัปโหลดไฟล์ภาพ...' : 'คลิกเพื่อเลือกไฟล์รูปภาพ (PNG, JPG, WebP)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                    ขนาดไฟล์ไม่เกิน 5 MB • ระบบจะจัดเก็บในเซิร์ฟเวอร์ให้อัตโนมัติ
                  </div>
                </div>
              </div>

              {/* Direct URL input */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '5px', color: '#475569' }}>
                  หรือระบุ URL รูปภาพโดยตรง
                </label>
                <input
                  type="text"
                  placeholder="https://... หรือ /uploads/articles/..."
                  value={bodyImageUrl}
                  onChange={(e) => setBodyImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Alt Text input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                    2. คำอธิบายภาพ (Alt Text / คำบรรยายใต้รูป) *
                  </label>
                  <span style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 600 }}>
                    แนะนำให้มี Focus Keyword เพื่อ SEO
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="เช่น ตัวอย่างแบบฟอร์ม ภ.พ.20 และขั้นตอนการจดทะเบียน"
                  value={bodyImageAlt}
                  onChange={(e) => setBodyImageAlt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  ข้อความนี้จะแสดงเป็นคำบรรยายใต้ภาพ (Caption) และช่วยให้ติดอันดับ Google Image Search
                </div>
              </div>

              {/* Preview Thumbnail */}
              {bodyImageUrl && (
                <div
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bodyImageUrl}
                      alt={bodyImageAlt || 'Preview'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--dtv-navy-950)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bodyImageAlt || 'ไม่มีคำอธิบายภาพ'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {bodyImageUrl}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!bodyImageUrl.trim() || uploadingBodyImage}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !bodyImageUrl.trim() || uploadingBodyImage ? '#94a3b8' : 'var(--dtv-navy-950)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: !bodyImageUrl.trim() || uploadingBodyImage ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <Plus size={16} />
                <span>แทรกรูปลงในเนื้อหา</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
