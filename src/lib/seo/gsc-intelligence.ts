import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/seo/site-url';
import { SUB_SERVICES } from '@/lib/services/sub-services-data';
import { slugify } from '@/lib/articles/validation';

// ============================================================================
// Types & Interfaces (7-Layer SEO Intelligence Framework)
// ============================================================================

export type GscDataSourceTier = 'LIVE_API' | 'CACHED_SYNC' | 'CSV_IMPORT' | 'DEMO_SIMULATION';

export type OpportunityBucket =
  | 'CONTENT_GAP'
  | 'STRIKING_DISTANCE'
  | 'CTR_BOOSTER'
  | 'TOP_PERFORMER';

export type RankDeltaStatus = 'UP' | 'DOWN' | 'SAME' | 'NEW';

export interface GscQueryRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0.0 - 1.0
  position: number;
  previousPosition?: number | null;
  positionDelta?: number | null; // positive = improved (moved up)
  deltaStatus: RankDeltaStatus;
}

export interface AnalyzedOpportunityItem extends GscQueryRow {
  id: string;
  bucket: OpportunityBucket;
  priorityScore: number;
  matchedArticleId?: number | null;
  matchedArticleTitle?: string | null;
  matchedArticleSlug?: string | null;
  matchedArticleStatus?: string | null;
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedCategory: string;
  pillarTitle: string;
  pillarUrl: string;
  actionRecommendation: string;
  // 5 Smart SEO Guardrail flags
  alreadyOptimized: boolean;
  isExamQuery: boolean;
  lowImpressionsWait: boolean;
  cannibalizationPrevented: boolean;
  guardrailBadges: Array<{
    type: 'optimized' | 'exam' | 'wait_impressions' | 'anti_cannibalization';
    label: string;
    tone: 'green' | 'blue' | 'amber' | 'purple';
  }>;
}

export interface PlainEnglishReport {
  headline: string;
  summaryParagraph: string;
  totalClicks: number;
  totalImpressions: number;
  averagePosition: number;
  averageCtrPercent: number;
  topPerformerHighlight: string;
  topContentGapHighlight: string;
  fastestWinHighlight: string;
  nextThreeActions: Array<{
    step: number;
    title: string;
    detail: string;
    bucket: OpportunityBucket;
    actionLabel: string;
    actionUrl?: string;
  }>;
}

export interface SeoContentPlanItem {
  id: string;
  keyword: string;
  suggestedTitle: string;
  suggestedSlug: string;
  category: string;
  pillarUrl: string;
  pillarTitle: string;
  status: 'PLANNED' | 'DRAFTING' | 'COMPLETED';
  matchedArticleId?: number | null;
  matchedArticleSlug?: string | null;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutocompleteKeywordItem {
  keyword: string;
  sourcePattern: string;
  intent: 'HIGH_INTENT' | 'COMPARISON' | 'QUESTION_FAQ' | 'GENERAL';
  intentLabel: string;
  coverageStatus: 'COVERED_PRIMARY' | 'COVERED_IN_CONTENT' | 'MISSING_GAP';
  matchedArticleTitle?: string | null;
  matchedArticleSlug?: string | null;
  matchedArticleId?: number | null;
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedCategory: string;
  pillarUrl: string;
  pillarTitle: string;
}

export interface InternalLinkOpportunity {
  sourceArticleId: number;
  sourceArticleTitle: string;
  sourceArticleSlug: string;
  targetArticleId: number;
  targetArticleTitle: string;
  targetArticleSlug: string;
  matchedPhrase: string;
  contextSnippet: string;
}

export interface ArticleLinkMatrixRow {
  articleId: number;
  title: string;
  slug: string;
  status: string;
  category: string;
  focusKeyword: string | null;
  seoScore: number;
  inboundCount: number;
  inboundFrom: Array<{ id: number; title: string; slug: string }>;
  outboundBlogCount: number;
  outboundTo: Array<{ slug: string; anchor: string }>;
  pillarLinksCount: number;
  pillarLinks: Array<{ url: string; anchor: string }>;
  isOrphan: boolean;
}

export interface BrokenLinkIssue {
  articleId: number;
  articleTitle: string;
  articleSlug: string;
  issueType: 'BROKEN_INTERNAL_LINK' | 'INVALID_CITATION_URL' | 'MISSING_COVER_IMAGE' | 'MISSING_COVER_ALT';
  severity: 'HIGH' | 'MEDIUM';
  targetValue: string;
  description: string;
  fixActionUrl: string;
}

export const MIN_IMPRESSIONS_FOR_CTR_EDIT = 15;

// ============================================================================
// Layer 1: Native Node.js RS256 JWT Signer & Google Search Console API
// ============================================================================

export interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function parseServiceAccountJson(rawJson: string): ServiceAccountCredentials | null {
  if (!rawJson || !rawJson.trim()) return null;
  try {
    const parsed = JSON.parse(rawJson.trim());
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      client_email: String(parsed.client_email).trim(),
      private_key: String(parsed.private_key).replace(/\\n/g, '\n'),
      project_id: parsed.project_id ? String(parsed.project_id).trim() : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Generates an OAuth2 Access Token using Node's native `crypto` (RSA-SHA256)
 * with zero external dependencies (`googleapis` not required).
 */
export async function getGoogleAccessToken(
  credentials: ServiceAccountCredentials,
  scopes: string[] = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/indexing',
  ]
): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSec,
    exp: nowSec + 3600,
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(payload)
  )}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(credentials.private_key);
  const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Google OAuth2 Token Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Google OAuth2 did not return an access_token');
  }

  return data.access_token;
}

/**
 * Auto-Site Discovery & Smart Diagnostics for GSC Properties
 */
export async function fetchVerifiedGscSites(
  accessToken: string,
  projectId?: string
): Promise<{
  sites: string[];
  matchedSite: string | null;
  serviceDisabledUrl?: string;
  error?: string;
}> {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (errText.includes('SERVICE_DISABLED') || errText.includes('has not been used in project')) {
      const enableUrl = projectId
        ? `https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=${projectId}`
        : 'https://console.developers.google.com/apis/library/searchconsole.googleapis.com';
      return {
        sites: [],
        matchedSite: null,
        serviceDisabledUrl: enableUrl,
        error: `Google Search Console API ยังไม่ได้เปิดใช้งานในโปรเจกต์ ${projectId || ''}`,
      };
    }
    return {
      sites: [],
      matchedSite: null,
      error: `GSC Sites API Error (${res.status}): ${errText}`,
    };
  }

  const data = await res.json();
  const entries: Array<{ siteUrl: string; permissionLevel?: string }> = data.siteEntry || [];
  const sites = entries.map((e) => e.siteUrl);

  const canonicalHost = new URL(getSiteUrl()).host.replace(/^www\./, '').toLowerCase();
  const matchedSite =
    sites.find((s) => s.toLowerCase() === `sc-domain:${canonicalHost}`) ||
    sites.find((s) => s.toLowerCase().includes(canonicalHost)) ||
    sites[0] ||
    null;

  return { sites, matchedSite };
}

function formatDateYmd(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function queryGscWindow(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  rowLimit = 250
): Promise<Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>> {
  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`GSC SearchAnalytics Error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json.rows || [];
}

/**
 * 3-Window Period-over-Period Rank Delta Fetcher
 */
export async function fetchGscSearchAnalytics(
  accessToken: string,
  siteUrl: string,
  days = 28
): Promise<GscQueryRow[]> {
  const now = new Date();
  // GSC data has ~2-day lag
  const currentEnd = new Date(now.getTime() - 2 * 86400000);
  const currentStart = new Date(currentEnd.getTime() - days * 86400000);

  const prevEnd = new Date(currentStart.getTime() - 1 * 86400000);
  const prevStart = new Date(prevEnd.getTime() - days * 86400000);

  const baselineEnd = new Date(prevStart.getTime() - 1 * 86400000);
  const baselineStart = new Date(baselineEnd.getTime() - days * 86400000);

  const [currentRows, prevRows, baselineRows] = await Promise.all([
    queryGscWindow(accessToken, siteUrl, formatDateYmd(currentStart), formatDateYmd(currentEnd)),
    queryGscWindow(accessToken, siteUrl, formatDateYmd(prevStart), formatDateYmd(prevEnd)).catch(() => []),
    queryGscWindow(accessToken, siteUrl, formatDateYmd(baselineStart), formatDateYmd(baselineEnd)).catch(
      () => []
    ),
  ]);

  const prevMap = new Map<string, number>();
  for (const r of baselineRows) {
    const q = (r.keys?.[0] || '').trim().toLowerCase();
    if (q && !prevMap.has(q)) prevMap.set(q, r.position);
  }
  for (const r of prevRows) {
    const q = (r.keys?.[0] || '').trim().toLowerCase();
    if (q) prevMap.set(q, r.position);
  }

  return currentRows.map((row) => {
    const query = (row.keys?.[0] || '').trim();
    const page = (row.keys?.[1] || '/').trim();
    const position = Number((row.position || 0).toFixed(1));
    const prevPos = prevMap.get(query.toLowerCase());

    let positionDelta: number | null = null;
    let deltaStatus: RankDeltaStatus = 'NEW';

    if (typeof prevPos === 'number') {
      positionDelta = Number((prevPos - position).toFixed(1));
      if (positionDelta > 0.2) deltaStatus = 'UP';
      else if (positionDelta < -0.2) deltaStatus = 'DOWN';
      else deltaStatus = 'SAME';
    }

    return {
      query,
      page,
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: Number((row.ctr || 0).toFixed(4)),
      position,
      previousPosition: typeof prevPos === 'number' ? Number(prevPos.toFixed(1)) : null,
      positionDelta,
      deltaStatus,
    };
  });
}

// ============================================================================
// Demo Simulation Dataset (Realistic Accounting & Tax Queries for Deethavorn)
// ============================================================================

export function getDemoSimulationRows(): GscQueryRow[] {
  const siteUrl = getSiteUrl();
  return [
    // 1. CONTENT_GAP items (Ranking on generic/service pages, 0-1 clicks, high impressions, no dedicated article yet)
    {
      query: 'ยื่น ภ.พ.30 ล่าช้า ปรับเท่าไหร่ เบี้ยปรับ เงินเพิ่ม',
      page: `${siteUrl}/services/monthly-tax-filing`,
      clicks: 1,
      impressions: 420,
      ctr: 0.0024,
      position: 8.4,
      previousPosition: 11.2,
      positionDelta: 2.8,
      deltaStatus: 'UP',
    },
    {
      query: 'ประมาณการกำไรสุทธิ ภ.ง.ด.51 ขาดเกิน 25% มีโทษปรับอย่างไร',
      page: `${siteUrl}/services/accounting-tax`,
      clicks: 0,
      impressions: 365,
      ctr: 0,
      position: 9.1,
      previousPosition: 12.0,
      positionDelta: 2.9,
      deltaStatus: 'UP',
    },
    {
      query: 'ภาษีหัก ณ ที่จ่าย ภ.ง.ด.3 กับ ภ.ง.ด.53 ต่างกันอย่างไร หักกี่เปอร์เซ็นต์',
      page: `${siteUrl}/services/monthly-tax-filing`,
      clicks: 1,
      impressions: 510,
      ctr: 0.002,
      position: 7.8,
      previousPosition: null,
      positionDelta: null,
      deltaStatus: 'NEW',
    },
    {
      query: 'ค่าใช้จ่ายต้องห้ามทางภาษี มาตรา 65 ตรี มีอะไรบ้าง',
      page: `${siteUrl}/services/tax-planning-consulting`,
      clicks: 0,
      impressions: 290,
      ctr: 0,
      position: 10.5,
      previousPosition: 13.4,
      positionDelta: 2.9,
      deltaStatus: 'UP',
    },
    {
      query: 'เปลี่ยนที่อยู่บริษัท ย้ายสำนักงานใหญ่ ข้ามเขต ต้องแจ้งกรมสรรพากรกี่วัน',
      page: `${siteUrl}/services/company-amendment`,
      clicks: 1,
      impressions: 245,
      ctr: 0.0041,
      position: 6.9,
      previousPosition: 8.1,
      positionDelta: 1.2,
      deltaStatus: 'UP',
    },

    // 2. STRIKING_DISTANCE items (Rank 5.0 - 20.0 or existing article needing H2/H3/FAQ boost)
    {
      query: 'ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด ทุนจดทะเบียนเท่าไหร่ดี',
      page: `${siteUrl}/knowledge/5-things-to-know-before-company-registration`,
      clicks: 14,
      impressions: 480,
      ctr: 0.0292,
      position: 6.4,
      previousPosition: 9.2,
      positionDelta: 2.8,
      deltaStatus: 'UP',
    },
    {
      query: 'วางแผนภาษีนิติบุคคล SME ลดหย่อนอะไรได้บ้าง 2569',
      page: `${siteUrl}/knowledge/corporate-tax-planning-for-sme`,
      clicks: 11,
      impressions: 390,
      ctr: 0.0282,
      position: 7.2,
      previousPosition: 6.1,
      positionDelta: -1.1,
      deltaStatus: 'DOWN',
    },
    {
      query: 'ปิดงบการเงินประจำปี ยื่น DBD และ ภ.ง.ด.50 ภายในกี่วัน',
      page: `${siteUrl}/services/annual-financial-statements`,
      clicks: 9,
      impressions: 340,
      ctr: 0.0265,
      position: 8.7,
      previousPosition: 10.5,
      positionDelta: 1.8,
      deltaStatus: 'UP',
    },

    // 3. CTR_BOOSTER items (Rank 1.0 - 5.0 but CTR < 3.5%)
    {
      query: 'จดทะเบียนบริษัทจำกัด เอกสาร ขั้นตอน ค่าใช้จ่าย',
      page: `${siteUrl}/knowledge/5-things-to-know-before-company-registration`,
      clicks: 8,
      impressions: 350,
      ctr: 0.0228,
      position: 3.2,
      previousPosition: 4.1,
      positionDelta: 0.9,
      deltaStatus: 'UP',
    },
    {
      query: 'ในข้อใดถูกต้องเกี่ยวกับการจดทะเบียนบริษัทจำกัด ก. ผู้เริ่มก่อการ 2 คน ข. 3 คน',
      page: `${siteUrl}/knowledge/5-things-to-know-before-company-registration`,
      clicks: 0,
      impressions: 95,
      ctr: 0,
      position: 2.4,
      previousPosition: 2.5,
      positionDelta: 0.1,
      deltaStatus: 'SAME',
    },
    {
      query: 'ผู้สอบบัญชีรับอนุญาต CPA ตรวจงบการเงิน ราคา',
      page: `${siteUrl}/services/audit`,
      clicks: 0,
      impressions: 9, // < 15 impressions threshold test
      ctr: 0,
      position: 4.1,
      previousPosition: null,
      positionDelta: null,
      deltaStatus: 'NEW',
    },

    // 4. TOP_PERFORMER items (Rank <= 4.5 and CTR >= 3.5%)
    {
      query: 'ดีถาวรการบัญชี สำนักงานบัญชี อโศก ดินแดง',
      page: `${siteUrl}/`,
      clicks: 84,
      impressions: 310,
      ctr: 0.271,
      position: 1.2,
      previousPosition: 1.4,
      positionDelta: 0.2,
      deltaStatus: 'SAME',
    },
    {
      query: 'รับทำบัญชีรายเดือน ราคาเริ่มต้น 1500 บาท',
      page: `${siteUrl}/pricing`,
      clicks: 52,
      impressions: 620,
      ctr: 0.0839,
      position: 2.6,
      previousPosition: 3.8,
      positionDelta: 1.2,
      deltaStatus: 'UP',
    },
    {
      query: 'จดทะเบียน vat ภาษีมูลค่าเพิ่ม เมื่อไหร่ รายได้เกิน 1.8 ล้าน',
      page: `${siteUrl}/services/vat-registration`,
      clicks: 38,
      impressions: 540,
      ctr: 0.0704,
      position: 2.9,
      previousPosition: 4.5,
      positionDelta: 1.6,
      deltaStatus: 'UP',
    },
  ];
}

// ============================================================================
// Layer 2: 5 Smart SEO Guardrails & Opportunity Classifier
// ============================================================================

const THAI_ACCOUNTING_SYNONYM_GROUPS: string[][] = [
  ['ภ.พ.30', 'ภพ.30', 'ภพ30', 'ภาษีมูลค่าเพิ่ม', 'vat', 'จด vat', 'จดทะเบียน vat'],
  ['ภ.ง.ด.51', 'ภงด.51', 'ภงด51', 'ภาษีเงินได้นิติบุคคลครึ่งปี', 'ภาษีครึ่งปี', 'ประมาณการกำไรสุทธิ'],
  ['ภ.ง.ด.50', 'ภงด.50', 'ภงด50', 'ภาษีเงินได้นิติบุคคลประจำปี'],
  ['ภ.ง.ด.3', 'ภงด.3', 'ภงด3', 'ภ.ง.ด.53', 'ภงด.53', 'ภงด53', 'ภาษีหัก ณ ที่จ่าย', 'หัก ณ ที่จ่าย', 'wht'],
  ['งบการเงิน', 'ปิดงบ', 'ปิดงบการเงิน', 'ตรวจสอบบัญชี', 'สอบบัญชี', 'ผู้สอบบัญชี', 'cpa', 'audit'],
  ['จดทะเบียนบริษัท', 'จดบริษัท', 'จัดตั้งบริษัท', 'จดทะเบียนนิติบุคคล', 'เปิดบริษัท'],
  ['วางแผนภาษี', 'ประหยัดภาษี', 'ลดหย่อนภาษี', 'ที่ปรึกษาภาษี'],
  ['ประกันสังคม', 'ทำเงินเดือน', 'สลิปเงินเดือน', 'payroll', 'ภ.ง.ด.1', 'ภงด1'],
];

function normalizeThaiText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Guardrail 2: Thai Synonym & Fuzzy Topic Matcher
 */
export function isFuzzyTopicMatch(query: string, targetText: string): boolean {
  const qNorm = normalizeThaiText(query);
  const tNorm = normalizeThaiText(targetText);
  if (!qNorm || !tNorm) return false;

  if (tNorm.includes(qNorm) || qNorm.includes(tNorm)) return true;

  // Check token overlap (ignoring common Thai stop words)
  const stopWords = new Set(['คือ', 'อะไร', 'ที่ไหน', 'อย่างไร', 'เท่าไหร่', 'กี่วัน', 'ต้อง', 'และ', 'กับ', 'ใน', 'การ', 'ของ', 'สำหรับ']);
  const qTokens = qNorm
    .split(/[\s,/()-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !stopWords.has(t));

  if (qTokens.length >= 2) {
    const matchedTokens = qTokens.filter((token) => {
      if (tNorm.includes(token)) return true;
      // Check synonym group
      const group = THAI_ACCOUNTING_SYNONYM_GROUPS.find((g) =>
        g.some((syn) => syn.toLowerCase() === token || token.includes(syn.toLowerCase()))
      );
      if (group) {
        return group.some((syn) => tNorm.includes(syn.toLowerCase()));
      }
      return false;
    });
    if (matchedTokens.length / qTokens.length >= 0.65) {
      return true;
    }
  }

  return false;
}

/**
 * Guardrail 3: H2/H3 & FAQ Optimization Detector
 */
export function isQueryAlreadyOptimizedInPost(
  query: string,
  article: {
    title: string;
    seoTitle?: string | null;
    focusKeyword?: string | null;
    contentMarkdown: string;
    faqs?: Array<{ question: string; answer: string }>;
  }
): boolean {
  const qNorm = normalizeThaiText(query);
  if (!qNorm) return false;

  const h2h3Matches = article.contentMarkdown.match(/^#{2,3}\s+[^\n]+/gm) || [];
  const headingsCombined = normalizeThaiText(h2h3Matches.join(' '));
  const faqCombined = normalizeThaiText(
    (article.faqs || []).map((f) => `${f.question} ${f.answer}`).join(' ')
  );
  const titleCombined = normalizeThaiText(
    `${article.title} ${article.seoTitle || ''} ${article.focusKeyword || ''}`
  );

  if (
    headingsCombined.includes(qNorm) ||
    faqCombined.includes(qNorm) ||
    isFuzzyTopicMatch(qNorm, headingsCombined) ||
    isFuzzyTopicMatch(qNorm, faqCombined)
  ) {
    return true;
  }

  // Also check if >= 75% of meaningful query tokens appear in Title + Headings + FAQ
  const tokens = qNorm.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length >= 2) {
    const pool = `${titleCombined} ${headingsCombined} ${faqCombined}`;
    const hitCount = tokens.filter((t) => pool.includes(t)).length;
    if (hitCount / tokens.length >= 0.8) return true;
  }

  return false;
}

/**
 * Guardrail 4: Zero-Click Exam Query Guardrail
 */
export function isExamOrZeroClickQuery(query: string): boolean {
  const q = normalizeThaiText(query);
  const examPatterns = [
    'ในข้อใด',
    'ข้อใดถูกต้อง',
    'ข้อใดผิด',
    'ข้อใดไม่ใช่',
    'ข้อใดกล่าวถูกต้อง',
    'ก. ',
    'ข. ',
    'ค. ',
    'ง. ',
    'จงอธิบาย',
    'อัตนัย',
    'ปรนัย',
  ];
  return examPatterns.some((pat) => q.includes(pat));
}

/**
 * Maps a Thai query to the best Pillar Service Page & Article Category
 */
export function matchPillarServiceAndCategory(query: string): {
  category: string;
  pillarTitle: string;
  pillarUrl: string;
} {
  const q = normalizeThaiText(query);

  if (q.includes('จดทะเบียน') || q.includes('จัดตั้ง') || q.includes('ย้ายที่อยู่') || q.includes('แก้ไขบริษัท') || q.includes('ผู้ถือหุ้น') || q.includes('เลิกบริษัท')) {
    if (q.includes('vat') || q.includes('ภาษีมูลค่าเพิ่ม')) {
      return {
        category: 'จดทะเบียนธุรกิจ',
        pillarTitle: 'บริการจดทะเบียนภาษีมูลค่าเพิ่ม (VAT)',
        pillarUrl: '/services/vat-registration',
      };
    }
    if (q.includes('ย้าย') || q.includes('เปลี่ยน') || q.includes('แก้ไข')) {
      return {
        category: 'จดทะเบียนธุรกิจ',
        pillarTitle: 'บริการจดทะเบียนเปลี่ยนแปลงแก้ไขบริษัท',
        pillarUrl: '/services/company-amendment',
      };
    }
    return {
      category: 'จดทะเบียนธุรกิจ',
      pillarTitle: 'บริการจดทะเบียนจัดตั้งบริษัทและห้างหุ้นส่วน',
      pillarUrl: '/services/company-registration',
    };
  }

  if (q.includes('สอบบัญชี') || q.includes('ตรวจสอบบัญชี') || q.includes('cpa') || q.includes('ผู้สอบบัญชี')) {
    return {
      category: 'ตรวจสอบบัญชี',
      pillarTitle: 'บริการตรวจสอบบัญชีและรับรองงบโดย CPA',
      pillarUrl: '/services/financial-audit-cpa',
    };
  }

  if (q.includes('งบการเงิน') || q.includes('ปิดงบ') || q.includes('dbd') || q.includes('ภ.ง.ด.50') || q.includes('ภ.ง.ด.51') || q.includes('ภงด51')) {
    return {
      category: 'บัญชีและงบการเงิน',
      pillarTitle: 'บริการปิดงบการเงินประจำปีและยื่นภาษีนิติบุคคล',
      pillarUrl: '/services/annual-financial-statements',
    };
  }

  if (q.includes('วางแผนภาษี') || q.includes('ประหยัดภาษี') || q.includes('ลดหย่อน') || q.includes('ต้องห้าม') || q.includes('มาตรา 65')) {
    return {
      category: 'วางแผนภาษี',
      pillarTitle: 'บริการที่ปรึกษาและวางแผนภาษีอากร',
      pillarUrl: '/services/tax-planning-consulting',
    };
  }

  if (q.includes('เงินเดือน') || q.includes('ประกันสังคม') || q.includes('payroll') || q.includes('ภ.ง.ด.1')) {
    return {
      category: 'ทรัพยากรบุคคล',
      pillarTitle: 'บริการจัดทำเงินเดือนและประกันสังคม (Payroll & SSO)',
      pillarUrl: '/services/hr-payroll',
    };
  }

  return {
    category: 'ภาษีและสรรพากร',
    pillarTitle: 'บริการยื่นภาษีรายเดือน (ภ.พ.30 / ภ.ง.ด.1, 3, 53)',
    pillarUrl: '/services/monthly-tax-filing',
  };
}

/**
 * Generates an authoritative CPA editorial title from a search query
 */
export function generateSuggestedEditorialTitle(query: string): string {
  const clean = query.trim();
  if (!clean) return 'คู่มือภาษีและบัญชีสำหรับผู้ประกอบการ | ดีถาวรการบัญชี';
  if (clean.length >= 38) return clean;
  if (clean.includes('เท่าไหร่') || clean.includes('อย่างไร') || clean.includes('อะไรบ้าง') || clean.includes('กี่วัน')) {
    return `${clean} สรุปครบทุกเกณฑ์ที่ผู้ประกอบการต้องรู้`;
  }
  return `${clean}: คู่มือฉบับสมบูรณ์และแนวทางปฏิบัติตามกฎหมายสรรพากร`;
}

/**
 * Generates a Clean English URL Slug from a Thai/English query
 */
export function generateEnglishSlugFromQuery(query: string): string {
  const q = normalizeThaiText(query);
  const dictionary: Array<[string, string]> = [
    ['ภ.พ.30', 'pp30-vat'],
    ['ภพ30', 'pp30-vat'],
    ['ภาษีมูลค่าเพิ่ม', 'vat-guide'],
    ['vat', 'vat'],
    ['ภ.ง.ด.51', 'pnd51-half-year-tax'],
    ['ภงด51', 'pnd51-half-year-tax'],
    ['ประมาณการกำไรสุทธิ', 'net-profit-estimation'],
    ['ภ.ง.ด.50', 'pnd50-corporate-tax'],
    ['ภ.ง.ด.3', 'pnd3-wht'],
    ['ภ.ง.ด.53', 'pnd53-wht'],
    ['หัก ณ ที่จ่าย', 'withholding-tax'],
    ['ค่าใช้จ่ายต้องห้าม', 'non-deductible-expenses'],
    ['มาตรา 65 ตรี', 'section-65-ter'],
    ['จดทะเบียนบริษัท', 'company-registration'],
    ['เปลี่ยนที่อยู่บริษัท', 'company-address-change'],
    ['ย้ายสำนักงาน', 'office-relocation-tax'],
    ['ปิดงบการเงิน', 'annual-financial-statements'],
    ['ตรวจสอบบัญชี', 'financial-audit-cpa'],
    ['วางแผนภาษี', 'corporate-tax-planning'],
    ['ประกันสังคม', 'social-security-payroll'],
    ['ล่าช้า', 'late-filing'],
    ['เบี้ยปรับ', 'penalty-surcharge'],
    ['ปรับเท่าไหร่', 'penalty-rate'],
  ];

  const matchedParts: string[] = [];
  for (const [th, en] of dictionary) {
    if (q.includes(th)) {
      for (const part of en.split('-')) {
        if (!matchedParts.includes(part)) matchedParts.push(part);
      }
    }
  }

  // Also extract any English/numeric tokens present in the query
  const englishTokens = q.match(/[a-z0-9]+/g) || [];
  for (const tok of englishTokens) {
    if (!matchedParts.includes(tok)) matchedParts.push(tok);
  }

  if (matchedParts.length >= 2) {
    return matchedParts.slice(0, 6).join('-');
  }

  const fallback = slugify(query);
  if (/^[a-z0-9-]+$/.test(fallback) && fallback.length >= 4) {
    return fallback;
  }

  // Deterministic hash suffix for pure Thai queries outside dictionary
  const shortHash = crypto.createHash('md5').update(q).digest('hex').slice(0, 6);
  const prefix = matchedParts.length > 0 ? matchedParts.join('-') : 'tax-accounting-guide';
  return `${prefix}-${shortHash}`;
}

/**
 * Core Classifier: "Judge Gaps by the Page Google Actually Ranks"
 */
export function analyzeRowsAgainstPosts(
  rows: GscQueryRow[],
  articles: Array<{
    id: number;
    title: string;
    slug: string;
    summary: string;
    contentMarkdown: string;
    category: string;
    status: string;
    focusKeyword?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    tags?: string | null;
    faqs?: Array<{ question: string; answer: string }>;
  }>
): AnalyzedOpportunityItem[] {
  return rows.map((row, idx) => {
    const query = row.query.trim();
    const pagePath = (() => {
      try {
        if (row.page.startsWith('http')) return new URL(row.page).pathname;
      } catch {
        // ignore
      }
      return row.page;
    })();

    const isKnowledgeUrl = pagePath.startsWith('/knowledge/') && pagePath !== '/knowledge';
    const rankedSlug = isKnowledgeUrl ? pagePath.replace('/knowledge/', '').split('/')[0] : null;

    // 1. Guardrail 1 & 2: Anti-Cannibalization & Thai Fuzzy Topic Matcher
    let matchedArticle = rankedSlug
      ? articles.find((a) => a.slug.toLowerCase() === rankedSlug.toLowerCase())
      : undefined;

    let cannibalizationPrevented = false;
    if (!matchedArticle) {
      matchedArticle = articles.find((a) => {
        const kwMatch = a.focusKeyword && isFuzzyTopicMatch(query, a.focusKeyword);
        const titleMatch = isFuzzyTopicMatch(query, a.title);
        const seoTitleMatch = a.seoTitle && isFuzzyTopicMatch(query, a.seoTitle);
        const slugMatch = query.toLowerCase().includes(a.slug.toLowerCase());
        return Boolean(kwMatch || titleMatch || seoTitleMatch || slugMatch);
      });
      if (matchedArticle) {
        cannibalizationPrevented = true;
      }
    }

    // 2. Guardrail 3: H2/H3 & FAQ Optimization Detector
    const alreadyOptimized = matchedArticle
      ? isQueryAlreadyOptimizedInPost(query, matchedArticle)
      : false;

    // 3. Guardrail 4: Zero-Click Exam Query Guardrail
    const isExamQuery = isExamOrZeroClickQuery(query);

    // 4. Guardrail 5: Statistical Impression Threshold
    const lowImpressionsWait = row.impressions < MIN_IMPRESSIONS_FOR_CTR_EDIT;

    // Determine Bucket
    let bucket: OpportunityBucket;
    if (row.position <= 4.5 && row.ctr >= 0.035 && row.clicks >= 5) {
      bucket = 'TOP_PERFORMER';
    } else if (row.position >= 1.0 && row.position <= 5.0 && (row.clicks === 0 || row.ctr < 0.035)) {
      bucket = 'CTR_BOOSTER';
    } else if (!matchedArticle && !isKnowledgeUrl && row.clicks <= 2 && row.impressions >= 30) {
      bucket = 'CONTENT_GAP';
    } else if (row.position > 5.0 && row.position <= 20.0) {
      bucket = matchedArticle ? 'STRIKING_DISTANCE' : row.clicks <= 1 ? 'CONTENT_GAP' : 'STRIKING_DISTANCE';
    } else {
      bucket = matchedArticle ? 'STRIKING_DISTANCE' : 'CONTENT_GAP';
    }

    // Never classify as CONTENT_GAP if an article already exists (Anti-Cannibalization Iron Rule)
    if (bucket === 'CONTENT_GAP' && matchedArticle) {
      bucket = 'STRIKING_DISTANCE';
      cannibalizationPrevented = true;
    }

    const pillarInfo = matchPillarServiceAndCategory(query);
    const suggestedTitle = generateSuggestedEditorialTitle(query);
    const suggestedSlug = generateEnglishSlugFromQuery(query);

    // Guardrail badges
    const guardrailBadges: AnalyzedOpportunityItem['guardrailBadges'] = [];
    if (alreadyOptimized) {
      guardrailBadges.push({
        type: 'optimized',
        label: '✓ อัปเดตคีย์เวิร์ดใน H2/FAQ แล้ว (รอ GSC อัปเดตข้อมูล)',
        tone: 'green',
      });
    }
    if (isExamQuery) {
      guardrailBadges.push({
        type: 'exam',
        label: '✓ คำค้นหาแนวข้อสอบ (ไม่ต้องแก้พาดหัว)',
        tone: 'blue',
      });
    }
    if (bucket === 'CTR_BOOSTER' && lowImpressionsWait) {
      guardrailBadges.push({
        type: 'wait_impressions',
        label: `⏳ รอสะสม Impressions (${row.impressions}/${MIN_IMPRESSIONS_FOR_CTR_EDIT} ครั้ง)`,
        tone: 'amber',
      });
    }
    if (cannibalizationPrevented && matchedArticle) {
      guardrailBadges.push({
        type: 'anti_cannibalization',
        label: `🛡️ ป้องกันบทความซ้ำ (มีบทความ "${matchedArticle.title.slice(0, 32)}..." แล้ว)`,
        tone: 'purple',
      });
    }

    // Priority Score calculation (de-prioritize alreadyOptimized, exam queries, and low impression CTR items)
    let priorityScore = row.impressions * (bucket === 'CONTENT_GAP' ? 1.5 : 1.2);
    if (alreadyOptimized) priorityScore *= 0.25;
    if (isExamQuery) priorityScore *= 0.15;
    if (bucket === 'CTR_BOOSTER' && lowImpressionsWait) priorityScore *= 0.2;

    // Action Recommendation
    let actionRecommendation = '';
    if (bucket === 'CONTENT_GAP') {
      actionRecommendation = `ยังไม่มีบทความเฉพาะรองรับคำนี้ (ปัจจุบัน Google นำหน้า ${pagePath} ไปแสดง) แนะนำกด "1-Click เขียนบทความใหม่" โดยใช้ "${query}" เป็น Focus Keyword แล้วส่ง Internal Link กลับไปยังหน้า ${pillarInfo.pillarTitle} (${pillarInfo.pillarUrl})`;
    } else if (bucket === 'STRIKING_DISTANCE') {
      if (alreadyOptimized) {
        actionRecommendation = `บทความ "${matchedArticle?.title || pagePath}" มีคำค้นหานี้ในหัวข้อ H2/H3 หรือ FAQ เรียบร้อยแล้ว แนะนำรอ Google ประมวลผลอันดับรอบถัดไป หรือเสริม Internal Link จากบทความอื่นเพิ่ม`;
      } else if (matchedArticle) {
        actionRecommendation = `ห้ามเขียนบทความใหม่ซ้ำ! แนะนำเปิดแก้ไขบทความ "${matchedArticle.title}" แล้วเพิ่มหัวข้อ H2/H3 หรือคำถาม FAQ ที่มีคำว่า "${query}" เพื่อดันจากอันดับ ${row.position} ขึ้น Top 5`;
      } else {
        actionRecommendation = `หน้า ${pagePath} ติดอันดับ ${row.position} แนะนำสร้างบทความเจาะลึกหรือเพิ่มเนื้อหา FAQ ในหน้าดังกล่าวเพื่อดันขึ้นหน้าแรก`;
      }
    } else if (bucket === 'CTR_BOOSTER') {
      if (isExamQuery) {
        actionRecommendation = `ตรวจพบเป็นคำค้นหาแนวโจทย์ข้อสอบปรนัย ผู้ค้นหามักดูคำตอบบนหน้า SERP ทันที (Zero-Click) ไม่แนะนำให้เปลี่ยน SEO Title ของบทความหลัก`;
      } else if (lowImpressionsWait) {
        actionRecommendation = `มียอดการมองเห็นเพียง ${row.impressions} ครั้ง (ต่ำกว่าเกณฑ์ขั้นต่ำ ${MIN_IMPRESSIONS_FOR_CTR_EDIT} ครั้ง) แนะนำรอสะสมข้อมูลทางสถิติก่อนปรับแก้ SEO Title`;
      } else {
        actionRecommendation = `ติดหน้าแรกอันดับ ${row.position} แต่ CTR เพียง ${(row.ctr * 100).toFixed(2)}% แนะนำปรับปรุง SEO Title และ Meta Description ให้ระบุตัวเลข/ประโยชน์ชัดเจนเพื่อดึงดูดคลิก`;
      }
    } else {
      actionRecommendation = `ทำผลงานยอดเยี่ยม (อันดับ ${row.position}, CTR ${(row.ctr * 100).toFixed(2)}%) แนะนำรักษามาตรฐานเนื้อหาและใช้หน้านี้ส่ง Internal Link ไปดันบทความใหม่ในหมวด ${pillarInfo.category}`;
    }

    return {
      ...row,
      id: `opp-${idx}-${Buffer.from(query).toString('base64').slice(0, 10)}`,
      bucket,
      priorityScore: Math.round(priorityScore),
      matchedArticleId: matchedArticle?.id || null,
      matchedArticleTitle: matchedArticle?.title || null,
      matchedArticleSlug: matchedArticle?.slug || null,
      matchedArticleStatus: matchedArticle?.status || null,
      suggestedTitle,
      suggestedSlug,
      suggestedCategory: matchedArticle?.category || pillarInfo.category,
      pillarTitle: pillarInfo.pillarTitle,
      pillarUrl: pillarInfo.pillarUrl,
      actionRecommendation,
      alreadyOptimized,
      isExamQuery,
      lowImpressionsWait,
      cannibalizationPrevented,
      guardrailBadges,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

// ============================================================================
// Layer 3: Plain-English Executive Briefing Generator
// ============================================================================

export function buildPlainEnglishReport(items: AnalyzedOpportunityItem[]): PlainEnglishReport {
  const totalClicks = items.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = items.reduce((s, r) => s + r.impressions, 0);
  const averagePosition =
    items.length > 0
      ? Number((items.reduce((s, r) => s + r.position, 0) / items.length).toFixed(1))
      : 0;
  const averageCtrPercent =
    totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

  const topPerformer = items
    .filter((i) => i.bucket === 'TOP_PERFORMER')
    .sort((a, b) => b.clicks - a.clicks)[0];
  const topGap = items.filter((i) => i.bucket === 'CONTENT_GAP')[0];
  const fastestWin = items.filter(
    (i) => i.bucket === 'STRIKING_DISTANCE' && !i.alreadyOptimized
  )[0];
  const topCtrFix = items.filter(
    (i) => i.bucket === 'CTR_BOOSTER' && !i.isExamQuery && !i.lowImpressionsWait
  )[0];

  const nextThreeActions: PlainEnglishReport['nextThreeActions'] = [];

  if (topGap) {
    const newUrl = `/admin/articles/new?title=${encodeURIComponent(
      topGap.suggestedTitle
    )}&slug=${encodeURIComponent(topGap.suggestedSlug)}&keyword=${encodeURIComponent(
      topGap.query
    )}&category=${encodeURIComponent(topGap.suggestedCategory)}&pillarUrl=${encodeURIComponent(
      topGap.pillarUrl
    )}&pillarTitle=${encodeURIComponent(topGap.pillarTitle)}`;

    nextThreeActions.push({
      step: 1,
      title: `เขียนบทความใหม่ปิดช่องว่าง: "${topGap.query}"`,
      detail: `มีผู้ค้นหาเห็นแล้ว ${topGap.impressions.toLocaleString()} ครั้ง (อันดับ ${topGap.position}) แต่ยังไม่มีบทความเฉพาะรองรับ กดสร้างบทความและเชื่อมลิงก์ไปยัง ${topGap.pillarTitle}`,
      bucket: 'CONTENT_GAP',
      actionLabel: '1-Click เขียนบทความนี้ทันที',
      actionUrl: newUrl,
    });
  }

  if (fastestWin) {
    nextThreeActions.push({
      step: nextThreeActions.length + 1,
      title: `ดันขึ้น Top 5: เติม H2/FAQ คำว่า "${fastestWin.query}"`,
      detail: fastestWin.matchedArticleId
        ? `บทความ "${fastestWin.matchedArticleTitle}" ติดอันดับ ${fastestWin.position} อยู่แล้ว แค่เพิ่มหัวข้อ H2 และคำถาม FAQ คำนี้จะช่วยดันขึ้นหน้าแรกได้เร็วที่สุดโดยไม่ต้องเขียนใหม่`
        : `คำค้นหานี้ติดอันดับ ${fastestWin.position} (${fastestWin.impressions} วิว) พร้อมดันขึ้น Top 5 ทันที`,
      bucket: 'STRIKING_DISTANCE',
      actionLabel: fastestWin.matchedArticleId ? 'เปิดแก้ไขบทความเดิม' : 'เขียนบทความรองรับ',
      actionUrl: fastestWin.matchedArticleId
        ? `/admin/articles/${fastestWin.matchedArticleId}`
        : `/admin/articles/new?title=${encodeURIComponent(
            fastestWin.suggestedTitle
          )}&slug=${encodeURIComponent(fastestWin.suggestedSlug)}&keyword=${encodeURIComponent(
            fastestWin.query
          )}`,
    });
  }

  if (topCtrFix) {
    nextThreeActions.push({
      step: nextThreeActions.length + 1,
      title: `ปรับ SEO Title เพิ่มคลิก: "${topCtrFix.query}"`,
      detail: `ติดหน้าแรกอันดับ ${topCtrFix.position} (${topCtrFix.impressions} วิว) แต่ CTR เพียง ${(
        topCtrFix.ctr * 100
      ).toFixed(2)}% แนะนำปรับ SEO Title ให้น่าคลิกยิ่งขึ้น`,
      bucket: 'CTR_BOOSTER',
      actionLabel: topCtrFix.matchedArticleId ? 'ปรับ SEO Title บทความ' : 'ดูรายละเอียด',
      actionUrl: topCtrFix.matchedArticleId
        ? `/admin/articles/${topCtrFix.matchedArticleId}`
        : undefined,
    });
  }

  return {
    headline: `สรุปสุขภาพการค้นหา: มองเห็นรวม ${totalImpressions.toLocaleString()} ครั้ง • คลิกเข้าเว็บ ${totalClicks.toLocaleString()} ครั้ง (CTR เฉลี่ย ${averageCtrPercent}%)`,
    summaryParagraph: `จากข้อมูลคำค้นหาทั้งหมด ${items.length} รายการ ระบบตรวจพบขุมทรัพย์เนื้อหาใหม่ (Content Gap) ${
      items.filter((i) => i.bucket === 'CONTENT_GAP').length
    } หัวข้อ, บทความระยะประชิดอันดับ 5–20 (Striking Distance) ${
      items.filter((i) => i.bucket === 'STRIKING_DISTANCE').length
    } รายการ และหน้าติด Top 5 ที่ควรปรับพาดหัวเพิ่มคลิก (CTR Booster) ${
      items.filter((i) => i.bucket === 'CTR_BOOSTER').length
    } รายการ`,
    totalClicks,
    totalImpressions,
    averagePosition,
    averageCtrPercent,
    topPerformerHighlight: topPerformer
      ? `"${topPerformer.query}" (อันดับ ${topPerformer.position} • ${topPerformer.clicks} คลิก)`
      : 'ยังไม่มีข้อมูลคีย์เวิร์ดหลัก',
    topContentGapHighlight: topGap
      ? `"${topGap.query}" (${topGap.impressions} Impressions • ยังไม่มีบทความรองรับ)`
      : 'ครอบคลุมทุกคำค้นหาหลักแล้ว',
    fastestWinHighlight: fastestWin
      ? `"${fastestWin.query}" (อันดับ ${fastestWin.position} • ดันขึ้น Top 5 ได้ทันที)`
      : 'อัปเดตคีย์เวิร์ดครบทุกบทความแล้ว',
    nextThreeActions,
  };
}

// ============================================================================
// Layer 3 Tab 4: SEO Content Plan Basket & Auto-Sync
// ============================================================================

export async function getSyncedContentPlan(): Promise<SeoContentPlanItem[]> {
  const [setting, articles] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { key: 'seo_content_plan' } }),
    prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        focusKeyword: true,
        seoTitle: true,
      },
    }),
  ]);

  let planItems: SeoContentPlanItem[] = [];
  if (setting?.value) {
    try {
      planItems = JSON.parse(setting.value);
    } catch {
      planItems = [];
    }
  }

  let changed = false;
  const synced = planItems.map((item) => {
    const match = articles.find(
      (a) =>
        a.slug.toLowerCase() === item.suggestedSlug.toLowerCase() ||
        (a.focusKeyword && isFuzzyTopicMatch(item.keyword, a.focusKeyword)) ||
        isFuzzyTopicMatch(item.keyword, a.title)
    );

    if (match) {
      const nextStatus: SeoContentPlanItem['status'] =
        match.status === 'PUBLISHED' ? 'COMPLETED' : 'DRAFTING';
      if (
        item.status !== nextStatus ||
        item.matchedArticleId !== match.id ||
        item.matchedArticleSlug !== match.slug
      ) {
        changed = true;
        return {
          ...item,
          status: nextStatus,
          matchedArticleId: match.id,
          matchedArticleSlug: match.slug,
          updatedAt: new Date().toISOString(),
        };
      }
    }
    return item;
  });

  if (changed) {
    await prisma.systemSetting
      .upsert({
        where: { key: 'seo_content_plan' },
        update: { value: JSON.stringify(synced) },
        create: {
          key: 'seo_content_plan',
          value: JSON.stringify(synced),
          description: 'รายการแผนบทความ SEO (PLANNED / DRAFTING / COMPLETED)',
        },
      })
      .catch(() => null);
  }

  return synced;
}

// ============================================================================
// Layer 3 Tab 7: Proactive Keyword Explorer (Google Thailand Autocomplete)
// ============================================================================

export async function exploreThaiAutocompleteKeywords(
  seedTopic: string
): Promise<AutocompleteKeywordItem[]> {
  const cleanSeed = seedTopic.trim() || 'จดทะเบียนบริษัท';
  const expansionPatterns = [
    { label: 'คำค้นหาตรง', query: cleanSeed },
    { label: 'ความหมาย (คือ)', query: `${cleanSeed} คือ` },
    { label: 'การวางแผน', query: `${cleanSeed} วางแผน` },
    { label: 'สิทธิประโยชน์/ลดหย่อน', query: `${cleanSeed} ลดหย่อนภาษี` },
    { label: 'เงื่อนไข (ต้องมี)', query: `${cleanSeed} ต้องมี` },
    { label: 'เปรียบเทียบ (กับ)', query: `${cleanSeed} กับ` },
    { label: 'อัตรา/ราคา (เท่าไหร่)', query: `${cleanSeed} เท่าไหร่` },
  ];

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      contentMarkdown: true,
      focusKeyword: true,
      seoTitle: true,
      status: true,
    },
  });

  const collected = new Map<string, { keyword: string; sourcePattern: string }>();

  await Promise.all(
    expansionPatterns.map(async (pat) => {
      try {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=th&gl=th&q=${encodeURIComponent(
          pat.query
        )}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(4500),
        });
        if (!res.ok) return;
        const json = await res.json();
        const suggestions: string[] = Array.isArray(json?.[1]) ? json[1] : [];
        for (const s of suggestions) {
          const clean = String(s || '').trim();
          if (clean && !collected.has(clean.toLowerCase())) {
            collected.set(clean.toLowerCase(), {
              keyword: clean,
              sourcePattern: pat.label,
            });
          }
        }
      } catch {
        // Ignore network timeout and fallback below if empty
      }
    })
  );

  // Fallback suggestions if offline or blocked
  if (collected.size === 0) {
    const fallbacks = [
      { keyword: `${cleanSeed} ราคาเท่าไหร่`, sourcePattern: 'อัตรา/ราคา (เท่าไหร่)' },
      { keyword: `${cleanSeed} ต้องใช้เอกสารอะไรบ้าง`, sourcePattern: 'เงื่อนไข (ต้องมี)' },
      { keyword: `${cleanSeed} คืออะไร สรุปเข้าใจง่าย`, sourcePattern: 'ความหมาย (คือ)' },
      { keyword: `${cleanSeed} กับ บุคคลธรรมดา แบบไหนประหยัดภาษีกว่า`, sourcePattern: 'เปรียบเทียบ (กับ)' },
      { keyword: `${cleanSeed} วางแผนภาษีอย่างไรให้ถูกต้อง`, sourcePattern: 'การวางแผน' },
      { keyword: `${cleanSeed} ลดหย่อนภาษีอะไรได้บ้าง 2569`, sourcePattern: 'สิทธิประโยชน์/ลดหย่อน' },
    ];
    for (const fb of fallbacks) {
      collected.set(fb.keyword.toLowerCase(), fb);
    }
  }

  const results: AutocompleteKeywordItem[] = [];
  for (const { keyword, sourcePattern } of collected.values()) {
    const kwLower = keyword.toLowerCase();

    // Classify Intent
    let intent: AutocompleteKeywordItem['intent'] = 'GENERAL';
    let intentLabel = 'ข้อมูลทั่วไป (Informational)';
    if (
      kwLower.includes('ราคา') ||
      kwLower.includes('เท่าไหร่') ||
      kwLower.includes('รับทำ') ||
      kwLower.includes('สำนักงาน') ||
      kwLower.includes('จ้าง') ||
      kwLower.includes('ค่าบริการ')
    ) {
      intent = 'HIGH_INTENT';
      intentLabel = 'พร้อมใช้บริการ/เช็กราคา (High Commercial Intent)';
    } else if (kwLower.includes('กับ') || kwLower.includes('ต่างกัน') || kwLower.includes('เปรียบเทียบ') || kwLower.includes('หรือ')) {
      intent = 'COMPARISON';
      intentLabel = 'เปรียบเทียบทางเลือก (Comparison)';
    } else if (
      kwLower.includes('คือ') ||
      kwLower.includes('อย่างไร') ||
      kwLower.includes('ไหม') ||
      kwLower.includes('กี่วัน') ||
      kwLower.includes('ต้องมี') ||
      kwLower.includes('อะไรบ้าง')
    ) {
      intent = 'QUESTION_FAQ';
      intentLabel = 'คำถามเจาะลึก/เหมาะทำ FAQ (Question / AEO)';
    }

    // Check coverage against DB articles
    const primaryMatch = articles.find(
      (a) =>
        (a.focusKeyword && isFuzzyTopicMatch(keyword, a.focusKeyword)) ||
        isFuzzyTopicMatch(keyword, a.title) ||
        (a.seoTitle && isFuzzyTopicMatch(keyword, a.seoTitle))
    );

    const contentMatch = !primaryMatch
      ? articles.find(
          (a) =>
            normalizeThaiText(a.contentMarkdown).includes(kwLower) ||
            normalizeThaiText(a.summary).includes(kwLower)
        )
      : undefined;

    const coverageStatus: AutocompleteKeywordItem['coverageStatus'] = primaryMatch
      ? 'COVERED_PRIMARY'
      : contentMatch
      ? 'COVERED_IN_CONTENT'
      : 'MISSING_GAP';

    const matchedArt = primaryMatch || contentMatch;
    const pillarInfo = matchPillarServiceAndCategory(keyword);

    results.push({
      keyword,
      sourcePattern,
      intent,
      intentLabel,
      coverageStatus,
      matchedArticleId: matchedArt?.id || null,
      matchedArticleTitle: matchedArt?.title || null,
      matchedArticleSlug: matchedArt?.slug || null,
      suggestedTitle: generateSuggestedEditorialTitle(keyword),
      suggestedSlug: generateEnglishSlugFromQuery(keyword),
      suggestedCategory: pillarInfo.category,
      pillarUrl: pillarInfo.pillarUrl,
      pillarTitle: pillarInfo.pillarTitle,
    });
  }

  return results;
}

// ============================================================================
// Layer 3 Tab 8: Internal Link Matrix, Orphan Detector & 1-Click Link Inserter
// ============================================================================

export async function buildInternalLinkMatrix(): Promise<{
  matrix: ArticleLinkMatrixRow[];
  orphanCount: number;
  opportunities: InternalLinkOpportunity[];
}> {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      category: true,
      focusKeyword: true,
      seoScore: true,
      contentMarkdown: true,
    },
    orderBy: { publishedAt: 'desc' },
  });

  const inboundMap = new Map<string, Array<{ id: number; title: string; slug: string }>>();
  for (const a of articles) {
    inboundMap.set(a.slug.toLowerCase(), []);
  }

  const parsedLinksPerArticle = new Map<
    number,
    {
      outboundTo: Array<{ slug: string; anchor: string }>;
      pillarLinks: Array<{ url: string; anchor: string }>;
    }
  >();

  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const art of articles) {
    const outboundTo: Array<{ slug: string; anchor: string }> = [];
    const pillarLinks: Array<{ url: string; anchor: string }> = [];
    const matches = Array.from(art.contentMarkdown.matchAll(mdLinkRegex));

    for (const m of matches) {
      const anchor = m[1].trim();
      const rawUrl = m[2].trim();
      let pathname = rawUrl;
      try {
        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
          const parsed = new URL(rawUrl);
          const siteHost = new URL(getSiteUrl()).host.replace(/^www\./, '').toLowerCase();
          if (parsed.host.replace(/^www\./, '').toLowerCase() !== siteHost) {
            continue;
          }
          pathname = parsed.pathname;
        }
      } catch {
        continue;
      }

      if (pathname.startsWith('/knowledge/')) {
        const targetSlug = pathname.replace('/knowledge/', '').split(/[?#]/)[0].trim().toLowerCase();
        if (targetSlug && targetSlug !== art.slug.toLowerCase()) {
          outboundTo.push({ slug: targetSlug, anchor });
          const existingInbound = inboundMap.get(targetSlug) || [];
          if (!existingInbound.some((i) => i.id === art.id)) {
            existingInbound.push({ id: art.id, title: art.title, slug: art.slug });
            inboundMap.set(targetSlug, existingInbound);
          }
        }
      } else if (
        pathname.startsWith('/services') ||
        pathname.startsWith('/pricing') ||
        pathname.startsWith('/contact')
      ) {
        pillarLinks.push({ url: pathname, anchor });
      }
    }

    parsedLinksPerArticle.set(art.id, { outboundTo, pillarLinks });
  }

  const matrix: ArticleLinkMatrixRow[] = articles.map((art) => {
    const inboundFrom = inboundMap.get(art.slug.toLowerCase()) || [];
    const parsed = parsedLinksPerArticle.get(art.id) || { outboundTo: [], pillarLinks: [] };
    return {
      articleId: art.id,
      title: art.title,
      slug: art.slug,
      status: art.status,
      category: art.category,
      focusKeyword: art.focusKeyword,
      seoScore: art.seoScore,
      inboundCount: inboundFrom.length,
      inboundFrom,
      outboundBlogCount: parsed.outboundTo.length,
      outboundTo: parsed.outboundTo,
      pillarLinksCount: parsed.pillarLinks.length,
      pillarLinks: parsed.pillarLinks,
      isOrphan: inboundFrom.length === 0,
    };
  });

  // Scan for unlinked keyword mentions across articles to offer 1-Click Auto-Insert
  const opportunities: InternalLinkOpportunity[] = [];
  for (const target of articles) {
    const candidatePhrases = [
      target.focusKeyword?.trim(),
      target.category.trim(),
      ...THAI_ACCOUNTING_SYNONYM_GROUPS.find((g) =>
        g.some((syn) => normalizeThaiText(target.title).includes(syn.toLowerCase()))
      ) || [],
    ].filter((p): p is string => Boolean(p && p.length >= 3));

    for (const source of articles) {
      if (source.id === target.id) continue;
      // Skip if source already links to target
      if (source.contentMarkdown.includes(`/knowledge/${target.slug}`)) continue;

      const paragraphs = source.contentMarkdown.split(/\n\n+/);
      let foundInSource = false;

      for (const para of paragraphs) {
        if (foundInSource) break;
        const trimmedPara = para.trim();
        // Skip headings, tables, existing links, or short lines
        if (
          trimmedPara.startsWith('#') ||
          trimmedPara.startsWith('|') ||
          trimmedPara.startsWith('!') ||
          trimmedPara.length < 40
        ) {
          continue;
        }

        for (const phrase of candidatePhrases) {
          if (trimmedPara.toLowerCase().includes(phrase.toLowerCase())) {
            opportunities.push({
              sourceArticleId: source.id,
              sourceArticleTitle: source.title,
              sourceArticleSlug: source.slug,
              targetArticleId: target.id,
              targetArticleTitle: target.title,
              targetArticleSlug: target.slug,
              matchedPhrase: phrase,
              contextSnippet:
                trimmedPara.length > 140 ? `${trimmedPara.slice(0, 140)}...` : trimmedPara,
            });
            foundInSource = true;
            break;
          }
        }
      }
    }
  }

  return {
    matrix,
    orphanCount: matrix.filter((m) => m.isOrphan).length,
    opportunities: opportunities.slice(0, 25),
  };
}

/**
 * 1-Click Auto-Insert Internal Link into Source Article's Markdown
 */
export async function insertInternalLinkBetweenArticles(
  sourceArticleId: number,
  targetSlug: string,
  matchedPhrase?: string
): Promise<{ success: boolean; message: string }> {
  const [source, target] = await Promise.all([
    prisma.article.findUnique({ where: { id: sourceArticleId } }),
    prisma.article.findUnique({ where: { slug: targetSlug } }),
  ]);

  if (!source || !target) {
    return { success: false, message: 'ไม่พบบทความต้นทางหรือปลายทางในฐานข้อมูล' };
  }

  const targetUrl = `/knowledge/${target.slug}`;
  if (source.contentMarkdown.includes(targetUrl)) {
    return {
      success: true,
      message: `บทความ "${source.title}" มีลิงก์เชื่อมไปยัง "${target.title}" อยู่แล้ว`,
    };
  }

  let updatedMarkdown = source.contentMarkdown;
  const phraseToLink = (matchedPhrase || target.focusKeyword || '').trim();
  let replacedInline = false;

  if (phraseToLink && phraseToLink.length >= 3) {
    // Replace first unlinked occurrence in a regular paragraph
    const lines = updatedMarkdown.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('#') || line.trim().startsWith('|') || line.includes('](')) {
        continue;
      }
      const idx = line.toLowerCase().indexOf(phraseToLink.toLowerCase());
      if (idx !== -1) {
        const originalText = line.slice(idx, idx + phraseToLink.length);
        lines[i] = `${line.slice(0, idx)}[${originalText}](${targetUrl})${line.slice(
          idx + phraseToLink.length
        )}`;
        updatedMarkdown = lines.join('\n');
        replacedInline = true;
        break;
      }
    }
  }

  if (!replacedInline) {
    updatedMarkdown = `${updatedMarkdown.trim()}\n\n> **อ่านบทความที่เกี่ยวข้องเพิ่มเติม:** [${target.title}](${targetUrl})\n`;
  }

  await prisma.article.update({
    where: { id: source.id },
    data: {
      contentMarkdown: updatedMarkdown,
      contentUpdatedAt: new Date(),
    },
  });

  return {
    success: true,
    message: `แทรกลิงก์ภายในจาก "${source.title}" ไปยัง "${target.title}" เรียบร้อยแล้ว`,
  };
}

// ============================================================================
// Layer 7: Broken Link, Citation & Missing Cover Asset Scanner
// ============================================================================

export async function scanBrokenLinksAndAssets(): Promise<BrokenLinkIssue[]> {
  const articles = await prisma.article.findMany({
    include: { citations: true },
  });

  const validArticleSlugs = new Set(articles.map((a) => a.slug.toLowerCase()));
  const validServiceSlugs = new Set([
    'accounting-tax',
    'audit',
    'business-registration',
    'hr-payroll',
    ...SUB_SERVICES.map((s) => s.slug.toLowerCase()),
  ]);

  const issues: BrokenLinkIssue[] = [];
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const art of articles) {
    const fixActionUrl = `/admin/articles/${art.id}`;

    // 1. Check Cover Image existence & Alt Text
    if (!art.coverImage || !art.coverImage.trim()) {
      issues.push({
        articleId: art.id,
        articleTitle: art.title,
        articleSlug: art.slug,
        issueType: 'MISSING_COVER_IMAGE',
        severity: 'MEDIUM',
        targetValue: '(ไม่มีรูปหน้าปก)',
        description: 'บทความยังไม่ได้กำหนดรูปภาพหน้าปก (Cover Image) สำหรับแสดงผลและแชร์ Social OG',
        fixActionUrl,
      });
    } else if (art.coverImage.startsWith('/images/')) {
      const publicFilePath = path.join(process.cwd(), 'public', art.coverImage);
      if (!fs.existsSync(publicFilePath)) {
        issues.push({
          articleId: art.id,
          articleTitle: art.title,
          articleSlug: art.slug,
          issueType: 'MISSING_COVER_IMAGE',
          severity: 'HIGH',
          targetValue: art.coverImage,
          description: `ไม่พบไฟล์รูปหน้าปก ${art.coverImage} ในโฟลเดอร์ public/`,
          fixActionUrl,
        });
      }
    }

    if (!art.coverImageAlt || !art.coverImageAlt.trim()) {
      issues.push({
        articleId: art.id,
        articleTitle: art.title,
        articleSlug: art.slug,
        issueType: 'MISSING_COVER_ALT',
        severity: 'MEDIUM',
        targetValue: art.coverImage || '',
        description: 'รูปภาพหน้าปกยังไม่มีคำอธิบายภาพ (Image Alt Text) สำหรับ SEO & Accessibility',
        fixActionUrl,
      });
    }

    // 2. Check Internal Links in Markdown
    const matches = Array.from(art.contentMarkdown.matchAll(mdLinkRegex));
    for (const m of matches) {
      const rawUrl = m[2].trim();
      if (rawUrl.startsWith('/knowledge/')) {
        const slug = rawUrl.replace('/knowledge/', '').split(/[?#]/)[0].trim().toLowerCase();
        if (slug && !validArticleSlugs.has(slug)) {
          issues.push({
            articleId: art.id,
            articleTitle: art.title,
            articleSlug: art.slug,
            issueType: 'BROKEN_INTERNAL_LINK',
            severity: 'HIGH',
            targetValue: rawUrl,
            description: `ลิงก์ภายในชี้ไปยังบทความ "/knowledge/${slug}" ที่ไม่มีอยู่ในระบบ (เกิด 404)`,
            fixActionUrl,
          });
        }
      } else if (rawUrl.startsWith('/services/')) {
        const sSlug = rawUrl.replace('/services/', '').split(/[?#]/)[0].trim().toLowerCase();
        if (sSlug && !validServiceSlugs.has(sSlug)) {
          issues.push({
            articleId: art.id,
            articleTitle: art.title,
            articleSlug: art.slug,
            issueType: 'BROKEN_INTERNAL_LINK',
            severity: 'HIGH',
            targetValue: rawUrl,
            description: `ลิงก์ภายในชี้ไปยังหน้าบริการ "/services/${sSlug}" ที่ไม่มีอยู่จริง`,
            fixActionUrl,
          });
        }
      }
    }

    // 3. Check External Legal Citations
    for (const cit of art.citations) {
      try {
        const parsed = new URL(cit.url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new Error('Invalid protocol');
        }
      } catch {
        issues.push({
          articleId: art.id,
          articleTitle: art.title,
          articleSlug: art.slug,
          issueType: 'INVALID_CITATION_URL',
          severity: 'MEDIUM',
          targetValue: cit.url,
          description: `แหล่งอ้างอิง "${cit.title}" มีรูปแบบ URL ไม่ถูกต้อง`,
          fixActionUrl,
        });
      }
    }
  }

  return issues;
}
