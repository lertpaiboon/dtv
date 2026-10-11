'use client';

import React, { useState, useEffect } from 'react';
import ArticleEditorForm from '@/components/admin/ArticleEditorForm';
import { RefreshCw } from 'lucide-react';

export default function NewArticlePage() {
  const [authors, setAuthors] = useState<Array<{ id: number; name: string; role: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/articles?limit=1')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.authors)) {
          setAuthors(json.authors);
        }
      })
      .catch((err) => console.error('Failed to load authors:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>กำลังเตรียมแบบฟอร์มบทความใหม่...</p>
      </div>
    );
  }

  return <ArticleEditorForm authors={authors} isNew={true} />;
}
