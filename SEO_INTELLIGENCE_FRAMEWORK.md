# 📘 Standard SEO Intelligence Framework (SEO + AEO + GEO Blueprint)

> **Reference Implementation:** Wealth Integrator (`Next.js App Router` + `Prisma/MySQL` + `Zero-Dependency Google APIs`)  
> **Core Philosophy:** *"Stop guessing keywords. Judge content gaps by the page Google actually ranks, prevent keyword cannibalization, index instantly across Search & AI engines, and self-heal technical SEO."*

เอกสารฉบับนี้สรุปสถาปัตยกรรม ฟีเจอร์ ตรรกะอัลกอริทึม และโครงสร้างฐานข้อมูลของระบบ **SEO Intelligence & AI Search Operating System** ทั้งหมดที่พัฒนาในเว็บไซต์ **Wealth Integrator** เพื่อใช้เป็น **Standard Framework / Prompt Blueprint** สำหรับนำไปพัฒนากับเว็บไซต์อื่นๆ ตามมาตรฐานเดียวกัน

---

## 1. ภาพรวมสถาปัตยกรรม 7 ชั้น (7-Layer Architecture)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Layer 7: Technical SEO & Self-Healing (301 Auto-Redirect, 404, Broken Link)│
├────────────────────────────────────────────────────────────────────────────┤
│ Layer 6: AEO & GEO Infrastructure (/llms.txt, /llms-full.txt, JSON-LD)     │
├────────────────────────────────────────────────────────────────────────────┤
│ Layer 5: Real-Time 100-Point SEO/AEO/GEO Editor Audit Engine               │
├────────────────────────────────────────────────────────────────────────────┤
│ Layer 4: Multi-Channel Instant Indexing (Google API + Sitemap + IndexNow)  │
├────────────────────────────────────────────────────────────────────────────┤
│ Layer 3: 8-Tab SEO Intelligence Command Center UI & 1-Click Actions        │
├────────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Smart Opportunity Classifier & Anti-Cannibalization Guardrails    │
├────────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Zero-Dependency GSC Ingestion & Proactive Keyword Autocomplete    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. โครงสร้างไฟล์หลักในโปรเจกต์ต้นแบบ (Reference File Map)

| โมดูล (Module) | ไฟล์ต้นแบบใน Wealth Integrator | หน้าที่หลัก |
| :--- | :--- | :--- |
| **GSC & SEO Intelligence Engine** | `lib/gsc-actions.ts` | เชื่อมต่อ GSC API (RS256 JWT), วิเคราะห์โอกาส 4 ตะกร้า, คำนวณ Rank Delta, ค้นหาคีย์เวิร์ด Google Autocomplete, สแกน Internal Link & Orphan Posts |
| **SEO Intelligence Dashboard UI** | `app/admin/seo-intelligence/page.tsx`<br>`components/admin/seo-intelligence-client.tsx` | หน้าแดชบอร์ด 8 แท็บ พร้อมรายงานสรุปภาษามนุษย์ (Plain-English Briefing) และปุ่ม 1-Click Actions |
| **Multi-Channel Instant Indexing** | `lib/indexing-actions.ts` | ส่งสัญญาณจัดทำดัชนี 3 ช่องทางอัตโนมัติ (Google Indexing API + GSC Sitemap Submit + IndexNow AI Search) |
| **100-Point SEO/AEO/GEO Audit** | `lib/seo-engine.ts` | ประเมินคะแนนบทความแบบ Real-time 100 คะแนน (14 เกณฑ์ ใน 4 มิติ) |
| **GEO / LLM Knowledge Corpus** | `app/llms.txt/route.ts`<br>`app/llms-full.txt/route.ts`<br>`app/robots.ts` | สร้างสารบัญและคลังความรู้ Markdown อัตโนมัติสำหรับ ChatGPT, Perplexity, Claude, Gemini |
| **Self-Healing 301 & 404 Monitor** | `lib/redirect-actions.ts`<br>`app/admin/redirects/page.tsx` | สร้าง 301 Redirect อัตโนมัติเมื่อเปลี่ยน Slug (พร้อมยุบ Chain), ดักจับ 404 Not Found และสแกนหา Broken Links |
| **Automated SEO Verification** | `scripts/verify-gate4.mjs` | สคริปต์ตรวจสอบ Canonical URL, Sitemap, Robots, GA4 Admin Isolation และป้องกัน Draft รั่วไหล |

---

## 3. รายละเอียดฟีเจอร์แยกตามเลเยอร์ (Feature Specifications)

### Layer 1: ระบบดึงข้อมูล Google Search Console แบบ Zero-Dependency (`lib/gsc-actions.ts`)

1. **Native Node.js RS256 JWT Signer (`getGoogleAccessToken`)**
   - เชื่อมต่อ Google OAuth2 (`https://oauth2.googleapis.com/token`) ด้วยโมดูล `crypto` มาตรฐานของ Node.js (`RSA-SHA256`) โดยไม่ต้องติดตั้งไลบรารี `googleapis` ขนาดใหญ่ ช่วยให้ Build เบาและรันบน cPanel / Serverless ได้เสถียร 100%
2. **4-Tier Data Source Fallback (`GscConnectionStatus`)**
   - รองรับแหล่งข้อมูล 4 ระดับอัตโนมัติ:
     1. `LIVE_API`: ดึงข้อมูลสดจาก Google Search Console API
     2. `CACHED_SYNC`: โหลดข้อมูลที่ซิงค์ล่าสุดจากตาราง `AdminSetting`
     3. `CSV_IMPORT`: รองรับการอัปโหลดไฟล์ CSV ที่ Export มาจากหน้าเว็บ GSC โดยตรง
     4. `DEMO_SIMULATION`: ข้อมูลจำลองเสมือนจริงสำหรับพรีวิวระบบก่อนผูก API
3. **Auto-Site Discovery & Smart Diagnostics (`fetchVerifiedGscSites`)**
   - ค้นหา Property ที่ยืนยันแล้วในบัญชี GSC อัตโนมัติ ไม่ว่าจะตั้งค่าแบบ Domain Property (`sc-domain:example.com`) หรือ URL Prefix (`https://www.example.com/`)
   - ดักจับ Error `SERVICE_DISABLED` เพื่อสร้างลิงก์กด Enable Google Search Console API ตรงตาม `project_id` ของผู้ใช้ทันที
4. **3-Window Period-over-Period Rank Delta (`fetchGscSearchAnalytics`)**
   - ดึงข้อมูลเปรียบเทียบ 3 ช่วงเวลาพร้อมกัน: ช่วงปัจจุบัน (เช่น 28 วันล่าสุด), ช่วงก่อนหน้า (28–56 วันก่อน), และช่วง Baseline ต้นรอบ (สำหรับเว็บไซต์ที่เพิ่งเปิดใหม่)
   - คำนวณ `positionDelta` และแสดงป้ายสถานะการขยับอันดับทุกแถว:
     - `▲ +X.X` (สีเขียว — อันดับดีขึ้น)
     - `▼ -X.X` (สีอำพัน — อันดับลดลง)
     - `—` (คงที่)
     - `★ ใหม่` (สีน้ำเงิน — เพิ่งติดอันดับครั้งแรก)

---

### Layer 2: เอนจินจัดหมวดหมู่โอกาส SEO และระบบป้องกัน Keyword Cannibalization

#### กฎเหล็ก: *"Judge Gaps by the Page Google Actually Ranks"*
ฟังก์ชัน `analyzeRowsAgainstPosts` จะนำทุกคำค้นหาจาก GSC ไปตรวจสอบเทียบกับคลังบทความในฐานข้อมูล (`Post`) ก่อนจัดเข้า **4 ตะกร้าโอกาส (Opportunity Buckets)**:

| ตะกร้า (Bucket) | เงื่อนไขการคัดกรอง (Classification Logic) | แนวทางปฏิบัติที่ระบบแนะนำอัตโนมัติ |
| :--- | :--- | :--- |
| **1. `CONTENT_GAP`**<br>*(ช่องว่างเนื้อหาใหม่)* | มี Impressions สูง แต่ได้ `0–1 คลิก` **และ** หน้าที่ Google นำไปแสดงคือหน้าทั่วไป (`/`, `/services/*`) โดยยังไม่มีบทความเฉพาะรองรับ | กดปุ่ม **1-Click เขียนบทความใหม่** ใช้คำนี้เป็น Focus Keyword แล้วส่ง Internal Link กลับไปยังหน้าบริการหลัก (Pillar Page) |
| **2. `STRIKING_DISTANCE`**<br>*(ระยะประชิด อันดับ 5–20)* | ติดอันดับ `5.0 – 20.0` (ท้ายหน้าแรกหรือหน้าสอง) หรือมีบทความในระบบอยู่แล้วแต่อันดับยังไม่ถึง Top 5 | **ห้ามเขียนบทความใหม่ซ้ำ** — ให้กดอัปเดตบทความเดิมโดยแทรกคำค้นหานี้ลงในหัวข้อ `H2`/`H3`, เพิ่ม `FAQ`, และส่ง Internal Link เพิ่ม |
| **3. `CTR_BOOSTER`**<br>*(ติด Top 5 แต่ CTR ต่ำ)* | ติดหน้าแรกอันดับ `1.0 – 5.0` แต่ได้ `0 คลิก` หรือ `CTR < 3.5%` | ปรับปรุง `SEO Title` และ `Meta Description` ให้น่าคลิก หรือส่ง Internal Link จากหน้าแรกหากหน้าอื่นติดอันดับแทนหน้าบทความ |
| **4. `TOP_PERFORMER`**<br>*(คีย์เวิร์ดทำคลิกสูงสุด)* | ติดอันดับ `<= 4.5` และมี `CTR >= 3.5%` พร้อมยอดคลิกสูง | รักษามาตรฐานเนื้อหา และใช้บทความนี้เป็นฐานส่ง Internal Link ไปดันบทความใหม่ในหมวดเดียวกัน |

#### 5 ระบบกรองอัจฉริยะ (Smart SEO Guardrails)
1. **Anti-Cannibalization Matcher**: ตรวจสอบทั้ง URL ที่ติดอันดับ (`/blog/...`) และสแกนหาในฐานข้อมูล (`focusKeyword`, `title`, `seoTitle`, `tags`, `slug`) หากพบว่ามีบทความอยู่แล้ว ระบบจะไม่แนะนำให้สร้างบทความใหม่ซ้ำเด็ดขาด
2. **Thai Synonym & Fuzzy Topic Matcher (`isFuzzyTopicMatch`)**: รองรับคำพ้องและตัวสะกดใกล้เคียงภาษาไทย/อังกฤษ (เช่น `พีระมิด`/`ปิรามิด`, `ทางการเงิน`/`การเงิน`, `co-payment`/`copay`) รวมถึงคำค้นหาที่สลับตำแหน่งคำ
3. **H2/H3 & FAQ Optimization Detector (`isQueryAlreadyOptimizedInPost`)**: สแกนเนื้อหาบทความจริงว่ามีคีย์เวิร์ดนั้นใน `Title`, `SEO Title`, หัวข้อ `##`/`###` หรือ `faqJson` แล้วหรือยัง หากใส่ครบแล้วจะแสดงป้ายสีเขียว `✓ อัปเดตคีย์เวิร์ดแล้ว (รอ GSC อัปเดตข้อมูล)` และลด Priority Score เพื่อดันรายการที่ยังไม่ได้แก้ขึ้นมาก่อน
4. **Zero-Click Exam Query Guardrail (`isExamOrZeroClickQuery`)**: ตรวจจับคำค้นหาแนวโจทย์ข้อสอบปรนัย (เช่น มีคำว่า `"ในข้อใด"`, `"ข้อใดถูกต้อง"`, `"ก. ข. ค. ง."`) แล้วติดป้าย `✓ คำค้นหาแนวข้อสอบ (ไม่ต้องแก้พาดหัว)` เพื่อป้องกันไม่ให้แอดมินเผลอแก้ SEO Title ของบทความหลักตามโจทย์ข้อสอบ
5. **Statistical Impression Threshold (`MIN_IMPRESSIONS_FOR_CTR_EDIT = 15`)**: ในหมวด `CTR_BOOSTER` หากมียอดการมองเห็นต่ำกว่า 15 ครั้ง ระบบจะขึ้นป้าย `⏳ รอสะสม Impressions (ตัวอย่างยังน้อย)` เพื่อป้องกันการด่วนแก้พาดหัวเมื่อข้อมูลทางสถิติยังไม่เพียงพอ

---

### Layer 3: แผงควบคุม 8 แท็บ (8-Tab SEO Intelligence Command Center)

1. **Plain-English Executive Briefing (`buildPlainEnglishReport`)**
   - กล่องสรุปรายงานภาษามนุษย์ด้านบนสุด สรุปภาพรวมยอดวิว/คลิก, บทความที่ทำผลงานดีที่สุด, ขุมทรัพย์ Content Gap อันดับ 1, โอกาสดันขึ้นหน้าแรกที่เร็วที่สุด และ **Next 3 Actions** ที่ควรทำทันทีในสัปดาห์นี้
2. **Tab 1 — ช่องว่างเนื้อหาใหม่ (`CONTENT_GAP`)**
   - แสดงรายการหัวข้อที่ยังไม่มีบทความ พร้อมระบบตั้งชื่อบทความแนะนำ (`generateSuggestedEditorialTitle`), แปลงคีย์เวิร์ดไทยเป็น English URL Slug อัตโนมัติ (`generateEnglishSlugFromQuery`), จับคู่หน้า Pillar Page อัตโนมัติ และปุ่ม **1-Click เขียนบทความนี้ทันที** (ส่ง Query Params ไปเติมข้อมูลในหน้า `/admin/articles/new` อัตโนมัติ)
3. **Tab 2 — อันดับ 5–20 (`STRIKING_DISTANCE`)**
   - ชี้เป้าจุดที่ต้องเพิ่ม H2/H3 หรือ FAQ พร้อมปุ่มกดเปิดหน้าแก้ไขบทความเดิมโดยตรง และป้ายสถานะสีเขียวเมื่ออัปเดตคีย์เวิร์ดครบแล้ว
4. **Tab 3 — ปรับพาดหัวเพิ่มคลิก (`CTR_BOOSTER`)**
   - วิเคราะห์หน้าแรกที่ CTR ต่ำ พร้อม Guardrail กรองคำค้นหาข้อสอบและรอสะสม Impressions ขั้นต่ำ 15 ครั้ง
5. **Tab 4 — แผนบทความ SEO (`PLAN`)**
   - ระบบตะกร้าวางแผนบทความ (`PLANNED` -> `DRAFTING` -> `COMPLETED`) ที่ซิงค์สถานะอัตโนมัติทันทีเมื่อมีบทความที่มี Slug หรือ Focus Keyword ตรงกันถูกสร้างหรือเผยแพร่ในฐานข้อมูล
6. **Tab 5 — คีย์เวิร์ดทำคลิกสูงสุด (`TOP_PERFORMER`)**
   - ติดตามคีย์เวิร์ดหลักที่สร้าง Traffic เข้าเว็บ พร้อมแสดงการขยับของอันดับ (`Rank Delta`)
7. **Tab 6 — Instant Indexing (`INDEXING`)**
   - แผงควบคุมการส่ง URL เข้าดัชนีค้นหาแบบ 1-Click รายหน้า, ปุ่ม **Bulk Index ทุกหน้า**, และตารางประวัติการส่งสัญญาณ 30 รายการล่าสุดแยกสถานะรายช่องทาง
8. **Tab 7 — ค้นหาคีย์เวิร์ดใหม่ (`EXPLORER` — Proactive Keyword Explorer)**
   - ดึงคำค้นหายอดนิยมสดจาก **Google Search Thailand Autocomplete** (`suggestqueries.google.com`, `hl=th&gl=th`) โดยแตกคำขยาย 7 รูปแบบอัตโนมัติ (`คือ`, `วางแผน`, `ลดหย่อนภาษี`, `ต้องมี`, `กับ`, `เท่าไหร่`)
   - จำแนก Search Intent อัตโนมัติ (`HIGH_INTENT`, `COMPARISON`, `QUESTION_FAA`, `GENERAL`)
   - ตรวจสอบเทียบกับคลังบทความทันทีว่าคำไหนมีบทความหลักแล้ว (`COVERED_PRIMARY`), มีอยู่ในเนื้อหาย่อยแล้ว (`COVERED_IN_CONTENT`), หรือยังเป็นช่องว่างใหม่ (`MISSING_GAP`)
9. **Tab 8 — โครงข่าย Internal Link (`INTERNAL_LINKS` — Internal Link Matrix & Orphan Detector)**
   - สแกน Markdown ของทุกบทความเพื่อสร้างแผนผัง **Inbound Links** (ลิงก์รับเข้า), **Outbound Blog Links** (ลิงก์ส่งออกหาบทความอื่น), และ **Pillar Links** (ลิงก์เชื่อมหน้าบริการหลัก)
   - ตรวจจับ **Orphan Posts** (บทความกำพร้าที่มี `inboundCount === 0`)
   - สแกนหาประโยคในบทความอื่นที่มีคำสำคัญปรากฏอยู่แต่ยังไม่ได้ผูกเป็นลิงก์ พร้อมปุ่ม **1-Click แทรก Internal Link อัตโนมัติ** (`insertInternalLinkBetweenPostsAction`) เข้าไปในเนื้อหา Markdown ทันที

---

### Layer 4: ระบบ Multi-Channel Instant Indexing (`lib/indexing-actions.ts`)

ทำงานอัตโนมัติทันทีเมื่อกด **Publish บทความ**, **ซิงค์บทความผ่าน Cloud Sync API**, หรือกดปุ่ม **Manual / Bulk Indexing** โดยยิงสัญญาณ 3 ช่องทางพร้อมกัน (`Promise.all`):

1. **Google Web Search Indexing API (`callGoogleIndexingApi`)**
   - ยิง `POST https://indexing.googleapis.com/v3/urlNotifications:publish` (`type: 'URL_UPDATED'`)
2. **Google Search Console Sitemap Submit API (`callGscSitemapSubmitApi`)**
   - ยิง `PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{sitemapUrl}` แจ้ง Googlebot ให้ดึง `/sitemap.xml` ชุดใหม่ทันที
3. **IndexNow Protocol (`callIndexNowProtocol`)**
   - ยิง `POST https://api.indexnow.org/indexnow` พร้อมไฟล์ยืนยันตัวตน `public/{INDEXNOW_KEY}.txt` เพื่อแจ้งเตือน **Bing, ChatGPT Search, Microsoft Copilot, Perplexity และ DuckDuckGo** พร้อมกัน

---

### Layer 5: เอนจินตรวจคะแนนคุณภาพบทความ 100 คะแนน (`lib/seo-engine.ts`)

ประเมินผลแบบ Real-time ในหน้าเขียนบทความ แบ่งเป็น **4 มิติ 14 เกณฑ์ตรวจวัด (รวม 100 คะแนน)**:

| มิติ (Category) | เกณฑ์การตรวจวัด (Checklist Item) | คะแนนเต็ม | เกณฑ์ผ่าน (Pass Condition) |
| :--- | :--- | :---: | :--- |
| **1. Technical Eligibility (35)** | 1. ระบุ Focus Keyword (`has_keyword`) | 5 | มีการกำหนด Focus Keyword |
| | 2. Keyword อยู่ใน SEO Title (`keyword_in_title`) | 8 | พบ Focus Keyword ใน SEO Title |
| | 3. Keyword อยู่ใน Meta Description (`keyword_in_description`) | 6 | พบ Focus Keyword ใน Meta Description |
| | 4. โครงสร้าง URL Slug (`keyword_in_slug`) | 5 | ใช้ Clean English Slug (`^[a-z0-9-]+$`) หรือมี Keyword |
| | 5. ความยาว Title & Description (`meta_lengths`) | 6 | Title `30–75` ตัวอักษร และ Description `80–180` ตัวอักษร |
| | 6. คำอธิบายรูปภาพ (`keyword_in_image_alt`) | 5 | ระบุ Image Alt Text และมี Focus Keyword |
| **2. Answer Quality & AEO (25)** | 7. กล่องสรุปคำตอบ AI (`ai_direct_answer`) | 15 | มี `aiAnswerSnippet` ความยาว `60–400` ตัวอักษร (`40–60 คำ`) |
| | 8. คำถามที่พบบ่อย (`faq_schema`) | 10 | มีรายการ FAQ อย่างน้อย `2 ข้อ` (สร้าง JSON-LD อัตโนมัติ) |
| **3. Trust & Evidence / E-E-A-T (20)** | 9. คุณวุฒิผู้เขียน (`eeat_author`) | 10 | ระบุคุณวุฒิ/ใบอนุญาตของผู้เขียน (`authorCredentials`) |
| | 10. แหล่งอ้างอิงปฐมภูมิ (`geo_sources`) | 10 | ระบุแหล่งอ้างอิง (`sourcesList`) อย่างน้อย `1 แหล่ง` |
| **4. Content Depth & Cluster (20)** | 11. Keyword ในย่อหน้าแรก (`keyword_in_intro`) | 4 | พบ Focus Keyword ในช่วง 20% แรกของเนื้อหา |
| | 12. โครงสร้างหัวข้อย่อย (`keyword_in_headings`) | 4 | มีหัวข้อ `H2` หรือ `H3` อย่างน้อย `2 หัวข้อ` |
| | 13. ความลึกของเนื้อหา (`content_length`) | 4 | ความยาวเนื้อหา `350–600+ คำขึ้นไป` |
| | 14. ลิงก์ภายในคลัสเตอร์ (`internal_links`) | 4 | มี Internal Links เชื่อมหน้าบริการหรือบทความอื่น `>= 2 จุด` |
| | 15. ความหนาแน่นคีย์เวิร์ด (`keyword_density`) | 4 | Keyword Density อยู่ในช่วงธรรมชาติ `0.4% – 3.5%` |

---

### Layer 6: โครงสร้างพื้นฐาน AEO & GEO (Generative Engine Optimization)

1. **Dynamic `/llms.txt` & `/llms-full.txt` Routes**
   - `/llms.txt`: สร้างสารบัญ Markdown สดจากฐานข้อมูล สรุปข้อมูลแบรนด์ คุณวุฒิผู้เชี่ยวชาญ บริการหลัก เครื่องมือคำนวณ และรายการบทความที่เผยแพร่แล้วทั้งหมดพร้อม `aiAnswerSnippet`
   - `/llms-full.txt`: รวบรวมคลังความรู้ฉบับเต็ม (Full Knowledge Corpus) ทั้ง FAQ กลาง, เนื้อหาบทความเต็ม, AI Direct Answer, FAQ รายบทความ และ Primary Citations เพื่อให้ LLM (ChatGPT, Claude, Perplexity, Gemini) ดึงข้อมูลไปใช้อ้างอิงได้โดยตรง
2. **AI Search Bot Rules ใน `app/robots.ts`**
   - เปิดสิทธิ์ต้อนรับบอท AI อย่างชัดเจน (`OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`, `anthropic-ai`, `Applebot-Extended`) ให้เข้าถึง `/`, `/llms.txt`, `/llms-full.txt`, `/blog/`, `/services/` ขณะบล็อก `/admin/` และ `/api/`
3. **Multi-Layer JSON-LD Structured Data**
   - ฝัง Schema อัตโนมัติในแต่ละหน้า: `BlogPosting`, `FAQPage`, `BreadcrumbList`, `Person` (พร้อมคุณวุฒิ E-E-A-T), และ `Organization` / `Service`
4. **Automated Topic Cluster Hub ท้ายบทความ**
   - แสดงการ์ดเชื่อมโยงเสาหลักบริการ (Pillar Hub) และคัดเลือกบทความที่เกี่ยวข้องในหมวดเดียวกันที่มีคะแนน SEO สูงสุดมาแสดงท้ายบทความโดยอัตโนมัติ

---

### Layer 7: ระบบดูแลสุขภาพ Technical SEO อัตโนมัติ (`lib/redirect-actions.ts`)

1. **Auto 301 Redirect & Chain Flattening (`recordAutoSlugRedirect`)**
   - เมื่อเปลี่ยน URL Slug ของบทความเดิม หรือลบบทความที่เคยเผยแพร่แล้ว ระบบจะสร้าง `301 Redirect` ให้อัตโนมัติ
   - มีระบบ **Redirect Chain Flattening**: หากเคยเปลี่ยน `A -> B` แล้วเปลี่ยน `B -> C` ระบบจะยุบรวมให้ `A -> C` และ `B -> C` ทันทีเพื่อป้องกัน Redirect ซ้อนหลายทอด
2. **Live 404 Monitor & 1-Click Redirect Converter (`log404AndCheckRedirectAction`)**
   - ดักจับการเข้าหน้า `404 Not Found` ของผู้ใช้จริง บันทึกจำนวนครั้ง (`hits`) และ `referrer` แสดงป้ายแจ้งเตือนบน Topbar/Sidebar หลังบ้าน พร้อมปุ่มกดแปลง URL ที่ติด 404 ให้เป็น `301 Redirect` ไปยังหน้าที่ถูกต้องได้ในคลิกเดียว
3. **Broken Link & Citation Scanner**
   - สแกนบทความทั้งหมดเพื่อตรวจหา Internal Link เสีย, External Citation เสีย และรูปภาพหน้าปกที่สูญหาย
4. **GA4 Traffic Isolation & Canonical Guardrails**
   - แยกสคริปต์ Google Analytics 4 (`gtag.js`) ให้โหลดเฉพาะใน `app/(marketing)/layout.tsx` และบังคับ `robots: { index: false, follow: false }` ใน `app/admin/layout.tsx` เพื่อไม่ให้สถิติการทำงานของแอดมินปนเปื้อนใน GA4
   - กำหนด `alternates.canonical` ชัดเจนทุกหน้า และมีสคริปต์ตรวจสอบอัตโนมัติ (`npm run verify`) เช็กความสมบูรณ์ของ SEO & Security

---

## 4. โครงสร้างฐานข้อมูลมาตรฐาน (Prisma Schema Blueprint)

สำหรับการนำไปติดตั้งในโปรเจกต์ใหม่ ให้ใช้โครงสร้างตาราง `Post` และ `AdminSetting` ดังนี้:

```prisma
model Post {
  id                String    @id @default(cuid())
  title             String
  slug              String    @unique
  excerpt           String?   @db.Text
  content           String    @db.LongText
  category          String
  tags              String?   @db.Text
  featuredImage     String?
  imageAlt          String?
  status            String    @default("DRAFT") // DRAFT | PUBLISHED

  // SEO, AEO & GEO Fields
  seoTitle          String?
  seoDescription    String?   @db.Text
  focusKeyword      String?
  aiAnswerSnippet   String?   @db.Text // สรุปคำตอบตรงประเด็น 40-60 คำ สำหรับ AI Overviews
  faqJson           String?   @db.LongText // JSON Array: [{ question, answer }]
  sourcesJson       String?   @db.LongText // JSON Array: [{ title, url }]
  seoScore          Int       @default(0)

  // E-E-A-T Author Fields
  authorName        String
  authorRole        String
  authorCredentials String?   @db.Text
  authorAvatar      String?

  publishedAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model AdminSetting {
  key       String   @id
  value     String   @db.LongText
  updatedAt DateTime @updatedAt
}
```

**รายการ Keys ที่ใช้ในตาราง `AdminSetting`:**
- `gsc_service_account_json`: เก็บ JSON Key ของ Google Cloud Service Account
- `gsc_site_url`: เก็บ Property URL ที่เชื่อมต่อใน GSC
- `gsc_cached_rows`: เก็บข้อมูลคำค้นหาที่ซิงค์ล่าสุดพร้อมค่า `previousPosition`
- `seo_content_plan`: เก็บรายการแผนบทความ (`PLANNED` / `DRAFTING` / `COMPLETED`)
- `seo_indexing_logs`: เก็บประวัติการยิง Instant Indexing 30 รายการล่าสุด
- `seo_redirects`: เก็บกฎ 301/302 Redirects ทั้งหมดพร้อมสถิติ `hits`
- `seo_404_logs`: เก็บสถิติ URL ที่เกิด 404 Not Found พร้อม `referrer`

---

## 5. Checklist สำหรับสั่งพัฒนาในเว็บไซต์ใหม่ (Implementation Roadmap)

```markdown
### Phase 1: Database & Content Schema (SEO + AEO + GEO Fields)
- [ ] เพิ่มฟิลด์ในตาราง `Post`: `seoTitle`, `seoDescription`, `focusKeyword`, `aiAnswerSnippet` (สรุป 40-60 คำ), `faqJson`, `sourcesJson`, `seoScore` (0-100), และข้อมูลผู้เขียน E-E-A-T (`authorName`, `authorRole`, `authorCredentials`)
- [ ] สร้างตาราง `AdminSetting` (Key-Value JSON) สำหรับเก็บ `gsc_service_account_json`, `gsc_site_url`, `gsc_cached_rows`, `seo_content_plan`, `seo_indexing_logs`, `seo_redirects`, และ `seo_404_logs`

### Phase 2: Real-Time 100-Point SEO Audit & Article Editor
- [ ] สร้าง `lib/seo-engine.ts` ประเมินคะแนน 100 คะแนน แบ่งเป็น 4 มิติ: Technical (35), AEO Direct Answer & FAQs (25), E-E-A-T & Citations (20), และ Content Depth & Internal Links (20)
- [ ] เพิ่มปุ่ม 1-Click แทรก Internal Link เชื่อมหน้าบริการหลัก (Pillar Pages) และบทความในคลัสเตอร์เดียวกันภายในหน้า Article Editor

### Phase 3: GSC SEO Intelligence Command Center (8 Tabs)
- [ ] สร้างระบบเชื่อมต่อ Google Search Console API ด้วย Native Node.js Crypto (`RS256 JWT`) พร้อมระบบดึงข้อมูลเปรียบเทียบช่วงเวลาก่อนหน้า (Rank Delta ▲/▼)
- [ ] สร้างอัลกอริทึม `analyzeRowsAgainstPosts` แยกคีย์เวิร์ดเป็น 4 ตะกร้า (`CONTENT_GAP`, `STRIKING_DISTANCE`, `CTR_BOOSTER`, `TOP_PERFORMER`) โดยยึดหลักป้องกัน Keyword Cannibalization
- [ ] เพิ่ม Guardrails: ตัวกรองคำพ้องภาษาไทย, ตัวตรวจจับ H2/H3/FAQ ว่าอัปเดตคีย์เวิร์ดแล้วหรือยัง, ตัวกรองคำค้นหาแนวข้อสอบ (Zero-Click Exam Queries), และเกณฑ์ขั้นต่ำทางสถิติ `Impressions >= 15` ก่อนแนะนำให้แก้พาดหัว
- [ ] เพิ่มแท็บ Proactive Keyword Explorer เชื่อมต่อ Google Search Thailand Autocomplete เทียบกับคลังบทความใน DB
- [ ] เพิ่มแท็บ Internal Link Matrix & Orphan Post Detector พร้อมปุ่ม 1-Click Auto-Insert Internal Link ลงในเนื้อหา Markdown

### Phase 4: Multi-Channel Instant Indexing & GEO (/llms.txt)
- [ ] สร้าง `lib/indexing-actions.ts` ส่งสัญญาณจัดทำดัชนี 3 ช่องทางพร้อมกันเมื่อ Publish บทความ: 1) Google Indexing API, 2) GSC Sitemap Submit API, 3) IndexNow Protocol (Bing / ChatGPT / Perplexity)
- [ ] สร้าง Dynamic Route `/llms.txt` และ `/llms-full.txt` ดึงข้อมูลบทความ คำตอบตรงประเด็น และ FAQs ส่งให้ AI Search Bots พร้อมเปิดสิทธิ์ใน `app/robots.ts`
- [ ] สร้างระบบจัดการ 301 Redirect อัตโนมัติเมื่อเปลี่ยน Slug (พร้อม Chain Flattening) และระบบ 404 Monitor
```
