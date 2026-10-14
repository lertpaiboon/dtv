export interface ArticleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SerpAnalysis {
  titleLength: number;
  titleStatus: 'good' | 'too_short' | 'too_long';
  titleMessage: string;
  summaryLength: number;
  summaryStatus: 'good' | 'too_short' | 'too_long';
  summaryMessage: string;
  hasQuickAnswer: boolean;
  hasCoverAlt: boolean;
  headingsCount: { h1: number; h2: number; h3: number };
  faqsCount: number;
  citationsCount: number;
  qualityScore: number; // 0 - 100
}

/**
 * Generate a clean URL slug from Thai or English text
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and special symbols with hyphen
    .replace(/[\s\t\n]+/g, '-')
    // Remove unwanted punctuation except Thai characters, letters, numbers, and hyphens
    .replace(/[^\u0E00-\u0E7Fa-z0-9\-]/g, '')
    // Replace multiple consecutive hyphens with a single one
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate article fields for saving or publishing
 */
export function validateArticlePayload(
  payload: {
    title?: string;
    slug?: string;
    category?: string;
    summary?: string;
    contentMarkdown?: string;
    coverImage?: string | null;
    coverImageAlt?: string | null;
    quickAnswer?: string | null;
    authorId?: number | null;
    canonicalUrl?: string | null;
    ogImage?: string | null;
  },
  isPublishing = false
): ArticleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title checks
  if (!payload.title || payload.title.trim().length < 5) {
    errors.push('หัวข้อบทความ (Title) ต้องมีความยาวอย่างน้อย 5 ตัวอักษร');
  } else if (payload.title.length > 255) {
    errors.push('หัวข้อบทความต้องมีความยาวไม่เกิน 255 ตัวอักษร');
  }

  // Slug checks
  if (!payload.slug || payload.slug.trim().length < 3) {
    errors.push('Slug สำหรับ URL ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
  } else if (!/^[a-z0-9\-\u0E00-\u0E7F]+$/.test(payload.slug)) {
    errors.push('Slug ต้องประกอบด้วยตัวอักษร ตัวเลข หรือเครื่องหมายขีด (-) เท่านั้น');
  }

  // Category checks
  if (!payload.category || payload.category.trim().length === 0) {
    errors.push('กรุณาระบุหมวดหมู่บทความ');
  }

  // Summary checks
  if (!payload.summary || payload.summary.trim().length < 20) {
    if (isPublishing) {
      errors.push('บทสรุปบทความ (Meta Description) ต้องมีความยาวอย่างน้อย 20 ตัวอักษรสำหรับการเผยแพร่');
    } else {
      warnings.push('ควรกรอกบทสรุปบทความ (Meta Description) อย่างน้อย 20 ตัวอักษร');
    }
  } else if (payload.summary.length > 500) {
    errors.push('บทสรุปบทความต้องไม่เกิน 500 ตัวอักษร');
  }

  // Content Markdown checks
  if (!payload.contentMarkdown || payload.contentMarkdown.trim().length < 100) {
    if (isPublishing) {
      errors.push('เนื้อหาบทความ (Markdown) ต้องมีเนื้อหาอย่างน้อย 100 ตัวอักษรสำหรับการเผยแพร่');
    } else {
      warnings.push('เนื้อหาบทความยังสั้นเกินไป (แนะนำอย่างน้อย 100 ตัวอักษร)');
    }
  }

  // Author checks
  if (isPublishing && (!payload.authorId || payload.authorId <= 0)) {
    errors.push('ต้องระบุผู้เขียนบทความ (Author) ก่อนทำการเผยแพร่');
  }

  // Cover image alt text check
  if (payload.coverImage && (!payload.coverImageAlt || payload.coverImageAlt.trim().length === 0)) {
    if (isPublishing) {
      errors.push('หากมีภาพหน้าปก ต้องระบุคำอธิบายภาพ (Alt Text) เพื่อรองรับ Accessibility และ SEO');
    } else {
      warnings.push('แนะนำให้ระบุคำอธิบายภาพหน้าปก (Alt Text)');
    }
  }

  // Quick answer recommendation (AEO)
  if (!payload.quickAnswer || payload.quickAnswer.trim().length === 0) {
    warnings.push('แนะนำให้ใส่สรุปประเด็นสำคัญใน 1 นาที (Quick Answer) เพื่อรองรับ AEO / AI Overviews');
  }

  // Canonical URL validation
  if (payload.canonicalUrl && payload.canonicalUrl.trim().length > 0) {
    const trimmed = payload.canonicalUrl.trim();
    try {
      const u = new URL(trimmed);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        errors.push('Canonical URL ต้องขึ้นต้นด้วย http:// หรือ https://');
      }
    } catch {
      errors.push('Canonical URL ไม่ถูกต้องตามรูปแบบ URL มาตรฐาน (เช่น https://www.deethavorn.com/...)');
    }
  }

  // OG Image URL validation
  if (payload.ogImage && payload.ogImage.trim().length > 0) {
    const trimmed = payload.ogImage.trim();
    if (!trimmed.startsWith('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      errors.push('Social Share Image (OG Image) ต้องเป็นพาธที่ขึ้นต้นด้วย / หรือ URL เต็ม (http/https)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Analyze content for SEO, SERP Preview, and AEO optimization
 */
export function analyzeContentQuality(article: {
  title?: string;
  summary?: string;
  contentMarkdown?: string;
  quickAnswer?: string | null;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  faqs?: Array<{ question: string; answer: string }>;
  citations?: Array<{ title: string; url: string }>;
}): SerpAnalysis {
  const title = article.title?.trim() || '';
  const summary = article.summary?.trim() || '';
  const markdown = article.contentMarkdown || '';

  // Title length analysis (Desktop Google cuts around 55-65 chars)
  let titleStatus: 'good' | 'too_short' | 'too_long' = 'good';
  let titleMessage = 'ความยาวหัวข้อเหมาะสมสำหรับการแสดงผลบนผลการค้นหา Google';
  if (title.length < 30) {
    titleStatus = 'too_short';
    titleMessage = 'หัวข้อสั้นเกินไป ควรระบุรายละเอียดและคีย์เวิร์ดสำคัญเพิ่มเติม (แนะนำ 40–60 ตัวอักษร)';
  } else if (title.length > 70) {
    titleStatus = 'too_long';
    titleMessage = 'หัวข้อยาวเกินไป อาจถูกตัดทอน (...) บนหน้าผลการค้นหา Google (แนะนำ 40–60 ตัวอักษร)';
  }

  // Meta description analysis (optimal 120-160 chars)
  let summaryStatus: 'good' | 'too_short' | 'too_long' = 'good';
  let summaryMessage = 'ความยาวบทสรุปเหมาะสมสำหรับ Google Snippet';
  if (summary.length < 70) {
    summaryStatus = 'too_short';
    summaryMessage = 'คำอธิบายสั้นเกินไป (แนะนำ 100–160 ตัวอักษร เพื่อดึงดูดผู้ค้นหา)';
  } else if (summary.length > 175) {
    summaryStatus = 'too_long';
    summaryMessage = 'คำอธิบายยาวเกินไป อาจถูกตัดทอนในผลการค้นหา (แนะนำ 100–160 ตัวอักษร)';
  }

  // Count Markdown headings
  const h1Matches = markdown.match(/^#\s+[^\n]+/gm) || [];
  const h2Matches = markdown.match(/^##\s+[^\n]+/gm) || [];
  const h3Matches = markdown.match(/^###\s+[^\n]+/gm) || [];

  const headingsCount = {
    h1: h1Matches.length,
    h2: h2Matches.length,
    h3: h3Matches.length,
  };

  const hasQuickAnswer = Boolean(article.quickAnswer && article.quickAnswer.trim().length >= 20);
  const hasCoverAlt = Boolean(
    !article.coverImage || (article.coverImage && article.coverImageAlt && article.coverImageAlt.trim().length > 0)
  );
  const faqsCount = article.faqs?.length || 0;
  const citationsCount = article.citations?.length || 0;

  // Calculate quality score (0 - 100)
  let score = 0;
  if (title.length >= 30 && title.length <= 70) score += 20;
  else if (title.length > 0) score += 10;

  if (summary.length >= 70 && summary.length <= 175) score += 20;
  else if (summary.length > 0) score += 10;

  if (headingsCount.h2 >= 2) score += 15;
  else if (headingsCount.h2 >= 1) score += 8;

  if (hasQuickAnswer) score += 15;
  if (faqsCount >= 2) score += 15;
  else if (faqsCount >= 1) score += 8;

  if (citationsCount >= 1) score += 10;
  if (hasCoverAlt) score += 5;

  return {
    titleLength: title.length,
    titleStatus,
    titleMessage,
    summaryLength: summary.length,
    summaryStatus,
    summaryMessage,
    hasQuickAnswer,
    hasCoverAlt,
    headingsCount,
    faqsCount,
    citationsCount,
    qualityScore: Math.min(100, score),
  };
}
