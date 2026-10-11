import { slugify } from '@/lib/articles/validation';

export interface SeoEngineInput {
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  focusKeyword: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  faqs?: Array<{ question: string; answer: string }>;
  citations?: Array<{ title: string; url: string }>;
  authorId?: number | null;
  reviewerId?: number | null;
}

export interface SeoCheckItem {
  id: string;
  category: 'basic' | 'additional' | 'eeat' | 'readability';
  label: string;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
  tip?: string;
}

export interface SeoAnalysisResult {
  score: number; // 0 - 100
  status: 'good' | 'ok' | 'poor'; // green >= 80, yellow 50-79, red < 50
  color: string;
  focusKeyword: string;
  stats: {
    wordCount: number;
    charCount: number;
    headingsCount: { h1: number; h2: number; h3: number };
    keywordCount: number;
    keywordDensity: number; // Percentage e.g. 1.25%
    densityStatus: 'good' | 'too_low' | 'too_high';
    keywordInTitle: boolean;
    keywordInDescription: boolean;
    keywordInSlug: boolean;
    keywordInFirst10Percent: boolean;
    keywordInHeadings: boolean;
    keywordInAltText: boolean;
    hasCoverAlt: boolean;
    faqsCount: number;
    citationsCount: number;
    hasAuthor: boolean;
    hasReviewer: boolean;
  };
  checks: SeoCheckItem[];
}

/**
 * Strips markdown markup to count plain text and words accurately
 */
function cleanMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '') // Remove heading tags
    .replace(/\!\[([^\]]*)\]\([^)]*\)/g, '$1') // Image alt
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Link text
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Bullet lists
    .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
    .replace(/^\s*>\s+/gm, '') // Blockquotes
    .replace(/\|/g, ' ') // Table bars
    .trim();
}

/**
 * Estimates words in Thai/English mixed content
 */
function estimateWords(text: string): number {
  if (!text) return 0;
  // Separate English words and Thai text
  const englishWords = text.match(/[a-zA-Z0-9_-]+/g) || [];
  // Thai characters count (divide by ~4.5 for approximate word count in Thai)
  const thaiChars = text.replace(/[^ก-๙]/g, '').length;
  const thaiWords = Math.round(thaiChars / 4.5);
  return Math.max(1, englishWords.length + thaiWords);
}

/**
 * Counts keyword occurrences in text (case-insensitive)
 */
function countOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Real-time Rank Math-style SEO Scoring Engine for Next.js CMS
 */
export function analyzeSeoScore(input: SeoEngineInput): SeoAnalysisResult {
  const kw = (input.focusKeyword || '').trim().toLowerCase();
  const title = (input.title || '').trim();
  const summary = (input.summary || '').trim();
  const content = (input.contentMarkdown || '').trim();
  const slug = (input.slug || '').trim();
  const coverAlt = (input.coverImageAlt || '').trim();
  const faqs = input.faqs || [];
  const citations = input.citations || [];

  const plainContent = cleanMarkdown(content);
  const wordCount = estimateWords(plainContent);
  const charCount = plainContent.length;

  // Extract headings
  const h1Matches = content.match(/^#\s+[^\n]+/gm) || [];
  const h2Matches = content.match(/^##\s+[^\n]+/gm) || [];
  const h3Matches = content.match(/^###\s+[^\n]+/gm) || [];
  const headingsText = [...h2Matches, ...h3Matches].join(' ');

  // Extract first 10% of content
  const first10PercentLength = Math.max(120, Math.floor(plainContent.length * 0.1));
  const first10Percent = plainContent.slice(0, first10PercentLength);

  // Keyword match checks
  const keywordCount = kw ? countOccurrences(plainContent, kw) : 0;
  const keywordInTitle = kw ? title.toLowerCase().includes(kw) : false;
  const keywordInDescription = kw ? summary.toLowerCase().includes(kw) : false;

  // Slug check: match either direct Thai/English keyword or slugified version
  const kwSlug = slugify(kw);
  const keywordInSlug = kw ? (slug.toLowerCase().includes(kw) || (kwSlug.length > 0 && slug.toLowerCase().includes(kwSlug))) : false;

  const keywordInFirst10Percent = kw ? first10Percent.toLowerCase().includes(kw) : false;
  const keywordInHeadings = kw ? headingsText.toLowerCase().includes(kw) : false;
  
  // Extract alt texts from cover image and all images in content markdown
  const bodyImgAltMatches = Array.from(content.matchAll(/!\[(.*?)\]\((.+?)\)/g)).map(m => m[1].trim());
  const allAltTexts = [coverAlt, ...bodyImgAltMatches].filter(Boolean);
  const keywordInAltText = kw ? allAltTexts.some(alt => alt.toLowerCase().includes(kw)) : false;
  const hasAnyAltText = allAltTexts.length > 0;

  // Keyword density calculation
  let keywordDensity = 0;
  let densityStatus: 'good' | 'too_low' | 'too_high' = 'too_low';
  if (kw && wordCount > 0) {
    keywordDensity = Number(((keywordCount / wordCount) * 100).toFixed(2));
    if (keywordDensity >= 0.7 && keywordDensity <= 2.5) {
      densityStatus = 'good';
    } else if (keywordDensity > 2.5) {
      densityStatus = 'too_high';
    } else {
      densityStatus = 'too_low';
    }
  }

  const hasAuthor = Boolean(input.authorId);
  const hasReviewer = Boolean(input.reviewerId);
  const hasCoverAlt = coverAlt.length > 0;

  // Build Checklist Items
  const checks: SeoCheckItem[] = [];

  // ==================== 1. Basic SEO (40 Points) ====================
  // Check 1: Keyword in Title (10 pts)
  checks.push({
    id: 'kw_in_title',
    category: 'basic',
    label: 'Focus Keyword ในหัวข้อบทความ (SEO Title)',
    passed: Boolean(kw && keywordInTitle),
    score: kw && keywordInTitle ? 10 : 0,
    maxScore: 10,
    message: kw
      ? keywordInTitle
        ? 'ยอดเยี่ยม! พบ Focus Keyword ในหัวข้อบทความ'
        : 'ไม่พบ Focus Keyword ในหัวข้อบทความ แนะนำให้แทรกไว้ช่วงต้นของหัวข้อ'
      : 'กรุณาระบุ Focus Keyword เพื่อตรวจสอบ',
    tip: 'หัวข้อบทความควรขึ้นต้นด้วย Focus Keyword เพื่อดึงดูดผู้ค้นหาใน Google',
  });

  // Check 2: Keyword in Meta Description (10 pts)
  checks.push({
    id: 'kw_in_desc',
    category: 'basic',
    label: 'Focus Keyword ในบทสรุปย่อ (Meta Description)',
    passed: Boolean(kw && keywordInDescription),
    score: kw && keywordInDescription ? 10 : 0,
    maxScore: 10,
    message: kw
      ? keywordInDescription
        ? 'ยอดเยี่ยม! พบ Focus Keyword ในคำอธิบายย่อ'
        : 'ไม่พบ Focus Keyword ในบทสรุปย่อ แนะนำให้ใส่ 1 ครั้ง'
      : 'ระบุคำค้นหาเพื่อตรวจคำอธิบายย่อ',
    tip: 'Meta Description ที่มีคำค้นหาจะแสดงตัวหนา (Bold) บนหน้าผลการค้นหา Google',
  });

  // Check 3: Keyword in URL Slug (10 pts)
  checks.push({
    id: 'kw_in_slug',
    category: 'basic',
    label: 'Focus Keyword ในลิงก์ URL (Slug)',
    passed: Boolean(kw && keywordInSlug),
    score: kw && keywordInSlug ? 10 : 0,
    maxScore: 10,
    message: kw
      ? keywordInSlug
        ? 'ยอดเยี่ยม! URL Slug มี Focus Keyword กำกับอยู่'
        : 'ไม่พบ Focus Keyword ใน URL Slug แนะนำให้ตั้ง Slug ให้สอดคล้องกับคำค้นหา'
      : 'ระบุคำค้นหาเพื่อตรวจ URL Slug',
    tip: 'URL ที่สั้น กระชับ และมี Keyword ช่วยให้ผู้ใช้และ Google เข้าใจหัวข้อหน้าเว็บได้ทันที',
  });

  // Check 4: Keyword in First 10% (10 pts)
  checks.push({
    id: 'kw_in_intro',
    category: 'basic',
    label: 'Focus Keyword ในย่อหน้าแรก (First 10%)',
    passed: Boolean(kw && keywordInFirst10Percent),
    score: kw && keywordInFirst10Percent ? 10 : 0,
    maxScore: 10,
    message: kw
      ? keywordInFirst10Percent
        ? 'ดีมาก! มีคำค้นหาปรากฏตั้งแต่ช่วงต้นของบทความ'
        : 'ไม่พบคำค้นหาในย่อหน้าแรก แนะนำให้กล่าวถึงคำค้นหาในบทนำ'
      : 'ระบุคำค้นหาเพื่อตรวจบทนำ',
    tip: 'Google ให้ความสำคัญกับคำที่ปรากฏในย่อหน้าแรกมากกว่าส่วนท้ายของบทความ',
  });

  // ==================== 2. Additional SEO (25 Points) ====================
  // Check 5: Keyword in Subheadings H2/H3 (10 pts)
  checks.push({
    id: 'kw_in_headings',
    category: 'additional',
    label: 'Focus Keyword ในหัวข้อย่อย (H2 / H3)',
    passed: Boolean(kw && keywordInHeadings),
    score: kw && keywordInHeadings ? 10 : 0,
    maxScore: 10,
    message: kw
      ? keywordInHeadings
        ? 'ยอดเยี่ยม! มีคำค้นหาอยู่ในหัวข้อย่อย H2 หรือ H3'
        : 'ไม่พบคำค้นหาในหัวข้อย่อย แนะนำให้ใส่ Keyword ในหัวข้อย่อยอย่างน้อย 1 จุด'
      : 'ระบุคำค้นหาเพื่อตรวจหัวข้อย่อย',
    tip: 'การใส่ Keyword ใน H2 ช่วยให้ Google Bot จับความเชื่อมโยงของเนื้อหาได้ชัดเจน',
  });

  // Check 6: Keyword Density (10 pts)
  const densityPassed = Boolean(kw && densityStatus === 'good');
  checks.push({
    id: 'kw_density',
    category: 'additional',
    label: `ความหนาแน่นคำค้นหา (Keyword Density: ${keywordDensity}%)`,
    passed: densityPassed,
    score: densityPassed ? 10 : (kw && keywordCount > 0 ? 4 : 0),
    maxScore: 10,
    message: kw
      ? densityStatus === 'good'
        ? `ความหนาแน่นเหมาะสม (${keywordDensity}% พบ ${keywordCount} ครั้ง)`
        : densityStatus === 'too_high'
        ? `ความหนาแน่นสูงเกินไป (${keywordDensity}%) เสี่ยงต่อการโดนลงโทษ Keyword Stuffing แนะนำไม่เกิน 2.5%`
        : `ความหนาแน่นต่ำ (${keywordDensity}% พบ ${keywordCount} ครั้ง) แนะนำให้อยู่ระหว่าง 0.7% - 2.5%`
      : 'ระบุคำค้นหาเพื่อวัดความหนาแน่น',
    tip: 'ความหนาแน่นของคำที่เหมาะสมคือ 0.7% ถึง 2.5% เพื่อให้อ่านเป็นธรรมชาติและปลอดภัยจากอัลกอริทึมสแปม',
  });

  // Check 7: Focus Keyword in Alt Text (5 pts)
  const altPassed = Boolean(kw && keywordInAltText);
  checks.push({
    id: 'kw_in_alt',
    category: 'additional',
    label: 'Focus Keyword ในคำอธิบายรูปภาพ (Image Alt)',
    passed: altPassed,
    score: altPassed ? 5 : (hasAnyAltText ? 2 : 0),
    maxScore: 5,
    message: kw
      ? altPassed
        ? 'ยอดเยี่ยม! มี Focus Keyword ในคำอธิบายรูปภาพ (Alt Text)'
        : hasAnyAltText
        ? 'มี Alt Text แต่ยังไม่มีคำค้นหาเป้าหมาย'
        : 'ยังไม่มีการระบุ Alt Text ให้รูปภาพหน้าปกหรือรูปประกอบ'
      : 'ระบุคำค้นหาเพื่อตรวจ Alt Text',
    tip: 'Google Image Search อาศัย Alt Text ในการเข้าใจภาพ และส่งผลต่ออันดับ SEO โดยรวม',
  });

  // ==================== 3. Thai E-E-A-T & Authority (20 Points) ====================
  // Check 8: Citations / Legal References (10 pts)
  const citationsPassed = citations.length >= 1;
  checks.push({
    id: 'legal_citations',
    category: 'eeat',
    label: `แหล่งอ้างอิงทางกฎหมาย / ทางการ (${citations.length} รายการ)`,
    passed: citationsPassed,
    score: citationsPassed ? 10 : 0,
    maxScore: 10,
    message: citationsPassed
      ? `ยอดเยี่ยม! มีการอ้างอิงกฎหมาย ${citations.length} รายการ เสริมความน่าเชื่อถือเกณฑ์ YMYL`
      : 'แนะนำให้อ้างอิงประมวลรัษฎากร คำสั่งกรมสรรพากร หรือสภาวิชาชีพ อย่างน้อย 1 รายการ',
    tip: 'เนื้อหาด้านบัญชีและภาษี (YMYL) ที่มีลิงก์อ้างอิงหน่วยงานรัฐจะได้รับคะแนนความน่าเชื่อถือสูงกว่าบทความทั่วไป',
  });

  // Check 9: Author & Reviewer Governance (10 pts)
  const governancePassed = Boolean(hasAuthor && hasReviewer);
  checks.push({
    id: 'editorial_governance',
    category: 'eeat',
    label: 'การระบุผู้เขียนและผู้ตรวจทาน (CPA/TA)',
    passed: governancePassed,
    score: governancePassed ? 10 : (hasAuthor ? 5 : 0),
    maxScore: 10,
    message: governancePassed
      ? 'สมบูรณ์แบบ! มีทั้งผู้เขียนและผู้เชี่ยวชาญ CPA ตรวจทานความถูกต้อง'
      : hasAuthor
      ? 'ระบุผู้เขียนแล้ว แนะนำให้เลือกผู้ตรวจทานความถูกต้อง (CPA) เพิ่มเติม'
      : 'ยังไม่ได้เลือกผู้เขียนบทความ',
    tip: 'Google ประเมินความเชี่ยวชาญของผู้เขียน (E-E-A-T) โดยดูจากวุฒิบัตร CPA, TA หรือประสบการณ์วิชาชีพ',
  });

  // ==================== 4. Readability & Structure (15 Points) ====================
  // Check 10: Content Length (8 pts)
  const lengthPassed = wordCount >= 500;
  checks.push({
    id: 'content_length',
    category: 'readability',
    label: `ความยาวของเนื้อหาบทความ (${wordCount} คำ)`,
    passed: lengthPassed,
    score: lengthPassed ? 8 : (wordCount >= 250 ? 4 : 1),
    maxScore: 8,
    message: lengthPassed
      ? `ความยาวเนื้อหาเหมาะสมสำหรับบทความวิชาการ (${wordCount} คำ)`
      : `เนื้อหาสั้นเกินไป (${wordCount} คำ) แนะนำให้มีความยาวอย่างน้อย 500 คำขึ้นไป`,
    tip: 'บทความที่ติดอันดับหน้าแรกสำหรับหัวข้อบัญชี-ภาษี มักมีความยาวเฉลี่ย 800 - 1,500 คำ',
  });

  // Check 11: FAQs Section (7 pts)
  const faqsPassed = faqs.length >= 2;
  checks.push({
    id: 'faqs_section',
    category: 'readability',
    label: `คำถามที่พบบ่อย FAQs (${faqs.length} ข้อ)`,
    passed: faqsPassed,
    score: faqsPassed ? 7 : (faqs.length === 1 ? 3 : 0),
    maxScore: 7,
    message: faqsPassed
      ? `ยอดเยี่ยม! มี FAQ ${faqs.length} ข้อ ระบบสร้าง FAQPage Schema สำหรับ Google Search อัตโนมัติ`
      : 'แนะนำให้เพิ่มคำถาม-คำตอบที่พบบ่อย (FAQs) อย่างน้อย 2 ข้อ เพื่อให้ติด Rich Results',
    tip: 'Google นำคำถาม FAQs ไปแสดงเป็น Accordion ในหน้าผลการค้นหา เพิ่มพื้นที่มองเห็นและอัตราคลิก (CTR)',
  });

  // Calculate total score (0 - 100)
  const totalScore = Math.min(100, checks.reduce((sum, item) => sum + item.score, 0));

  let status: 'good' | 'ok' | 'poor' = 'poor';
  let color = '#dc2626'; // Red

  if (totalScore >= 80) {
    status = 'good';
    color = '#16a34a'; // Green
  } else if (totalScore >= 50) {
    status = 'ok';
    color = '#ca8a04'; // Yellow/Orange
  }

  return {
    score: totalScore,
    status,
    color,
    focusKeyword: kw,
    stats: {
      wordCount,
      charCount,
      headingsCount: {
        h1: h1Matches.length,
        h2: h2Matches.length,
        h3: h3Matches.length,
      },
      keywordCount,
      keywordDensity,
      densityStatus,
      keywordInTitle,
      keywordInDescription,
      keywordInSlug,
      keywordInFirst10Percent,
      keywordInHeadings,
      keywordInAltText,
      hasCoverAlt,
      faqsCount: faqs.length,
      citationsCount: citations.length,
      hasAuthor,
      hasReviewer,
    },
    checks,
  };
}
