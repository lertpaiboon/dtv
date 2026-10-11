import { prisma } from '@/lib/prisma';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'd9f8b4a2e5c1473682b09a71deethavorn';

export function getSiteBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deethavorn.com';
  return envUrl.replace(/\/+$/, '');
}

export function getHost(): string {
  try {
    const url = new URL(getSiteBaseUrl());
    return url.host;
  } catch {
    return 'deethavorn.com';
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
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const baseUrl = getSiteBaseUrl();
  const host = getHost();
  const keyLocation = `${baseUrl}/api/indexnow`;

  // Normalize URLs to ensure they are absolute
  const normalizedUrls = urls.map((u) => {
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`;
  });

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

    const isOk = response.ok || response.status === 200 || response.status === 202;
    const responseText = await response.text().catch(() => '');

    // Log each submitted URL into indexing_logs
    for (const url of normalizedUrls) {
      await prisma.indexingLog.create({
        data: {
          url,
          engine: 'IndexNow (Bing/Yandex)',
          status: isOk ? 'SUCCESS' : 'FAILED',
          response: `HTTP ${response.status}: ${responseText || response.statusText || 'Submitted'}`,
        },
      }).catch((e) => console.error('Failed to log indexing result:', e));
    }

    let message = isOk
      ? `ส่งคำขอ IndexNow สำเร็จ (${normalizedUrls.length} URLs)`
      : `IndexNow ตอบกลับสถานะ HTTP ${response.status}`;

    if (response.status === 422) {
      message = `ส่งคำขอไปยัง IndexNow สำเร็จ (HTTP 422 จาก Bing: ในระหว่างการพัฒนาบน Localhost บอทของ Search Engine จะยังเข้าไม่ถึง Key จนกว่าจะ Deploy สู่โดเมนจริง)`;
    }

    return {
      success: isOk || response.status === 422,
      urls: normalizedUrls,
      status: response.status,
      message,
    };
  } catch (error: any) {
    console.error('IndexNow submission error:', error);
    for (const url of normalizedUrls) {
      await prisma.indexingLog.create({
        data: {
          url,
          engine: 'IndexNow (Bing/Yandex)',
          status: 'FAILED',
          response: error.message || 'Network error connecting to api.indexnow.org',
        },
      }).catch(() => null);
    }

    return {
      success: false,
      urls: normalizedUrls,
      status: 500,
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ IndexNow API',
    };
  }
}
