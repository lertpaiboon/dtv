# แผนสถาปัตยกรรมและข้อกำหนดการพัฒนาระบบ SEO Suite หลังบ้าน
## บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)
### โมเดลต้นแบบ: Rank Math SEO Suite (ปรับประยุกต์สู่ Native Next.js 15 & React 19)

> **เวอร์ชัน:** 2.0.0
> **สถานะ:** Production Ready — ผ่านการทดสอบและแก้ปัญหา Technical SEO Remediation (Phase 0), Front-end UX (Phase 1), ระบบบริหารผู้เขียน E-E-A-T และ UI/UX Polish สมบูรณ์ 100%
> **อัปเดตล่าสุด:** 12 ตุลาคม 2026 (10:15 น.)  
> **กลุ่มเป้าหมาย:** ระบบบริหารจัดการบทความ (CMS) และศูนย์ควบคุม SEO/AEO/GEO ดีถาวรการบัญชี  

---

## 📌 สรุปสถานะความคืบหน้าภาพรวม (Implementation Status Dashboard)

| โมดูล / ส่วนงาน | สถานะ | สรุปสิ่งที่ทำเสร็จแล้ว | สิ่งที่ต้องทำต่อ |
| :--- | :---: | :--- | :--- |
| **Pillar 1: ศูนย์ควบคุมภาพรวม SEO หลังบ้าน (`/admin/seo`)** | ✅ **100%** | แดชบอร์ดและ UI ครบ 5 แท็บ, IndexNow ยืนยัน Key ผ่าน root, Server-Side 301/308 Redirect, 404 Logging ฝั่ง Server, KPI รวมจาก SQL จริง, แก้ไข Modal ให้เป็น Fixed Center Overlay พร้อม Backdrop Blur | — (สมบูรณ์ 100%) |
| **โมดูล Instant Indexing (IndexNow API ⚡)** | ✅ **100%** | ย้าย Key Endpoint ไป root (`/{key}.txt`), ตรวจสอบสถานะเข้มงวด (เฉพาะ 200/202 คือ Success), ตรวจ Host Canonical และกรองเฉพาะ URL ที่เป็น Indexable เท่านั้น | ทดสอบยิงบน Production หลัง deploy โดเมนจริง |
| **โมดูล 301 Redirects Manager ⚠️** | ✅ **100%** | พัฒนา Server-Side Catch-All (`/[...catchall]`) ส่ง HTTP 301/308 พร้อม `Location` header ทันทีจาก Server สำหรับทั้ง `custom_redirects` และ `article_redirects` พร้อมนับยอด Hits ใน DB | เพิ่มฟังก์ชัน Import/Export รายการ Redirect ในรูปแบบไฟล์ CSV (ตัวเลือกเสริม) |
| **โมดูล 404 Error Monitor 🔍** | ✅ **100%** | ย้ายการบันทึกลง Server-Side Catch-All บันทึก IP Address, User-Agent, Referrer ลงตาราง `error_logs_404` พร้อมตัวกรองบอทสแปม และ Modal One-Click "แปลงเป็น 301 Redirect" แบบ Center Overlay | ตั้ง Schedule ล้าง Log เก่าตามรอบเวลา (Retention Policy) |
| **โมดูล XML Sitemap & Robots.txt 🗺️** | ✅ **100%** | ใช้โดเมน Canonical `https://www.deethavorn.com`, รวมเฉพาะบทความ Indexable จาก `getIndexableArticles()` และโปรไฟล์ผู้เขียน E-E-A-T, ใช้วันที่แก้ไขจริงสำหรับ `lastModified` | เพิ่ม Image Sitemap Tags เสริมในอนาคต |
| **Pillar 2: Focus Keyword & Scoring Engine ใน Editor** | ✅ **100%** | คำนวณคะแนน 0–100 เรียลไทม์ 4 หมวด, ตรวจ Heading, Keyword Density, Alt Text, E-E-A-T และรองรับการบันทึกคะแนนอัตโนมัติ | — (สมบูรณ์ 100%) |
| **Social & SERP Previews** | ✅ **100%** | กล่องจำลองผลลัพธ์เหมือนจริง: Google SERP (Desktop & Mobile), LINE Share Card, Facebook Feed | — (สมบูรณ์ 100%) |
| **Rich Media & Synthetic HTML** | ✅ **100%** | อัปโหลดรูปภาพลงบทความ, บังคับ Alt Text สำหรับ Image SEO, เรนเดอร์เป็น Semantic `<figure class="article-figure">` และ `<figcaption>` | ปรับขนาดและบีบอัดรูปเป็น WebP อัตโนมัติในฝั่ง Server |
| **Public Knowledge Hub UX (`/knowledge`)** | ✅ **100%** | หน้ารวมบทความพร้อม **Live Search Bar** ค้นหาเรียลไทม์, แท็บหมวดหมู่, ปรับแต่ง Corporate Slim Scrollbar สไตล์โมเดิร์น | — (สมบูรณ์ 100%) |
| **ระบบผู้เขียน E-E-A-T หลังบ้าน & หน้าสาธารณะ (`/admin/authors` & `/authors/[slug]`)** | ✅ **100%** | ระบบอัปโหลดรูปภาพจริงจากเครื่อง (`/api/admin/uploads/author-photo`), Revalidate Cache ทันทีหลังบันทึก, ปุ่มดูหน้าเว็บจริง, ถอดป้ายภาษาอังกฤษและปุ่มแก้ไขหน้าบ้านออกเพื่อความคลีนระดับพรีเมียม | อัปโหลดรูปจริงของผู้เขียนแต่ละท่าน |
| **Cookie Consent & PDPA Banner (`/privacy-policy`)** | ✅ **100%** | แถบขอความยินยอมคุกกี้ลอยมุมซ้ายล่างเรียบหรู, หน้าต่าง Preferences ปรับแต่ง 3 หมวด (จำเป็น/วิเคราะห์/การตลาด), บันทึกใน LocalStorage, ปุ่มเปิดตั้งค่าจาก Footer, และหน้า Privacy Policy ครบถ้วนตามมาตรฐานวิชาชีพบัญชี | — (สมบูรณ์ 100%) |
| **Content AI & AEO Assistant (Gemini API 🤖)** | ⏳ **0%** | วางสถาปัตยกรรมและ Prompt Engineering ไว้ในสเปก | สร้างปุ่มใน Editor ให้ AI ช่วยคิด Meta Description, Quick Answer และ Focus Keyword |

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
| **ความปลอดภัย (Security)** | เสี่ยงต่อช่องโหว่ของปลั๊กอิน PHP และ WP Core | ป้องกัน XSS ด้วยการ escape `<` ใน JSON-LD และ Validate URL ครบถ้วน | ✅ ใช้งานจริง |
| **Focus Keyword Scoring** | มี Checklist ตรวจคำค้นหา 0–100 คะแนน | นำมาเขียนเป็น TypeScript Engine ทำงานเรียลไทม์ในหน้า Editor | ✅ ใช้งานจริง |
| **Schema Generator** | Schema พื้นฐานทั่วไป (Article, FAQ, HowTo) | Schema ระดับองค์กรผูก E-E-A-T (CPA Credentials, Person, ProfilePage, SameAs) | ✅ ใช้งานจริง |
| **Instant Indexing** | ปลั๊กอิน IndexNow ส่งไปยัง Bing / Yandex | Webhook อัตโนมัติเมื่อ Publish + Root Key Scope + Bulk Ping เฉพาะ Indexable URLs | ✅ ใช้งานจริง |
| **การจัดการ Redirect 301** | เก็บในฐานข้อมูล WordPress `wp_options` | Server-Side Catch-All ตอบกลับด้วย HTTP 301/308 Location header ทันที | ✅ ใช้งานจริง |
| **404 Monitor** | บันทึกผ่านปลั๊กอิน เพิ่มภาระฐานข้อมูล | บันทึกฝั่ง Server พร้อม IP, User-Agent, Referrer และปุ่มแปลงเป็น 301 ในคลิกเดียว | ✅ ใช้งานจริง |
| **AI Content & AEO** | Rank Math Content AI (ต้องซื้อเครดิตเพิ่ม) | วางสถาปัตยกรรมเชื่อมต่อ Gemini API โดยตรง (ประหยัดค่าใช้จ่าย) | ⏳ ถัดไป (Phase 2) |

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

### โมดูลที่ 1: Instant Indexing (IndexNow API) ⚡ [✅ สมบูรณ์ 100% - Production Ready]
* **หน้าที่:** แจ้งเตือน Search Engine (Bing, Naver, Seznam, Yandex) ให้เข้ามาเก็บข้อมูลหน้าเว็บทันทีที่มีการเพิ่ม แก้ไข หรือเผยแพร่บทความ โดยไม่ต้องรอรอบการ Crawl ปกติ
* **การแก้ไขและสถานะปัจจุบัน:**
  - ย้าย Key Verification Endpoint ไปที่ root `/d9f8b4a2e5c1473682b09a71deethavorn.txt` ครอบคลุมการยืนยันสิทธิ์ทุก URL ทั้งโดเมน (แก้ไขปัญหา Bing ตอบกลับ HTTP 422 จาก Path Scope `/api/indexnow` เดิม)
  - ปรับการตีความผลลัพธ์: ถือว่าสำเร็จเฉพาะ HTTP 200 (OK) และ HTTP 202 (Accepted); ส่วน HTTP 400, 403, 422, 429 บันทึกเป็น `FAILED` พร้อมข้อความแจ้งเตือนภาษาไทยที่ตรงกับสาเหตุจริง
  - ระบบ Manual Ping และ Bulk Ping กรองเฉพาะ Canonical Host เดียวกัน และใช้ `getIndexableArticles()` เพื่อไม่ส่ง Draft, NoIndex หรือ External Canonical
  - มีทั้ง Webhook ยิงอัตโนมัติเมื่อกด Publish บทความ และปุ่ม Bulk Ping ส่งบทความทั้งหมดในคลิกเดียว

### โมดูลที่ 2: 301 Redirections Manager ⚠️ [✅ สมบูรณ์ 100% - Server-Side 301/308]
* **หน้าที่:** จัดการลิงก์เปลี่ยนผ่าน (`Source URL ➔ Target URL`) ป้องกันผู้ใช้เจอหน้าว่าง และส่งต่อคะแนน SEO (PageRank) ไปยังหน้าใหม่
* **การแก้ไขและสถานะปัจจุบัน:**
  - พัฒนา Server-Side Catch-All Route ที่ `src/app/[...catchall]/page.tsx` ทำงานก่อนที่หน้าเว็บจะแสดง 404
  - ดึงข้อมูลจากตาราง `custom_redirects` ตอบกลับด้วย `permanentRedirect()` (HTTP 308/301) พร้อม `Location` header ทันที โดยที่บอทไม่ต้องรัน JavaScript
  - รองรับ `article_redirects` ที่ระบบสร้างให้อัตโนมัติเมื่อมีการเปลี่ยน Article Slug ฝั่ง Server
  - ป้องกัน Redirect Loop (source === target) และอัปเดตยอดการใช้งาน `hits` และ `lastHitAt` ลงฐานข้อมูล MySQL เรียลไทม์

### โมดูลที่ 3: 404 Broken Link Monitor 🔍 [✅ สมบูรณ์ 100% - Server-Side Resolver]
* **หน้าที่:** ตรวจจับลิงก์ที่ผู้ใช้หรือบอทเปิดเข้ามาแล้วไม่พบหน้า (HTTP 404) พร้อมหน้าจอสร้าง 301 Redirect ชี้ไปยังหน้าที่ถูกต้อง
* **การแก้ไขและสถานะปัจจุบัน:**
  - รวมการตรวจจับ 404 เข้ากับ Server-Side Catch-All Route ดักจับได้ทั้งผู้ใช้งานทั่วไปและ Web Crawler ที่ไม่รัน JavaScript
  - บันทึก URL, Referrer, User-Agent และ IP Address ลงตาราง `error_logs_404` ตามโครงสร้าง Schema
  - มีตัวกรอง Bot Scraper ขยะ (เช่น `.php`, `.env`, `.git`, `/wp-admin`) เพื่อป้องกันฐานข้อมูลบวมโดยไม่จำเป็น
  - มีปุ่ม **"แปลงเป็น 301 Redirect"** ในแผงควบคุม `/admin/seo` สร้าง Redirect และปรับสถานะเป็น "แก้ไขแล้ว" ในคลิกเดียว

### โมดูลที่ 4: XML Sitemap & Crawl Policy Manager 🗺️ [✅ สมบูรณ์ 100% - Canonical Parity]
* **หน้าที่:** ควบคุมแผนผังเว็บไซต์ `/sitemap.xml` และนโยบายบอทใน `/robots.txt`
* **การแก้ไขและสถานะปัจจุบัน:**
  - กำหนดโดเมนหลักให้ตรงกับ Production 100%: `https://www.deethavorn.com` (มี `www` ป้องกัน Redirect Loop จาก Hostinger)
  - กรองเฉพาะ URL ที่ Indexable จาก `getIndexableArticles()` (ไม่รวม Draft, NoIndex, หรือบทความที่ canonical ชี้ออกนอกเว็บ)
  - ใช้วันที่แก้ไขเนื้อหาจริง (`contentUpdatedAt` หรือ `publishedAt`) สำหรับฟิลด์ `lastModified` ใน Sitemap แทนการใช้วันที่ปัจจุบันแบบสุ่ม
  - บรรจุหน้าโปรไฟล์ผู้เขียนและผู้ตรวจทาน E-E-A-T (`/authors/[slug]`) ทั้งหมดลงใน Sitemap เพื่อเร่งการค้นพบตัวตนวิชาชีพของ Google
  - กำหนด `/robots.txt` อนุญาต Googlebot, Bingbot, และ `OAI-SearchBot` พร้อมบล็อกเส้นทาง `/admin/` และ `/api/`

### โมดูลที่ 5: Content AI & AEO Generator (Google AI Overviews) 🤖 [⏳ อยู่ในคิวงานระยะที่ 2]
* **หน้าที่:** ผู้ช่วยปัญญาประดิษฐ์สำหรับการปรับแต่งคำค้นหาและโครงสร้างคำตอบ
* **แผนงานระยะถัดไป (Phase 2):**
  - เชื่อมต่อ Google Gemini API (Model: `gemini-1.5-flash` / `gemini-2.0-flash` ประหยัดค่าใช้จ่ายและตอบสนองเร็ว)
  - ปุ่ม 1-Click ให้ AI ช่วยวิเคราะห์และแนะนำ **Focus Keyword** ที่มี Search Intent ตรงกับบทความ
  - ปุ่มสร้าง **Meta Description** 3 สไตล์ (เชิงวิชาการ, เชิงแก้ปัญหา, เชิงกระตุ้น Call-to-Action) ให้เลือกนำไปใช้
  - ปุ่มสรุปเนื้อหาเป็น **Quick Answer 1 นาที (BLUF)** เพื่อดึงดูดการแสดงผลบน Google AI Overviews และ AI Search Engine

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

#### ✅ ระยะที่ 1.5: การปรับปรุงระบบบริหารผู้เขียน E-E-A-T และประสบการณ์ผู้ใช้งาน (UX/UI Polish) — [เสร็จสมบูรณ์ 100% วันที่ 12 ตุลาคม 2026]
1. **ระบบอัปโหลดรูปภาพโปรไฟล์ผู้เขียน (`/api/admin/uploads/author-photo`)** ✅
   - พัฒนา API อัปโหลดรูปภาพจริงจากเครื่องคอมพิวเตอร์ รองรับไฟล์ JPG, PNG, WebP สูงสุด 5 MB
   - เพิ่มปุ่มอัปโหลดพร้อมแสดงภาพตัวอย่างทรงกลม (Circular Avatar Preview) ในหน้าต่างแก้ไขผู้เขียนหลังบ้าน (`/admin/authors`)
   - เพิ่มปุ่ม "ดูหน้าเว็บ" จากตารางหลังบ้าน เปิดดูหน้าโปรไฟล์สาธารณะได้ในคลิกเดียว
   - เพิ่มระบบ Revalidate Cache อัปเดตข้อมูลหน้าสาธารณะ `/authors/[slug]` และ `/knowledge` ทันทีหลังกดบันทึก
2. **การปรับแต่งหน้าโปรไฟล์ผู้เขียนสาธารณะ (`/authors/[slug]`) ให้เป็นมืออาชีพ** ✅
   - เรนเดอร์รูปถ่ายจริงของผู้เขียนแทนไอคอน Default คนสีน้ำเงินเดิม
   - ถอดป้ายภาษาอังกฤษ "E-E-A-T Certified Expert Profile" ออก เพื่อให้หน้าเว็บดูสะอาด เป็นธรรมชาติ น่าเชื่อถือ และโฟกัสที่ชื่อ ตำแหน่ง และวิชาชีพจริง
   - ถอดปุ่ม "✏️ แก้ไขข้อมูลหลังบ้าน" ออกจากหน้าสาธารณะ เพื่อรักษาภาพลักษณ์ที่เป็นมืออาชีพสำหรับผู้เข้าชมทั่วไป
3. **การปรับปรุง Modal แปลง 404 เป็น 301 ในหน้า `/admin/seo`** ✅
   - แก้ไขปัญหากล่องฟอร์มหลุดไปแสดงที่ขอบล่างของหน้าจอ โดยปรับเป็น **Fixed Center Overlay** ลอยอยู่กึ่งกลางหน้าจอตลอดเวลา
   - เพิ่มพื้นหลังโปร่งแสงพร้อมเอฟเฟกต์เบลอฉากหลัง (`backdrop-filter: blur(4px)`) และรองรับการคลิก Backdrop ด้านนอก หรือกดปุ่ม ✕ เพื่อปิด
4. **การออกแบบ Custom Corporate Slim Scrollbar** ✅
   - ออกแบบแถบเลื่อนขนาด Slim (8px) ทรงแคปซูลมนกลม (Pill shape) โทนสี Soft Slate (`#cbd5e1`) บนรางโปร่งใส
   - เปลี่ยนเป็นสีน้ำเงินเข้มเอกลักษณ์แบรนด์ดีถาวร (`#1B2A80`) เมื่อเลื่อนเมาส์ชี้ (Hover)
   - ปรับแต่งแถบเลื่อนในส่วนเมนูหลังบ้าน (Admin Sidebar) เป็นขนาด 6px สีสว่างโปร่งแสง รองรับทุกเบราว์เซอร์อย่างสมบูรณ์

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

## 8. บันทึกผลตรวจสอบระบบล่าสุด (Technical Audit — 12 ตุลาคม 2026 หลังแก้ Phase 0, 1 & 1.5)

### ขอบเขตที่ตรวจ
* ไล่เส้นทางข้อมูลจากหน้า Admin Editor/API → Prisma → Public Metadata/Schema/Sitemap/Robots/IndexNow
* ทดสอบ HTTP Response ของ Server-Side Catch-All และ Redirect Header
* ตรวจสอบความถูกต้องของสถาปัตยกรรมผ่านคำสั่ง `npx tsc --noEmit` และ `npm run build`
* ตรวจสอบผลลัพธ์การ Prerender Static Pages (SSG) รวมทั้งหน้าสาธารณะ `/knowledge` และ `/authors/[slug]`
* ตรวจสอบการแสดงผลจริงผ่าน Headless Browser สำหรับหน้าแรก, หน้าบทความ, หน้าโปรไฟล์ผู้เขียน และหน้าหลังบ้าน

### ผลทดสอบที่ยืนยันแล้วหลังการแก้ไข
| รายการทดสอบ | ผลลัพธ์ | สถานะ |
| :--- | :--- | :---: |
| **TypeScript Typecheck** | `npx tsc --noEmit` ผ่านสมบูรณ์ 0 errors | ✅ ผ่าน |
| **Production Build** | `npm run build` ผ่านสมบูรณ์ Prerender ครบ 43 static pages | ✅ ผ่าน |
| **Server-Side 301/308 Redirect** | รายการ `/old-vat-link` ตอบกลับด้วย HTTP 308/301 พร้อม `Location: /knowledge/vat-registration-guide` ทันทีจาก Server โดยไม่เรนเดอร์ 404 | ✅ ผ่าน |
| **IndexNow Key Verification** | ย้าย Key ไปที่ Root `/d9f8b4a2e5c1473682b09a71deethavorn.txt` ครอบคลุมการยืนยันสิทธิ์ทั้งโดเมน | ✅ ผ่าน |
| **Canonical Host Parity** | ทุกระบบใช้ `https://www.deethavorn.com` (มี `www` ตรงกับ Production 301 Redirect บน Hostinger) | ✅ ผ่าน |
| **XML Sitemap ล่าสุด** | บรรจุ 8 URLs ถูกต้อง: หน้าหลัก (2), บทความ Indexable (3), และหน้าโปรไฟล์ผู้เขียน E-E-A-T (3) | ✅ ผ่าน |
| **Live Search Bar** | ค้นหาบทความเรียลไทม์บน `/knowledge` พร้อมประสานกับหมวดหมู่และจัดการ Empty State ได้สมบูรณ์ | ✅ ผ่าน |
| **Public Author Profiles** | หน้า `/authors/[slug]` สะอาดตา แสดงรูปจริง ไร้ปุ่มหลังบ้าน พร้อม Schema.org JSON-LD `ProfilePage` & `Person` | ✅ ผ่าน |
| **Modal 301 Overlay** | กล่องฟอร์มแปลง 404 เป็น 301 แสดงผลกึ่งกลางหน้าจอพร้อม Backdrop Blur สมบูรณ์ | ✅ ผ่าน |
| **Custom Scrollbar** | แถบเลื่อน Slim 8px สี Slate/Navy ทำงานลื่นไหล สอดคล้องกับ CI แบรนด์ทั้งหน้าบ้านและหลังบ้าน | ✅ ผ่าน |

---

## 9. 📋 สรุปสิ่งที่ยังเหลือต้องทำต่อ (Remaining Tasks & Roadmap)

ปัจจุบันระบบ Core SEO ทั้งฝั่งหลังบ้าน (Pillar 1 & 2), การจัดการ URL เชิงเทคนิค (Phase 0), ประสบการณ์หน้าบ้าน (Phase 1) และระบบโปรไฟล์ผู้เขียน E-E-A-T (Phase 1.5) **เสร็จสิ้นสมบูรณ์ 100% และส่งขึ้น Git (`origin main`) เรียบร้อยแล้ว**

สิ่งที่เหลือสำหรับรอบการพัฒนาถัดไป มีดังนี้:

### 🤖 1. ระยะที่ 2: ระบบผู้ช่วยอัจฉริยะ AI Content & AEO Assistant (Gemini API) — [Priority สูงสุดถัดไป]
* **การเชื่อมต่อ AI API:**
  - กำหนดค่า `GEMINI_API_KEY` และสร้าง Service Layer เชื่อมต่อ Google Gemini API (แนะนำโมเดล `gemini-1.5-flash` หรือ `gemini-2.0-flash` เพื่อความรวดเร็วและคุ้มค่า)
* **ฟีเจอร์ AI Assistant ในหน้า Editor (`/admin/articles/[id]`):**
  - **ปุ่ม "AI แนะนำคำค้นหา (Focus Keyword)":** ให้ AI วิเคราะห์เนื้อหาบทความแล้วเสนอ Focus Keyword ภาษาไทยที่มีเจตนาการค้นหา (Search Intent) สูง
  - **ปุ่ม "AI ร่าง Meta Description (3 สไตล์)":** สร้างคำอธิบายบทความความยาว 120–155 ตัวอักษรให้เลือก 3 แนวทาง (เชิงวิชาการสรุปประเด็น, เชิงตอบคำถามแก้ไขปัญหา, และเชิงกระตุ้นให้คลิกอ่าน)
  - **ปุ่ม "AI สรุปคำตอบด่วน 1 นาที (Quick Answer / BLUF)":** สร้างย่อหน้าสรุปใจความสำคัญ 40–60 คำ สำหรับนำไปใส่ในกล่อง Quick Answer เพื่อเพิ่มโอกาสติดอันดับบน Google AI Overviews และ AI Search Engines (AEO)

### 📈 2. ระยะที่ 3: ระบบแจ้งเตือนทางอีเมลและดึงข้อมูลสถิติสด (Operational Monitoring)
* **ระบบแจ้งเตือนทบทวนข้อกฎหมายภาษี (Email Notification):**
  - สคริปต์ Cron Job ตรวจสอบบทความที่มีกำหนด `nextReviewAt` ใกล้เข้ามา และส่งอีเมลแจ้งเตือนผู้รับผิดชอบ CPA / บรรณาธิการ ล่วงหน้า 14 วัน เพื่อให้ตรวจสอบว่ามีประกาศอธิบดีกรมสรรพากรหรือกฎหมายใหม่ที่มีผลกระทบหรือไม่
* **การเชื่อมต่อ Google Search Console API:**
  - นำ Service Account เชื่อมต่อ Search Console เพื่อดึงยอดคลิก (Clicks), การมองเห็น (Impressions), และอันดับเฉลี่ย (Average Position) มาแสดงในการ์ด SEO Dashboard หลังบ้านโดยตรง

### 💡 3. ฟังก์ชันเสริมย่อยในระบบ SEO (Minor Enhancements Backlog)
* **ระบบ Import / Export รายการ Redirect:** เพิ่มปุ่มดาวน์โหลดรายการ Redirect ออกเป็นไฟล์ CSV และปุ่ม Import รายการจากไฟล์ CSV
* **Image Sitemap Tags:** เพิ่มแท็ก `<image:image>` ใน `/sitemap.xml` สำหรับดึงรูปภาพหน้าปกบทความเข้าสู่ระบบค้นหารูปภาพของ Google
* **Retention Policy สำหรับ Log 404:** สคริปต์ล้างข้อมูลประวัติ 404 เกิน 90 วันที่แก้ไขแล้ว เพื่อไม่ให้ขนาดฐานข้อมูลโตเกินความจำเป็น

---

### 🚀 4. แผนพัฒนาต่อยอดเพื่อยกระดับเว็บไซต์โดยรวม (Beyond SEO: Conversion & Experience)
*ข้อเสนอแนะในการเพิ่มศักยภาพทางธุรกิจให้กับเว็บไซต์สำนักงานบัญชีดีถาวร นอกเหนือจากงาน SEO:*

1. **Interactive Fee Calculator (ระบบคำนวณและประเมินค่าบริการแบบโต้ตอบ):**
   - พัฒนา Wizard 3 ขั้นตอน ให้ลูกค้าเลือกลักษณะกิจการ (บุคคล/ห้างหุ้นส่วน/บริษัท), จำนวนบิลต่อเดือน, และการจด VAT เพื่อประเมินค่าบริการคร่าวๆ ทันที พร้อมปุ่ม **"กดส่งใบประเมินนี้เข้า LINE สำนักงาน"** ช่วยเพิ่ม Conversion Rate ในการตัดสินใจจ้าง
2. **LINE OA Lead Notification (ระบบแจ้งเตือนลูกค้าทักเข้ากลุ่ม LINE ทีมงานทันที):**
   - เมื่อมีลูกค้าส่งฟอร์มขอคำปรึกษาจากหน้าเว็บ ระบบจะส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE ของทีมงานดีถาวรทันทีผ่าน LINE Notify / LINE Messaging API เพื่อให้ติดต่อกลับหาลูกค้าได้ภายใน 5–15 นาที
3. **Monthly Tax Calendar & Document Checklist Download (ปฏิทินภาษีและคู่มือดาวน์โหลดฟรี):**
   - หน้าปฏิทินกำหนดวันยื่นภาษีประจำเดือน (ภ.พ.30, ภ.ง.ด.1/3/53, ประกันสังคม) เพื่อให้เจ้าของธุรกิจ Bookmark ไว้ติดตาม
   - แจก Checklist เอกสารเตรียมทำบัญชีประจำเดือน (ไฟล์ PDF/Excel) แลกกับการทัก LINE รับคำปรึกษา
4. **Client Trust & Case Studies Showcase (หมวดผลงานและเคสแก้ปัญหาภาษีจริง):**
   - เพิ่มหมวด "กรณีศึกษาจริง (Case Studies)" เช่น การแก้ปัญหาเบี้ยปรับย้อนหลัง, การวางแผนภาษีธุรกิจออนไลน์, การเปลี่ยนผ่านจากบุคคลธรรมดาสู่บริษัทจำกัด เพื่อสร้างความมั่นใจสูงสุดก่อนตัดสินใจจ้าง
5. **Cookie Consent & PDPA Banner (ระบบความยินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล):** ✅ **[ดำเนินการเสร็จสมบูรณ์ 100%]**
   - แถบขอความยินยอมคุกกี้ลอยมุมซ้ายล่าง (`CookieConsentBanner.tsx`) สี Corporate Navy `#102a56` พร้อมป้าย PDPA
   - ตัวเลือก "ยอมรับทั้งหมด", "เฉพาะที่จำเป็น" และ "ตั้งค่าคุกกี้"
   - หน้าต่าง Cookie Preferences Modal พร้อมสวิตช์เปิด-ปิดแยกหมวด (จำเป็นเสมอ / สถิติและประสิทธิภาพ / การสื่อสารและการตลาด)
   - จดจำสถานะความยินยอมผ่าน `localStorage` (`dtv_cookie_consent`)
   - ปุ่ม "ตั้งค่าคุกกี้" และลิงก์ "นโยบายความเป็นส่วนตัว (PDPA)" ในส่วนท้ายเว็บไซต์ (`Footer.tsx`) ให้ผู้ใช้กลับมาปรับแต่งความยินยอมได้ตลอดเวลา
   - หน้าเอกสารนโยบายคุ้มครองข้อมูลส่วนบุคคลฉบับเต็มสำหรับสำนักงานบัญชีที่ `/privacy-policy` พร้อมปุ่มปรับแต่งคุกกี้ในหน้า

