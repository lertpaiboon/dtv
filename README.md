# บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)
> **Web Application & Enterprise Corporate Platform (Migrated from Wix Studio to Self-Hosted Next.js 15 + MySQL + Prisma)**

เว็บไซต์และแพลตฟอร์มรับทำบัญชี วางแผนภาษี ตรวจสอบบัญชี และจดทะเบียนธุรกิจ พัฒนาขึ้นทดแทนระบบเดิมบน Wix เพื่อลดภาระค่าใช้จ่าย Subscription รายปี ยกระดับความเร็ว ประสิทธิภาพ SEO (Core Web Vitals) และมอบความเป็นเจ้าของ Source Code 100% พร้อมความปลอดภัยระดับองค์กร

---

## 🛠️ 1. Tech Stack & สรุปภาพรวมเทคโนโลยี

โปรเจกต์นี้ได้รับการคัดเลือกเทคโนโลยีระดับ Modern Enterprise เพื่อความเสถียร ประสิทธิภาพ และความง่ายต่อการบำรุงรักษา:

| หมวดหมู่ | เทคโนโลยีที่เลือกใช้ | เวอร์ชั่น | บทบาทหน้าที่และความสำคัญ |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [Next.js](https://nextjs.org/) (App Router) | `15.2.1` | Full-stack Framework รองรับ React Server Components (RSC), Static Site Generation (SSG) และ Dynamic API Routes |
| **UI Library** | [React](https://react.dev/) | `19.0.0` | Library จัดการ State และ Component Architecture |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.8.2` | Type-safety ป้องกัน Runtime Errors ควบคุมโครงสร้างข้อมูล Leads และ API Payloads |
| **Styling & Design** | Vanilla CSS + Design System Variables | CSS3 Standard | Custom Design System โทนสีทางการองค์กร (Deep Indigo `#1B2A80` + Cyan `#0098E5`) ไม่มี CSS Overhead โหลดเร็วกว่า CSS Frameworks ทั่วไป |
| **Typography** | `next/font/google` | Built-in | ฟอนต์ **Prompt** (ภาษาไทยทางการ คมชัด อ่านง่าย) คู่กับ **Outfit** (ตัวเลขและภาษาอังกฤษพรีเมียม) แบบ Zero-Layout-Shift (CLS = 0) |
| **Database ORM** | [Prisma ORM](https://www.prisma.io/) | `6.4.1` | Type-safe Database Client จัดการ Schema Migrations และ Validation เชื่อมต่อ MySQL |
| **Database** | MySQL | `8.0+` | ฐานข้อมูลหลักสำหรับจัดเก็บข้อมูลผู้ติดต่อ (Contact Leads) และประวัติ Audit Log |
| **Icons** | [Lucide React](https://lucide.dev/) | `1.16.0` | ไอคอนเวกเตอร์ SVG น้ำหนักเบา สวยงาม คมชัดทุกขนาดหน้าจอ |
| **Code Quality** | ESLint + `eslint-config-next` | `8.57.1` | ควบคุมมาตรฐานโค้ด สไตล์ และความถูกต้องของ React 19 / Next.js 15 (0 Errors) |
| **Testing** | Playwright E2E Automated Tests | `1.50+` | สคริปต์ทดสอบหน้าเว็บ การกรอกฟอร์ม และการทำงานแบบ End-to-End (`scripts/verify-webapp.mjs`) |
| **Production Runtime** | Node.js + PM2 + Nginx / Plesk / Vesta | Node 18+/20+ | สถาปัตยกรรมรองรับการ Deploy บนเครื่อง Server/VPS ของผู้ใช้เอง พร้อม SSL |

---

## 📁 2. โครงสร้างโปรเจกต์ฉบับสมบูรณ์ (Project Directory Structure)

```text
d:/WebApp/Deethavorn/
├── .agents/                        # โฟลเดอร์ AI Agent Skills ตามมาตรฐาน skills.sh
│   └── skills/                     # เครื่องมือและระเบียบวิธีปฏิบัติงานของ Agent
│       ├── debug-mantra/           # วินัยการแก้บั๊ก 4 ขั้นตอน (9ARM)
│       ├── frontend-design/        # มาตรฐานการออกแบบ UI พรีเมียม มีอัตลักษณ์เฉพาะ (Anthropic)
│       ├── grill-me/               # เจาะลึกความต้องการและท้าทายสมมติฐานก่อนลงมือทำ (Matt Pocock)
│       ├── grilling/               # โมดูลสนับสนุนการซักถามเชิงสถาปัตยกรรม
│       ├── next-best-practices/    # มาตรฐาน Next.js 15 App Router, RSC, Async APIs (Vercel)
│       ├── scrutinize/             # ตรวจทานโค้ดและ User Flow แบบ Outsider (9ARM)
│       ├── scrutinizer/            # ตรวจสอบความถูกต้องและ Path การทำงานจริง
│       ├── shadcn/                 # แนวทางและ Accessibility Component (shadcn/ui)
│       ├── web-design-guidelines/  # ตรวจสอบความถูกต้อง UI, UX, และ a11y (Vercel)
│       └── webapp-testing/         # แนวทางการเขียน E2E Tests ด้วย Playwright (Anthropic)
├── prisma/
│   └── schema.prisma               # Prisma Data Model (MySQL ContactLead, AuditLog)
├── public/
│   └── images/                     # กราฟิก 3D จาก Wix เดิม และโลโก้บริษัท (logo.png)
├── scripts/
│   └── verify-webapp.mjs           # สคริปต์ Automated E2E Test (ตรวจจับ Regression ทั้งหมด)
├── src/
│   ├── app/
│   │   ├── api/contact/
│   │   │   └── route.ts            # API รับส่งฟอร์ม พร้อมระบบดักสแปม Honeypot & Prisma Lead
│   │   ├── knowledge/
│   │   │   └── page.tsx            # หน้าคลังความรู้ภาษี-ธุรกิจ 5 หมวดหมู่ (ทดแทน Wix Blog)
│   │   ├── error.tsx               # Client Error Boundary รับมือข้อผิดพลาดโดยไม่ล่ม
│   │   ├── globals.css             # Design Tokens, Accessibility Styles, Animation Transitions
│   │   ├── layout.tsx              # Root Layout, Google Fonts, JSON-LD Schema.org, Skip Link
│   │   ├── not-found.tsx           # หน้าแจ้งเตือน 404 ดีไซน์สวยงาม พร้อมปุ่มนำทางกลับหน้าแรก
│   │   ├── page.tsx                # Landing Page หลัก รวมทุก Section
│   │   ├── robots.ts               # ระบบกำหนดสิทธิ์ Search Engine Crawlers อัตโนมัติ
│   │   └── sitemap.ts              # ระบบสร้าง Dynamic XML Sitemap อัตโนมัติ
│   ├── components/
│   │   ├── ContactForm.tsx         # ฟอร์มติดต่อ พร้อม Honeypot, Validations, Live Alerts
│   │   ├── FAQ.tsx                 # Accordion 6 คำถามพบบ่อย พร้อม ARIA Accessibility
│   │   ├── Footer.tsx              # ข้อมูลบริษัท, เลขทะเบียน, เวลาทำการ, ลิงก์ภายใน (RSC)
│   │   ├── Header.tsx              # เมนูนำทาง, ตราสัญลักษณ์, เบอร์โทรด่วน, Mobile Drawer
│   │   ├── Hero.tsx                # แบนเนอร์หลัก, สโลแกน, ตราสัญลักษณ์, กราฟิก 3D (RSC)
│   │   ├── Pricing.tsx             # ตารางแพ็กเกจราคาเริ่มต้น 1,000.- / 1,500.- (RSC)
│   │   ├── ScrollObserver.tsx      # ระบบตรวจจับการเลื่อนจอ Scroll-Reveal 60fps (Client Component)
│   │   ├── ScrollToTopButton.tsx   # ปุ่มลอยเลื่อนกลับด้านบนสุดแบบ Smooth
│   │   ├── Services.tsx            # 4 บริการหลัก (ทำบัญชี, ตรวจสอบ, บุคคล, ทะเบียน) (RSC)
│   │   └── WhyUs.tsx               # 4 จุดเด่น (คุณภาพ, ซื่อสัตย์, ราคายุติธรรม, สะดวก) (RSC)
│   └── lib/
│       └── prisma.ts               # Singleton MySQL Prisma Client สำหรับ Next.js
├── .env.example                    # ตัวอย่างการตั้งค่า Environment Variables
├── .eslintrc.json                  # การตั้งค่า ESLint สำหรับ Next.js
├── .gitignore                      # กำหนดไฟล์ที่ไม่ต้องส่งขึ้น Git (เช่น .next, node_modules, .env)
├── DEPLOYMENT.md                   # คู่มือการติดตั้งบน VPS, Nginx, Plesk Obsidian, Vesta CP
├── package.json                    # รายการ Dependencies และ Scripts
├── server.js                       # Entry point สำหรับรันบน Plesk Node.js / Passenger
├── tsconfig.json                   # การตั้งค่า TypeScript Compiler
└── README.md                       # เอกสารอธิบายโครงการฉบับสมบูรณ์
```

---

## 🚀 3. เริ่มต้นใช้งานบนเครื่อง Local (Getting Started)

### ขั้นตอนที่ 1: ติดตั้ง Dependencies
```bash
npm install
```

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables
คัดลอกไฟล์ตัวอย่าง `.env.example` ไปเป็น `.env`:
```bash
cp .env.example .env
```
เปิดไฟล์ `.env` และระบุการเชื่อมต่อ MySQL:
```env
DATABASE_URL="mysql://deethavorn_user:YourStrongPassword@localhost:3306/deethavorn_db"
```

### ขั้นตอนที่ 3: ซิงค์ฐานข้อมูล (Prisma Migration)
```bash
npx prisma generate
npx prisma db push
```

### ขั้นตอนที่ 4: รันโหมด Development Server
```bash
npm run dev
```
เปิดเบราว์เซอร์เข้าใช้งานที่: [http://localhost:3000](http://localhost:3000)

### ขั้นตอนที่ 5: ตรวจสอบความถูกต้อง (Linting & Build Test)
```bash
# ตรวจสอบมาตรฐานโค้ดด้วย ESLint (ต้องได้ 0 errors)
npm run lint

# ทดสอบ Compile Production Bundle
npm run build

# รันชุดทดสอบ End-to-End ด้วยสคริปต์อัตโนมัติ
node scripts/verify-webapp.mjs
```

---

## 🐙 4. ขั้นตอนการนำขึ้น Git Repository (Git Setup & Push)

โปรเจกต์นี้ได้รับการจัดเตรียมไฟล์ `.gitignore` ที่สมบูรณ์แล้ว เพื่อป้องกันไม่ให้ข้อมูลความลับ (`.env`) หรือไฟล์ Build ชั่วคราว (`.next/`, `node_modules/`) ถูกอัปโหลดขึ้น Git

### คำสั่งสำหรับเริ่มต้น Git และ Push โค้ด:
```bash
# 1. เริ่มต้น Git Repository (หากยังไม่เคย init)
git init

# 2. เพิ่มไฟล์ทั้งหมดเข้า Staging Area
git add .

# 3. ตรวจสอบสถานะว่าไม่มีไฟล์ .env หรือ node_modules หลุดเข้าไป
git status

# 4. Commit โค้ด
git commit -m "feat: complete Next.js 15 migration from Wix with MySQL Prisma and agent skills"

# 5. เชื่อมต่อไปยัง Git Remote (เช่น GitHub หรือ GitLab)
git remote add origin https://github.com/<username>/deethavorn-web.git
git branch -M main

# 6. Push โค้ดขึ้น Remote Repository
git push -u origin main
```

---

## 🌐 5. การ Deploy สู่ Production Server

ระบบได้รับการออกแบบให้รองรับการทำงานบน Server อิสระทุกรูปแบบ ไม่ว่าจะเป็น:
* **Ubuntu / Debian VPS** ที่ใช้ Nginx Reverse Proxy + PM2
* **Plesk Obsidian Control Panel** ผ่าน Node.js Extension
* **Vesta CP / Hestia CP** ผ่าน Nginx Proxy

👉 ดูคู่มือขั้นตอนอย่างละเอียดทีละขั้นได้ที่: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🤖 6. AI Agent Specialist Skills ในโปรเจกต์

ระบบนี้ได้รับการติดตั้ง Agent Skills ตามมาตรฐาน `skills.sh` ภายในโฟลเดอร์ `.agents/skills/`:
1. `/frontend-design` – กำหนดมาตรฐานความงาม อัตลักษณ์หน้าเว็บ การจัดสัดส่วนสี และ Typography ที่โดดเด่น (Anthropic)
2. `/web-design-guidelines` – Audit คุณภาพ UI, UX, Accessibility (WCAG 2.1 AA) และ Responsive Design (Vercel)
3. `/next-best-practices` – แนวทางการพัฒนา Next.js 15+ App Router, RSC boundaries, Async params, Error handling (Vercel)
4. `/shadcn` – แนวทางและการจัดการ Component ตามมาตรฐาน shadcn/ui และ Radix UI
5. `/webapp-testing` – เครื่องมือและแนวทางการเขียนชุดทดสอบ Playwright สำหรับเว็บแอปพลิเคชัน (Anthropic)
6. `/debug-mantra` – วินัยการแก้บั๊ก 4 ขั้นตอน: Reproduce -> Trace Fail Path -> Falsify -> Breadcrumbs (9ARM)
7. `/grill-me` – จำลองการซักไซ้เจาะลึกสถาปัตยกรรมและแผนงานก่อนเริ่มเขียนโค้ด (Matt Pocock)
8. `/scrutinizer` – ตรวจสอบทบทวนโค้ดจากมุมมองบุคคลภายนอก ตรวจสอบ Flow จริงตั้งแต่ต้นจนจบ (9ARM)

---

## 📋 7. แนวทางปฏิบัติและข้อกำหนดการพัฒนาตาม Skills (Engineering & Design Guidelines)

เพื่อรักษาคุณภาพของโค้ดให้เป็นไปตามมาตรฐานระดับสากล ทุกการพัฒนาต่อยอดในโปรเจกต์นี้จะต้องปฏิบัติตามข้อกำหนดดังต่อไปนี้:

### 1. สถาปัตยกรรม Next.js 15+ (อ้างอิง `next-best-practices`)
* **RSC Boundaries (Server First):** พัฒนา Component ให้เป็น **React Server Component (RSC)** เป็นค่าเริ่มต้นเสมอ ห้ามใส่ `'use client'` ยกเว้น Component นั้นต้องการ State (`useState`), Effects (`useEffect`) หรือ Client Event Handlers (`onClick`, `onSubmit`) เท่านั้น
* **Async APIs:** ใน Next.js 15 พารามิเตอร์ `params` และ `searchParams` รวมถึง `cookies()`, `headers()` มีลักษณะเป็น Async ต้องใช้ `await` เสมอ
* **Route Conventions:** หน้าเว็บต้องมีโครงสร้างมาตรฐาน เช่น `not-found.tsx` สำหรับกรณีหาหน้าไม่พบ และ `error.tsx` สำหรับ Error Boundary
* **Dynamic Route Handlers:** API Routes ที่มีการรับส่งข้อมูลแบบ Real-time (เช่น `/api/contact`) ต้องประกาศ `export const dynamic = 'force-dynamic'`

### 2. มาตรฐานการเข้าถึงและ UI/UX (อ้างอิง `web-design-guidelines` & `shadcn`)
* **Form Accessibility:** ทุกช่อง Input/Textarea ต้องมี `id` และต้องผูกกับ `<label htmlFor="...">` เสมอ ห้ามปล่อยให้ Label ลอย
* **Input Attributes:** ฟิลด์อีเมลต้องใส่ `autoComplete="email" spellCheck={false}` และฟิลด์โทรศัพท์ต้องใส่ `autoComplete="tel" inputMode="tel"`
* **Live Notifications:** ข้อความแจ้งเตือนสถานะสำเร็จ/ล้มเหลว ต้องใส่ `role="status"` และ `aria-live="polite"`
* **Interactive State:** ปุ่ม Accordion, Dropdown หรือ Drawer เมนู ต้องมี `aria-expanded` และ `aria-controls`
* **Performance CSS:** ห้ามใช้ `transition: all` ให้ระบุเฉพาะ properties ที่เคลื่อนไหวจริง (`transform`, `opacity`, `color`, `background-color`, `box-shadow`) เพื่อป้องกัน Layout Shift
* **Accessibility Settings:** รองรับ `@media (prefers-reduced-motion: reduce)` และใส่ `scroll-margin-top` บน Section เพื่อไม่ให้ Sticky Header บังหัวข้อ

### 3. อัตลักษณ์และการออกแบบ (อ้างอิง `frontend-design`)
* **Brand Identity:** ใช้โทนสีประจำองค์กร Deep Indigo (`#1B2A80`) คู่กับ Electric Cyan (`#0098E5`) และ Ice Blue Tint (`#F4F8FD`) หลีกเลี่ยงการใช้สีเทมเพลตโหล
* **Typography Discipline:** จัดสัดส่วนขนาดตัวอักษรชัดเจน และควบคุมความยาวบรรทัดของเนื้อหาให้อยู่ในเกณฑ์อ่านสบายตา (< 80 ตัวอักษรต่อบรรทัด)
* **Text Balancing:** ใช้ `text-wrap: balance` บนหัวข้อ (`h1`, `h2`) เพื่อป้องกันคำหลุดบรรทัดเดี่ยว (Widow word)
* **Tabular Numbers:** ตารางเปรียบเทียบราคาและตัวเลขทางบัญชีต้องใช้ `font-variant-numeric: tabular-nums`

### 4. การตรวจสอบและการประกันคุณภาพ (อ้างอิง `scrutinizer`, `debug-mantra`, `webapp-testing`)
* **Outsider Perspective:** ก่อนส่งมอบงาน ต้องทบทวนโค้ดจากจุดเริ่มต้น (Entry point) ไปจนถึงผลลัพธ์ปลายทาง (Exit effect) เช่น ตรวจสอบ Anchor Links ข้ามหน้า (ใช้ `<Link href="/#section">` ไม่ใช้ `<a href="...">` ใน Next.js)
* **Bot Mitigation & Sanitization:** แบบฟอร์มต้องมี Honeypot field ดักสแปมบอท และ Trim ข้อมูลก่อนบันทึกลง Database
* **Debugging Discipline:** เมื่อเจอบั๊ก ให้ทำตาม 4 ขั้นตอน: 1) สร้าง Repro ซ้ำได้แน่นอน 2) แกะ Fail path จริง 3) ตั้งสมมติฐานหักล้าง 4) จดบันทึกทุกผลการรัน
* **End-to-End Testing:** ใช้สคริปต์ Playwright ทดสอบ Flows สำคัญ (การโหลดหน้าแรก, การเปิดปิด Accordion, การเปิดเมนูมือถือ, และการ Submit Contact Form) ผ่าน `node scripts/verify-webapp.mjs`

---

## 🏢 ข้อมูลการติดต่อบริษัท

**บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)**  
เลขประจำตัวผู้เสียภาษี: 0105556108170  
เลขที่ 234/116 ถนนอโศก-ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310  
*(เดินทางสะดวก ใกล้ MRT เพชรบุรี ทางออก 1 เพียง 350 เมตร)*  

* 📞 เบอร์โทรศัพท์: 091-941-5656, 099-149-5656, 02-247-4111
* 💬 LINE Official: `@deethavorn`
* 🌐 เว็บไซต์: [https://www.deethavorn.com](https://www.deethavorn.com)
