# แผนสถาปัตยกรรมและข้อกำหนดการพัฒนาระบบ SEO Suite หลังบ้าน
## บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)
### โมเดลต้นแบบ: Rank Math SEO Suite (ปรับประยุกต์สู่ Native Next.js 15 & React 19)

> **เวอร์ชัน:** 1.5.0  
> **สถานะ:** ดำเนินการแล้วเสร็จระดับ Core Pillars (Active Implementation & Progress Tracking)  
> **อัปเดตล่าสุด:** 11 ตุลาคม 2026  
> **กลุ่มเป้าหมาย:** ระบบบริหารจัดการบทความ (CMS) และศูนย์ควบคุม SEO/AEO/GEO ดีถาวรการบัญชี  

---

## 📌 สรุปสถานะความคืบหน้าภาพรวม (Implementation Status Dashboard)

| โมดูล / ส่วนงาน                                             |   สถานะ    | สรุปสิ่งที่ทำเสร็จแล้ว                                                                                                                                                                | สิ่งที่ต้องทำต่อ                                                                   |
| :---------------------------------------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| **Pillar 1: ศูนย์ควบคุมภาพรวม SEO หลังบ้าน (`/admin/seo`)** | ✅ **90%**  | แดชบอร์ดสรุป KPI 5 ด้าน, แท็บวิเคราะห์สุขภาพ SEO รายบทความ, บันทึกเตือนทบทวนกฎหมาย E-E-A-T, เพิ่มเมนูใน Sidebar                                                                       | เชื่อมต่อ API ดึง Clicks/Impressions จาก Google Search Console โดยตรง              |
| **โมดูล Instant Indexing (IndexNow API ⚡)**                 | ✅ **100%** | เชื่อมต่อ IndexNow Protocol (Bing, Yandex, Seznam), ระบบยิงอัตโนมัติเมื่อกด Publish, แบบฟอร์ม Manual Ping, ปุ่ม Bulk Ping ทุกบทความ, ตาราง `indexing_logs`                            | — (พร้อมใช้งานบน Production เมื่อ Deploy)                                          |
| **โมดูล 301 Redirects Manager ⚠️**                          | ✅ **100%** | ตาราง `custom_redirects` และ `article_redirects`, UI สร้าง/ลบ Redirect (301/302), บันทึกยอดคนเข้า (Hits), ระบบดักจับและเปลี่ยนทางอัตโนมัติ                                            | รองรับการ Import/Export รายการ Redirect เป็น CSV                                   |
| **โมดูล 404 Error Monitor 🔍**                              | ✅ **100%** | ตาราง `error_logs_404`, ตัวดักจับในหน้า 404 บันทึก URL/Referrer/Hits, ปุ่ม One-Click **"แปลงเป็น 301 Redirect"** ได้ทันที                                                             | ตัวกรองแยกบอท Scraper ทั่วไป                                                       |
| **โมดูล XML Sitemap & Robots.txt 🗺️**                      | ✅ **100%** | Dynamic `/sitemap.xml` ดึงเฉพาะบทความ Published, Dynamic `/robots.txt` พร้อมเปิดรับ `OAI-SearchBot` และบล็อก `/admin/`, หน้า UI แสดงสถานะและปุ่ม Copy ลิงก์                           | เพิ่ม Image Sitemap สรุปรูปภาพในบทความ                                             |
| **Pillar 2: Focus Keyword & Scoring Engine ใน Editor**      | ✅ **100%** | คำนวณคะแนน 0–100 เรียลไทม์ 4 หมวด (Basic, Density, E-E-A-T, Readability), ตรวจสอบ Heading H2/H3, คำนวณความถี่คำค้นหา, บันทึก Alt Text                                                 | — (สมบูรณ์ 100%)                                                                   |
| **Social & SERP Previews**                                  | ✅ **100%** | กล่องจำลองผลลัพธ์เหมือนจริง: Google SERP (Desktop & Mobile), LINE Share Card, Facebook Feed                                                                                           | — (สมบูรณ์ 100%)                                                                   |
| **Rich Media & Synthetic HTML**                             | ✅ **100%** | อัปโหลดรูปภาพลงบทความ, บังคับ Alt Text สำหรับ Image SEO, เรนเดอร์เป็น Semantic `<figure class="article-figure">` และ `<figcaption>`                                                   | ปรับขนาดและบีบอัดรูปเป็น WebP อัตโนมัติในฝั่ง Server                               |
| **Public Knowledge Hub UX (`/knowledge`)**                  | ✅ **85%**  | หน้ารวมบทความพร้อมแท็บหมวดหมู่, รูปหน้าปก 16:9 และ Gradient Fallback, หน้าอ่านบทความมี Breadcrumbs, Quick Answer (BLUF สำหรับ AEO), TOC, Citations, FAQ, CPA Author, Related Articles | เพิ่ม **Live Search Bar** (ช่องค้นหาบทความ) และหน้า **`/authors/[slug]`**          |
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
| **ความปลอดภัย (Security)** | เสี่ยงต่อช่องโหว่ของปลั๊กอิน PHP และ WP Core | ปลอดภัยสูง Static/Edge Rendering ไม่มีช่องโหว่ปลั๊กอินภายนอก | ✅ ใช้งานจริง |
| **Focus Keyword Scoring** | มี Checklist ตรวจคำค้นหา 0–100 คะแนน | นำมาเขียนเป็น TypeScript Engine ทำงานเรียลไทม์ในหน้า Editor | ✅ ใช้งานจริง |
| **Schema Generator** | Schema พื้นฐานทั่วไป (Article, FAQ, HowTo) | Schema ระดับองค์กรผูก E-E-A-T (CPA Credentials, TFAC License, SameAs) | ✅ ใช้งานจริง |
| **Instant Indexing** | ปลั๊กอิน IndexNow ส่งไปยัง Bing / Yandex | Webhook อัตโนมัติเมื่อ Publish + ปุ่ม Bulk Ping ส่ง Bing/Yandex ทันที | ✅ ใช้งานจริง |
| **การจัดการ Redirect 301** | เก็บในฐานข้อมูล WordPress `wp_options` | เก็บในตาราง `custom_redirects` และ `article_redirects` | ✅ ใช้งานจริง |
| **404 Monitor** | บันทึกผ่านปลั๊กอิน เพิ่มภาระฐานข้อมูล | บันทึกผ่าน Next.js Route + ปุ่มแปลงเป็น 301 ในคลิกเดียว | ✅ ใช้งานจริง |
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

### โมดูลที่ 1: Instant Indexing (IndexNow API) ⚡ [✅ เสร็จสมบูรณ์]
* **หน้าที่:** แจ้งเตือน Search Engine (Bing, Naver, Seznam, Yandex) ให้เข้ามาเก็บข้อมูลหน้าเว็บทันทีที่มีการเพิ่ม แก้ไข หรือเผยแพร่บทความ โดยไม่ต้องรอรอบการ Crawl ปกติ
* **สิ่งที่ทำเสร็จแล้ว:**
  - สร้างไฟล์ IndexNow API Key Endpoint ที่ `/api/indexnow` สำหรับให้ Crawler ยืนยันตัวตน
  - ส่งคำขออัตโนมัติทันทีที่บทความถูกกด `PUBLISHED` ใน `/api/admin/articles/[id]/publish`
  - มีกล่องฟอร์ม **Manual Ping** ให้แอดมินพิมพ์ส่ง URL เดี่ยวเข้า Search Engine ได้ทันที
  - มีปุ่ม **"ยิง IndexNow ทุกบทความ (Bulk Ping)"** สำหรับส่งบทความทั้งหมดที่เผยแพร่ในคราวเดียว
  - บันทึกประวัติและผลตอบรับลงตาราง `indexing_logs` พร้อมเวลาและสถานะ
* **สิ่งที่ต้องทำต่อ:**
  - เมื่อนำขึ้น Production Domain (`deethavorn.com`) ระบบจะเริ่มได้รับการยืนยันสถานะ HTTP 200/202 จาก Microsoft Bing ทันที

### โมดูลที่ 2: 301 Redirections Manager ⚠️ [✅ เสร็จสมบูรณ์]
* **หน้าที่:** จัดการลิงก์เปลี่ยนผ่าน (`Source URL ➔ Target URL`) ป้องกันผู้ใช้เจอหน้าว่าง และส่งต่อคะแนน SEO (PageRank) ไปยังหน้าใหม่
* **สิ่งที่ทำเสร็จแล้ว:**
  - สร้างตาราง `custom_redirects` รองรับทั้ง 301 Permanent และ 302 Temporary
  - เชื่อมโยงกับ `article_redirects` ที่ระบบสร้างให้อัตโนมัติเมื่อมีการแก้ไข Article Slug
  - มีหน้าจอ Modal สร้าง Redirect ใหม่ และตารางแสดงรายการพร้อมจำนวนยอดคลิกเข้าใช้งาน (Hits)
  - ระบบตรวจสอบ Redirect อัตโนมัติใน `/api/seo/log-404` และสั่งเปลี่ยนทางแบบ 301 ทันที
* **สิ่งที่ต้องทำต่อ:**
  - ฟังก์ชัน Import/Export รายการ Redirect ในรูปแบบไฟล์ CSV

### โมดูลที่ 3: 404 Broken Link Monitor 🔍 [✅ เสร็จสมบูรณ์]
* **หน้าที่:** ตรวจจับลิงก์ที่ผู้ใช้หรือบอทเปิดเข้ามาแล้วไม่พบหน้า (HTTP 404) พร้อมหน้าจอสร้าง 301 Redirect ชี้ไปยังหน้าที่ถูกต้อง
* **สิ่งที่ทำเสร็จแล้ว:**
  - สร้างตาราง `error_logs_404` บันทึก URL, Referrer (ที่มา), จำนวนครั้ง (Hits), วันที่พบ และสถานะการแก้ไข
  - สร้างคอมโพเนนต์ `NotFoundTracker.tsx` ฝังในหน้า [src/app/not-found.tsx](file:///d:/WebApp/Deethavorn/src/app/not-found.tsx) เพื่อบันทึกสถิติ 404 อัตโนมัติ
  - เพิ่มปุ่มแอ็กชัน **"แปลงเป็น 301 Redirect"** ในตาราง 404: เมื่อคลิกจะเปิด Modal กรอก URL ปลายทาง และสร้าง 301 Redirect พร้อมปรับสถานะเป็น "แก้ไขแล้ว" ในคลิกเดียว
* **สิ่งที่ต้องทำต่อ:**
  - ตัวกรองตรวจจับ Scraper หรือ Bot ที่ยิงสุ่มหาไฟล์ `.php` หรือ `.env` เพื่อไม่ให้รบกวนสถิติจริง

### โมดูลที่ 4: XML Sitemap & Crawl Policy Manager 🗺️ [✅ เสร็จสมบูรณ์]
* **หน้าที่:** ควบคุมแผนผังเว็บไซต์ `/sitemap.xml` และนโยบายบอทใน `/robots.txt`
* **สิ่งที่ทำเสร็จแล้ว:**
  - พัฒนา [src/app/sitemap.ts](file:///d:/WebApp/Deethavorn/src/app/sitemap.ts) ดึงเฉพาะหน้าหลักและบทความที่เป็น `PUBLISHED` โดยอัตโนมัติ
  - พัฒนา [src/app/robots.ts](file:///d:/WebApp/Deethavorn/src/app/robots.ts) อนุญาต Googlebot, Bingbot, และ `OAI-SearchBot` สำหรับการค้นพบใน ChatGPT Search พร้อมบล็อก `/admin/` และ `/api/`
  - หน้า UI สรุปจำนวน URLs ใน Sitemap, กล่องแสดง URL พร้อมปุ่ม Copy และปุ่มเปิดดูไฟล์
  - เพิ่มทางลัดเปิดเครื่องมือตรวจสอบภายนอก: **Google Rich Results Test**, **Google Search Console**, และ **Bing Webmaster Tools**
* **สิ่งที่ต้องทำต่อ:**
  - เพิ่ม `Image Sitemap Tags` สำหรับระบุ URL รูปภาพประกอบบทความเพื่อเร่งการติด Google Image Search

### โมดูลที่ 5: Content AI & AEO Generator (Google AI Overviews) 🤖 [⏳ สิ่งที่ต้องทำต่อ]
* **หน้าที่:** ผู้ช่วยปัญญาประดิษฐ์สำหรับการปรับแต่งคำค้นหาและโครงสร้างคำตอบ
* **สิ่งที่วางแผนไว้:**
  - ปุ่มสร้าง SEO Title และ Meta Description 3 รูปแบบให้เลือก
  - ปุ่มสรุปเนื้อหาเป็น **Quick Answer 1 นาที** เพื่อให้ติดอันดับในกล่องคำตอบ AI
  - ฟังก์ชันแนะนำ Secondary Keywords จากประเด็นเนื้อหา

---

## 5. รายละเอียด Pillar 2: ระบบวิเคราะห์ Focus Keyword ในหน้า Editor [✅ เสร็จสมบูรณ์ 100%]

เมื่อเปิดหน้าแก้ไขบทความ (`/admin/articles/[id]`) แถบ **SEO & AEO** จะคำนวณคะแนนแบบเรียลไทม์ 0–100 คะแนน:

### เกณฑ์การตรวจจับและให้คะแนน (Scoring Algorithm - 100 คะแนนเต็ม)

#### 1. Basic SEO (40 คะแนน)
* 🟢 **Focus Keyword in Title (10 คะแนน):** ตรวจจับคำค้นหาเป้าหมายในหัวข้อบทความ
* 🟢 **Focus Keyword in Meta Description (10 คะแนน):** ตรวจจับคำค้นหาในบทสรุปย่อ (ความยาวเหมาะสม 70–175 ตัวอักษร)
* 🟢 **Focus Keyword in URL Slug (10 คะแนน):** ตรวจจับคำค้นหา (ภาษาไทยหรืออังกฤษ) อยู่ใน URL Slug
* 🟢 **Focus Keyword in First 10% (10 คะแนน):** ตรวจจับคำค้นหาปรากฏในย่อหน้าแรกของเนื้อหา

#### 2. Additional SEO & Keyword Density (30 คะแนน)
* 🟢 **Focus Keyword in Headings (10 คะแนน):** ตรวจจับคำค้นหาในหัวข้อย่อยระดับ `## (H2)` หรือ `### (H3)` อย่างน้อย 1 จุด
* 🟢 **Keyword Density (10 คะแนน):** คำนวณสัดส่วนความถี่ของคำค้นหาในเนื้อหา อยู่ระหว่าง **0.8% ถึง 2.0%** (ไม่น้อยเกินไปและไม่เป็นการสแปมคำ - Keyword Stuffing)
* 🟢 **Focus Keyword in Image Alt (10 คะแนน):** ตรวจสอบว่ามีรูปภาพหน้าปกหรือรูปภาพประกอบในเนื้อหาที่มี Focus Keyword อยู่ในคำอธิบายรูป (Alt Text)

#### 3. E-E-A-T & Content Authority (ดีถาวร Special - 20 คะแนน)
* 🟢 **Legal & Official Citations (10 คะแนน):** มีการระบุแหล่งอ้างอิงทางกฎหมาย (เช่น ลิงก์ไปยังประมวลรัษฎากร กรมสรรพากร หรือสภาวิชาชีพบัญชี) อย่างน้อย 1 รายการ
* 🟢 **Editorial Governance (10 คะแนน):** มีการระบุผู้เขียนบทความ และมีผู้สอบบัญชี CPA/TA ตรวจสอบความถูกต้อง พร้อมกำหนดวันทบทวนกฎหมายรอบถัดไป

#### 4. Readability & Structure (10 คะแนน)
* 🟢 **Content Length (5 คะแนน):** ความยาวเนื้อหาบทความเกิน 600 คำขึ้นไปสำหรับเนื้อหาเชิงลึก
* 🟢 **FAQ Section (5 คะแนน):** มีกล่องถาม-ตอบ (FAQs) อย่างน้อย 2 ข้อ เพื่อรองรับ Rich Results

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

### ✅ สิ่งที่ทำเสร็จแล้วสมบูรณ์ (Completed)
1. **Pillar 2: In-Editor SEO Scoring & Inspector (`/admin/articles/[id]`)**
   - คำนวณคะแนน SEO 0–100 แบบเรียลไทม์ตามเกณฑ์ 4 หมวด
   - กล่องพรีวิว Google SERP (Desktop/Mobile), LINE Card, และ Facebook Feed
   - Toolbar จัดการ Markdown พร้อมปุ่มใส่รูปภาพประกอบและ Modal อัปโหลดไฟล์ + บังคับ Alt Text
   - เรนเดอร์รูปภาพในเนื้อหาเป็น `<figure>` และ `<figcaption>` สวยงาม
   - จัด Alignment แท็บด้านบนไม่ให้ตกบรรทัด และป้ายคะแนน SEO Score แนวนอน

2. **Pillar 1: ศูนย์ควบคุมภาพรวม SEO หลังบ้าน (`/admin/seo`)**
   - เมนู "ศูนย์ควบคุม SEO" บน Sidebar พร้อมไอคอน Globe
   - การ์ดสรุปสถิติสำคัญ 5 ด้าน (Average Score, IndexNow Pings, 301 Redirects, 404 Errors, Sitemap URLs)
   - Tab 1: ตารางตรวจสอบสุขภาพ SEO รายบทความ พร้อมป้ายสถานะและแจ้งเตือนทบทวนข้อกฎหมาย (Review Due Alert)
   - Tab 2: ระบบ Instant Indexing (IndexNow) พร้อมฟอร์ม Manual Ping, ปุ่ม Bulk Ping, และตาราง `indexing_logs`
   - Tab 3: ระบบจัดการ 301 Redirects พร้อม Modal สร้างเส้นทางใหม่ และตารางบันทึกยอดคลิก (Hits)
   - Tab 4: ระบบ 404 Monitor ดักจับลิงก์เสีย พร้อมปุ่ม One-Click "แปลงเป็น 301 Redirect"
   - Tab 5: ตรวจสอบ Dynamic Sitemap `/sitemap.xml` และ Robots Policy `/robots.txt` พร้อมทางลัด Rich Results Test

3. **Public Front-end Knowledge Hub (`/knowledge` & `/knowledge/[slug]`)**
   - หน้ารวมบทความพร้อมแท็บหมวดหมู่ และการ์ดบทความมีภาพหน้าปก 16:9 + Gradient Fallback
   - หน้าอ่านบทความมี Banner รูปหน้าปก, Breadcrumbs, Quick Answer (BLUF สำหรับ AEO), TOC, Citations, FAQ, CPA Author, CTA นำสู่ Lead และ Related Articles
   - โครงสร้างข้อมูล Schema.org JSON-LD (`Article`, `BreadcrumbList`, `FAQPage`)
   - ระบบ Smart Redirect สำหรับสิทธิ์ `EDITOR` เข้าถึงเฉพาะส่วนงานบทความโดยตรง

---

### ⏳ สิ่งที่ต้องทำต่อในระยะถัดไป (Remaining Roadmap)

#### ระยะที่ 1: การยกระดับประสบการณ์ผู้ใช้งานหน้าบ้าน (Front-end UX)
* **ช่องค้นหาบทความแบบเรียลไทม์ (Live Search Bar) บนหน้า `/knowledge`**:
  - เพิ่มช่อง Search สำหรับค้นหาบทความด้วย Title หรือ Keyword แบบพิมพ์แล้วกรองการ์ดบทความทันที
* **หน้าโปรไฟล์ผู้เขียนและผู้ตรวจทานสาธารณะ (`/authors/[slug]`)**:
  - สร้างหน้าประวัติผู้เขียน แสดงวุฒิการศึกษา เลขทะเบียนวิชาชีพ CPA/TA และรวมบทความที่บุคคลนั้นเขียนหรือตรวจทาน เพื่อยกระดับความน่าเชื่อถือตามเกณฑ์ Google E-E-A-T ขั้นสูงสุด

#### ระยะที่ 2: ระบบผู้ช่วยอัจฉริยะ AI Content & AEO Assistant
* **ปุ่ม Gemini / AI Suggestions ในหน้า Editor**:
  - ปุ่ม 1 คลิกให้ AI ช่วยวิเคราะห์เนื้อหาและแนะนำ **Focus Keyword** ที่ตรงจุด
  - ปุ่มสร้าง **Meta Description** อัตโนมัติ 3 รูปแบบให้เลือกคลิกนำไปใช้
  - ปุ่มสรุปเนื้อหาเป็น **Quick Answer (1 นาที)** สำหรับกล่องคำตอบ Google AI Overviews

#### ระยะที่ 3: ระบบแจ้งเตือนทางอีเมลและการเชื่อมต่อ Search Console (Operational Monitoring)
* **ระบบแจ้งเตือนทบทวนกฎหมาย (Email Notification)**:
  - สคริปต์ตรวจจับบทความที่ใกล้ถึง `nextReviewAt` และส่งอีเมลแจ้งเตือนผู้รับผิดชอบ CPA ล่วงหน้า 14 วัน
* **Google Search Console & Bing Webmaster Live Metrics**:
  - ดึงข้อมูลสถิติ Clicks, Impressions, และ Average Position ผ่าน Search Console API เข้ามาแสดงในการ์ด SEO Suite โดยตรง
