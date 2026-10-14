export interface Author {
  id: number;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  credentials: string; // e.g. "ผู้สอบบัญชีรับอนุญาต (CPA เลขทะเบียน xxxxx) และที่ปรึกษาภาษีอากร"
  profileImage?: string;
  sameAs?: string[];
}

export interface ArticleFaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface ArticleCitationItem {
  id: number;
  title: string;
  publisher?: string;
  url: string;
  referenceDate?: string;
  accessedAt?: string;
  sortOrder: number;
}

export const ARTICLE_CATEGORIES = [
  'ภาษีและสรรพากร',
  'บัญชีและงบการเงิน',
  'จดทะเบียนธุรกิจ',
  'ตรวจสอบบัญชี',
  'วางแผนภาษี',
  'ทรัพยากรบุคคล',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export function normalizeArticleCategory(category?: string | null): string {
  if (!category) return 'ภาษีและสรรพากร';
  const trimmed = category.trim();
  if (trimmed === 'ภาษีอากร') return 'ภาษีและสรรพากร';
  if (trimmed === 'การทำบัญชี') return 'บัญชีและงบการเงิน';
  return trimmed;
}

export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  category: string;
  coverImage?: string;
  coverImageAlt?: string;
  quickAnswer?: string; // BLUF - 40 to 60 words quick direct answer
  status: ArticleStatus;
  author: Author;
  reviewer?: Author;
  reviewedAt?: string;
  publishedAt: string;
  contentUpdatedAt?: string;
  nextReviewAt?: string;
  readTime: string;
  faqs: ArticleFaqItem[];
  citations: ArticleCitationItem[];
  focusKeyword?: string;
  seoScore?: number;
  isNoIndex?: boolean;
  canonicalUrl?: string;
  ogImage?: string;
  primaryCta?: {
    headline: string;
    subheadline: string;
    buttonText: string;
    lineMessage: string;
  };
}
