import { NextResponse } from 'next/server';
import { getIndexableArticles, getAllActiveAuthors } from '@/lib/articles/queries';
import { SUB_SERVICES } from '@/lib/services/sub-services-data';
import { getSiteUrl } from '@/lib/seo/site-url';

export const dynamic = 'force-dynamic';

const CORE_PILLARS = [
  {
    slug: 'accounting-tax',
    title: 'บริการทำบัญชีและภาษีครบวงจร (Accounting & Tax)',
    url: '/services/accounting-tax',
    description:
      'รับทำบัญชีรายเดือนตามมาตรฐาน TFRS for NPAEs ยื่นภาษี ภ.พ.30 ภ.ง.ด.1/3/53/50/51 ปิดงบการเงินประจำปี และวางแผนภาษี เริ่มต้น 1,500 บาท/เดือน',
  },
  {
    slug: 'audit',
    title: 'บริการตรวจสอบบัญชีและรับรองงบการเงิน (CPA Audit)',
    url: '/services/audit',
    description:
      'ตรวจสอบและรับรองงบการเงินประจำปีโดยผู้สอบบัญชีรับอนุญาต (CPA) ตามมาตรฐานการสอบบัญชี TSA สำหรับบริษัทจำกัดและห้างหุ้นส่วนจำกัด',
  },
  {
    slug: 'business-registration',
    title: 'บริการจดทะเบียนธุรกิจและนิติบุคคล (Business Registration)',
    url: '/services/business-registration',
    description:
      'รับจดทะเบียนจัดตั้งบริษัทจำกัด หจก. ผ่านระบบ DBD Biz Regist จดทะเบียนภาษีมูลค่าเพิ่ม (VAT ภ.พ.01/ภ.พ.20) แก้ไขข้อมูลนิติบุคคล และจดเครื่องหมายการค้า เริ่มต้น 1,500 บาท',
  },
  {
    slug: 'hr-payroll',
    title: 'บริการงานบุคคล เงินเดือน และสวัสดิการองค์กร (HR & Payroll)',
    url: '/services/hr-payroll',
    description:
      'รับทำเงินเดือนพนักงาน (Payroll Outsourcing) ยื่นประกันสังคม ภ.ง.ด.1 วางระบบ HR ขอ Visa & Work Permit กองทุนสำรองเลี้ยงชีพ (PVD) ประกันกลุ่ม และประกัน Keyman',
  },
];

export async function GET() {
  const siteUrl = getSiteUrl();
  const [articles, authors] = await Promise.all([
    getIndexableArticles(),
    getAllActiveAuthors(),
  ]);

  const lines: string[] = [];

  lines.push('# บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)');
  lines.push('');
  lines.push(
    '> สำนักงานบัญชีและที่ปรึกษาภาษีอากรครบวงจร นำโดยทีมผู้สอบบัญชีรับอนุญาต (CPA) และผู้ทำบัญชีขึ้นทะเบียน (CPD) ให้บริการรับทำบัญชีรายเดือน ปิดงบการเงิน ตรวจสอบบัญชี วางแผนภาษี จดทะเบียนบริษัท/VAT และบริหารเงินเดือน (Payroll) ตั้งอยู่ย่านอโศก-ดินแดง (ใกล้ MRT เพชรบุรี) กรุงเทพมหานคร ค่าบริการทำบัญชีและจดทะเบียนเริ่มต้น 1,500 บาท'
  );
  lines.push('');
  lines.push('## ข้อมูลองค์กรและการติดต่อ (Company & Contact)');
  lines.push(`- **เว็บไซต์หลัก**: ${siteUrl}`);
  lines.push('- **ชื่อนิติบุคคล**: บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)');
  lines.push(
    '- **ที่ตั้งสำนักงาน**: 234/116 ถนนอโศก-ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร 10310 (ใกล้ MRT เพชรบุรี ทางออก 1)'
  );
  lines.push('- **เวลาทำการ**: วันจันทร์ - ศุกร์ เวลา 08:30 - 17:30 น.');
  lines.push('- **โทรศัพท์**: 099-149-5656, 091-941-5656');
  lines.push('- **อีเมล**: dtv_accounting@hotmail.com, c.pimmphisa@gmail.com');
  lines.push('- **LINE Official**: https://line.me/ti/p/DliAyJfUXd');
  lines.push(
    '- **ค่าบริการเริ่มต้น**: ทำบัญชีรายเดือน เริ่มต้น 1,500 บาท/เดือน | จดทะเบียนธุรกิจ เริ่มต้น 1,500 บาท'
  );
  lines.push(
    '- **จุดเด่นบริการ**: แจ้งราคาชัดเจนก่อนเริ่มงาน ไม่บวกค่าใช้จ่ายจุกจิก และส่งคืนใบเสร็จรับเงินตัวจริงจากกรมสรรพากรให้ลูกค้าเก็บทุกเดือน'
  );
  lines.push('');

  lines.push('## คลังความรู้ฉบับเต็มสำหรับ AI (Full Knowledge Corpus)');
  lines.push(
    `- [Full Knowledge Corpus (/llms-full.txt)](${siteUrl}/llms-full.txt): รวบรวมเนื้อหาบทความบัญชีและภาษีฉบับเต็ม คำตอบสรุป (Quick Answer) คำถามที่พบบ่อย (FAQ) และแหล่งอ้างอิงกฎหมายกรมสรรพากร/DBD ทั้งหมด`
  );
  lines.push('');

  if (authors.length > 0) {
    lines.push('## ทีมผู้เชี่ยวชาญและผู้สอบทานบทความ (E-E-A-T Experts & CPA Reviewers)');
    for (const author of authors) {
      lines.push(
        `- [${author.name}](${siteUrl}/authors/${author.slug}) — **${author.role}** (${author.credentials})`
      );
    }
    lines.push('');
  }

  lines.push('## 4 บริการหลัก (Core Service Pillars)');
  for (const pillar of CORE_PILLARS) {
    lines.push(`- [${pillar.title}](${siteUrl}${pillar.url}): ${pillar.description}`);
  }
  lines.push('');

  lines.push('## บริการย่อยเฉพาะทางทั้ง 16 บริการ (Specialized Sub-Services)');
  for (const sub of SUB_SERVICES) {
    lines.push(
      `- [${sub.title}](${siteUrl}/services/${sub.slug}) [${sub.parentCategoryTitle} | ราคา: ${sub.startingPrice} ${sub.priceUnit}]: ${sub.seoDescription}`
    );
  }
  lines.push('');

  lines.push('## หน้าสำคัญของเว็บไซต์ (Key Public Pages)');
  lines.push(`- [อัตราค่าบริการ (Pricing)](${siteUrl}/pricing)`);
  lines.push(`- [คำถามที่พบบ่อย (FAQ)](${siteUrl}/faq)`);
  lines.push(`- [เกี่ยวกับเรา (About Us)](${siteUrl}/about)`);
  lines.push(`- [ติดต่อขอใบเสนอราคา (Contact Us)](${siteUrl}/contact)`);
  lines.push(`- [คลังความรู้บัญชีและภาษี (Knowledge Hub)](${siteUrl}/knowledge)`);
  lines.push('');

  lines.push(`## บทความคลังความรู้บัญชีและภาษี (${articles.length} บทความ)`);
  const grouped = new Map<string, typeof articles>();
  for (const article of articles) {
    const cat = article.category || 'ทั่วไป';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(article);
  }

  for (const [category, catArticles] of grouped.entries()) {
    lines.push(`### หมวดหมู่: ${category}`);
    for (const art of catArticles) {
      const url = art.canonicalUrl || `${siteUrl}/knowledge/${art.slug}`;
      lines.push(`- [${art.title}](${url})`);
      if (art.quickAnswer) {
        lines.push(`  - **สรุปคำตอบ (AI Direct Answer)**: ${art.quickAnswer.trim()}`);
      } else if (art.summary) {
        lines.push(`  - **สรุปย่อ**: ${art.summary.trim()}`);
      }
    }
    lines.push('');
  }

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
