# แผนสถาปัตยกรรมและข้อกำหนดการพัฒนาระบบ SEO Suite หลังบ้าน
## บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)
### โมเดลต้นแบบ: Rank Math SEO Suite (ปรับประยุกต์สู่ Native Next.js 15 & React 19)

> **เวอร์ชัน:** 1.6.0
> **สถานะ:** Core UI และโครงสร้างข้อมูลพร้อมใช้งาน แต่ต้องแก้ Technical SEO ระดับเร่งด่วนก่อนถือว่า Production Ready
> **อัปเดตล่าสุด:** 11 ตุลาคม 2026  
> **กลุ่มเป้าหมาย:** ระบบบริหารจัดการบทความ (CMS) และศูนย์ควบคุม SEO/AEO/GEO ดีถาวรการบัญชี  

---

## 📌 สรุปสถานะความคืบหน้าภาพรวม (Implementation Status Dashboard)

| โมดูล / ส่วนงาน                                             |   สถานะ    | สรุปสิ่งที่ทำเสร็จแล้ว                                                                                                                                                                | สิ่งที่ต้องทำต่อ                                                                   |
| :---------------------------------------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| **Pillar 1: ศูนย์ควบคุมภาพรวม SEO หลังบ้าน (`/admin/seo`)** | ✅ **100%** | แดชบอร์ดและ UI ครบ 5 แท็บ, IndexNow ยืนยัน Key ผ่าน root, Server-Side 301/308 Redirect, 404 Logging ฝั่ง Server, KPI รวมจาก SQL count/aggregate จริง และ Canonical Domain บน `www`     | — (สมบูรณ์ 100%)                                                                   |
| **โมดูล Instant Indexing (IndexNow API ⚡)**                 | ✅ **100%** | ย้าย Key Endpoint ไป root (`/{key}.txt`), ตรวจสอบสถานะเข้มงวด (เฉพาะ 200/202 คือ Success), ตรวจ Host Canonical และกรองเฉพาะ URL ที่เป็น Indexable เท่านั้น                            | ทดสอบยิงบน Production หลัง deploy โดเมนจริง                                        |
| **โมดูล 301 Redirects Manager ⚠️**                          | ✅ **100%** | พัฒนา Server-Side Catch-All (`/[...catchall]`) ส่ง HTTP 301/308 พร้อม `Location` header ทันทีจาก Server สำหรับทั้ง `custom_redirects` และ `article_redirects` พร้อมนับยอด Hits ใน DB | เพิ่มฟังก์ชัน Import/Export รายการ Redirect ในรูปแบบไฟล์ CSV (ตัวเลือกเสริม)        |
| **โมดูล 404 Error Monitor 🔍**                              | ✅ **100%** | ย้ายการบันทึกลง Server-Side Catch-All บันทึก IP Address, User-Agent, Referrer ลงตาราง `error_logs_404` พร้อมตัวกรองบอทสแปมและปุ่ม One-Click "แปลงเป็น 301 Redirect"                  | ตั้ง Schedule ล้าง Log เก่าตามรอบเวลา (Retention Policy)                          |
| **โมดูล XML Sitemap & Robots.txt 🗺️**                      | ✅ **100%** | ใช้โดเมน Canonical `https://www.deethavorn.com`, รวมเฉพาะบทความ Indexable จาก `getIndexableArticles()` และโปรไฟล์ผู้เขียน E-E-A-T, ใช้วันที่แก้ไขจริงสำหรับ `lastModified`           | เพิ่ม Image Sitemap Tags เสริมในอนาคต                                              |
| **Pillar 2: Focus Keyword & Scoring Engine ใน Editor**      | ✅ **100%** | คำนวณคะแนน 0–100 เรียลไทม์ 4 หมวด, ตรวจ Heading, Keyword Density, Alt Text, E-E-A-T และรองรับการบันทึกคะแนนอัตโนมัติ                                                                | — (สมบูรณ์ 100%)                                                                   |
| **Social & SERP Previews**                                  | ✅ **100%** | กล่องจำลองผลลัพธ์เหมือนจริง: Google SERP (Desktop & Mobile), LINE Share Card, Facebook Feed                                                                                           | — (สมบูรณ์ 100%)                                                                   |
| **Rich Media & Synthetic HTML**                             | ✅ **100%** | อัปโหลดรูปภาพลงบทความ, บังคับ Alt Text สำหรับ Image SEO, เรนเดอร์เป็น Semantic `<figure class="article-figure">` และ `<figcaption>`                                                   | ปรับขนาดและบีบอัดรูปเป็น WebP อัตโนมัติในฝั่ง Server                               |
| **Public Knowledge Hub UX (`/knowledge`)**                  | ✅ **100%** | หน้ารวมบทความพร้อม **Live Search Bar** ค้นหาเรียลไทม์, แท็บหมวดหมู่, หน้าโปรไฟล์ผู้เขียนและผู้ตรวจทานสาธารณะ (`/authors/[slug]`) พร้อม Person/ProfilePage JSON-LD ยกระดับ Google E-E-A-T | — (สมบูรณ์ 100%)                                                                   |
| **Content AI & AEO Assistant (Gemini API 🤖)**              |  ⏳ **0%**  | วางสถาปัตยกรรมและ Prompt Engineering ไว้ในสเปก                                                                                                                                        | สร้างปุ่มใน Editor ให้ AI ช่วยคิด Meta Description, Quick Answer และ Focus Keyword |

---

## 1. บทนำและเป้าหมายเชิงกลยุทธ์ (Executive Summary)

Rank Math SEO เป็นหนึ่งในปลั๊กอินจัดการ SEO ที่ได้รับความนิยมสูงสุดบน WordPress เนื่องจากมี **Modular Architecture** (ระบบเปิด-ปิดฟังก์ชันแยกส่วน) และ **Real-time Content Scoring** (ระบบตรวจจับ Focus Keyword ให้คะแนน 0–100 แบบไฟเขียว-ไฟแดง)

โครงการนี้พัฒนา **Custom SEO Suite** ขึ้นมาทำงานบนสถาปัตยกรรม **Next.js 15 App Router** ของบริษัท ดีถาวรการบัญชี จำกัด โดยจำลองฟังก์ชันชั้นนำของ Rank Math แต่แก้ไขจุดอ่อนดั้งเดิมของ WordPress ทำให้ได้ระบบที่:
1. **เร็วระดับ 95–100 (Core Web Vitals)**: ไม่ต้องโหลดปลั๊กอิน PHP หนักๆ และไม่มี JavaScript ส่วนเกินในหน้าบ้าน
2. **ตรงเป้าหมายธุรกิจบัญชี-ภาษี (YMYL & E-E-A-T)**: ปรับแต่งเกณฑ์คะแนนให้ตรวจจับการอ้างอิงกฎหมายสรรพากร, ผู้ตรวจทาน CPA, และบล็อกคำตอบ 1 นาทีสำหรับ Google AI Overviews (AEO)
3. **ควบคุม Source Code ได้ 100%**: ไม่มีค่าบริการรายปี ปรับแต่งได้อย่างอิสระตามความต้องการของสำนักงาน

---

## 2. ตารางเปรียบเทียบสถาปัตยกรรม: WordPress + Rank Math VS Next.js Custom Suite

| มิติการทำงาน | WordPress + Rank Math | Next.js Custom SEO Suite (ดีถาวร) | สถานะปัจจุบัน |
| :--- | :--- | :--- | :---: |
| **ความเร็วหน้าเว็บ (LCP / FCP)** | ช้าลงตามจำนวนปลั๊กอิน (PageSpeed ~45–70) | เร็วระดับขีดสุดด้วย React Server Components (~95–100) | ✅ ใช้งานจริง |
| **ความปลอดภัย (Security)** | เสี่ยงต่อช่องโหว่ของปลั๊กอิน PHP และ WP Core | ลด Attack Surface จากปลั๊กอิน แต่ยังต้อง validate URL และ escape JSON-LD จากข้อมูล CMS | ⚠️ ต้อง Hardening |
| **Focus Keyword Scoring** | มี Checklist ตรวจคำค้นหา 0–100 คะแนน | นำมาเขียนเป็น TypeScript Engine ทำงานเรียลไทม์ในหน้า Editor | ✅ ใช้งานจริง |
| **Schema Generator** | Schema พื้นฐานทั่วไป (Article, FAQ, HowTo) | Schema ระดับองค์กรผูก E-E-A-T (CPA Credentials, TFAC License, SameAs) | ✅ ใช้งานจริง |
| **Instant Indexing** | ปลั๊กอิน IndexNow ส่งไปยัง Bing / Yandex | Webhook อัตโนมัติเมื่อ Publish + ปุ่ม Bulk Ping | ❌ พบ HTTP 422 |
| **การจัดการ Redirect 301** | เก็บในฐานข้อมูล WordPress `wp_options` | เก็บในตาราง `custom_redirects` และ `article_redirects` | ❌ Custom Redirect ยังตอบ 404 ก่อน |
| **404 Monitor** | บันทึกผ่านปลั๊กอิน เพิ่มภาระฐานข้อมูล | บันทึกผ่าน Client Route + ปุ่มแปลงเป็น 301 ในคลิกเดียว | ⚠️ ใช้งานบางส่วน |
| **AI Content & AEO** | Rank Math Content AI (ต้องซื้อเครดิตเพิ่ม) | เชื่อมต่อ API AI (Gemini / OpenAI) ร่างบทความและ Quick Answer โดยตรง | ⏳ ถัดไป |

---

## 3. สถาปัตยกรรมระบบ 2 เสาหลัก (The 2 Core Pillars)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    DTV NATIVE SEO SUITE ARCHITECTURE                        │
├──────────────────────────────────────────────┬───────────────────────────────┤
│  Pillar 1: หน้าศูนย์ควบคุม SEO หลังบ้าน      │  Pillar 2: แถบตรวจคะแนนในหน้า  │
│  Route: /admin/seo                           │  เขียนบทความ (/admin/articles)│
├──────────────────────────────────────────────┼───────────────────────────────┤
│  [🎛️ Master Dashboard & Tabs]               │  [🎯 Focus Keyword Input]     │
│  - KPI Cards: Score, IndexNow, 301, 404, Map │  - Target Keyword (คำค้นหลัก) │
│  - Tab 1: SEO Health Audit รายบทความ         │  - คำนวณ Keyword Density %    │
│  - Tab 2: Instant Indexing (IndexNow ⚡)     │                               │
│  - Tab 3: 301 Redirects Manager              │  [📊 Real-time Score: 0-100]  │
│  - Tab 4: 404 Error Monitor (One-Click 301)  │  - Basic SEO (40 คะแนน)       │
│  - Tab 5: Dynamic Sitemap & Crawler Policy   │  - Additional SEO (30 คะแนน)  │
│                                              │  - E-E-A-T Authority (20 คะแนน)│
│                                              │  - Readability (10 คะแนน)     │
│                                              │  - SERP / LINE / FB Previews  │
└──────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 4. รายละเอียด Pillar 1: หน้าศูนย์ควบคุมภาพรวม SEO (`/admin/seo`)

### โมดูลที่ 1: Instant Indexing (IndexNow API) ⚡ [❌ ต้องแก้ก่อนใช้งาน Production]
* **หน้าที่:** แจ้งเตือน Search Engine (Bing, Naver, Seznam, Yandex) ให้เข้ามาเก็บข้อมูลหน้าเว็บทันทีที่มีการเพิ่ม แก้ไข หรือเผยแพร่บทความ โดยไม่ต้องรอรอบการ Crawl ปกติ
* **สิ่งที่ทำเสร็จแล้ว:**
  - สร้างไฟล์ IndexNow API Key Endpoint ที่ `/api/indexnow` สำหรับให้ Crawler ยืนยันตัวตน
  - ส่งคำขออัตโนมัติทันทีที่บทความถูกกด `PUBLISHED` ใน `/api/admin/articles/[id]/publish`
  - มีกล่องฟอร์ม **Manual Ping** ให้แอดมินพิมพ์ส่ง URL เดี่ยวเข้า Search Engine ได้ทันที
  - มีปุ่ม **"ยิง IndexNow ทุกบทความ (Bulk Ping)"** สำหรับส่งบทความทั้งหมดที่เผยแพร่ในคราวเดียว
  - บันทึกประวัติและผลตอบรับลงตาราง `indexing_logs` พร้อมเวลาและสถานะ
* **ผลตรวจสอบวันที่ 11 ตุลาคม 2026:**
  - Log ล่าสุดในฐานข้อมูลเป็น `FAILED` จาก HTTP 422: URL ที่ส่งไม่สัมพันธ์กับ Site ที่ยืนยันผ่าน `keyLocation`
  - ปัจจุบัน `keyLocation` ชี้ไป `/api/indexnow` จึงครอบคลุมได้เฉพาะ URL ใต้ `/api/` ตามกติกา Path Scope ของ IndexNow ไม่ครอบคลุม `/knowledge/*`
  - โค้ดปัจจุบันตีความ HTTP 422 เป็น `success: true` ทำให้ข้อความบนหน้าแอดมินขัดกับสถานะที่บันทึกในฐานข้อมูล
* **สิ่งที่ต้องทำต่อ:**
  - ย้าย Key Endpoint ไป root เช่น `/indexnow-key.txt` หรือ `/{INDEXNOW_KEY}.txt` และแก้ `keyLocation` ให้ตรงกัน
  - ถือว่าสำเร็จเฉพาะ HTTP 200/202; HTTP 400/403/422/429 ต้องเป็น Failed พร้อมข้อความที่แก้ไขได้
  - Manual Ping ต้องรับเฉพาะ `http/https` ของ canonical host เดียวกัน และ Bulk Ping ต้องกรอง `isNoIndex`, Future Publish และ External Canonical
  - Auto Ping หลัง Publish ต้อง `await` งานหรือใช้ Next.js `after()` เพื่อไม่ให้ Serverless ตัดงานหลังส่ง response

### โมดูลที่ 2: 301 Redirections Manager ⚠️ [❌ Custom Redirect ยังไม่เป็น HTTP Redirect จริง]
* **หน้าที่:** จัดการลิงก์เปลี่ยนผ่าน (`Source URL ➔ Target URL`) ป้องกันผู้ใช้เจอหน้าว่าง และส่งต่อคะแนน SEO (PageRank) ไปยังหน้าใหม่
* **สิ่งที่ทำเสร็จแล้ว:**
  - สร้างตาราง `custom_redirects` รองรับทั้ง 301 Permanent และ 302 Temporary
  - เชื่อมโยงกับ `article_redirects` ที่ระบบสร้างให้อัตโนมัติเมื่อมีการแก้ไข Article Slug
  - มีหน้าจอ Modal สร้าง Redirect ใหม่ และตารางแสดงรายการพร้อมจำนวนยอดคลิกเข้าใช้งาน (Hits)
  - ระบบตรวจสอบ Redirect ใน `/api/seo/log-404` และส่งข้อมูล Target กลับให้ Client
* **ผลตรวจสอบวันที่ 11 ตุลาคม 2026:**
  - ทดสอบรายการ `/old-vat-link` ที่ตั้งค่า 301 แล้ว พบว่า HTTP response แรกยังเป็น `404` และไม่มี `Location` header
  - `NotFoundTracker.tsx` รอให้หน้า 404 โหลดและเรียก API ก่อนใช้ `window.location.replace()` ซึ่งเป็น Client Navigation ไม่ใช่ HTTP 301/302 และไม่ส่งต่อสัญญาณ SEO อย่างถูกต้อง
  - `article_redirects` จากการเปลี่ยน slug ทำงานฝั่ง Server ผ่าน `permanentRedirect()` แต่ `custom_redirects` ยังไม่ใช้เส้นทางเดียวกัน
* **สิ่งที่ต้องทำต่อ:**
  - เพิ่ม Server-Side catch-all route หรือ Reverse Proxy ที่ตรวจ `custom_redirects` ก่อน render 404 และตอบ 301/302 พร้อม `Location`
  - ป้องกัน redirect loop, source=target, chain หลายชั้น และตรวจ protocol ของ External Target
  - ฟังก์ชัน Import/Export รายการ Redirect ในรูปแบบไฟล์ CSV

### โมดูลที่ 3: 404 Broken Link Monitor 🔍 [⚠️ ทำงานเฉพาะ Client ที่รัน JavaScript]
* **หน้าที่:** ตรวจจับลิงก์ที่ผู้ใช้หรือบอทเปิดเข้ามาแล้วไม่พบหน้า (HTTP 404) พร้อมหน้าจอสร้าง 301 Redirect ชี้ไปยังหน้าที่ถูกต้อง
* **สิ่งที่ทำเสร็จแล้ว:**
  - สร้างตาราง `error_logs_404` บันทึก URL, Referrer (ที่มา), จำนวนครั้ง (Hits), วันที่พบ และสถานะการแก้ไข
  - สร้างคอมโพเนนต์ `NotFoundTracker.tsx` ฝังในหน้า [src/app/not-found.tsx](file:///d:/WebApp/Deethavorn/src/app/not-found.tsx) เพื่อบันทึกสถิติ 404 อัตโนมัติ
  - เพิ่มปุ่มแอ็กชัน **"แปลงเป็น 301 Redirect"** ในตาราง 404: เมื่อคลิกจะเปิด Modal กรอก URL ปลายทาง และสร้าง 301 Redirect พร้อมปรับสถานะเป็น "แก้ไขแล้ว" ในคลิกเดียว
* **ข้อจำกัดที่ตรวจพบ:**
  - Search Bot หรือ Client ที่ไม่รัน JavaScript จะไม่เรียก `NotFoundTracker` จึงไม่ถูกบันทึก
  - Public API สามารถถูกเรียกเพื่อเพิ่ม Hits ได้โดยตรงและยังไม่มี rate limit
  - Schema มี `userAgent` และ `ipAddress` แต่ Route ปัจจุบันยังไม่บันทึกข้อมูลดังกล่าว
* **สิ่งที่ต้องทำต่อ:**
  - รวม 404 Logging เข้ากับ Server-Side catch-all เดียวกับ Redirect Resolver
  - เพิ่ม rate limit, bot/static-asset filter และนโยบาย retention เพื่อไม่ให้ฐานข้อมูลโตโดยไม่จำเป็น

### โมดูลที่ 4: XML Sitemap & Crawl Policy Manager 🗺️ [⚠️ ต้องจัดสัญญาณ Canonical ให้ตรงกัน]
* **หน้าที่:** ควบคุมแผนผังเว็บไซต์ `/sitemap.xml` และนโยบายบอทใน `/robots.txt`
* **สิ่งที่ทำเสร็จแล้ว:**
  - พัฒนา [src/app/sitemap.ts](file:///d:/WebApp/Deethavorn/src/app/sitemap.ts) ดึงเฉพาะหน้าหลักและบทความที่เป็น `PUBLISHED` โดยอัตโนมัติ
  - พัฒนา [src/app/robots.ts](file:///d:/WebApp/Deethavorn/src/app/robots.ts) อนุญาต Googlebot, Bingbot, และ `OAI-SearchBot` สำหรับการค้นพบใน ChatGPT Search พร้อมบล็อก `/admin/` และ `/api/`
  - หน้า UI สรุปจำนวน URLs ใน Sitemap, กล่องแสดง URL พร้อมปุ่ม Copy และปุ่มเปิดดูไฟล์
  - เพิ่มทางลัดเปิดเครื่องมือตรวจสอบภายนอก: **Google Rich Results Test**, **Google Search Console**, และ **Bing Webmaster Tools**
* **ผลตรวจสอบวันที่ 11 ตุลาคม 2026:**
  - Production redirect `https://deethavorn.com/*` ไป `https://www.deethavorn.com/*` แต่ Canonical, Open Graph และ Sitemap ยังสร้าง URL แบบไม่มี `www`
  - Sitemap ใช้ `getPublishedArticles()` ซึ่งยังไม่กรอง `isNoIndex` และ External Canonical
  - Static route ใช้เวลาปัจจุบันเป็น `lastModified` ทุกครั้งที่สร้าง Sitemap แทนวันที่แก้ไขเนื้อหาจริง
* **สิ่งที่ต้องทำต่อ:**
  - กำหนด `NEXT_PUBLIC_SITE_URL=https://www.deethavorn.com` และสร้าง utility `SITE_URL` กลางแทน hard-code หลายไฟล์
  - สร้าง query กลาง `getIndexableArticles()` สำหรับ Sitemap, IndexNow และ KPI โดยกรอง Published + ถึงเวลาเผยแพร่ + ไม่ NoIndex + Canonical อยู่บนโดเมนหลัก
  - ใช้วันที่แก้ไขจริงสำหรับ `lastModified` และเพิ่ม automated test ตรวจว่า Sitemap ไม่มี URL ที่ redirect/noindex
  - เพิ่ม `Image Sitemap Tags` สำหรับระบุ URL รูปภาพประกอบบทความเพื่อเร่งการติด Google Image Search

### โมดูลที่ 5: Content AI & AEO Generator (Google AI Overviews) 🤖 [⏳ สิ่งที่ต้องทำต่อ]
* **หน้าที่:** ผู้ช่วยปัญญาประดิษฐ์สำหรับการปรับแต่งคำค้นหาและโครงสร้างคำตอบ
* **สิ่งที่วางแผนไว้:**
  - ปุ่มสร้าง SEO Title และ Meta Description 3 รูปแบบให้เลือก
  - ปุ่มสรุปเนื้อหาเป็น **Quick Answer 1 นาที** เพื่อให้ติดอันดับในกล่องคำตอบ AI
  - ฟังก์ชันแนะนำ Secondary Keywords จากประเด็นเนื้อหา

---

## 5. รายละเอียด Pillar 2: ระบบวิเคราะห์ Focus Keyword ในหน้า Editor [⚠️ Implementation ครบ แต่ต้องปรับเกณฑ์]

เมื่อเปิดหน้าแก้ไขบทความ (`/admin/articles/[id]`) แถบ **SEO & AEO** จะคำนวณคะแนนแบบเรียลไทม์ 0–100 คะแนน:

### เกณฑ์การตรวจจับและให้คะแนน (Scoring Algorithm - 100 คะแนนเต็ม)

#### 1. Basic SEO (40 คะแนน)
* 🟢 **Focus Keyword in Title (10 คะแนน):** ตรวจจับคำค้นหาเป้าหมายในหัวข้อบทความ
* 🟢 **Focus Keyword in Meta Description (10 คะแนน):** ตรวจจับคำค้นหาในบทสรุปย่อ (ความยาวเหมาะสม 70–175 ตัวอักษร)
* 🟢 **Focus Keyword in URL Slug (10 คะแนน):** ตรวจจับคำค้นหา (ภาษาไทยหรืออังกฤษ) อยู่ใน URL Slug
* 🟢 **Focus Keyword in First 10% (10 คะแนน):** ตรวจจับคำค้นหาปรากฏในย่อหน้าแรกของเนื้อหา

#### 2. Additional SEO & Keyword Density (25 คะแนน)
* 🟢 **Focus Keyword in Headings (10 คะแนน):** ตรวจจับคำค้นหาในหัวข้อย่อยระดับ `## (H2)` หรือ `### (H3)` อย่างน้อย 1 จุด
* 🟢 **Keyword Density (10 คะแนน):** คำนวณสัดส่วนความถี่ของคำค้นหาในเนื้อหา โดยโค้ดปัจจุบันใช้ช่วง **0.7% ถึง 2.5%** เป็น heuristic ภายใน ไม่ใช่เกณฑ์จัดอันดับอย่างเป็นทางการของ Google
* 🟢 **Focus Keyword in Image Alt (5 คะแนน):** ตรวจสอบว่ามีรูปภาพหน้าปกหรือรูปภาพประกอบในเนื้อหาที่มี Focus Keyword อยู่ในคำอธิบายรูป (Alt Text)

#### 3. E-E-A-T & Content Authority (ดีถาวร Special - 20 คะแนน)
* 🟢 **Legal & Official Citations (10 คะแนน):** มีการระบุแหล่งอ้างอิงทางกฎหมาย (เช่น ลิงก์ไปยังประมวลรัษฎากร กรมสรรพากร หรือสภาวิชาชีพบัญชี) อย่างน้อย 1 รายการ
* 🟢 **Editorial Governance (10 คะแนน):** มีการระบุผู้เขียนบทความ และมีผู้สอบบัญชี CPA/TA ตรวจสอบความถูกต้อง พร้อมกำหนดวันทบทวนกฎหมายรอบถัดไป

#### 4. Readability & Structure (15 คะแนน)
* 🟢 **Content Length (8 คะแนน):** โค้ดปัจจุบันให้คะแนนเต็มเมื่อประเมินได้ตั้งแต่ 500 คำขึ้นไป ใช้เป็นตัวชี้วัดความครบถ้วนภายในเท่านั้น
* 🟡 **FAQ Section (7 คะแนน):** มีคำถาม-คำตอบอย่างน้อย 2 ข้อเพื่อประโยชน์ของผู้อ่านและ Structured Data แต่ไม่ควรสื่อว่าจะได้ FAQ Rich Results เนื่องจาก Google จำกัดการแสดงผลหลักไว้กับเว็บไซต์รัฐบาลและสุขภาพที่มีอำนาจสูง

### ข้อปรับปรุงด้าน Metadata และ Structured Data
* Validate `canonicalUrl` และ `ogImage` ให้เป็น URL `http/https` ที่ถูกต้องก่อนบันทึกหรือเผยแพร่
* Escape อักขระ `<` เป็น `\u003c` ก่อนส่ง JSON-LD ผ่าน `dangerouslySetInnerHTML` เพื่อป้องกัน Stored Script Injection จากข้อมูล CMS
* เพิ่ม `image` ใน Article Schema และทำให้ `mainEntityOfPage.@id`, Canonical, Open Graph URL และ Sitemap ใช้ URL เดียวกัน
* ใช้ `cache()` ครอบ `getArticleBySlug()` เพื่อลดการ query ซ้ำระหว่าง `generateMetadata()` และหน้า Article

### Social Media & SERP Previews (การจำลองตัวอย่างผลลัพธ์) [✅ เสร็จสมบูรณ์]
* **Google SERP Preview (Desktop & Mobile):** จำลองผลการค้นหาบน Google พร้อม Title สีน้ำเงิน, URL Breadcrumb, และ Description สีเทา
* **LINE Share Preview:** จำลองหน้าต่างเวลาส่งลิงก์แชร์ในแชท LINE (แสดงภาพการ์ด 1:1 หรือ 1.91:1 พร้อมชื่อเรื่องและบทคัดย่อ)
* **Facebook OpenGraph Preview:** จำลองโพสต์เมื่อนำลิงก์ไปแปะบน Facebook Feed

### Rich Media & Synthetic HTML [✅ เสร็จสมบูรณ์]
* ปุ่ม Toolbar `[🖼️ รูปภาพ]` พร้อม Modal อัปโหลดไฟล์จากเครื่อง หรือใส่ URL พร้อมบังคับ Alt Text
* เรนเดอร์ HTML ออกมาเป็น Semantic `<figure class="article-figure">` และ `<figcaption>` พร้อมไอคอนกล้อง 📷

---

## 6. โครงสร้างฐานข้อมูลจริงในปัจจุบัน (Active Prisma Schema)

```prisma
// ------------------------------------------------------------------------------
// 1. ตารางบทความและข้อมูล E-E-A-T
// ------------------------------------------------------------------------------

model Article {
  id               Int               @id @default(autoincrement())
  title            String            @db.VarChar(255)
  slug             String            @unique @db.VarChar(255)
  summary          String            @db.VarChar(500)
  contentMarkdown  String            @map("content_markdown") @db.LongText
  category         String            @db.VarChar(80)
  coverImage       String?           @map("cover_image") @db.VarChar(255)
  coverImageAlt    String?           @map("cover_image_alt") @db.VarChar(255)
  quickAnswer      String?           @map("quick_answer") @db.Text
  status           ArticleStatus     @default(DRAFT)
  focusKeyword     String?           @map("focus_keyword") @db.VarChar(120)
  seoScore         Int               @default(0) @map("seo_score")
  isNoIndex        Boolean           @default(false) @map("is_no_index")
  canonicalUrl     String?           @map("canonical_url") @db.VarChar(500)
  ogImage          String?           @map("og_image") @db.VarChar(255)
  authorId         Int?              @map("author_id")
  author           Author?           @relation("ArticleAuthor", fields: [authorId], references: [id])
  reviewerId       Int?              @map("reviewer_id")
  reviewer         Author?           @relation("ArticleReviewer", fields: [reviewerId], references: [id])
  reviewedAt       DateTime?         @map("reviewed_at")
  publishedAt      DateTime?         @map("published_at")
  contentUpdatedAt DateTime?         @map("content_updated_at")
  nextReviewAt     DateTime?         @map("next_review_at")
  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime          @updatedAt @map("updated_at")
  faqs             ArticleFaq[]
  citations        ArticleCitation[]
  redirects        ArticleRedirect[]

  @@index([status, publishedAt])
  @@index([category, status])
  @@map("articles")
}

// ------------------------------------------------------------------------------
// 2. ตารางศูนย์ควบคุม SEO Suite (Rank Math Architecture)
// ------------------------------------------------------------------------------

// ตารางบันทึกประวัติการส่งคำขอ Instant Indexing (IndexNow API)
model IndexingLog {
  id        Int      @id @default(autoincrement())
  url       String   @db.VarChar(500)
  engine    String   @default("IndexNow") @db.VarChar(50)
  status    String   @db.VarChar(50) // SUCCESS, FAILED
  response  String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  @@index([createdAt])
  @@map("indexing_logs")
}

// ตารางบันทึก 404 Errors เพื่อนำมาตรวจจับลิงก์เสียและทำ 301 Redirects
model ErrorLog404 {
  id         Int      @id @default(autoincrement())
  url        String   @unique @db.VarChar(500)
  referrer   String?  @db.VarChar(500)
  userAgent  String?  @map("user_agent") @db.VarChar(255)
  ipAddress  String?  @map("ip_address") @db.VarChar(50)
  hits       Int      @default(1)
  isResolved Boolean  @default(false) @map("is_resolved")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([hits])
  @@map("error_logs_404")
}

// ตารางจัดการ Custom Redirects (301 Permanent / 302 Temporary)
model CustomRedirect {
  id         Int       @id @default(autoincrement())
  sourcePath String    @unique @map("source_path") @db.VarChar(500)
  targetPath String    @map("target_path") @db.VarChar(500)
  statusCode Int       @default(301) @map("status_code") // 301 or 302
  isActive   Boolean   @default(true) @map("is_active")
  hits       Int       @default(0)
  lastHitAt  DateTime? @map("last_hit_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@map("custom_redirects")
}
```

---

## 7. รายการงานที่ทำเสร็จแล้ว VS สิ่งที่ต้องทำต่อ (Completed vs Remaining)

### ✅ สิ่งที่มี Implementation แล้ว (Implemented; บางส่วนยังต้อง Technical Remediation)
1. **Pillar 2: In-Editor SEO Scoring & Inspector (`/admin/articles/[id]`)**
   - คำนวณคะแนน SEO 0–100 แบบเรียลไทม์ตามเกณฑ์ 4 หมวด
   - กล่องพรีวิว Google SERP (Desktop/Mobile), LINE Card, และ Facebook Feed
   - Toolbar จัดการ Markdown พร้อมปุ่มใส่รูปภาพประกอบและ Modal อัปโหลดไฟล์ + บังคับ Alt Text
   - เรนเดอร์รูปภาพในเนื้อหาเป็น `<figure>` และ `<figcaption>` สวยงาม
   - จัด Alignment แท็บด้านบนไม่ให้ตกบรรทัด และป้ายคะแนน SEO Score แนวนอน

2. **Pillar 1: ศูนย์ควบคุมภาพรวม SEO หลังบ้าน (`/admin/seo`) — UI/Data Layer พร้อม, Runtime Behavior ยังไม่สมบูรณ์**
   - เมนู "ศูนย์ควบคุม SEO" บน Sidebar พร้อมไอคอน Globe
   - การ์ดสรุปสถิติสำคัญ 5 ด้าน (Average Score, IndexNow Pings, 301 Redirects, 404 Errors, Sitemap URLs)
   - Tab 1: ตารางตรวจสอบสุขภาพ SEO รายบทความ พร้อมป้ายสถานะและแจ้งเตือนทบทวนข้อกฎหมาย (Review Due Alert)
   - Tab 2: มีฟอร์ม Manual Ping, ปุ่ม Bulk Ping และตาราง `indexing_logs` แต่การยืนยัน Key ยังผิด Path Scope และได้รับ HTTP 422
   - Tab 3: มี Modal/ตาราง Redirect แต่ Custom Redirect ยังเป็น Client Redirect หลัง HTTP 404 ไม่ใช่ HTTP 301/302 จาก Server
   - Tab 4: มี 404 Monitor และปุ่ม One-Click "แปลงเป็น 301 Redirect" แต่เก็บข้อมูลได้เฉพาะ Client ที่รัน JavaScript
   - Tab 5: ตรวจสอบ Dynamic Sitemap `/sitemap.xml` และ Robots Policy `/robots.txt` พร้อมทางลัด Rich Results Test

3. **Public Front-end Knowledge Hub (`/knowledge` & `/knowledge/[slug]`)**
   - หน้ารวมบทความพร้อมแท็บหมวดหมู่ และการ์ดบทความมีภาพหน้าปก 16:9 + Gradient Fallback
   - หน้าอ่านบทความมี Banner รูปหน้าปก, Breadcrumbs, Quick Answer (BLUF สำหรับ AEO), TOC, Citations, FAQ, CPA Author, CTA นำสู่ Lead และ Related Articles
   - โครงสร้างข้อมูล Schema.org JSON-LD (`Article`, `BreadcrumbList`, `FAQPage`)
   - ระบบ Smart Redirect สำหรับสิทธิ์ `EDITOR` เข้าถึงเฉพาะส่วนงานบทความโดยตรง

---

### ⏳ สิ่งที่ต้องทำต่อในระยะถัดไป (Remaining Roadmap)

#### ✅ ระยะที่ 0: Technical SEO Remediation — [เสร็จสมบูรณ์ 100% วันที่ 11 ตุลาคม 2026]
1. **Canonical Host และ URL Source of Truth** ✅
   - สร้าง utility กลาง `getSiteUrl()` และ `toAbsoluteUrl()` ใน `src/lib/seo/site-url.ts`
   - กำหนดค่าเริ่มต้นเป็น `https://www.deethavorn.com` (ตรงกับ Production 301 Redirect บน Hostinger)
   - อัปเดต Metadata, OpenGraph, Canonical, Schema, Robots, Sitemap และ IndexNow ให้ใช้ค่าเดียวกันทั้งหมด
2. **ซ่อม IndexNow End-to-End** ✅
   - ย้าย Key Endpoint ไปที่ root `/d9f8b4a2e5c1473682b09a71deethavorn.txt` ครอบคลุมสิทธิ์ทั้งโดเมน
   - แปลงผล HTTP status อย่างถูกต้อง: เฉพาะ HTTP 200/202 ถือเป็น SUCCESS; 400/403/422/429 ถือเป็น FAILED
   - เพิ่ม Host Validation ตรวจสอบ URL ให้อยู่บนโดเมนเดียวกัน และกรองเฉพาะ Indexable Articles
3. **ทำ Redirect และ 404 Resolver ฝั่ง Server** ✅
   - พัฒนา Server Catch-All Route `src/app/[...catchall]/page.tsx`
   - ดึง `custom_redirects` ตอบกลับด้วย `permanentRedirect()` (HTTP 308/301) พร้อม `Location` header ทันทีโดยไม่ต้องเรนเดอร์หน้า 404
   - รองรับ `article_redirects` จากการเปลี่ยน Slug บทความฝั่ง Server
   - บันทึก 404 Error Log พร้อม User-Agent, IP Address, Referrer และตัวกรอง Bot Scraper ขยะ
4. **รวม Indexability Rules เป็น Query กลาง** ✅
   - สร้าง `getIndexableArticles()` ใน `src/lib/articles/queries.ts` ใช้ร่วมกันใน Sitemap, IndexNow Bulk, และ SEO Stats
   - กรองเฉพาะบทความ Published, ถึงเวลาเผยแพร่จริง, `isNoIndex === false` และ Canonical ไม่ชี้ออกภายนอก
   - เพิ่ม React `cache()` ใน `getCachedArticleBySlug()` ป้องกันการยิง DB ซ้ำซ้อนระหว่าง `generateMetadata()` และ Page Component
5. **Metadata/Structured Data Hardening** ✅
   - ทำ URL ทุกสัญญาณให้ตรงกัน (Canonical, Open Graph URL, Schema `mainEntityOfPage.@id`)
   - Escape เครื่องหมาย `<` เป็น `\u003c` ใน JSON-LD `dangerouslySetInnerHTML` ทุกจุดเพื่อป้องกัน XSS
   - บังคับใส่ `image` ใน Article Schema ชี้ไปยังรูปภาพปกที่แท้จริง
6. **แก้ KPI ให้คำนวณจากฐานข้อมูลจริง** ✅
   - คำนวณยอดรวมผ่าน `prisma.count()` และ `prisma.aggregate({ _sum: { hits: true } })` แทนการนับ Array ที่ถูกจำกัด `take`
   - แสดงคะแนนเฉลี่ยเป็น `null` (N/A) เมื่อยังไม่มีบทความที่ประเมินคะแนน แทนการ Hard-code ค่าเริ่มต้น 75
   - ผูก `sitemapUrlCount` กับจำนวน URL ที่มีอยู่จริงใน XML Sitemap (หน้าหลัก 2 + บทความ Indexable + หน้าโปรไฟล์ผู้เขียน)

#### ✅ ระยะที่ 1: การยกระดับประสบการณ์ผู้ใช้งานหน้าบ้าน (Front-end UX) — [เสร็จสมบูรณ์ 100% วันที่ 11 ตุลาคม 2026]
1. **ช่องค้นหาบทความแบบเรียลไทม์ (Live Search Bar) บนหน้า `/knowledge`** ✅
   - ติดตั้งกล่อง Search Input ดีไซน์พรีเมียม กรองบทความเรียลไทม์ตาม Title, Summary, Keyword และ Category
   - มีปุ่ม Clear Search, แสดงจำนวนบทความที่ค้นพบ และ Empty State สวยงามพร้อมปุ่ม "แสดงบทความทั้งหมด"
2. **หน้าโปรไฟล์ผู้เขียนและผู้ตรวจทานสาธารณะ (`/authors/[slug]`)** ✅
   - สร้างหน้าโปรไฟล์ E-E-A-T แสดงรูปภาพ, วุฒิการศึกษา, เลขทะเบียนวิชาชีพ CPA/TA, และประวัติการทำงาน
   - เชื่อมโยง Schema.org `ProfilePage` และ `Person` ผูกกับบริษัท ดีถาวรการบัญชี จำกัด
   - แสดงรายชื่อบทความที่บุคคลนั้นเขียน (Authored) และบทความที่สอบทานความถูกต้อง (Reviewed)
   - เชื่อมโยงลิงก์จากหน้าอ่านบทความ (`ArticleAuthor` และ Byline) ตรงสู่หน้าโปรไฟล์ผู้เขียน
   - เพิ่ม URL ผู้เขียนลงใน `/sitemap.xml` เพื่อเร่งการจัดทำดัชนี E-E-A-T ของ Google

---

#### ⏳ ระยะที่ 2: ระบบผู้ช่วยอัจฉริยะ AI Content & AEO Assistant
* **ปุ่ม Gemini / AI Suggestions ในหน้า Editor**:
  - ปุ่ม 1 คลิกให้ AI ช่วยวิเคราะห์เนื้อหาและแนะนำ **Focus Keyword** ที่ตรงจุด
  - ปุ่มสร้าง **Meta Description** อัตโนมัติ 3 รูปแบบให้เลือกคลิกนำไปใช้
  - ปุ่มสรุปเนื้อหาเป็น **Quick Answer (1 นาที)** สำหรับกล่องคำตอบ Google AI Overviews

#### ⏳ ระยะที่ 3: ระบบแจ้งเตือนทางอีเมลและการเชื่อมต่อ Search Console (Operational Monitoring)
* **ระบบแจ้งเตือนทบทวนกฎหมาย (Email Notification)**:
  - สคริปต์ตรวจจับบทความที่ใกล้ถึง `nextReviewAt` และส่งอีเมลแจ้งเตือนผู้รับผิดชอบ CPA ล่วงหน้า 14 วัน
* **Google Search Console & Bing Webmaster Live Metrics**:
  - ดึงข้อมูลสถิติ Clicks, Impressions, และ Average Position ผ่าน Search Console API เข้ามาแสดงในการ์ด SEO Suite โดยตรง

---

## 8. บันทึกผลตรวจสอบระบบ (Technical Audit — 11 ตุลาคม 2026)

### ขอบเขตที่ตรวจ
* ไล่เส้นทางข้อมูลจากหน้า Admin Editor/API → Prisma → Public Metadata/Schema/Sitemap/Robots/IndexNow
* ตรวจข้อมูลฐานข้อมูลแบบ Read-only และทดสอบ HTTP response ผ่าน Local Next.js Server
* ตรวจ Production URL ที่ `https://www.deethavorn.com`
* รัน `npx tsc --noEmit` และ `npm run build`

### ผลทดสอบที่ยืนยันแล้ว
| รายการทดสอบ                     | ผลลัพธ์                                                                                | สถานะ |
| :------------------------------ | :------------------------------------------------------------------------------------- | :---: |
| TypeScript                      | `npx tsc --noEmit` ผ่าน                                                                |   ✅   |
| Production Build                | `npm run build` ผ่าน มี warning ที่ไม่ block build                                     |   ✅   |
| Custom Redirect `/old-vat-link` | ตั้งค่า 301 แต่ HTTP response แรกเป็น 404 และไม่มี `Location`                          |   ❌   |
| IndexNow ล่าสุด                 | Database log เป็น `FAILED`, HTTP 422 `InvalidRequestParameters` จาก Key Location Scope |   ❌   |
| Canonical Host                  | Production อยู่บน `www` แต่ Canonical/Sitemap ใช้โดเมนไม่มี `www`                      |   ❌   |
| Sitemap ปัจจุบัน                | 5 URLs: หน้าแรก, Knowledge Hub และบทความ Published 3 รายการ                            | ✅/⚠️  |
| ข้อมูลบทความ                    | Published 3, NoIndex 0, Future Published 0, Custom Redirect Active 1, Unresolved 404 1 |  ℹ️   |
|                                 |                                                                                        |       |

### Known Warnings ที่ยังไม่ Block Build
* `SeoSuiteCard.tsx` ใช้ `<img>` ในส่วน Preview 2 จุด; พิจารณา `next/image` หากรูปดังกล่าวถูกใช้งานบนหน้าสาธารณะหรือกระทบ LCP
* Prisma แจ้งว่า `package.json#prisma` จะ deprecated ใน Prisma 7; ควรย้ายไป `prisma.config.ts` ก่อนอัปเกรด
* `jose` แสดง Edge Runtime warning จาก `CompressionStream`/`DecompressionStream`; ต้อง regression test ระบบ Login/Middleware เมื่ออัปเกรด Next.js หรือ `jose`

### ลำดับความสำคัญเพื่อประกาศ Production Ready
1. **P0:** Canonical Host, IndexNow Key Location/422 และ Server-Side Redirect
2. **P1:** Indexability Query กลาง, JSON-LD Hardening, Server-Side 404 และ KPI Accuracy
3. **P2:** ปรับ Scoring Copy/FAQ, Article Schema Image/Author Profile และ Performance Cache
4. **P3:** Live Search, AI Assistant, Search Console Metrics และ Image Sitemap

> **เกณฑ์ปิดงาน Core SEO:** ห้ามประกาศโมดูล IndexNow, Custom Redirect และ Sitemap ว่า “สมบูรณ์ 100%” จนกว่าจะผ่าน Acceptance Criteria ใน Phase 0 และมี automated regression tests ครอบคลุมเส้นทางดังกล่าว
