import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting system initialization seed...');

  // 1. Roles & Permissions (RBAC Matrix)
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {
      permissions: ['*'],
    },
    create: {
      name: 'SUPER_ADMIN',
      description: 'ผู้ดูแลระบบสูงสุด (เข้าถึงและจัดการได้ทุกฟังก์ชัน)',
      permissions: ['*'],
    },
  });

  await prisma.role.upsert({
    where: { name: 'ACCOUNTANT' },
    update: {
      permissions: [
        'pnd51:view', 'pnd51:create', 'pnd51:edit',
        'wht:view', 'wht:create', 'wht:edit',
        'vat:view', 'vat:create', 'vat:edit',
        'companies:view', 'companies:create', 'companies:edit',
        'followup:view', 'followup:create', 'followup:edit',
        'article:view', 'article:create', 'article:edit',
      ],
    },
    create: {
      name: 'ACCOUNTANT',
      description: 'เจ้าหน้าที่บัญชีและการเงิน (จัดการภาษี, ทะเบียนบริษัท, และบันทึกการทวงถาม)',
      permissions: [
        'pnd51:view', 'pnd51:create', 'pnd51:edit',
        'wht:view', 'wht:create', 'wht:edit',
        'vat:view', 'vat:create', 'vat:edit',
        'companies:view', 'companies:create', 'companies:edit',
        'followup:view', 'followup:create', 'followup:edit',
        'article:view', 'article:create', 'article:edit',
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {
      permissions: [
        'article:view', 'article:create', 'article:edit',
        'article:review', 'article:publish', 'article:archive',
      ],
    },
    create: {
      name: 'EDITOR',
      description: 'บรรณาธิการคลังความรู้ (จัดการ, ตรวจสอบ และอนุมัติเผยแพร่บทความ)',
      permissions: [
        'article:view', 'article:create', 'article:edit',
        'article:review', 'article:publish', 'article:archive',
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: 'VIEWER' },
    update: {
      permissions: [
        'pnd51:view', 'wht:view', 'vat:view', 'companies:view', 'followup:view', 'article:view',
      ],
    },
    create: {
      name: 'VIEWER',
      description: 'ผู้ตรวจสอบ / ดูข้อมูลได้อย่างเดียว (ไม่สามารถเพิ่มหรือแก้ไขข้อมูล)',
      permissions: [
        'pnd51:view', 'wht:view', 'vat:view', 'companies:view', 'followup:view', 'article:view',
      ],
    },
  });

  console.log('✅ Roles initialized (with Article permissions).');

  // 2. Authors (E-E-A-T Master Profiles)
  const authorWichian = await prisma.author.upsert({
    where: { slug: 'wichian-deethavorn' },
    update: {
      name: 'คุณวิเชียร ดีถาวร',
      role: 'ผู้ก่อตั้งและหัวหน้าคณะผู้สอบบัญชี',
      credentials: 'ผู้สอบบัญชีรับอนุญาต (CPA Thailand) และที่ปรึกษาภาษีอากรอาวุโส ประสบการณ์กว่า 20 ปี',
      bio: 'ผู้เชี่ยวชาญด้านการวางแผนภาษีนิติบุคคล การตรวจสอบบัญชีตามมาตรฐานการรายงานทางการเงิน (TFRS for NPAEs) และการวางระบบควบคุมภายในสำหรับ SME',
      profileImage: '/images/DTV%20LOGO.png',
      sameAs: ['https://deethavorn.com/#why-us'],
    },
    create: {
      name: 'คุณวิเชียร ดีถาวร',
      slug: 'wichian-deethavorn',
      role: 'ผู้ก่อตั้งและหัวหน้าคณะผู้สอบบัญชี',
      credentials: 'ผู้สอบบัญชีรับอนุญาต (CPA Thailand) และที่ปรึกษาภาษีอากรอาวุโส ประสบการณ์กว่า 20 ปี',
      bio: 'ผู้เชี่ยวชาญด้านการวางแผนภาษีนิติบุคคล การตรวจสอบบัญชีตามมาตรฐานการรายงานทางการเงิน (TFRS for NPAEs) และการวางระบบควบคุมภายในสำหรับ SME',
      profileImage: '/images/DTV%20LOGO.png',
      sameAs: ['https://deethavorn.com/#why-us'],
    },
  });

  const authorTaxTeam = await prisma.author.upsert({
    where: { slug: 'deethavorn-tax-editorial' },
    update: {
      name: 'ทีมวิชาการภาษี ดีถาวรการบัญชี',
      role: 'ฝ่ายวิชาการและตรวจสอบข้อกฎหมายภาษีอากร',
      credentials: 'ผู้สอบบัญชีภาษีอากร (TA) และผู้เชี่ยวชาญการยื่นแบบภาษี กรมสรรพากร',
      bio: 'ทีมงานฝ่ายวิชาการทำหน้าที่ติดตามพระราชกฤษฎีกา คำวินิจฉัยสรรพากร และประกาศกระทรวงพาณิชย์ เพื่อส่งมอบข้อมูลที่ถูกต้องแก่ผู้ประกอบการ',
      profileImage: '/images/DTV%20LOGO.png',
    },
    create: {
      name: 'ทีมวิชาการภาษี ดีถาวรการบัญชี',
      slug: 'deethavorn-tax-editorial',
      role: 'ฝ่ายวิชาการและตรวจสอบข้อกฎหมายภาษีอากร',
      credentials: 'ผู้สอบบัญชีภาษีอากร (TA) และผู้เชี่ยวชาญการยื่นแบบภาษี กรมสรรพากร',
      bio: 'ทีมงานฝ่ายวิชาการทำหน้าที่ติดตามพระราชกฤษฎีกา คำวินิจฉัยสรรพากร และประกาศกระทรวงพาณิชย์ เพื่อส่งมอบข้อมูลที่ถูกต้องแก่ผู้ประกอบการ',
      profileImage: '/images/DTV%20LOGO.png',
    },
  });

  console.log('✅ Authors initialized (CPA & Tax Editorial Team).');

  // 3. Articles & E-E-A-T Datasets (Seed Articles)
  const articlesToSeed = [
    {
      title: 'ภาษีมูลค่าเพิ่ม (VAT 7%) ธุรกิจแบบไหนต้องจด เกณฑ์รายได้ 1.8 ล้านบาท และขั้นตอนที่ถูกต้อง',
      slug: 'vat-registration-guide',
      summary: 'เจาะลึกเกณฑ์รายได้ 1.8 ล้านบาทต่อปีที่ต้องจด VAT หน้าที่ของผู้ประกอบการจดทะเบียน ข้อแตกต่างภาษีซื้อ-ภาษีขาย และโทษปรับหากยื่นล่าช้า',
      category: 'ภาษีอากร',
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-03-03T08:30:00.000Z'),
      contentUpdatedAt: new Date('2026-04-01T09:00:00.000Z'),
      reviewedAt: new Date('2026-04-01T09:00:00.000Z'),
      nextReviewAt: new Date('2026-10-01T09:00:00.000Z'),
      authorId: authorWichian.id,
      reviewerId: authorTaxTeam.id,
      quickAnswer: 'ธุรกิจทุกประเภทที่มีรายได้จากการขายสินค้าหรือให้บริการเกิน 1.8 ล้านบาทต่อปี (ยกเว้นกิจการที่ได้รับยกเว้นตามกฎหมาย) มีหน้าที่ต้องยื่นคำขอจดทะเบียนภาษีมูลค่าเพิ่ม (แบบ ภ.พ.01) ภายใน 30 วันนับแต่วันที่รายได้เกินเกณฑ์ พร้อมหน้าที่ออกใบกำกับภาษีและยื่นแบบ ภ.พ.30 ทุกเดือน แม้เดือนนั้นจะไม่มีรายได้ก็ตาม',
      coverImage: '/uploads/articles/cover-vat-guide.jpg',
      coverImageAlt: 'ภาษีมูลค่าเพิ่ม (VAT 7%) เกณฑ์รายได้ 1.8 ล้านบาท และขั้นตอนที่ถูกต้อง',
      contentMarkdown: `## เกณฑ์รายได้ 1.8 ล้านบาทต่อนับอย่างไร

ตามประมวลรัษฎากร มาตรา 81/1 กำหนดให้ผู้ประกอบการที่มีรายรับจากการขายสินค้าหรือให้บริการเกินกว่า **1.8 ล้านบาทต่อปีภาษี** ต้องเข้าสู่ระบบภาษีมูลค่าเพิ่ม

> **ข้อควรระวัง**: รายได้ 1.8 ล้านบาท นับจาก **"ยอดขายรวมก่อนหักค่าใช้จ่าย"** ไม่ใช่ยอดกำไรสุทธิ และนับสะสมตั้งแต่วันแรกของปี หากวันใดมียอดขายสะสมแตะ 1,800,001 บาท กฎหมายกำหนดให้ต้องยื่นจด VAT ภายใน **30 วัน** นับจากวันนั้น

---

## ธุรกิจที่ได้รับการยกเว้นภาษีมูลค่าเพิ่มตามกฎหมาย

ประมวลรัษฎากร มาตรา 81 กำหนดธุรกิจบางประเภทที่ไม่ต้องจดทะเบียนภาษีมูลค่าเพิ่ม แม้จะมีรายได้เกิน 1.8 ล้านบาทต่อปี ได้แก่:
- กิจการขายพืชผลทางการเกษตร สัตว์เลี้ยง ทั้งมีชีวิตหรือไม่มีชีวิต
- กิจการขายปุ๋ย อาหารสัตว์ ยาหรือเคมีภัณฑ์ที่ใช้สำหรับพืชหรือสัตว์
- กิจการขายหนังสือพิมพ์ นิตยสาร หรือตำราเรียน
- การให้บริการการศึกษาของสถานศึกษาของทางราชการหรือเอกชน
- กิจการขนส่งในราชอาณาจักร (เช่น รถตู้ รถเมล์ แท็กซี่)
- การให้บริการรักษาพยาบาลของสถานพยาบาล

---

## ตารางเปรียบเทียบ: ภาษีซื้อ vs ภาษีขาย และการคำนวณภาษี

| รายการ | คำนิยาม | ผลกระทบต่อการจ่ายภาษี |
| :--- | :--- | :--- |
| **ภาษีขาย (Output Tax)** | VAT 7% ที่เรียกเก็บจากลูกค้าเมื่อขายสินค้า/บริการ | เป็นยอดที่ต้องนำส่งให้กรมสรรพากร |
| **ภาษีซื้อ (Input Tax)** | VAT 7% ที่จ่ายไปให้ซัพพลายเออร์เมื่อซื้อของ/จ้างงาน | ใช้เป็นเครดิตหักออกจากภาษีขายได้ |
| **ภาษีขาย > ภาษีซื้อ** | ภาษีขายมีจำนวนมากกว่าภาษีซื้อในเดือนนั้น | **ต้องชำระภาษีส่วนต่าง** ให้สรรพากร |
| **ภาษีซื้อ > ภาษีขาย** | ภาษีซื้อมีจำนวนมากกว่าภาษีซื้อในเดือนนั้น | **ขอคืนเงินสด หรือยกยอดเครดิตภาษี** ไปใช้เดือนถัดไป |

---

## ขั้นตอนการจดทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.01)

1. **เตรียมเอกสารหลักฐาน**: สำเนาหนังสือรับรองบริษัท, ทะเบียนบ้านและบัตรประชาชนกรรมการ, แผนที่ตั้งสถานประกอบการ
2. **ยื่นคำขอจดทะเบียน**: ผ่านระบบอินเทอร์เน็ตของกรมสรรพากร (e-Registration) หรือยื่นที่สรรพากรพื้นที่
3. **รับใบทะเบียน ภ.พ.20**: นำไปติดแสดงไว้ ณ สถานประกอบการในที่เปิดเผย

---

## บทลงโทษหากไม่จด VAT หรือยื่นแบบล่าช้า

- **เบี้ยปรับ**: 2 เท่าของเงินภาษีที่ต้องเสียในแต่ละเดือน
- **เงินเพิ่ม**: 1.5% ต่อเดือนของเงินภาษีที่ต้องชำระ
- **โทษปรับทางอาญา**: ปรับไม่เกิน 2,000 บาท ตามมาตรา 90/2`,
      faqs: [
        { question: 'รายได้ยังไม่ถึง 1.8 ล้านบาท สามารถขอจด VAT ก่อนได้หรือไม่?', answer: 'สามารถทำได้ครับ ผู้ประกอบการสามารถยื่นขอจดทะเบียนภาษีมูลค่าเพิ่มก่อนมีรายได้ถึงเกณฑ์ได้ (จดด้วยความสมัครใจ) เพื่อให้สามารถออกใบกำกับภาษีให้ลูกค้ารายใหญ่ และนำภาษีซื้อจากการลงทุนมาขอคืนภาษีได้', sortOrder: 1 },
        { question: 'หากเดือนไหนไม่มีรายได้เลย ยังต้องยื่นแบบ ภ.พ.30 หรือไม่?', answer: 'ยังคงต้องยื่นแบบ ภ.พ.30 ทุกเดือนครับ แม้ว่าเดือนนั้นจะมียอดขายเป็น 0 บาทก็ตาม โดยต้องยื่นเป็น "แบบยอดศูนย์" หากละเลยจะมีโทษปรับ 300 - 500 บาทต่อเดือน', sortOrder: 2 },
        { question: 'กำหนดการยื่นแบบ ภ.พ.30 ประจำเดือน คือวันไหน?', answer: 'กำหนดยื่นแบบกระดาษภายในวันที่ 15 ของเดือนถัดไป หรือยื่นผ่านอินเทอร์เน็ต (e-Filing) ภายในวันที่ 23 ของเดือนถัดไป', sortOrder: 3 },
      ],
      citations: [
        { title: 'ประมวลรัษฎากร มาตรา 81 และ 81/1 ว่าด้วยกิจการที่ได้รับยกเว้นและเกณฑ์มูลค่าของฐานภาษี', publisher: 'กรมสรรพากร', url: 'https://www.rd.go.th', referenceDate: new Date('2026-01-01'), accessedAt: new Date('2026-04-01'), sortOrder: 1 },
      ],
    },
    {
      title: '5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีและป้องกันปัญหาหุ้นส่วน',
      slug: '5-things-before-company-registration',
      summary: 'ข้อบังคับทางกฎหมายใหม่ ทุนจดทะเบียนที่เหมาะสม การเลือกประเภทนิติบุคคล และสิ่งต้องทำหลังจดทะเบียนสำเร็จ สรุปครบในที่เดียว',
      category: 'จดทะเบียนธุรกิจ',
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-02-18T08:30:00.000Z'),
      contentUpdatedAt: new Date('2026-03-20T10:00:00.000Z'),
      reviewedAt: new Date('2026-03-20T10:00:00.000Z'),
      nextReviewAt: new Date('2026-09-20T10:00:00.000Z'),
      authorId: authorWichian.id,
      reviewerId: authorTaxTeam.id,
      quickAnswer: 'กฎหมายหุ้นส่วนบริษัทฉบับใหม่กำหนดให้บริษัทจำกัดมีผู้เริ่มก่อการอย่างน้อย 2 คน (จากเดิม 3 คน) โดยทุนจดทะเบียนไม่จำเป็นต้องตั้ง 1 ล้านบาทเสมอไป แต่ควรสอดคล้องกับขนาดธุรกิจจริง และต้องเตรียมแต่งตั้งผู้สอบบัญชีรับอนุญาต (CPA) รับรองงบการเงินประจำปีตั้งแต่เริ่มต้น',
      coverImage: '/uploads/articles/cover-company-reg.jpg',
      coverImageAlt: '5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีและป้องกันปัญหาหุ้นส่วน',
      contentMarkdown: `## 1. กฎหมายใหม่: มีผู้เริ่มก่อการเพียง 2 คนก็จดบริษัทได้

ตามประมวลกฎหมายแพ่งและพาณิชย์ (ฉบับแก้ไขเพิ่มเติม) การจัดตั้งบริษัทจำกัดในปัจจุบันใช้ผู้เริ่มก่อการและผู้ถือหุ้นเพียง **อย่างน้อย 2 คน** ช่วยให้ผู้ประกอบการเริ่มต้นธุรกิจได้สะดวกรวดเร็วยิ่งขึ้น

---

## 2. ทุนจดทะเบียนที่เหมาะสม ไม่จำเป็นต้องตั้ง 1 ล้านบาทเสมอไป

- กฎหมายกำหนดมูลค่าหุ้นละไม่ต่ำกว่า **5 บาท** และต้องชำระค่าหุ้นครั้งแรกไม่น้อยกว่า **25%**
- ธุรกิจบริการขนาดเล็กอาจเริ่มต้นที่ทุน 100,000 – 500,000 บาทได้
- ทุน 1,000,000 บาท เหมาะกับธุรกิจที่ต้องการความน่าเชื่อถือสูงหรือยื่นกู้ธนาคาร

---

## 3. ตารางเปรียบเทียบ: บริษัทจำกัด (บจก.) vs ห้างหุ้นส่วนจำกัด (หจก.)

| ประเด็นเปรียบเทียบ | บริษัทจำกัด (บจก.) | ห้างหุ้นส่วนจำกัด (หจก.) |
| :--- | :--- | :--- |
| **จำนวนผู้จัดตั้ง** | อย่างน้อย 2 คน | อย่างน้อย 2 คน |
| **ความรับผิดชอบในหนี้สิน** | จำกัดไม่เกินจำนวนเงินค่าหุ้นที่ยังส่งใช้ไม่ครบ | หุ้นส่วนผู้จัดการรับผิดชอบไม่จำกัด |
| **การตรวจสอบงบการเงิน** | **ต้องใช้ CPA รับรองงบเท่านั้น** | ทุนไม่เกิน 5 ลบ. รายได้ไม่เกิน 30 ลบ. ใช้ **TA** ได้ |
| **อัตราภาษีเงินได้นิติบุคคล** | อัตราก้าวหน้า SME (กำไรไม่เกิน 3 แสน ยกเว้น) | อัตราก้าวหน้า SME แบบเดียวกัน |`,
      faqs: [
        { question: 'จดทะเบียนบริษัทคนเดียวได้หรือไม่ในปัจจุบัน?', answer: 'ยังไม่ได้ครับ ตามกฎหมายไทยปัจจุบัน การจัดตั้งบริษัทจำกัดต้องมีผู้เริ่มก่อการอย่างน้อย 2 คน', sortOrder: 1 },
        { question: 'ทุนจดทะเบียน 1 ล้านบาท ต้องนำเงินเข้าบัญชีจริงเท่าไหร่?', answer: 'กฎหมายกำหนดให้เรียกชำระค่าหุ้นครั้งแรกไม่น้อยกว่า 25% ดังนั้นทุน 1 ล้านบาท ต้องมีเงินเข้าบัญชีอย่างน้อย 250,000 บาท', sortOrder: 2 },
      ],
      citations: [
        { title: 'คู่มือการจดทะเบียนจัดตั้งบริษัทจำกัด กรมพัฒนาธุรกิจการค้า (DBD)', publisher: 'กรมพัฒนาธุรกิจการค้า กระทรวงพาณิชย์', url: 'https://www.dbd.go.th', accessedAt: new Date('2026-03-20'), sortOrder: 1 },
      ],
    },
    {
      title: 'ข้อแตกต่างระหว่าง ผู้สอบบัญชีรับอนุญาต (CPA) และ ผู้สอบบัญชีภาษีอากร (TA) ธุรกิจแบบไหนต้องใช้ใคร?',
      slug: 'difference-between-cpa-and-ta',
      summary: 'เปรียบเทียบคุณวุฒิ ขอบเขตอำนาจการรับรองงบการเงิน และเกณฑ์ตามกฎหมายที่ผู้ประกอบการต้องรู้ก่อนเลือกผู้สอบบัญชีประจำปี',
      category: 'ตรวจสอบบัญชี',
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2026-01-20T08:30:00.000Z'),
      contentUpdatedAt: new Date('2026-03-10T11:00:00.000Z'),
      reviewedAt: new Date('2026-03-10T11:00:00.000Z'),
      nextReviewAt: new Date('2026-09-10T11:00:00.000Z'),
      authorId: authorWichian.id,
      reviewerId: authorTaxTeam.id,
      quickAnswer: 'บริษัทจำกัดทุกแห่งไม่ว่าขนาดเล็กหรือใหญ่ กฎหมายบังคับให้ต้องตรวจสอบและรับรองงบการเงินโดย "ผู้สอบบัญชีรับอนุญาต (CPA)" เท่านั้น ส่วน "ผู้สอบบัญชีภาษีอากร (TA)" สามารถตรวจสอบได้รับรองเฉพาะห้างหุ้นส่วนนิติบุคคลขนาดเล็กที่มีทุนไม่เกิน 5 ล้านบาท สินทรัพย์ไม่เกิน 30 ล้านบาท และรายได้ไม่เกิน 30 ล้านบาท',
      coverImage: '/uploads/articles/cover-cpa-audit.jpg',
      coverImageAlt: 'ข้อแตกต่างระหว่าง ผู้สอบบัญชีรับอนุญาต (CPA) และ ผู้สอบบัญชีภาษีอากร (TA)',
      contentMarkdown: `## ทำความรู้จัก CPA และ TA

- **CPA (Certified Public Accountant)**: ผู้สอบบัญชีรับอนุญาต ได้รับใบอนุญาตจาก **สภาวิชาชีพบัญชี ในพระบรมราชูปถัมภ์**
- **TA (Tax Auditor)**: ผู้สอบบัญชีภาษีอากร ได้รับใบอนุญาตจาก **กรมสรรพากร**

---

## ตารางเปรียบเทียบ: CPA vs TA ขอบเขตอำนาจหน้าที่

| ประเด็น | CPA (ผู้สอบบัญชีรับอนุญาต) | TA (ผู้สอบบัญชีภาษีอากร) |
| :--- | :--- | :--- |
| **หน่วยงานผู้ออกใบอนุญาต** | สภาวิชาชีพบัญชีฯ | กรมสรรพากร |
| **บริษัทจำกัด (บจก.)** | **ตรวจสอบและรับรองได้ 100%** | **ไม่มีอำนาจตรวจสอบ** |
| **ห้างหุ้นส่วนจำกัด (หจก.) ขนาดใหญ่** | ตรวจสอบได้ทุกขนาด | ตรวจสอบไม่ได้ |
| **ห้างหุ้นส่วนจำกัด (หจก.) ขนาดเล็ก** | ตรวจสอบได้ | ตรวจสอบได้ |`,
      faqs: [
        { question: 'บริษัทจำกัดขนาดเล็กมาก เพิ่งมีรายได้หลักหมื่น จ้าง TA ได้หรือไม่?', answer: 'ไม่ได้ครับ กฎหมายระบุชัดเจนว่างบการเงินของบริษัทจำกัดต้องได้รับการตรวจสอบโดย CPA เท่านั้น ไม่ว่าจะมีรายได้มากหรือน้อยเพียงใด', sortOrder: 1 },
      ],
      citations: [
        { title: 'พระราชบัญญัติวิชาชีพบัญชี พ.ศ. 2547', publisher: 'สภาวิชาชีพบัญชี ในพระบรมราชูปถัมภ์', url: 'https://www.tfac.or.th', accessedAt: new Date('2026-03-10'), sortOrder: 1 },
      ],
    },
  ];

  for (const art of articlesToSeed) {
    const { faqs, citations, ...articleData } = art;
    const createdArticle = await prisma.article.upsert({
      where: { slug: art.slug },
      update: articleData,
      create: articleData,
    });

    // Replace FAQs
    await prisma.articleFaq.deleteMany({ where: { articleId: createdArticle.id } });
    if (faqs && faqs.length > 0) {
      await prisma.articleFaq.createMany({
        data: faqs.map((f) => ({ ...f, articleId: createdArticle.id })),
      });
    }

    // Replace Citations
    await prisma.articleCitation.deleteMany({ where: { articleId: createdArticle.id } });
    if (citations && citations.length > 0) {
      await prisma.articleCitation.createMany({
        data: citations.map((c) => ({ ...c, articleId: createdArticle.id })),
      });
    }
  }

  console.log('✅ Pilot Articles with FAQs & Citations successfully seeded into database.');

  // 4. Payment Methods (บัตรเครดิตสำนักงาน และวิธีชำระเงินหลัก)
  const paymentMethods = [
    { code: 'SCB_CARD', name: 'บัตรเครดิต SCB' },
    { code: 'BBL_CARD', name: 'บัตรเครดิต BBL' },
    { code: 'KBANK_CARD', name: 'บัตรเครดิต KBANK' },
    { code: 'TRANSFER', name: 'โอนเงินผ่านบัญชีธนาคาร' },
    { code: 'CASH', name: 'เงินสด / สำรองจ่าย' },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: pm.code },
      update: { name: pm.name },
      create: pm,
    });
  }
  console.log('✅ Payment Methods initialized (SCB, BBL, KBANK, Transfer, Cash).');

  // 5. Default Super Admin User
  const defaultAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const defaultAdminPassword = process.env.ADMIN_PASSWORD;
  if (!defaultAdminEmail || !defaultAdminPassword || defaultAdminPassword.length < 12) {
    console.log('ℹ️ Skipping admin creation. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to create one.');
    return;
  }
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultAdminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultAdminPassword, salt);

    await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        passwordHash: passwordHash,
        fullName: 'ผู้ดูแลระบบ ดีถาวร',
        roleId: superAdminRole.id,
        isActive: true,
      },
    });
    console.log(`✅ Super Admin created: ${defaultAdminEmail}`);
  } else if (process.env.RESET_ADMIN_PASSWORD === 'true') {
    const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { passwordHash, isActive: true, roleId: superAdminRole.id },
    });
    console.log(`✅ Super Admin password reset: ${defaultAdminEmail}`);
  } else {
    console.log(`ℹ️ Admin user ${defaultAdminEmail} already exists.`);
  }

  console.log('🎉 System initialization finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
