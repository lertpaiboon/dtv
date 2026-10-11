import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/seo/site-url';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'd9f8b4a2e5c1473682b09a71deethavorn';

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

export interface IndexNowResult {
  success: boolean;
  urls: string[];
  status: number;
  message: string;
}

/**
 * Submits a list of canonical URLs to the IndexNow API (Bing, Yandex, Seznam, Naver)
 * and records the event in the indexing_logs table.
 *
 * Rules:
 * 1. keyLocation is hosted at root (/${INDEXNOW_KEY}.txt) to cover the entire domain scope.
 * 2. Only HTTP 200 and 202 are considered SUCCESS.
 * 3. All URLs must belong to the canonical host.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const baseUrl = getSiteBaseUrl();
  const host = getHost();
  // Key file placed at root covers all URLs across the entire site
  const keyLocation = `${baseUrl}/${INDEXNOW_KEY}.txt`;

  // Normalize and validate URLs
  const normalizedUrls: string[] = [];
  for (const rawUrl of urls) {
    if (!rawUrl || typeof rawUrl !== 'string') continue;
    const trimmed = rawUrl.trim();
    if (!trimmed) continue;

    let parsedUrl: URL;
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        parsedUrl = new URL(trimmed);
      } else {
        const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        parsedUrl = new URL(`${baseUrl}${cleanPath}`);
      }

      // Check protocol
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        continue;
      }

      // Verify host belongs to canonical domain or non-www variant
      const parsedHost = parsedUrl.host.toLowerCase();
      const expectedHost = host.toLowerCase();
      const bareHost = expectedHost.replace(/^www\./, '');
      if (parsedHost !== expectedHost && parsedHost !== bareHost && parsedHost !== `www.${bareHost}`) {
        console.warn(`[IndexNow] Skipped URL from different host: ${parsedUrl.href} (expected ${expectedHost})`);
        continue;
      }

      normalizedUrls.push(parsedUrl.href);
    } catch {
      console.warn(`[IndexNow] Invalid URL ignored: ${trimmed}`);
    }
  }

  if (normalizedUrls.length === 0) {
    return {
      success: false,
      urls: [],
      status: 400,
      message: `ไม่พบ URL ที่ถูกต้องและตรงกับโดเมน ${host} สำหรับส่งคำขอ IndexNow`,
    };
  }

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: normalizedUrls,
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    // Strictly treat only 200 (OK) and 202 (Accepted) as SUCCESS
    const isSuccess = response.status === 200 || response.status === 202;
    const responseText = await response.text().catch(() => '');

    let statusDescription = `HTTP ${response.status}`;
    let userMessage = '';

    if (response.status === 200) {
      statusDescription = 'HTTP 200: OK (URLs submitted successfully)';
      userMessage = `ส่งคำขอ IndexNow สำเร็จ (${normalizedUrls.length} รายการ) — Search Engine ยืนยันรับดัชนีเรียบร้อยแล้ว`;
    } else if (response.status === 202) {
      statusDescription = 'HTTP 202: Accepted (Key valid, awaiting verification)';
      userMessage = `ส่งคำขอ IndexNow สำเร็จ (${normalizedUrls.length} รายการ) — รอ Search Engine ตรวจสอบความถูกต้องของ Key`;
    } else if (response.status === 400) {
      statusDescription = `HTTP 400: Bad Request - ${responseText || 'Invalid format'}`;
      userMessage = 'รูปแบบข้อมูลที่ส่งไปยัง IndexNow ไม่ถูกต้อง (HTTP 400)';
    } else if (response.status === 403) {
      statusDescription = `HTTP 403: Forbidden - ${responseText || 'Key invalid or not found at keyLocation'}`;
      userMessage = `Search Engine ตรวจไม่พบคีย์ยืนยันตัวตนที่ ${keyLocation} (HTTP 403)`;
    } else if (response.status === 422) {
      statusDescription = `HTTP 422: Unprocessable Entity - ${responseText || 'URL not on host or key mismatch'}`;
      userMessage =
        'IndexNow ปฏิเสธคำขอ (HTTP 422: URLs ไม่ตรงกับ Host หรือ Search Engine ไม่สามารถเข้าถึง Key Location บนโดเมนจริงได้ — หากอยู่บน Localhost ให้รอทดสอบบน Production)';
    } else if (response.status === 429) {
      statusDescription = `HTTP 429: Too Many Requests - ${responseText || 'Rate limited'}`;
      userMessage = 'ส่งคำขอ IndexNow ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ (HTTP 429)';
    } else {
      statusDescription = `HTTP ${response.status}: ${responseText || response.statusText || 'Error'}`;
      userMessage = `IndexNow ตอบกลับสถานะ ${response.status}: ${responseText || 'เกิดข้อผิดพลาด'}`;
    }

    // Record logs in database
    for (const url of normalizedUrls) {
      await prisma.indexingLog
        .create({
          data: {
            url,
            engine: 'IndexNow (Bing/Yandex)',
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            response: statusDescription,
          },
        })
        .catch((e) => console.error('Failed to log indexing result:', e));
    }

    return {
      success: isSuccess,
      urls: normalizedUrls,
      status: response.status,
      message: userMessage,
    };
  } catch (error: any) {
    console.error('IndexNow submission error:', error);
    for (const url of normalizedUrls) {
      await prisma.indexingLog
        .create({
          data: {
            url,
            engine: 'IndexNow (Bing/Yandex)',
            status: 'FAILED',
            response: error.message || 'Network error connecting to api.indexnow.org',
          },
        })
        .catch(() => null);
    }

    return {
      success: false,
      urls: normalizedUrls,
      status: 500,
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ IndexNow API',
    };
  }
}
