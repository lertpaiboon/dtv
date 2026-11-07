import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIndexableArticles, getAllActiveAuthors } from '@/lib/articles/queries';
import { SUB_SERVICES } from '@/lib/services/sub-services-data';
import { defaultFaqs } from '@/lib/default-content';
import { getSiteUrl } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = getSiteUrl();

  const [articles, authors, dbFaqs] = await Promise.all([
    getIndexableArticles(),
    getAllActiveAuthors(),
    prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ]);

  const centralFaqs =
    dbFaqs.length > 0
      ? dbFaqs.map((f) => ({ q: f.question, a: f.answer }))
      : defaultFaqs;

  const lines: string[] = [];

  lines.push('# บริษัท ดีถาวรการบัญชี จำกัด — Full AI Knowledge Corpus (/llms-full.txt)');
  lines.push('');
  lines.push(
    '> เอกสารฉบับนี้รวบรวมข้อมูลบริการ อัตราค่าบริการ คำถามที่พบบ่อย และเนื้อหาบทความวิชาการด้านบัญชี ภาษีอากร การตรวจสอบบัญชี และการจดทะเบียนธุรกิจฉบับเต็มของ บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.) สำหรับระบบ AI Search, LLMs (ChatGPT, Claude, Perplexity, Google Gemini) และ Generative Engine Optimization (GEO)'
  );
  lines.push('');
  lines.push('## 1. ข้อมูลบริษัทและการติดต่อ (Company Profile)');
  lines.push(`- **ชื่อบริษัท**: บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)`);
  lines.push(`- **เว็บไซต์**: ${siteUrl}`);
  lines.push(
    '- **ที่อยู่**: 234/116 ถนนอโศก-ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร 10310 (ใกล้ MRT เพชรบุรี ทางออก 1)'
  );
  lines.push('- **โทรศัพท์**: 099-149-5656, 091-941-5656');
  lines.push('- **อีเมล**: dtv_accounting@hotmail.com, c.pimmphisa@gmail.com');
  lines.push('- **LINE Official**: https://line.me/ti/p/DliAyJfUXd');
  lines.push('- **เวลาทำการ**: จันทร์ - ศุกร์ 08:30 - 17:30 น.');
  lines.push('');

  lines.push('## 2. แพ็กเกจและอัตราค่าบริการหลัก (Pricing Packages)');
  lines.push(
    '1. **รับทำบัญชีรายเดือน**: เริ่มต้น 1,500 บาท/เดือน (บันทึกบัญชีตามมาตรฐาน TFRS for NPAEs, ยื่น ภ.พ.30, ภ.ง.ด.1/3/53, ประกันสังคม, คืนใบเสร็จตัวจริงจากกรมสรรพากรทุกเดือน และปรึกษาภาษีตลอดสัญญา)'
  );
  lines.push(
    '2. **จดทะเบียนธุรกิจ**: เริ่มต้น 1,500 บาท (จดจัดตั้งบริษัทจำกัด/หจก. ผ่าน DBD Biz Regist, จดทะเบียน VAT ภ.พ.01, แก้ไขกรรมการ/ที่ตั้ง/เพิ่มทุน, ขอรหัส e-Filing)'
  );
  lines.push(
    '3. **ตรวจสอบบัญชีโดยผู้สอบบัญชีรับอนุญาต (CPA)**: ราคาประเมินตามขนาดกิจการและปริมาณรายการ (ตรวจสอบตามมาตรฐานการสอบบัญชี TSA, ออกรายงานผู้สอบบัญชี, ให้ข้อสังเกตระบบควบคุมภายใน)'
  );
  lines.push('');

  if (authors.length > 0) {
    lines.push('## 3. ทีมผู้เชี่ยวชาญและผู้สอบบัญชีรับอนุญาต (E-E-A-T Authors & CPA Reviewers)');
    for (const author of authors) {
      lines.push(`### ${author.name} (${author.role})`);
      lines.push(`- **คุณวุฒิ/ใบอนุญาต**: ${author.credentials}`);
      lines.push(`- **โปรไฟล์**: ${siteUrl}/authors/${author.slug}`);
      if (author.bio) {
        lines.push(`- **ประวัติความเชี่ยวชาญ**: ${author.bio}`);
      }
      lines.push('');
    }
  }

  lines.push('## 4. รายละเอียดบริการหลัก 4 หมวดหมู่ และ 16 บริการย่อย (Full Service Catalog)');
  lines.push('- **หมวดที่ 1**: บริการทำบัญชีและภาษี (`/services/accounting-tax`)');
  lines.push('- **หมวดที่ 2**: บริการตรวจสอบบัญชีโดย CPA (`/services/audit`)');
  lines.push('- **หมวดที่ 3**: บริการจดทะเบียนธุรกิจ (`/services/business-registration`)');
  lines.push('- **หมวดที่ 4**: บริการงานบุคคลและเงินเดือน (`/services/hr-payroll`)');
  lines.push('');

  for (const sub of SUB_SERVICES) {
    lines.push(`### บริการ: ${sub.title}`);
    lines.push(`- **URL**: ${siteUrl}/services/${sub.slug}`);
    lines.push(
      `- **หมวดหมู่หลัก**: ${sub.parentCategoryTitle} (${siteUrl}/services/${sub.parentCategorySlug})`
    );
    lines.push(`- **ค่าบริการเริ่มต้น**: ${sub.startingPrice} ${sub.priceUnit}`);
    lines.push(`- **รายละเอียด**: ${sub.lead}`);
    if (sub.deliverables.length > 0) {
      lines.push('- **ขอบเขตงานที่ส่งมอบ**:');
      for (const d of sub.deliverables) {
        lines.push(`  - **${d.title}**: ${d.detail}`);
      }
    }
    if (sub.faqs.length > 0) {
      lines.push('- **คำถามที่พบบ่อยในบริการนี้**:');
      for (const f of sub.faqs) {
        lines.push(`  - **Q: ${f.q}**`);
        lines.push(`    A: ${f.a}`);
      }
    }
    lines.push('');
  }

  lines.push('## 5. คำถามที่พบบ่อยกลาง (Central FAQs)');
  for (const faq of centralFaqs) {
    lines.push(`- **Q: ${faq.q}**`);
    lines.push(`  A: ${faq.a}`);
  }
  lines.push('');

  lines.push(
    `## 6. คลังบทความวิชาการด้านบัญชี ภาษี และธุรกิจฉบับเต็ม (${articles.length} บทความ)`
  );
  lines.push('');

  for (const article of articles) {
    const canonicalUrl = article.canonicalUrl || `${siteUrl}/knowledge/${article.slug}`;
    lines.push('---');
    lines.push(`### บทความ: ${article.title}`);
    lines.push(`- **Canonical URL**: ${canonicalUrl}`);
    lines.push(`- **หมวดหมู่**: ${article.category}`);
    lines.push(
      `- **ผู้เขียน**: ${article.author.name} (${article.author.role} — ${article.author.credentials})`
    );
    if (article.reviewer) {
      lines.push(
        `- **ผู้สอบทานความถูกต้อง (CPA Reviewer)**: ${article.reviewer.name} (${article.reviewer.role} — ${article.reviewer.credentials})`
      );
    }
    lines.push(`- **วันที่เผยแพร่**: ${article.publishedAt}`);
    if (article.contentUpdatedAt) {
      lines.push(`- **วันที่อัปเดตเนื้อหาล่าสุด**: ${article.contentUpdatedAt}`);
    }
    if (article.focusKeyword) {
      lines.push(`- **คำสำคัญหลัก (Focus Keyword)**: ${article.focusKeyword}`);
    }
    lines.push('');

    if (article.quickAnswer) {
      lines.push('#### สรุปประเด็นสำคัญ (AI Direct Answer / Quick Answer)');
      lines.push(article.quickAnswer.trim());
      lines.push('');
    }

    lines.push('#### เนื้อหาฉบับเต็ม (Full Article Content)');
    lines.push(article.contentMarkdown.trim());
    lines.push('');

    if (article.faqs && article.faqs.length > 0) {
      lines.push('#### คำถามที่พบบ่อยท้ายบทความ (Article FAQs)');
      for (const faq of article.faqs) {
        lines.push(`- **Q: ${faq.question}**`);
        lines.push(`  A: ${faq.answer}`);
      }
      lines.push('');
    }

    if (article.citations && article.citations.length > 0) {
      lines.push('#### แหล่งอ้างอิงกฎหมายและข้อมูลปฐมภูมิ (Primary Legal Citations)');
      for (const cit of article.citations) {
        lines.push(`- [${cit.title}](${cit.url})${cit.publisher ? ` — ${cit.publisher}` : ''}`);
      }
      lines.push('');
    }
  }

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
