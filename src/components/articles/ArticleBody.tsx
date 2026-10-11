import React from 'react';
import { renderMarkdownToHtml } from '@/lib/articles/markdown';

interface ArticleBodyProps {
  contentMarkdown: string;
}

export default function ArticleBody({ contentMarkdown }: ArticleBodyProps) {
  const htmlContent = renderMarkdownToHtml(contentMarkdown);

  return (
    <div
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
