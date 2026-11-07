import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/seo/site-url';
import {
  getGoogleAccessToken,
  parseServiceAccountJson,
  fetchVerifiedGscSites,
} from '@/lib/seo/gsc-intelligence';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'd9f8b4a2e5c1473682b09a71deethavorn';

export function getIndexNowKeyPath(): string {
  return `/${INDEXNOW_KEY}.txt`;
}

export function getSiteBaseUrl(): string {
  return getSiteUrl();
}

export function getHost(): string {
  try {
    const url = new URL(getSiteBaseUrl());
    return url.host;
  } catch {
    return 'www.deethavorn.com';
  }
}

export interface ChannelResult {
  channel: 'GOOGLE_INDEXING_API' | 'GSC_SITEMAP_SUBMIT' | 'INDEXNOW';
  engineLabel: string;
  success: boolean;
  status: number;
  message: string;
}

export interface IndexNowResult {
  success: boolean;
  urls: string[];
  status: number;
  message: string;
  channels?: ChannelResult[];
}

function normalizeTargetUrls(urls: string[]): string[] {
  const baseUrl = getSiteBaseUrl();
  const host = getHost();
  const normalizedUrls: string[] = [];

  for (const rawUrl of urls) {
    if (!rawUrl || typeof rawUrl !== 'string') continue;
    const trimmed = rawUrl.trim();
    if (!trimmed) continue;

    try {
      const parsedUrl =
        trimmed.startsWith('http://') || trimmed.startsWith('https://')
          ? new URL(trimmed)
          : new URL(`${baseUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`);

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        continue;
      }

      const parsedHost = parsedUrl.host.toLowerCase();
      const expectedHost = host.toLowerCase();
      const bareHost = expectedHost.replace(/^www\./, '');
      if (
        parsedHost !== expectedHost &&
        parsedHost !== bareHost &&
        parsedHost !== `www.${bareHost}`
      ) {
        continue;
      }

      if (!normalizedUrls.includes(parsedUrl.href)) {
        normalizedUrls.push(parsedUrl.href);
      }
    } catch {
      // ignore invalid URL
    }
  }

  return normalizedUrls;
}

/**
 * Channel 1: Google Web Search Indexing API (`urlNotifications:publish`)
 */
export async function callGoogleIndexingApi(
  normalizedUrls: string[],
  accessToken: string | null
): Promise<ChannelResult> {
  const engineLabel = 'Google Indexing API';
  const primaryUrl = normalizedUrls[0] || getSiteBaseUrl();

  if (!accessToken) {
    await prisma.indexingLog
      .create({
        data: {
          url: primaryUrl,
          engine: engineLabel,
          status: 'SKIPPED',
          response: 'ยังไม่ได้ตั้งค่า Google Service Account JSON (ข้ามการทำงานช่องทางที่ 1)',
        },
      })
      .catch(() => null);

    return {
      channel: 'GOOGLE_INDEXING_API',
      engineLabel,
      success: false,
      status: 0,
      message: 'ยังไม่ได้ผูก Google Service Account JSON',
    };
  }

  try {
    // Submit up to first 5 URLs in parallel to avoid quota burst on bulk
    const batch = normalizedUrls.slice(0, 5);
    const responses = await Promise.all(
      batch.map((u) =>
        fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: u, type: 'URL_UPDATED' }),
        })
      )
    );

    const firstRes = responses[0];
    const isSuccess = firstRes.status === 200;
    const bodyText = await firstRes.text().catch(() => '');

    await prisma.indexingLog
      .createMany({
        data: batch.map((u) => ({
          url: u,
          engine: engineLabel,
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          response: isSuccess
            ? `HTTP 200: URL_UPDATED notified to Googlebot`
            : `HTTP ${firstRes.status}: ${bodyText.slice(0, 200)}`,
        })),
      })
      .catch(() => null);

    return {
      channel: 'GOOGLE_INDEXING_API',
      engineLabel,
      success: isSuccess,
      status: firstRes.status,
      message: isSuccess
        ? `แจ้ง Google Indexing API สำเร็จ (${batch.length} URL)`
        : `Google Indexing API ตอบกลับ HTTP ${firstRes.status}`,
    };
  } catch (err: any) {
    return {
      channel: 'GOOGLE_INDEXING_API',
      engineLabel,
      success: false,
      status: 500,
      message: err.message || 'Google Indexing API Error',
    };
  }
}

/**
 * Channel 2: Google Search Console Sitemap Submit API
 */
export async function callGscSitemapSubmitApi(
  accessToken: string | null,
  configuredSiteUrl: string | null
): Promise<ChannelResult> {
  const engineLabel = 'GSC Sitemap Submit';
  const baseUrl = getSiteBaseUrl();
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  if (!accessToken) {
    await prisma.indexingLog
      .create({
        data: {
          url: sitemapUrl,
          engine: engineLabel,
          status: 'SKIPPED',
          response: 'ยังไม่ได้ตั้งค่า Google Service Account JSON (ข้ามการส่ง Sitemap อัตโนมัติ)',
        },
      })
      .catch(() => null);

    return {
      channel: 'GSC_SITEMAP_SUBMIT',
      engineLabel,
      success: false,
      status: 0,
      message: 'ยังไม่ได้ผูก Google Service Account JSON',
    };
  }

  try {
    let siteUrl = configuredSiteUrl;
    if (!siteUrl) {
      const discovered = await fetchVerifiedGscSites(accessToken);
      siteUrl = discovered.matchedSite;
    }

    if (!siteUrl) {
      return {
        channel: 'GSC_SITEMAP_SUBMIT',
        engineLabel,
        success: false,
        status: 404,
        message: 'ไม่พบ Property ที่ยืนยันแล้วในบัญชี GSC',
      };
    }

    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      siteUrl
    )}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const isSuccess = res.status === 200 || res.status === 204;
    const text = await res.text().catch(() => '');

    await prisma.indexingLog
      .create({
        data: {
          url: sitemapUrl,
          engine: engineLabel,
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          response: isSuccess
            ? `HTTP ${res.status}: Submitted ${sitemapUrl} to GSC (${siteUrl})`
            : `HTTP ${res.status}: ${text.slice(0, 200)}`,
        },
      })
      .catch(() => null);

    return {
      channel: 'GSC_SITEMAP_SUBMIT',
      engineLabel,
      success: isSuccess,
      status: res.status,
      message: isSuccess
        ? `อัปเดต /sitemap.xml ไปยัง Google Search Console สำเร็จ`
        : `GSC Sitemap API ตอบกลับ HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      channel: 'GSC_SITEMAP_SUBMIT',
      engineLabel,
      success: false,
      status: 500,
      message: err.message || 'GSC Sitemap Submit Error',
    };
  }
}

/**
 * Channel 3: IndexNow Protocol (Bing, ChatGPT Search, Copilot, Perplexity, DuckDuckGo)
 */
export async function callIndexNowProtocol(normalizedUrls: string[]): Promise<ChannelResult> {
  const engineLabel = 'IndexNow (Bing/ChatGPT/Perplexity)';
  const baseUrl = getSiteBaseUrl();
  const host = getHost();
  const keyLocation = `${baseUrl}${getIndexNowKeyPath()}`;

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: normalizedUrls,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const isSuccess = response.status === 200 || response.status === 202;
    const responseText = await response.text().catch(() => '');

    let statusDescription = `HTTP ${response.status}`;
    let userMessage = '';

    if (response.status === 200) {
      statusDescription = 'HTTP 200: OK (URLs submitted to IndexNow / AI Search)';
      userMessage = `ส่ง IndexNow สำเร็จ (${normalizedUrls.length} URL)`;
    } else if (response.status === 202) {
      statusDescription = 'HTTP 202: Accepted (Key valid, awaiting verification)';
      userMessage = `ส่ง IndexNow สำเร็จ (${normalizedUrls.length} URL — รอยืนยัน Key)`;
    } else if (response.status === 422) {
      statusDescription = `HTTP 422: Unprocessable Entity - ${responseText || 'Host/Key mismatch on localhost'}`;
      userMessage = `IndexNow ตอบกลับ HTTP 422 (หากรันบน Localhost ให้ทดสอบบนโดเมนจริง ${host})`;
    } else {
      statusDescription = `HTTP ${response.status}: ${responseText || response.statusText || 'Error'}`;
      userMessage = `IndexNow ตอบกลับ HTTP ${response.status}`;
    }

    await prisma.indexingLog
      .createMany({
        data: normalizedUrls.map((url) => ({
          url,
          engine: engineLabel,
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          response: statusDescription,
        })),
      })
      .catch(() => null);

    return {
      channel: 'INDEXNOW',
      engineLabel,
      success: isSuccess,
      status: response.status,
      message: userMessage,
    };
  } catch (error: any) {
    await prisma.indexingLog
      .createMany({
        data: normalizedUrls.map((url) => ({
          url,
          engine: engineLabel,
          status: 'FAILED',
          response: error.message || 'Network error connecting to api.indexnow.org',
        })),
      })
      .catch(() => null);

    return {
      channel: 'INDEXNOW',
      engineLabel,
      success: false,
      status: 500,
      message: error.message || 'IndexNow connection error',
    };
  }
}

/**
 * Layer 4 Multi-Channel Instant Indexing Dispatcher (`Promise.all` across all 3 channels):
 * 1) Google Web Search Indexing API
 * 2) Google Search Console Sitemap Submit API
 * 3) IndexNow Protocol (Bing / ChatGPT / Perplexity)
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const host = getHost();
  const normalizedUrls = normalizeTargetUrls(urls);

  if (normalizedUrls.length === 0) {
    return {
      success: false,
      urls: [],
      status: 400,
      message: `ไม่พบ URL ที่ถูกต้องและตรงกับโดเมน ${host} สำหรับส่งคำขอ Instant Indexing`,
    };
  }

  // Load Google Service Account credentials if configured in SystemSetting or env
  let accessToken: string | null = null;
  let configuredSiteUrl: string | null = null;

  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['gsc_service_account_json', 'gsc_site_url'] } },
    });
    const saRaw =
      settings.find((s) => s.key === 'gsc_service_account_json')?.value ||
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
      '';
    configuredSiteUrl =
      settings.find((s) => s.key === 'gsc_site_url')?.value ||
      process.env.GSC_SITE_URL ||
      null;

    const creds = parseServiceAccountJson(saRaw);
    if (creds) {
      accessToken = await getGoogleAccessToken(creds).catch(() => null);
    }
  } catch {
    accessToken = null;
  }

  // Fire all 3 channels simultaneously (`Promise.all`)
  const [googleRes, sitemapRes, indexNowRes] = await Promise.all([
    callGoogleIndexingApi(normalizedUrls, accessToken),
    callGscSitemapSubmitApi(accessToken, configuredSiteUrl),
    callIndexNowProtocol(normalizedUrls),
  ]);

  const channels = [googleRes, sitemapRes, indexNowRes];
  const anySuccess = channels.some((c) => c.success);

  const summaryParts = channels.map(
    (c) => `${c.engineLabel}: ${c.success ? 'สำเร็จ' : c.status === 0 ? 'ข้าม (ยังไม่ผูก Key)' : `HTTP ${c.status}`}`
  );

  return {
    success: anySuccess || indexNowRes.status === 422,
    urls: normalizedUrls,
    status: indexNowRes.status,
    message: `ส่งสัญญาณ Multi-Channel Indexing (${normalizedUrls.length} URL) — ${summaryParts.join(' | ')}`,
    channels,
  };
}
