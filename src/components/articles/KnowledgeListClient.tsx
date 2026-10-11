'use client';

import React, { useState, useMemo } from 'react';
import { Article } from '@/lib/articles/types';
import ArticleCard from './ArticleCard';

interface KnowledgeListClientProps {
  initialArticles: Article[];
}

const CATEGORIES = ['ทั้งหมด', 'ภาษีอากร', 'การทำบัญชี', 'ตรวจสอบบัญชี', 'จดทะเบียนธุรกิจ'];

export default function KnowledgeListClient({ initialArticles }: KnowledgeListClientProps) {
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'ทั้งหมด') {
      return initialArticles;
    }
    return initialArticles.filter((item) => item.category === activeCategory);
  }, [activeCategory, initialArticles]);

  return (
    <div>
      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '50px',
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
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
            ยังไม่มีบทความในหมวดหมู่นี้ กำลังจัดเตรียมเนื้อหาโดยทีมงานผู้เชี่ยวชาญ
          </p>
        </div>
      )}
    </div>
  );
}
