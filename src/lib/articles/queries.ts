import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/seo/site-url';
import { Article, Author, ArticleFaqItem, ArticleCitationItem } from './types';

function calculateReadTime(markdown: string): string {
  // Average Thai reading speed ~400-500 chars/min
  const length = markdown.trim().length;
  const minutes = Math.max(3, Math.ceil(length / 500));
  return `${minutes} นาที`;
}

function mapAuthor(raw: any): Author {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    role: raw.role || 'ผู้เชี่ยวชาญด้านบัญชีและภาษีอากร',
    bio: raw.bio || undefined,
    credentials: raw.credentials || 'ทีมงานผู้เชี่ยวชาญ ดีถาวรการบัญชี',
    profileImage: raw.profileImage || '/images/DTV%20LOGO.png',
    sameAs: Array.isArray(raw.sameAs) ? raw.sameAs : undefined,
  };
}

function mapArticle(raw: any): Article {
  const author: Author = raw.author
    ? mapAuthor(raw.author)
    : {
        id: 0,
        name: 'บริษัท ดีถาวรการบัญชี จำกัด',
        slug: 'deethavorn',
        role: 'สำนักงานบัญชีและที่ปรึกษาภาษีอากร',
        credentials: 'ทีมงานผู้สอบบัญชีรับอนุญาต (CPA)',
        profileImage: '/images/DTV%20LOGO.png',
      };

  const reviewer: Author | undefined = raw.reviewer ? mapAuthor(raw.reviewer) : undefined;

  const faqs: ArticleFaqItem[] = (raw.faqs || []).map((f: any) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
  }));

  const citations: ArticleCitationItem[] = (raw.citations || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    publisher: c.publisher || undefined,
    url: c.url,
    referenceDate: c.referenceDate ? c.referenceDate.toISOString().split('T')[0] : undefined,
    accessedAt: c.accessedAt ? c.accessedAt.toISOString().split('T')[0] : undefined,
    sortOrder: c.sortOrder,
  }));

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    summary: raw.summary,
    contentMarkdown: raw.contentMarkdown,
    category: raw.category,
    coverImage: raw.coverImage || undefined,
    coverImageAlt: raw.coverImageAlt || undefined,
    quickAnswer: raw.quickAnswer || undefined,
    status: raw.status,
    author,
    reviewer,
    reviewedAt: raw.reviewedAt ? raw.reviewedAt.toISOString() : undefined,
    publishedAt: raw.publishedAt ? raw.publishedAt.toISOString() : raw.createdAt.toISOString(),
    contentUpdatedAt: raw.contentUpdatedAt ? raw.contentUpdatedAt.toISOString() : undefined,
    nextReviewAt: raw.nextReviewAt ? raw.nextReviewAt.toISOString() : undefined,
    readTime: calculateReadTime(raw.contentMarkdown),
    faqs,
    citations,
    focusKeyword: raw.focusKeyword || undefined,
    seoTitle: raw.seoTitle || undefined,
    seoDescription: raw.seoDescription || undefined,
    tags: raw.tags || undefined,
    seoScore: typeof raw.seoScore === 'number' ? raw.seoScore : undefined,
    isNoIndex: Boolean(raw.isNoIndex),
    canonicalUrl: raw.canonicalUrl || undefined,
    ogImage: raw.ogImage || undefined,
    primaryCta: {
      headline: `สนใจบริการ${raw.category} หรือต้องการที่ปรึกษาภาษีมืออาชีพ?`,
      subheadline: 'บริษัท ดีถาวรการบัญชี จำกัด ยินดีช่วยตรวจสอบ วางแผน และดูแลธุรกิจของคุณให้เติบโตอย่างมั่นคง',
      buttonText: 'ขอคำปรึกษาเบื้องต้นฟรี',
      lineMessage: `สนใจขอคำปรึกษาเกี่ยวกับ ${raw.title}`,
    },
  };
}

/**
 * Fetch all published articles from MySQL with optional category filter
 * Strictly excludes DRAFT, IN_REVIEW, ARCHIVED, or future-dated articles.
 */
export async function getPublishedArticles(category?: string): Promise<Article[]> {
  const now = new Date();

  const where: any = {
    status: 'PUBLISHED',
    publishedAt: {
      lte: now,
    },
  };

  if (category && category !== 'ทั้งหมด') {
    where.category = category;
  }

  const rawArticles = await prisma.article.findMany({
    where,
    include: {
      author: true,
      reviewer: true,
      faqs: { orderBy: { sortOrder: 'asc' } },
      citations: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return rawArticles.map(mapArticle);
}

/**
 * Fetch strictly indexable articles for XML Sitemap, IndexNow, and SEO Audits.
 * Criteria:
 * 1. status === 'PUBLISHED'
 * 2. publishedAt <= now
 * 3. isNoIndex === false
 * 4. canonicalUrl is either null or belongs to our canonical site host (not pointing externally)
 */
export async function getIndexableArticles(): Promise<Article[]> {
  const now = new Date();
  const siteUrl = getSiteUrl();

  const rawArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        lte: now,
      },
      isNoIndex: false,
    },
    include: {
      author: true,
      reviewer: true,
      faqs: { orderBy: { sortOrder: 'asc' } },
      citations: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  // Filter out articles that have external canonical URLs
  const filtered = rawArticles.filter((art) => {
    if (!art.canonicalUrl) return true;
    try {
      const canonicalHost = new URL(art.canonicalUrl).host.toLowerCase();
      const siteHost = new URL(siteUrl).host.toLowerCase();
      return (
        canonicalHost === siteHost ||
        canonicalHost === siteHost.replace(/^www\./, '') ||
        canonicalHost === `www.${siteHost}`
      );
    } catch {
      return false;
    }
  });

  return filtered.map(mapArticle);
}

/**
 * Fetch a single published article by its slug from MySQL
 * Also checks 301 Redirects table if a slug was renamed.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const now = new Date();

  const raw = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      reviewer: true,
      faqs: { orderBy: { sortOrder: 'asc' } },
      citations: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!raw) return null;
  if (raw.status !== 'PUBLISHED') return null;
  if (raw.publishedAt && raw.publishedAt > now) return null;

  return mapArticle(raw);
}

/**
 * Cached version of getArticleBySlug to prevent duplicate SQL queries
 * between generateMetadata() and ArticlePage() in Next.js Server Components.
 */
export const getCachedArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  return getArticleBySlug(slug);
});

/**
 * Check if a slug has a registered 301 redirect
 */
export async function getArticleRedirect(fromSlug: string): Promise<string | null> {
  const redirect = await prisma.articleRedirect.findUnique({
    where: { fromSlug },
    include: { article: true },
  });

  if (redirect?.article?.slug) {
    return redirect.article.slug;
  }
  return null;
}

/**
 * Fetch related articles from MySQL in the same category or intent
 */
export async function getRelatedArticles(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<Article[]> {
  const now = new Date();

  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: now },
      slug: { not: currentSlug },
      category,
    },
    include: {
      author: true,
      reviewer: true,
      faqs: { orderBy: { sortOrder: 'asc' } },
      citations: { orderBy: { sortOrder: 'asc' } },
    },
    take: limit,
    orderBy: [{ seoScore: 'desc' }, { publishedAt: 'desc' }],
  });

  // Fallback to highest SEO score / latest published if fewer than limit in same category
  if (articles.length < limit) {
    const existingSlugs = [currentSlug, ...articles.map((a) => a.slug)];
    const additional = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        slug: { notIn: existingSlugs },
      },
      include: {
        author: true,
        reviewer: true,
        faqs: { orderBy: { sortOrder: 'asc' } },
        citations: { orderBy: { sortOrder: 'asc' } },
      },
      take: limit - articles.length,
      orderBy: [{ seoScore: 'desc' }, { publishedAt: 'desc' }],
    });
    return [...articles, ...additional].map(mapArticle);
  }

  return articles.map(mapArticle);
}

export interface PillarHubInfo {
  title: string;
  url: string;
  description: string;
  subServices: {
    title: string;
    url: string;
  }[];
}

/**
 * Maps each article category to its Pillar Service Hub page and 3 related sub-services
 */
export function getPillarHubForCategory(category: string): PillarHubInfo {
  const normalized = category.trim();

  switch (normalized) {
    case 'บัญชีและงบการเงิน':
    case 'การทำบัญชี':
      return {
        title: 'บริการทำบัญชีและปิดงบการเงินครบวงจร',
        url: '/services/accounting-tax',
        description:
          'ดูแลบัญชีรายเดือนตามมาตรฐาน TFRS for NPAEs ปิดงบการเงินประจำปี และยื่นภาษีครบถ้วน พร้อมส่งคืนใบเสร็จตัวจริงจากกรมสรรพากรทุกเดือน เริ่มต้น 1,500 บาท/เดือน',
        subServices: [
          { title: 'รับทำบัญชีรายเดือน', url: '/services/monthly-accounting' },
          { title: 'รับปิดงบการเงินประจำปี', url: '/services/annual-financial-statements' },
          { title: 'บริการยื่นภาษีรายเดือนและรายปี', url: '/services/tax-filing' },
        ],
      };

    case 'จดทะเบียนธุรกิจ':
      return {
        title: 'บริการจดทะเบียนธุรกิจและนิติบุคคลครบวงจร',
        url: '/services/business-registration',
        description:
          'รับจดทะเบียนบริษัทจำกัด ห้างหุ้นส่วนจำกัด ผ่านระบบ DBD Biz Regist จดทะเบียนภาษีมูลค่าเพิ่ม (VAT) แก้ไขข้อมูลบริษัท และจดเครื่องหมายการค้า เริ่มต้น 1,500 บาท',
        subServices: [
          { title: 'รับจดทะเบียนบริษัท', url: '/services/company-registration' },
          { title: 'รับจดทะเบียน VAT', url: '/services/vat-registration' },
          { title: 'แก้ไขข้อมูลบริษัท', url: '/services/company-amendment' },
        ],
      };

    case 'ตรวจสอบบัญชี':
      return {
        title: 'บริการตรวจสอบบัญชีและรับรองงบการเงินโดย CPA',
        url: '/services/audit',
        description:
          'ตรวจสอบและรับรองงบการเงินประจำปีโดยผู้สอบบัญชีรับอนุญาต (CPA) ตามมาตรฐานการสอบบัญชี TSA พร้อมให้ข้อสังเกตระบบควบคุมภายในเพื่อความโปร่งใสของกิจการ',
        subServices: [
          { title: 'รับปิดงบการเงินประจำปี', url: '/services/annual-financial-statements' },
          { title: 'รับทำบัญชีรายเดือน', url: '/services/monthly-accounting' },
          { title: 'ที่ปรึกษาภาษีธุรกิจ', url: '/services/tax-consulting' },
        ],
      };

    case 'วางแผนภาษี':
      return {
        title: 'บริการที่ปรึกษาและวางแผนภาษีธุรกิจอย่างถูกต้องตามกฎหมาย',
        url: '/services/accounting-tax',
        description:
          'วิเคราะห์โครงสร้างรายได้และค่าใช้จ่าย วางแผนภาษีเงินได้นิติบุคคล ภาษีมรดก และประกัน Keyman โดยทีมผู้เชี่ยวชาญและผู้สอบบัญชีรับอนุญาต (CPA)',
        subServices: [
          { title: 'ที่ปรึกษาภาษีธุรกิจ', url: '/services/tax-consulting' },
          { title: 'วางแผนมรดกและภาษี', url: '/services/wealth-transfer' },
          { title: 'ประกัน Keyman วางแผนภาษีกรรมการ', url: '/services/keyman-insurance' },
        ],
      };

    case 'ทรัพยากรบุคคล':
      return {
        title: 'บริการงานบุคคล เงินเดือน และสวัสดิการองค์กร (HR & Payroll)',
        url: '/services/hr-payroll',
        description:
          'รับทำเงินเดือนพนักงาน (Payroll Outsourcing) ยื่น ภ.ง.ด.1 และประกันสังคม วางระบบงานบุคคล จัดตั้งกองทุนสำรองเลี้ยงชีพ (PVD) และประกันกลุ่มพนักงาน',
        subServices: [
          { title: 'รับทำเงินเดือนและประกันสังคม (Payroll)', url: '/services/payroll-outsourcing' },
          { title: 'วางระบบงานบุคคล (HR System)', url: '/services/hr-system' },
          { title: 'ประกันกลุ่มพนักงานและสวัสดิการ', url: '/services/group-insurance' },
        ],
      };

    case 'ภาษีและสรรพากร':
    case 'ภาษีอากร':
    default:
      return {
        title: 'บริการทำบัญชี ยื่นภาษี และที่ปรึกษาภาษีครบวงจร',
        url: '/services/accounting-tax',
        description:
          'ยื่นภาษีธุรกิจ ภ.พ.30 ภ.ง.ด.1/3/53/50/51 ตรวจสอบเอกสารภาษีตามหลักเกณฑ์กรมสรรพากร และวางแผนภาษีนิติบุคคลโดยทีมงานมืออาชีพ เริ่มต้น 1,500 บาท/เดือน',
        subServices: [
          { title: 'บริการยื่นภาษีบริษัท', url: '/services/tax-filing' },
          { title: 'ที่ปรึกษาภาษีธุรกิจ', url: '/services/tax-consulting' },
          { title: 'รับทำบัญชีรายเดือน', url: '/services/monthly-accounting' },
        ],
      };
  }
}

export interface AuthorProfileData {
  author: Author;
  authoredArticles: Article[];
  reviewedArticles: Article[];
}

/**
 * Fetch an author by slug along with their published authored and reviewed articles.
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorProfileData | null> {
  const now = new Date();

  const rawAuthor = await prisma.author.findUnique({
    where: { slug },
    include: {
      authoredArticles: {
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: now },
        },
        include: {
          author: true,
          reviewer: true,
          faqs: { orderBy: { sortOrder: 'asc' } },
          citations: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { publishedAt: 'desc' },
      },
      reviewedArticles: {
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: now },
        },
        include: {
          author: true,
          reviewer: true,
          faqs: { orderBy: { sortOrder: 'asc' } },
          citations: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { publishedAt: 'desc' },
      },
    },
  });

  if (!rawAuthor || !rawAuthor.isActive) return null;

  return {
    author: mapAuthor(rawAuthor),
    authoredArticles: rawAuthor.authoredArticles.map(mapArticle),
    reviewedArticles: rawAuthor.reviewedArticles.map(mapArticle),
  };
}

/**
 * Fetch all active authors
 */
export async function getAllActiveAuthors(): Promise<Author[]> {
  const authors = await prisma.author.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });
  return authors.map(mapAuthor);
}

