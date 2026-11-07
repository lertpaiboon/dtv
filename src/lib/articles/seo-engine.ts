import { slugify } from '@/lib/articles/validation';

export interface SeoEngineInput {
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  focusKeyword: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  quickAnswer?: string | null;
  tags?: string | null;
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
    internalLinksCount: number;
    hasQuickAnswer: boolean;
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
  const englishWords = text.match(/[a-zA-Z0-9_-]+/g) || [];
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
 * Real-time 100-Point SEO / AEO / GEO Scoring Engine (4 Dimensions, 15 Criteria)
 */
export function analyzeSeoScore(input: SeoEngineInput): SeoAnalysisResult {
  const kw = (input.focusKeyword || '').trim().toLowerCase();
  const title = (input.title || '').trim();
  const effectiveSeoTitle = ((input.seoTitle || '').trim() || title);
  const summary = (input.summary || '').trim();
  const effectiveSeoDescription = ((input.seoDescription || '').trim() || summary);
  const quickAnswer = (input.quickAnswer || '').trim();
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
  const subheadingsCount = h2Matches.length + h3Matches.length;
  const headingsText = [...h2Matches, ...h3Matches].join(' ');

  // Extract first 20% of content (Framework standard: 20% intro)
  const first20PercentLength = Math.max(120, Math.floor(plainContent.length * 0.2));
  const first20Percent = plainContent.slice(0, first20PercentLength);

  // Keyword match checks
  const hasKeyword = kw.length >= 2;
  const keywordCount = hasKeyword ? countOccurrences(plainContent, kw) : 0;
  const keywordInTitle = hasKeyword ? effectiveSeoTitle.toLowerCase().includes(kw) : false;
  const keywordInDescription = hasKeyword
    ? effectiveSeoDescription.toLowerCase().includes(kw)
    : false;

  // Slug check: Clean English Slug (`^[a-z0-9-]+$`) OR contains Focus Keyword
  const isCleanEnglishSlug = slug.length >= 4 && /^[a-z0-9-]+$/.test(slug);
  const kwSlug = slugify(kw);
  const keywordInSlug =
    isCleanEnglishSlug ||
    (hasKeyword
      ? slug.toLowerCase().includes(kw) || (kwSlug.length > 0 && slug.toLowerCase().includes(kwSlug))
      : false);

  const keywordInFirst20Percent = hasKeyword
    ? first20Percent.toLowerCase().includes(kw)
    : false;
  const keywordInHeadings = hasKeyword ? headingsText.toLowerCase().includes(kw) : false;

  // Extract alt texts from cover image and all images in content markdown
  const bodyImgAltMatches = Array.from(content.matchAll(/!\[(.*?)\]\((.+?)\)/g)).map((m) =>
    m[1].trim()
  );
  const allAltTexts = [coverAlt, ...bodyImgAltMatches].filter(Boolean);
  const keywordInAltText = hasKeyword
    ? allAltTexts.some((alt) => alt.toLowerCase().includes(kw))
    : false;
  const hasAnyAltText = allAltTexts.length > 0;

  // Count internal links in markdown (`[...](/...)` or `[...](https://deethavorn.com/...)`)
  const mdLinks = Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
  const internalLinks = mdLinks.filter((m) => {
    const href = m[2].trim();
    return (
      href.startsWith('/') ||
      href.includes('deethavorn.com')
    );
  });
  const internalLinksCount = internalLinks.length;

  // Keyword density calculation (Framework natural range: 0.4% - 3.5%)
  let keywordDensity = 0;
  let densityStatus: 'good' | 'too_low' | 'too_high' = 'too_low';
  if (hasKeyword && wordCount > 0) {
    keywordDensity = Number(((keywordCount / wordCount) * 100).toFixed(2));
    if (keywordDensity >= 0.4 && keywordDensity <= 3.5) {
      densityStatus = 'good';
    } else if (keywordDensity > 3.5) {
      densityStatus = 'too_high';
    } else {
      densityStatus = 'too_low';
    }
  }

  const hasAuthor = Boolean(input.authorId);
  const hasReviewer = Boolean(input.reviewerId);
  const hasCoverAlt = coverAlt.length > 0;
  const hasQuickAnswer = quickAnswer.length >= 60 && quickAnswer.length <= 400;

  const checks: SeoCheckItem[] = [];

  // ==================== 1. Technical Eligibility (35 Points) ====================
  // Check 1: has_keyword (5 pts)
  checks.push({
    id: 'has_keyword',
    category: 'basic',
    label: '1. ระบุคำค้นหาหลัก (Focus Keyword)',
    passed: hasKeyword,
    score: hasKeyword ? 5 : 0,
    maxScore: 5,
    message: hasKeyword
      ? `กำหนด Focus Keyword เรียบร้อยแล้ว ("${input.focusKeyword?.trim()}")`
      : 'กรุณากำหนด Focus Keyword เพื่อใช้วิเคราะห์ความสอดคล้องของบทความ',
    tip: 'เลือกคำค้นหาที่ผู้ประกอบการหรือผู้ทำบัญชีใช้ค้นหาจริงบน Google',
  });

  // Check 2: keyword_in_title (8 pts)
  checks.push({
    id: 'keyword_in_title',
    category: 'basic',
    label: '2. Focus Keyword อยู่ใน SEO Title',
    passed: Boolean(hasKeyword && keywordInTitle),
    score: hasKeyword && keywordInTitle ? 8 : 0,
    maxScore: 8,
    message: hasKeyword
      ? keywordInTitle
        ? 'ยอดเยี่ยม! พบ Focus Keyword ในหัวข้อ SEO Title'
        : 'ไม่พบ Focus Keyword ใน SEO Title แนะนำให้แทรกไว้ช่วงต้นของหัวข้อ'
      : 'กรุณาระบุ Focus Keyword เพื่อตรวจ SEO Title',
    tip: 'SEO Title ที่มีคำค้นหาหลักอยู่ช่วงต้นจะได้รับน้ำหนักการจัดอันดับสูงสุด',
  });

  // Check 3: keyword_in_description (6 pts)
  checks.push({
    id: 'keyword_in_description',
    category: 'basic',
    label: '3. Focus Keyword อยู่ใน Meta Description',
    passed: Boolean(hasKeyword && keywordInDescription),
    score: hasKeyword && keywordInDescription ? 6 : 0,
    maxScore: 6,
    message: hasKeyword
      ? keywordInDescription
        ? 'ยอดเยี่ยม! พบ Focus Keyword ในคำอธิบายย่อ (Meta Description)'
        : 'ไม่พบ Focus Keyword ในคำอธิบายย่อ แนะนำให้ใส่ 1 ครั้ง'
      : 'ระบุคำค้นหาเพื่อตรวจคำอธิบายย่อ',
    tip: 'Google จะไฮไลต์ตัวหนาคำที่ตรงกับคำค้นหาใน Meta Description ช่วยเพิ่ม CTR',
  });

  // Check 4: keyword_in_slug (5 pts)
  checks.push({
    id: 'keyword_in_slug',
    category: 'basic',
    label: '4. โครงสร้าง URL Slug (Clean English Slug หรือมี Keyword)',
    passed: Boolean(slug.length >= 3 && keywordInSlug),
    score: slug.length >= 3 && keywordInSlug ? 5 : 0,
    maxScore: 5,
    message:
      slug.length >= 3 && keywordInSlug
        ? isCleanEnglishSlug
          ? `ยอดเยี่ยม! ใช้ Clean English Slug มาตรฐานสากล (/knowledge/${slug})`
          : 'URL Slug มี Focus Keyword กำกับอยู่'
        : 'แนะนำให้ตั้ง URL Slug เป็นภาษาอังกฤษตัวพิมพ์เล็กและขีดกลาง (^[a-z0-9-]+$) หรือมี Keyword',
    tip: 'Clean English Slug เช่น vat-registration-guide ช่วยให้แชร์ลิงก์บน LINE/Social สวยงามไม่ติดรหัส %E0%B8',
  });

  // Check 5: meta_lengths (6 pts)
  const titleLenOk = effectiveSeoTitle.length >= 30 && effectiveSeoTitle.length <= 75;
  const descLenOk = effectiveSeoDescription.length >= 80 && effectiveSeoDescription.length <= 180;
  const metaLengthsScore = titleLenOk && descLenOk ? 6 : titleLenOk || descLenOk ? 3 : 0;
  checks.push({
    id: 'meta_lengths',
    category: 'basic',
    label: `5. ความยาว Title (${effectiveSeoTitle.length}/30–75) & Description (${effectiveSeoDescription.length}/80–180)`,
    passed: titleLenOk && descLenOk,
    score: metaLengthsScore,
    maxScore: 6,
    message:
      titleLenOk && descLenOk
        ? 'ความยาว SEO Title และ Meta Description อยู่ในเกณฑ์มาตรฐาน ไม่ถูกตัดคำบน SERP'
        : `ควรปรับความยาวให้พอดี (Title ปัจจุบัน ${effectiveSeoTitle.length} ตัวอักษร [เกณฑ์ 30–75], Description ปัจจุบัน ${effectiveSeoDescription.length} ตัวอักษร [เกณฑ์ 80–180])`,
    tip: 'Title ที่สั้นหรือยาวเกิน 75 ตัวอักษรอาจถูก Google เขียนพาดหัวใหม่แทน',
  });

  // Check 6: keyword_in_image_alt (5 pts)
  const altPassed = Boolean(hasKeyword && keywordInAltText);
  checks.push({
    id: 'keyword_in_image_alt',
    category: 'basic',
    label: '6. คำอธิบายรูปภาพ (Image Alt Text มี Focus Keyword)',
    passed: altPassed,
    score: altPassed ? 5 : hasAnyAltText ? 2 : 0,
    maxScore: 5,
    message: altPassed
      ? 'ยอดเยี่ยม! มี Focus Keyword ในคำอธิบายรูปภาพ (Alt Text)'
      : hasAnyAltText
      ? 'มี Alt Text แล้ว แต่ยังไม่มี Focus Keyword (ได้ 2/5 คะแนน)'
      : 'ยังไม่ได้ระบุ Alt Text ให้รูปภาพหน้าปกหรือรูปประกอบ',
    tip: 'Alt Text ช่วยทั้ง Google Images และมาตรฐานการเข้าถึงเว็บไซต์ (WCAG A11y)',
  });

  // ==================== 2. Answer Quality & AEO (25 Points) ====================
  // Check 7: ai_direct_answer (15 pts)
  const aiAnswerPartial = quickAnswer.length > 0 && !hasQuickAnswer;
  checks.push({
    id: 'ai_direct_answer',
    category: 'readability',
    label: `7. กล่องสรุปคำตอบ AI (Quick Answer: ${quickAnswer.length} ตัวอักษร)`,
    passed: hasQuickAnswer,
    score: hasQuickAnswer ? 15 : aiAnswerPartial ? 8 : 0,
    maxScore: 15,
    message: hasQuickAnswer
      ? 'ยอดเยี่ยม! มีกล่องสรุปคำตอบตรงประเด็น (60–400 ตัวอักษร) พร้อมให้ Google AI Overviews และ ChatGPT ดึงไปอ้างอิง'
      : aiAnswerPartial
      ? `มี Quick Answer แล้ว (${quickAnswer.length} ตัวอักษร) แนะนำปรับความยาวให้อยู่ในช่วง 60–400 ตัวอักษร (40–60 คำ)`
      : 'ยังไม่ได้กรอกกล่องสรุปคำตอบใน 1 นาที (Quick Answer) สำหรับ AEO / AI Overviews',
    tip: 'การสรุปคำตอบตรงประเด็น 40–60 คำไว้ต้นบทความช่วยเพิ่มโอกาสติด Featured Snippet และ `/llms.txt`',
  });

  // Check 8: faq_schema (10 pts)
  const faqsPassed = faqs.length >= 2;
  checks.push({
    id: 'faq_schema',
    category: 'readability',
    label: `8. คำถามที่พบบ่อย FAQ Schema (${faqs.length} ข้อ)`,
    passed: faqsPassed,
    score: faqsPassed ? 10 : faqs.length === 1 ? 5 : 0,
    maxScore: 10,
    message: faqsPassed
      ? `ยอดเยี่ยม! มีรายการ FAQ ${faqs.length} ข้อ ระบบฝัง FAQPage JSON-LD Schema อัตโนมัติ`
      : 'แนะนำให้เพิ่มคำถาม-คำตอบที่พบบ่อย (FAQs) อย่างน้อย 2 ข้อ เพื่อรองรับ AEO และ Voice Search',
    tip: 'คำถาม FAQ จะถูกส่งออกไปทั้งใน JSON-LD และในคลังความรู้ `/llms-full.txt` สำหรับ AI Search',
  });

  // ==================== 3. Trust & Evidence / E-E-A-T (20 Points) ====================
  // Check 9: eeat_author (10 pts)
  const governancePassed = Boolean(hasAuthor && hasReviewer);
  checks.push({
    id: 'eeat_author',
    category: 'eeat',
    label: '9. คุณวุฒิผู้เขียนและผู้สอบทาน CPA (E-E-A-T Governance)',
    passed: governancePassed,
    score: governancePassed ? 10 : hasAuthor ? 7 : 0,
    maxScore: 10,
    message: governancePassed
      ? 'สมบูรณ์แบบ! มีทั้งผู้เขียนและผู้สอบบัญชีรับอนุญาต (CPA) สอบทานความถูกต้อง'
      : hasAuthor
      ? 'ระบุผู้เขียนแล้ว (ได้ 7/10 คะแนน) แนะนำเลือกผู้ตรวจทาน CPA เพิ่มเติมเพื่อคะแนนเต็ม'
      : 'ยังไม่ได้ระบุผู้เขียนบทความ',
    tip: 'เนื้อหาด้านภาษีและบัญชี (YMYL) ต้องแสดงคุณวุฒิผู้เชี่ยวชาญชัดเจนเพื่อสร้างความน่าเชื่อถือ',
  });

  // Check 10: geo_sources (10 pts)
  const citationsPassed = citations.length >= 1;
  checks.push({
    id: 'geo_sources',
    category: 'eeat',
    label: `10. แหล่งอ้างอิงปฐมภูมิ / กฎหมาย (${citations.length} แหล่ง)`,
    passed: citationsPassed,
    score: citationsPassed ? 10 : 0,
    maxScore: 10,
    message: citationsPassed
      ? `ยอดเยี่ยม! มีแหล่งอ้างอิงกฎหมาย/หน่วยงานรัฐ ${citations.length} รายการ เสริมความน่าเชื่อถือ GEO`
      : 'แนะนำให้เพิ่มแหล่งอ้างอิงปฐมภูมิ (เช่น กรมสรรพากร, กรมพัฒนาธุรกิจการค้า, ประมวลรัษฎากร) อย่างน้อย 1 แหล่ง',
    tip: 'AI Engines (Perplexity, ChatGPT, Gemini) ให้คะแนนความน่าเชื่อถือสูงขึ้นเมื่อบทความอ้างอิงแหล่งข้อมูลปฐมภูมิ',
  });

  // ==================== 4. Content Depth & Cluster (20 Points) ====================
  // Check 11: keyword_in_intro (4 pts)
  checks.push({
    id: 'keyword_in_intro',
    category: 'additional',
    label: '11. Focus Keyword ในย่อหน้าแรก (First 20%)',
    passed: Boolean(hasKeyword && keywordInFirst20Percent),
    score: hasKeyword && keywordInFirst20Percent ? 4 : 0,
    maxScore: 4,
    message: hasKeyword
      ? keywordInFirst20Percent
        ? 'ดีมาก! มีคำค้นหาหลักปรากฏในช่วง 20% แรกของเนื้อหา'
        : 'ไม่พบคำค้นหาในช่วงต้นของบทความ แนะนำให้กล่าวถึงในย่อหน้าแรก'
      : 'ระบุคำค้นหาเพื่อตรวจบทนำ',
    tip: 'Search Engine ให้ความสำคัญกับคำที่ปรากฏในย่อหน้าเปิดเรื่อง',
  });

  // Check 12: keyword_in_headings (4 pts)
  const headingsPassed = subheadingsCount >= 2 && ( !hasKeyword || keywordInHeadings );
  checks.push({
    id: 'keyword_in_headings',
    category: 'additional',
    label: `12. โครงสร้างหัวข้อย่อย H2/H3 (${subheadingsCount} หัวข้อ)`,
    passed: headingsPassed,
    score: headingsPassed ? 4 : subheadingsCount >= 2 ? 2 : 0,
    maxScore: 4,
    message: headingsPassed
      ? `ยอดเยี่ยม! มีหัวข้อย่อย H2/H3 ${subheadingsCount} หัวข้อ และมีคำค้นหาประกอบ`
      : subheadingsCount >= 2
      ? `มีหัวข้อย่อย ${subheadingsCount} หัวข้อแล้ว แนะนำแทรก Focus Keyword ใน H2/H3 อย่างน้อย 1 จุด`
      : 'แนะนำให้แบ่งเนื้อหาด้วยหัวข้อย่อย (## H2 หรือ ### H3) อย่างน้อย 2 หัวข้อ',
    tip: 'หัวข้อย่อยช่วยให้ผู้อ่านสแกนเนื้อหาง่ายและสร้างสารบัญ (Table of Contents) อัตโนมัติ',
  });

  // Check 13: content_length (4 pts)
  const lengthPassed = wordCount >= 350;
  checks.push({
    id: 'content_length',
    category: 'additional',
    label: `13. ความลึกของเนื้อหา (${wordCount} คำ)`,
    passed: lengthPassed,
    score: lengthPassed ? 4 : wordCount >= 200 ? 2 : 0,
    maxScore: 4,
    message: lengthPassed
      ? `ความยาวเนื้อหาเหมาะสมและครบถ้วน (${wordCount} คำ)`
      : `เนื้อหายังสั้น (${wordCount} คำ) แนะนำให้เขียนอธิบายอย่างน้อย 350–600 คำขึ้นไป`,
    tip: 'บทความบัญชีและภาษีที่ครอบคลุมตัวอย่างจริงและขั้นตอนปฏิบัติมักติดอันดับได้ดีกว่า',
  });

  // Check 14: internal_links (4 pts)
  const linksPassed = internalLinksCount >= 2;
  checks.push({
    id: 'internal_links',
    category: 'additional',
    label: `14. ลิงก์ภายในคลัสเตอร์ (Internal Links: ${internalLinksCount} จุด)`,
    passed: linksPassed,
    score: linksPassed ? 4 : internalLinksCount === 1 ? 2 : 0,
    maxScore: 4,
    message: linksPassed
      ? `ยอดเยี่ยม! มีลิงก์เชื่อมโยงหน้าบริการหรือบทความอื่น ${internalLinksCount} จุด`
      : `พบลิงก์ภายใน ${internalLinksCount} จุด แนะนำให้เชื่อมลิงก์ไปยังหน้าบริการหลัก (/services/...) หรือบทความอื่นอย่างน้อย 2 จุด`,
    tip: 'ใช้ปุ่ม "1-Click แทรก Internal Link" ด้านบนช่องเขียนเนื้อหาเพื่อเชื่อมโยง Topic Cluster ได้ทันที',
  });

  // Check 15: keyword_density (4 pts)
  const densityPassed = Boolean(hasKeyword && densityStatus === 'good');
  checks.push({
    id: 'keyword_density',
    category: 'additional',
    label: `15. ความหนาแน่นคีย์เวิร์ด (Keyword Density: ${keywordDensity}%)`,
    passed: densityPassed,
    score: densityPassed ? 4 : hasKeyword && keywordCount > 0 ? 2 : 0,
    maxScore: 4,
    message: hasKeyword
      ? densityStatus === 'good'
        ? `ความหนาแน่นเป็นธรรมชาติ (${keywordDensity}% • พบ ${keywordCount} ครั้ง)`
        : densityStatus === 'too_high'
        ? `ความหนาแน่นสูงเกินไป (${keywordDensity}%) แนะนำไม่เกิน 3.5%`
        : `ความหนาแน่นต่ำ (${keywordDensity}%) แนะนำให้อยู่ในช่วง 0.4% – 3.5%`
      : 'ระบุคำค้นหาเพื่อวัดความหนาแน่น',
    tip: 'ความหนาแน่นธรรมชาติ 0.4% – 3.5% ช่วยให้เนื้อหาอ่านลื่นไหลและปลอดภัยจาก Keyword Stuffing',
  });

  // Calculate total score (0 - 100)
  const totalScore = Math.min(
    100,
    checks.reduce((sum, item) => sum + item.score, 0)
  );

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
      keywordInFirst10Percent: keywordInFirst20Percent,
      keywordInHeadings,
      keywordInAltText,
      hasCoverAlt,
      faqsCount: faqs.length,
      citationsCount: citations.length,
      hasAuthor,
      hasReviewer,
      internalLinksCount,
      hasQuickAnswer,
    },
    checks,
  };
}
