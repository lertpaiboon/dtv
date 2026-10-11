'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, RotateCcw, FileQuestion } from 'lucide-react';
import { Article } from '@/lib/articles/types';
import ArticleCard from './ArticleCard';

interface KnowledgeListClientProps {
  initialArticles: Article[];
}

const CATEGORIES = ['ทั้งหมด', 'ภาษีอากร', 'การทำบัญชี', 'ตรวจสอบบัญชี', 'จดทะเบียนธุรกิจ'];

export default function KnowledgeListClient({ initialArticles }: KnowledgeListClientProps) {
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialArticles.filter((item) => {
      // 1. Category check
      const matchesCategory = activeCategory === 'ทั้งหมด' || item.category === activeCategory;
      if (!matchesCategory) return false;

      // 2. Search query check
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const summaryMatch = item.summary.toLowerCase().includes(query);
      const keywordMatch = item.focusKeyword ? item.focusKeyword.toLowerCase().includes(query) : false;
      const categoryMatch = item.category.toLowerCase().includes(query);

      return titleMatch || summaryMatch || keywordMatch || categoryMatch;
    });
  }, [activeCategory, searchQuery, initialArticles]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setActiveCategory('ทั้งหมด');
  };

  return (
    <div>
      {/* Live Search Bar */}
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto 36px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px 6px 20px',
            boxShadow: '0 4px 20px rgba(11, 25, 44, 0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          className="search-input-wrapper"
        >
          <Search size={20} color="var(--primary)" style={{ flexShrink: 0, opacity: 0.7 }} aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาบทความ เช่น ภาษีมูลค่าเพิ่ม, จดทะเบียนบริษัท, ตรวจสอบบัญชี..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '10px 14px',
              fontSize: '0.98rem',
              color: 'var(--text-main)',
              background: 'transparent',
            }}
            aria-label="ค้นหาบทความ"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'background 0.15s',
              }}
              title="ล้างคำค้นหา"
              aria-label="ล้างคำค้นหา"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Status & Hit Counts */}
        {searchQuery && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              padding: '0 12px',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              ผลการค้นหาสำหรับ &ldquo;<strong style={{ color: 'var(--primary)' }}>{searchQuery}</strong>&rdquo;
              {activeCategory !== 'ทั้งหมด' && ` ในหมวดหมู่ ${activeCategory}`} : พบ{' '}
              <strong style={{ color: 'var(--accent-dark)' }}>{filteredArticles.length}</strong> รายการ
            </span>
            <button
              onClick={handleClearSearch}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              ยกเลิกการค้นหา
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '40px',
        }}
        role="tablist"
        aria-label="ตัวกรองหมวดหมู่บทความ"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isActive ? 'var(--primary)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: isActive ? '0 2px 8px rgba(11, 25, 44, 0.2)' : 'var(--shadow-sm)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '30px',
          }}
        >
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#64748b',
            }}
          >
            <FileQuestion size={32} />
          </div>

          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '8px',
            }}
          >
            {searchQuery ? `ไม่พบบทความที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีบทความในหมวดหมู่นี้'}
          </h3>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {searchQuery
              ? 'ลองค้นหาด้วยคำสำคัญอื่น เช่น ภาษี, บัญชี, จดทะเบียน หรือคลิกปุ่มด้านล่างเพื่อแสดงบทความทั้งหมด'
              : 'ทีมงานผู้เชี่ยวชาญกำลังจัดเตรียมเนื้อหาในหมวดหมู่นี้ กรุณากลับมาติดตามเร็วๆ นี้'}
          </p>

          <button
            onClick={handleResetAll}
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
            <span>แสดงบทความทั้งหมด</span>
          </button>
        </div>
      )}
    </div>
  );
}

