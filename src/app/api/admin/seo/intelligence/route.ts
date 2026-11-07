import { NextResponse } from 'next/server';
import { getAdminSession, hasPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GscDataSourceTier,
  GscQueryRow,
  SeoContentPlanItem,
  parseServiceAccountJson,
  getGoogleAccessToken,
  fetchVerifiedGscSites,
  fetchGscSearchAnalytics,
  getDemoSimulationRows,
  analyzeRowsAgainstPosts,
  buildPlainEnglishReport,
  getSyncedContentPlan,
  exploreThaiAutocompleteKeywords,
  buildInternalLinkMatrix,
  insertInternalLinkBetweenArticles,
  scanBrokenLinksAndAssets,
  generateSuggestedEditorialTitle,
  generateEnglishSlugFromQuery,
  matchPillarServiceAndCategory,
} from '@/lib/seo/gsc-intelligence';
import { getSiteUrl } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

function parseGscCsvContent(csvText: string): GscQueryRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const siteUrl = getSiteUrl();
  const rows: GscQueryRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple quote-aware CSV splitter
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());

    const query = (cols[0] || '').trim();
    if (!query) continue;

    // Detect if col[1] is a URL/page or numeric clicks
    const hasPageCol = cols[1]?.startsWith('http') || cols[1]?.startsWith('/');
    const page = hasPageCol ? cols[1] : `${siteUrl}/`;
    const offset = hasPageCol ? 1 : 0;

    const clicks = parseInt((cols[1 + offset] || '0').replace(/,/g, ''), 10) || 0;
    const impressions = parseInt((cols[2 + offset] || '0').replace(/,/g, ''), 10) || 0;
    const rawCtr = (cols[3 + offset] || '0').replace('%', '').trim();
    const ctrVal = parseFloat(rawCtr) || 0;
    const ctr = rawCtr.includes('%') || ctrVal > 1 ? Number((ctrVal / 100).toFixed(4)) : ctrVal;
    const position = Number((parseFloat(cols[4 + offset] || '10') || 10).toFixed(1));

    rows.push({
      query,
      page,
      clicks,
      impressions,
      ctr,
      position,
      previousPosition: null,
      positionDelta: null,
      deltaStatus: 'NEW',
    });
  }

  return rows;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session, 'article:view') && !hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [settings, articles, contentPlan, linkMatrix, brokenLinks] = await Promise.all([
      prisma.systemSetting.findMany({
        where: {
          key: {
            in: ['gsc_service_account_json', 'gsc_site_url', 'gsc_cached_rows'],
          },
        },
      }),
      prisma.article.findMany({
        include: {
          faqs: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      getSyncedContentPlan(),
      buildInternalLinkMatrix(),
      scanBrokenLinksAndAssets(),
    ]);

    const saRaw = settings.find((s) => s.key === 'gsc_service_account_json')?.value || '';
    const siteUrlSetting = settings.find((s) => s.key === 'gsc_site_url')?.value || '';
    const cachedRaw = settings.find((s) => s.key === 'gsc_cached_rows')?.value || '';

    const creds = parseServiceAccountJson(saRaw);

    let dataSourceTier: GscDataSourceTier = 'DEMO_SIMULATION';
    let lastSyncedAt: string | null = null;
    let gscRows: GscQueryRow[] = [];

    if (cachedRaw) {
      try {
        const parsedCache = JSON.parse(cachedRaw);
        if (Array.isArray(parsedCache.rows) && parsedCache.rows.length > 0) {
          gscRows = parsedCache.rows;
          dataSourceTier = parsedCache.tier || (creds ? 'CACHED_SYNC' : 'CSV_IMPORT');
          lastSyncedAt = parsedCache.syncedAt || null;
        }
      } catch {
        // Fallback to demo below
      }
    }

    if (gscRows.length === 0) {
      gscRows = getDemoSimulationRows();
      dataSourceTier = 'DEMO_SIMULATION';
    }

    const opportunities = analyzeRowsAgainstPosts(gscRows, articles);
    const plainEnglishReport = buildPlainEnglishReport(opportunities);

    return NextResponse.json({
      success: true,
      data: {
        connection: {
          tier: dataSourceTier,
          hasServiceAccount: Boolean(creds),
          clientEmail: creds?.client_email || null,
          projectId: creds?.project_id || null,
          siteUrl: siteUrlSetting || getSiteUrl(),
          lastSyncedAt,
          totalQueriesCount: gscRows.length,
        },
        plainEnglishReport,
        opportunities,
        buckets: {
          CONTENT_GAP: opportunities.filter((o) => o.bucket === 'CONTENT_GAP'),
          STRIKING_DISTANCE: opportunities.filter((o) => o.bucket === 'STRIKING_DISTANCE'),
          CTR_BOOSTER: opportunities.filter((o) => o.bucket === 'CTR_BOOSTER'),
          TOP_PERFORMER: opportunities.filter((o) => o.bucket === 'TOP_PERFORMER'),
        },
        contentPlan,
        linkMatrix,
        brokenLinks,
      },
    });
  } catch (error: any) {
    console.error('Error loading SEO Intelligence:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session, 'article:edit') && !hasPermission(session, '*')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Save GSC Service Account & Sync Live
    if (action === 'save_gsc_config') {
      const { serviceAccountJson, siteUrl } = body;
      const creds = parseServiceAccountJson(serviceAccountJson || '');
      if (!creds) {
        return NextResponse.json(
          {
            success: false,
            error: 'รูปแบบ JSON ของ Google Service Account ไม่ถูกต้อง (ต้องมี client_email และ private_key)',
          },
          { status: 400 }
        );
      }

      await prisma.systemSetting.upsert({
        where: { key: 'gsc_service_account_json' },
        update: { value: serviceAccountJson.trim() },
        create: {
          key: 'gsc_service_account_json',
          value: serviceAccountJson.trim(),
          description: 'Google Cloud Service Account JSON for GSC & Indexing API',
        },
      });

      const accessToken = await getGoogleAccessToken(creds);
      const discovery = await fetchVerifiedGscSites(accessToken, creds.project_id);

      if (discovery.serviceDisabledUrl) {
        return NextResponse.json(
          {
            success: false,
            error: discovery.error,
            serviceDisabledUrl: discovery.serviceDisabledUrl,
          },
          { status: 400 }
        );
      }

      const finalSiteUrl = (siteUrl || '').trim() || discovery.matchedSite || getSiteUrl();
      await prisma.systemSetting.upsert({
        where: { key: 'gsc_site_url' },
        update: { value: finalSiteUrl },
        create: {
          key: 'gsc_site_url',
          value: finalSiteUrl,
          description: 'Verified GSC Property URL',
        },
      });

      const liveRows = await fetchGscSearchAnalytics(accessToken, finalSiteUrl);
      await prisma.systemSetting.upsert({
        where: { key: 'gsc_cached_rows' },
        update: {
          value: JSON.stringify({
            tier: 'LIVE_API',
            syncedAt: new Date().toISOString(),
            rows: liveRows,
          }),
        },
        create: {
          key: 'gsc_cached_rows',
          value: JSON.stringify({
            tier: 'LIVE_API',
            syncedAt: new Date().toISOString(),
            rows: liveRows,
          }),
          description: 'Cached GSC Search Analytics Rows',
        },
      });

      return NextResponse.json({
        success: true,
        message: `เชื่อมต่อ Google Search Console (${finalSiteUrl}) และซิงค์ข้อมูลสำเร็จ (${liveRows.length} คำค้นหา)`,
      });
    }

    // 2. Sync Live GSC Data using existing credentials
    if (action === 'sync_live_gsc') {
      const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['gsc_service_account_json', 'gsc_site_url'] } },
      });
      const saRaw = settings.find((s) => s.key === 'gsc_service_account_json')?.value || '';
      const siteUrl = settings.find((s) => s.key === 'gsc_site_url')?.value || '';
      const creds = parseServiceAccountJson(saRaw);

      if (!creds) {
        return NextResponse.json(
          { success: false, error: 'กรุณาตั้งค่า Google Service Account JSON ก่อนซิงค์ข้อมูลสด' },
          { status: 400 }
        );
      }

      const accessToken = await getGoogleAccessToken(creds);
      const discovery = await fetchVerifiedGscSites(accessToken, creds.project_id);
      if (discovery.serviceDisabledUrl) {
        return NextResponse.json(
          {
            success: false,
            error: discovery.error,
            serviceDisabledUrl: discovery.serviceDisabledUrl,
          },
          { status: 400 }
        );
      }

      const targetSite = siteUrl || discovery.matchedSite || getSiteUrl();
      const liveRows = await fetchGscSearchAnalytics(accessToken, targetSite);

      await prisma.systemSetting.upsert({
        where: { key: 'gsc_cached_rows' },
        update: {
          value: JSON.stringify({
            tier: 'LIVE_API',
            syncedAt: new Date().toISOString(),
            rows: liveRows,
          }),
        },
        create: {
          key: 'gsc_cached_rows',
          value: JSON.stringify({
            tier: 'LIVE_API',
            syncedAt: new Date().toISOString(),
            rows: liveRows,
          }),
          description: 'Cached GSC Search Analytics Rows',
        },
      });

      return NextResponse.json({
        success: true,
        message: `ซิงค์ข้อมูลสดจาก GSC สำเร็จ (${liveRows.length} คำค้นหา)`,
      });
    }

    // 3. Import GSC CSV
    if (action === 'import_csv') {
      const { csvContent } = body;
      const rows = parseGscCsvContent(String(csvContent || ''));
      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบข้อมูลคำค้นหาในไฟล์ CSV กรุณาตรวจสอบรูปแบบไฟล์' },
          { status: 400 }
        );
      }

      await prisma.systemSetting.upsert({
        where: { key: 'gsc_cached_rows' },
        update: {
          value: JSON.stringify({
            tier: 'CSV_IMPORT',
            syncedAt: new Date().toISOString(),
            rows,
          }),
        },
        create: {
          key: 'gsc_cached_rows',
          value: JSON.stringify({
            tier: 'CSV_IMPORT',
            syncedAt: new Date().toISOString(),
            rows,
          }),
          description: 'Imported GSC CSV Rows',
        },
      });

      return NextResponse.json({
        success: true,
        message: `นำเข้าข้อมูล CSV สำเร็จ (${rows.length} คำค้นหา)`,
      });
    }

    // 4. Reset to Demo Simulation
    if (action === 'reset_to_demo') {
      await prisma.systemSetting.deleteMany({
        where: { key: 'gsc_cached_rows' },
      });
      return NextResponse.json({
        success: true,
        message: 'สลับกลับสู่โหมดข้อมูลจำลองเสมือนจริง (Demo Simulation) เรียบร้อยแล้ว',
      });
    }

    // 5. Add Keyword to Content Plan Basket
    if (action === 'add_to_plan') {
      const kw = String(body.keyword || '').trim();
      if (!kw) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุคีย์เวิร์ด' }, { status: 400 });
      }

      const currentPlan = await getSyncedContentPlan();
      if (currentPlan.some((p) => p.keyword.toLowerCase() === kw.toLowerCase())) {
        return NextResponse.json({
          success: true,
          data: currentPlan,
          message: `มี "${kw}" อยู่ในแผนบทความแล้ว`,
        });
      }

      const pillarInfo = matchPillarServiceAndCategory(kw);
      const newItem: SeoContentPlanItem = {
        id: `plan-${Date.now()}`,
        keyword: kw,
        suggestedTitle: body.suggestedTitle || generateSuggestedEditorialTitle(kw),
        suggestedSlug: body.suggestedSlug || generateEnglishSlugFromQuery(kw),
        category: body.category || pillarInfo.category,
        pillarUrl: body.pillarUrl || pillarInfo.pillarUrl,
        pillarTitle: body.pillarTitle || pillarInfo.pillarTitle,
        status: 'PLANNED',
        impressions: Number(body.impressions) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPlan = [newItem, ...currentPlan];
      await prisma.systemSetting.upsert({
        where: { key: 'seo_content_plan' },
        update: { value: JSON.stringify(updatedPlan) },
        create: {
          key: 'seo_content_plan',
          value: JSON.stringify(updatedPlan),
          description: 'รายการแผนบทความ SEO (PLANNED / DRAFTING / COMPLETED)',
        },
      });

      const resynced = await getSyncedContentPlan();
      return NextResponse.json({
        success: true,
        data: resynced,
        message: `เพิ่ม "${kw}" ลงในตะกร้าแผนบทความ SEO เรียบร้อยแล้ว`,
      });
    }

    // 6. Delete Content Plan Item
    if (action === 'delete_plan_item') {
      const { id } = body;
      const currentPlan = await getSyncedContentPlan();
      const updated = currentPlan.filter((item) => item.id !== id);
      await prisma.systemSetting.upsert({
        where: { key: 'seo_content_plan' },
        update: { value: JSON.stringify(updated) },
        create: {
          key: 'seo_content_plan',
          value: JSON.stringify(updated),
          description: 'รายการแผนบทความ SEO',
        },
      });
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'ลบรายการออกจากแผนบทความแล้ว',
      });
    }

    // 7. Proactive Keyword Explorer (Google Thailand Autocomplete)
    if (action === 'explore_keywords') {
      const seed = String(body.seed || 'จดทะเบียนบริษัท').trim();
      const results = await exploreThaiAutocompleteKeywords(seed);
      return NextResponse.json({
        success: true,
        data: results,
        message: `ค้นพบคีย์เวิร์ด Autocomplete ${results.length} รายการสำหรับ "${seed}"`,
      });
    }

    // 8. 1-Click Auto-Insert Internal Link Between Articles
    if (action === 'insert_internal_link') {
      const { sourceArticleId, targetSlug, matchedPhrase } = body;
      const result = await insertInternalLinkBetweenArticles(
        Number(sourceArticleId),
        String(targetSlug || ''),
        matchedPhrase ? String(matchedPhrase) : undefined
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.message }, { status: 400 });
      }
      const updatedMatrix = await buildInternalLinkMatrix();
      return NextResponse.json({
        success: true,
        data: updatedMatrix,
        message: result.message,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('SEO Intelligence POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
