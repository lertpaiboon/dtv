import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileSearch,
  FileText,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';
import type { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import CompanyRegChecklist from '@/components/CompanyRegChecklist';
import CompanyRegQuoteForm from '@/components/CompanyRegQuoteForm';

const HERO_DELIVERABLES = [
  'ตรวจและจองชื่อบริษัท',
  'เตรียมเอกสารให้ลงนาม',
  'ยื่นผ่าน DBD Biz Regist',
  'ส่งหนังสือรับรองบริษัท',
] as const;

const SCOPE_CARDS = [
  {
    icon: Briefcase,
    title: 'ปรึกษาก่อนจดทะเบียน',
    detail: 'ควรเป็นบริษัทหรือ หจก. ทุนเท่าไรดี และแบ่งหุ้นอย่างไร',
  },
  {
    icon: FileSearch,
    title: 'ตรวจและจองชื่อบริษัท',
    detail: 'เช็กว่าชื่อซ้ำหรือติดเงื่อนไขไหม แล้วจองชื่อในระบบ',
  },
  {
    icon: FileText,
    title: 'เตรียมเอกสารจดทะเบียน',
    detail: 'ข้อมูลผู้ถือหุ้น กรรมการ ที่ตั้ง และวัตถุประสงค์ พร้อมให้ลงนาม',
  },
  {
    icon: Globe,
    title: 'ยื่นจดทะเบียนออนไลน์',
    detail: 'ยื่นผ่าน DBD Biz Regist และติดตามจนนายทะเบียนรับจด',
  },
  {
    icon: FileCheck2,
    title: 'ตรวจข้อมูลหลังจดเสร็จ',
    detail: 'เทียบหนังสือรับรองกับข้อมูลที่ตกลงไว้ ถ้าผิดแก้ทันที',
  },
  {
    icon: Building2,
    title: 'แนะนำบัญชีและภาษีหลังเปิด',
    detail: 'บอกหน้าที่ปีแรก เช่น ทำบัญชี ยื่นภาษี จด VAT และปิดงบ',
  },
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'คุยเรื่องธุรกิจ',
    detail: 'ฟังว่าทำธุรกิจอะไร มีผู้ถือหุ้นกี่คน ตั้งทุนเท่าไร และใช้ที่อยู่ที่ไหน',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'ตรวจชื่อและรายละเอียด',
    detail: 'ตรวจชื่อบริษัท จองชื่อ และสรุปข้อมูลที่ต้องใช้ทั้งหมด',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'เตรียมเอกสารให้ลงนาม',
    detail: 'จัดทำข้อมูลคำขอและเอกสารให้ผู้เริ่มก่อการและกรรมการตรวจและลงนาม',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'ยื่นผ่าน DBD Biz Regist',
    detail: 'ยื่นคำขอออนไลน์ ชำระค่าธรรมเนียม และติดตามจนนายทะเบียนรับจด',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ส่งมอบและวางงานต่อ',
    detail: 'ส่งหนังสือรับรองและเอกสารบริษัท พร้อมแนะนำเรื่องบัญชีและภาษีปีแรก',
  },
];

const COMPARE_ROWS = [
  {
    topic: 'เตรียมเอกสาร',
    diy: 'ทำเองทั้งหมด',
    agency: 'เราร่างให้ คุณตรวจและลงนาม',
  },
  {
    topic: 'ยื่นคำขอ',
    diy: 'ศึกษาระบบ DBD เอง',
    agency: 'เรายื่นและติดตามสถานะ',
  },
  {
    topic: 'ค่าใช้จ่าย',
    diy: 'เฉพาะค่าธรรมเนียมราชการ',
    agency: 'ค่าธรรมเนียม + ค่าบริการ',
  },
  {
    topic: 'ถ้าถูกขอแก้',
    diy: 'แก้และยื่นใหม่เอง',
    agency: 'เราแก้ให้ตามขอบเขตงาน',
  },
  {
    topic: 'หลังจดเสร็จ',
    diy: 'หาข้อมูลภาษีเอง',
    agency: 'ได้สรุปหน้าที่บัญชีและภาษี',
  },
];

const DISSOLUTION_ITEMS = [
  'ปรึกษาว่าควรเลิกบริษัทอย่างไร ต้องใช้เอกสารอะไร',
  'เตรียมเอกสารและยื่นจดทะเบียนเลิกบริษัท',
  'ชำระบัญชีและจดทะเบียนเสร็จการชำระบัญชี',
  'จัดการหน้าที่ภาษีที่ค้าง เช่น แจ้งเลิก VAT',
] as const;

const TRUST_POINTS = [
  {
    title: 'คิดเรื่องภาษีตั้งแต่ก่อนจด',
    detail: 'ทุน วัตถุประสงค์ และรอบบัญชีที่เลือกวันนี้ มีผลกับภาษีปีหน้า เราจึงคุยเรื่องนี้ก่อนยื่น',
  },
  {
    title: 'ตรวจเอกสารก่อนยื่น',
    detail: 'ลดโอกาสถูกตีกลับ และไม่ต้องเสียเวลายื่นซ้ำ',
  },
  {
    title: 'ทำบัญชีและภาษีต่อได้เลย',
    detail: 'จดเสร็จแล้วต่อด้วยทำบัญชีรายเดือน ยื่นภาษี และปิดงบกับทีมเดิม',
  },
  {
    title: 'แจ้งความคืบหน้าทุกขั้น',
    detail: 'รู้ว่างานอยู่ขั้นไหน ทาง LINE หรือโทรศัพท์ จันทร์–ศุกร์',
  },
];

const RELATED_SERVICES = [
  {
    href: '/services/monthly-accounting',
    title: 'รับทำบัญชีรายเดือน',
    detail: 'บันทึกบัญชี เก็บเอกสาร และยื่นภาษีรายเดือน',
    image: '/images/process_desk.jpg',
    imageAlt: 'บริการรับทำบัญชีรายเดือน',
  },
  {
    href: '/services/vat-registration',
    title: 'จดทะเบียน VAT',
    detail: 'จดเมื่อรายได้ถึงเกณฑ์ หรือจดเองโดยสมัครใจ',
    image: '/images/service_reg.png',
    imageAlt: 'บริการจดทะเบียนภาษีมูลค่าเพิ่ม',
  },
  {
    href: '/services/tax-filing',
    title: 'บริการยื่นภาษี',
    detail: 'ภ.ง.ด. ภ.พ.30 และภาษีนิติบุคคลตามกำหนด',
    image: '/images/office_atmosphere.png',
    imageAlt: 'บริการยื่นภาษีสำหรับบริษัท',
  },
  {
    href: '/services/payroll-outsourcing',
    title: 'รับทำเงินเดือน',
    detail: 'คำนวณเงินเดือน ภาษีหัก ณ ที่จ่าย และประกันสังคม',
    image: '/images/process_meeting.jpg',
    imageAlt: 'บริการรับทำเงินเดือน',
  },
];

const COMPANY_REG_FAQS = [
  {
    q: 'จดทะเบียนบริษัทต้องใช้เงินเท่าไหร่',
    a: 'มีค่าธรรมเนียมราชการที่คิดตามทุนจดทะเบียน บวกค่าบริการถ้าจ้างสำนักงานบัญชี (เริ่มต้น 1,500 บาท) และค่าเอกสารเพิ่มตามกรณี ทุนจดทะเบียนเป็นเงินของบริษัท ไม่ใช่ค่าจด',
  },
  {
    q: 'จดทะเบียนบริษัทต้องมีผู้ถือหุ้นกี่คน',
    a: 'บริษัทจำกัดต้องมีผู้เริ่มก่อการอย่างน้อย 2 คน และผู้เริ่มก่อการแต่ละคนต้องถือหุ้นอย่างน้อย 1 หุ้น',
  },
  {
    q: 'จดทะเบียนบริษัทใช้เวลากี่วัน',
    a: 'ขึ้นกับความพร้อมของข้อมูล การยืนยันตัวตนและลงนามออนไลน์ของผู้เกี่ยวข้อง และการพิจารณาของนายทะเบียน โดยทั่วไปการจองชื่อใช้เวลา 1–2 วันทำการ และเมื่อยื่นคำขอพร้อมลงนามครบทุกคนแล้ว นายทะเบียนจะพิจารณาอนุมัติภายใน 1–3 วันทำการ',
  },
  {
    q: 'จดทะเบียนบริษัทออนไลน์ได้ไหม',
    a: 'ได้ และตั้งแต่ 1 ก.ค. 2569 การจดตั้งบริษัทจำกัดและห้างหุ้นส่วนใหม่ต้องยื่นออนไลน์ผ่าน DBD Biz Regist ของกรมพัฒนาธุรกิจการค้า',
  },
  {
    q: 'เปิดบริษัทใหม่ต้องจด VAT ทันทีไหม',
    a: 'ไม่จำเป็น ต้องจดเมื่อรายรับจากกิจการที่ต้องเสีย VAT เกิน 1.8 ล้านบาทต่อปี แต่จดก่อนโดยสมัครใจได้ ถ้าลูกค้าต้องการใบกำกับภาษี',
  },
  {
    q: 'บริษัทไม่มีรายได้ต้องทำบัญชีไหม',
    a: 'ต้อง ตราบที่บริษัทยังไม่ได้จดเลิก ต้องทำบัญชี ปิดงบ ให้ผู้สอบบัญชีตรวจ และยื่นงบทุกปี แม้ไม่มีรายได้',
  },
  {
    q: 'เลิกบริษัทต้องทำอะไรบ้าง',
    a: 'ผู้ถือหุ้นลงมติเลิก จดทะเบียนเลิก แต่งตั้งผู้ชำระบัญชี ชำระบัญชี แล้วจดทะเบียนเสร็จการชำระบัญชี พร้อมจัดการภาษีที่เกี่ยวข้อง',
  },
];

export default function CompanyRegistrationPage({ data }: { data: SubServiceDetailConfig }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMPANY_REG_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ===== R1: HERO & UPDATE BAND (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการ</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">รับจดทะเบียนบริษัท</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการจดทะเบียนบริษัท</p>
              <h1 className="ma-hero__title">
                <span>รับจดทะเบียนบริษัท</span>
                <span className="ma-hero__subtitle">
                  จดบริษัทใหม่ ดูแลเอกสารและขั้นตอนจนได้หนังสือรับรอง
                </span>
              </h1>
              <p className="page-hero__lead">
                เราช่วยตั้งแต่เลือกชื่อ กำหนดทุนและผู้ถือหุ้น เตรียมเอกสาร
                ไปจนยื่นจดทะเบียนกับกรมพัฒนาธุรกิจการค้าผ่าน DBD Biz Regist
                แล้วบอกต่อว่าหลังเปิดบริษัทต้องทำบัญชีและยื่นภาษีอะไรบ้าง
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  ปรึกษาจดทะเบียนบริษัท <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#pricing" className="btn btn-light btn-large">
                  ดูค่าจดทะเบียนบริษัท
                </Link>
              </div>
            </div>

            <div className="creg-hero__card">
              <div className="creg-hero__card-head">
                <div className="creg-hero__card-icon" aria-hidden="true">
                  <Building2 size={24} strokeWidth={1.85} />
                </div>
                <div>
                  <span className="creg-hero__card-kicker">สิ่งที่เราทำให้</span>
                  <strong>ตั้งแต่จองชื่อจนได้หนังสือรับรอง</strong>
                </div>
              </div>

              <ul className="creg-hero__card-list">
                {HERO_DELIVERABLES.map((item) => (
                  <li key={item}>
                    <span className="creg-hero__card-check" aria-hidden="true">
                      <Check size={16} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการรับจดทะเบียนบริษัท">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>แนะนำก่อนจดว่าควรตั้งทุนเท่าไร</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ยื่นออนไลน์ตามระบบใหม่ของ DBD</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ทำบัญชีและภาษีต่อได้ที่เดียว</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>แจ้งค่าบริการก่อนเริ่มงาน</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== R1.3: UPDATE BAND (DBD Biz Regist 2569) ===== */}
      <section aria-label="อัปเดตขั้นตอนจดทะเบียนบริษัท" className="creg-update-band">
        <div className="container creg-update-band__inner">
          <div className="creg-update-band__content">
            <span className="creg-update-band__pill">อัปเดต 2569</span>
            <p>
              <strong>ตั้งแต่ 1 ก.ค. 2569</strong> จดทะเบียนตั้งบริษัทจำกัดและห้างหุ้นส่วนใหม่
              ต้องยื่นออนไลน์ผ่าน <strong>DBD Biz Regist</strong> ไม่รับยื่นกระดาษที่สำนักงานแล้ว
            </p>
          </div>
          <a
            href="https://www.dbd.go.th/hotService/online_service"
            target="_blank"
            rel="noopener noreferrer"
            className="creg-update-band__link"
          >
            ดูบริการออนไลน์ของ DBD →
          </a>
        </div>
      </section>

      {/* ===== R2: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                รับจดบริษัท
                <br />
                เหมาะกับใคร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ถ้าอยากเปิดบริษัทให้ถูกตั้งแต่แรก ไม่ต้องเสียเวลานั่งกรอกข้อมูลในระบบเอง
              เราดูแลตั้งแต่คุยข้อมูลจนได้หนังสือรับรอง
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Sparkles size={28} strokeWidth={1.7} />
              </span>
              <h3>ผู้เริ่มธุรกิจใหม่</h3>
              <p>จดบริษัทครั้งแรก ยังไม่รู้ว่าต้องเตรียมอะไรและเริ่มตรงไหน</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <ShoppingBag size={28} strokeWidth={1.7} />
              </span>
              <h3>ร้านค้าและธุรกิจออนไลน์</h3>
              <p>ยอดขายโตจนอยากเปลี่ยนจากบุคคลธรรมดามาเป็นบริษัท</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>SME ที่กำลังขยาย</h3>
              <p>ตั้งบริษัทเพื่อรับงานลูกค้าองค์กร ขอสินเชื่อ หรือแยกธุรกิจใหม่</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <Users size={28} strokeWidth={1.7} />
              </span>
              <h3>หุ้นส่วนหลายคน</h3>
              <p>ต้องตกลงสัดส่วนหุ้นและอำนาจลงนามให้ชัดตั้งแต่ตั้งบริษัท</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== R3: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container">
          <div className="aud-scope__layout">
            <div className="aud-scope__left">
              <div className="section-heading reveal-on-scroll">
                <p className="section-kicker">ขอบเขตงาน</p>
                <h2>
                  บริการจดทะเบียนบริษัท
                  <br />
                  ครอบคลุมอะไรบ้าง
                </h2>
                <p>เราดูแลตั้งแต่ก่อนยื่นจนได้หนังสือรับรอง แล้วส่งต่องานบัญชีได้ทันที</p>
              </div>

              <div className="ma-scope__grid">
                {SCOPE_CARDS.map((card, idx) => {
                  const IconComponent = card.icon;
                  return (
                    <article
                      key={card.title}
                      className={`ma-scope__card reveal-on-scroll delay-${(idx % 2) + 1}`}
                    >
                      <span className="ma-scope__icon" aria-hidden="true">
                        <IconComponent size={22} strokeWidth={1.75} />
                      </span>
                      <h3>{card.title}</h3>
                      <p>{card.detail}</p>
                    </article>
                  );
                })}
              </div>

              <div className="creg-scope__next-box reveal-on-scroll">
                <strong>หลังเปิดบริษัท: ขั้นต่อไปที่ต้องทำ</strong>
                <p>
                  ได้หนังสือรับรองแล้ว บริษัทต้องเริ่มทำบัญชีและยื่นภาษีรายเดือน
                  ถ้าเข้าเกณฑ์ต้องจด VAT ด้วย ดูบริการ{' '}
                  <Link href="/services/monthly-accounting">รับทำบัญชีรายเดือน</Link> และ{' '}
                  <Link href="/services/vat-registration">จดทะเบียนภาษีมูลค่าเพิ่ม</Link>
                </p>
              </div>
            </div>

            <div className="aud-scope__right reveal-on-scroll delay-2">
              <div className="aud-scope__photo">
                <Image
                  src="/images/service_reg.png"
                  alt="ทีมงานดีถาวรให้คำปรึกษาการจดทะเบียนบริษัทใหม่"
                  fill
                  sizes="100vw"
                  quality={95}
                  className="aud-scope__img"
                />
              </div>
              <div className="aud-scope__deliverable-card">
                <span>จดทะเบียนผ่านระบบออนไลน์</span>
                <strong>DBD Biz Regist ของกรมพัฒนาธุรกิจการค้า ไม่ต้องเดินทางไปยื่นเอง</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== R4: DOCUMENTS + AEO QUICK ANSWER + CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents creg-documents">
        <div className="container">
          <div className="aud-aeo__top creg-documents__top reveal-on-scroll">
            <div>
              <p className="section-kicker">เอกสารจดทะเบียนบริษัท</p>
              <h2>
                จดทะเบียนบริษัท
                <br />
                ต้องเตรียมอะไรบ้าง
              </h2>
            </div>

            <div className="aud-aeo__quick-answer">
              <p>
                การจดทะเบียนบริษัทจำกัดต้องมี<strong>ผู้เริ่มก่อการอย่างน้อย 2 คน</strong>{' '}
                และเตรียมข้อมูลหลัก 7 เรื่อง คือ ชื่อบริษัท ที่ตั้งสำนักงานใหญ่ วัตถุประสงค์
                ทุนจดทะเบียน ข้อมูลผู้ถือหุ้น ข้อมูลกรรมการและอำนาจลงนาม และผู้สอบบัญชี
                จากนั้นยื่นออนไลน์ผ่าน <strong>DBD Biz Regist</strong>
              </p>
            </div>
          </div>

          <div className="afs-documents__layout">
            <div className="afs-documents__intro reveal-on-scroll">
              <div className="afs-documents__photo">
                <Image
                  src="/images/graphic_abstract.png"
                  alt="เอกสารที่ต้องใช้จดทะเบียนบริษัทจำกัด"
                  fill
                  sizes="(max-width: 991px) 100vw, 480px"
                  className="afs-documents__img"
                />
              </div>

              <div className="afs-documents__reassure">
                <strong>
                  ยังตัดสินใจไม่ได้ว่าควรตั้งทุนเท่าไร หรือเขียนวัตถุประสงค์อย่างไร?
                </strong>
                <p>คุยกับทีมงานก่อนได้ เราช่วยดูให้เหมาะกับธุรกิจและแผนภาษีปีแรก</p>
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ma-quote__line-btn"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  <span>ปรึกษาทาง LINE</span>
                </a>
              </div>
            </div>

            <div className="reveal-on-scroll delay-2">
              <CompanyRegChecklist />
            </div>
          </div>
        </div>
      </section>

      {/* ===== R5: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอนการจดทะเบียน</p>
              <h2>
                ขั้นตอนจดทะเบียนบริษัท
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ตั้งแต่คุยข้อมูลครั้งแรกจนได้หนังสือรับรอง เราแจ้งทุกขั้นว่าตอนนี้ถึงไหนแล้ว
            </p>
          </div>

          <ol className="ma-steps">
            {PROCESS_STEPS.map((item, idx) => (
              <li
                key={item.step}
                className={`ma-step ${idx === 0 ? 'ma-step--active' : ''} reveal-on-scroll delay-${(idx % 4) + 1}`}
              >
                <span className="ma-step__badge">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== R6: PRICING (#pricing — Navy Section) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าจดทะเบียนบริษัท</p>
              <h2>
                จดทะเบียนบริษัท
                <br />
                ราคาเท่าไหร่
              </h2>
              <p>
                ค่าจดทะเบียนบริษัทมี 2 ส่วน คือ <strong>ค่าธรรมเนียมราชการ</strong>{' '}
                ที่จ่ายให้กรมพัฒนาธุรกิจการค้า (คิดตามทุนจดทะเบียน) และ<strong>ค่าบริการ</strong>
                ของสำนักงานบัญชีถ้าจ้างให้ทำแทน
              </p>
            </div>

            <div className="aud-pricing__factors-table">
              <div className="aud-pricing__factor-row">
                <strong>ค่าธรรมเนียมราชการ</strong>
                <span>
                  คิดตามทุนจดทะเบียนและประเภทคำขอ ดูอัตราล่าสุดที่{' '}
                  <a
                    href="https://www.dbd.go.th/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="creg-pricing__ext-link"
                  >
                    dbd.go.th
                  </a>
                </span>
              </div>
              <div className="aud-pricing__factor-row">
                <strong>ค่าบริการจดทะเบียน</strong>
                <span>ค่าตรวจชื่อ เตรียมเอกสาร และยื่นคำขอแทนคุณ</span>
              </div>
              <div className="aud-pricing__factor-row">
                <strong>ค่าเอกสารเพิ่มเติม</strong>
                <span>เช่น หนังสือรับรองหรือสำเนาเอกสารชุดเพิ่ม</span>
              </div>
              <div className="aud-pricing__factor-row">
                <strong>บริการเสริม</strong>
                <span>เช่น จด VAT หรือทำบัญชีหลังเปิดบริษัท</span>
              </div>
            </div>

            <div className="creg-pricing__callout">
              ทุนจดทะเบียนไม่ใช่ค่าใช้จ่าย เป็นเงินของบริษัทเอง เช่น ตั้งทุน 1 ล้านบาท
              ไม่ได้แปลว่าต้องจ่ายค่าจด 1 ล้านบาท
            </div>
          </div>

          <div className="ma-pricing__card reveal-on-scroll delay-2">
            <div className="ma-pricing__price-block">
              <span className="aud-pricing__card-kicker">จดทะเบียนบริษัทจำกัด</span>
              <span className="ma-pricing__price-label">ค่าบริการเริ่มต้น</span>
              <div className="ma-pricing__price-value">
                <strong>1,500</strong>
                <span>บาท เริ่มต้น</span>
              </div>
              <p className="aud-pricing__card-desc">
                ไม่รวมค่าธรรมเนียมราชการ (ชำระตามจริงตามทุนจดทะเบียนของกรมพัฒนาธุรกิจการค้า)
              </p>
            </div>

            <ul className="aud-pricing__checks">
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ปรึกษาโครงสร้างบริษัทและทุน</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ตรวจ จองชื่อ และเตรียมเอกสาร</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ยื่นผ่าน DBD Biz Regist จนจดเสร็จ</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>สรุปหน้าที่บัญชีและภาษีปีแรก</span>
              </li>
            </ul>

            <Link href="#quote" className="ma-pricing__cta">
              สอบถามราคาจดทะเบียนบริษัท
            </Link>
            <span className="ma-pricing__footnote">
              แจ้งค่าบริการและค่าธรรมเนียมราชการให้ทราบล่วงหน้าก่อนเริ่มงานทุกครั้ง
            </span>
          </div>
        </div>
      </section>

      {/* ===== R7: COMPARE DIY VS DEETHAVORN (#compare) ===== */}
      <section id="compare" className="section creg-compare">
        <div className="container creg-compare__layout">
          <div className="creg-compare__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เปรียบเทียบ</p>
              <h2>
                จดทะเบียนบริษัทเอง
                <br />
                กับจ้างสำนักงานบัญชี
              </h2>
            </div>
            <div className="creg-compare__summary">
              จดเองได้และประหยัดค่าบริการ แต่ต้องศึกษาระบบและแก้เอกสารเอง ถ้าไม่มีเวลา
              หรืออยากให้วางเรื่องบัญชีและภาษีตั้งแต่วันแรก
              การจ้างสำนักงานบัญชีช่วยลดงานและลดโอกาสยื่นผิด
            </div>
          </div>

          <div className="aud-aeo__table-wrap reveal-on-scroll delay-2">
            <table className="aud-aeo__table">
              <thead>
                <tr>
                  <th scope="col">ประเด็น</th>
                  <th scope="col">จดเอง</th>
                  <th scope="col" className="aud-aeo__th-hot">
                    ใช้บริการดีถาวร
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.topic}>
                    <td className="aud-aeo__td-key">{row.topic}</td>
                    <td>{row.diy}</td>
                    <td className="aud-aeo__td-hot">{row.agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== R8: DISSOLUTION (#dissolution) ===== */}
      <section id="dissolution" className="section creg-dissolution">
        <div className="container creg-dissolution__layout">
          <div className="creg-dissolution__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">บริการเลิกบริษัท</p>
              <h2>
                รับจดทะเบียนเลิกบริษัท
                <br />
                และเลิกกิจการ
              </h2>
              <p>
                ถ้าจะหยุดทำธุรกิจ ควรปิดบริษัทให้ถูกขั้นตอน ไม่อย่างนั้นบริษัทยังมีหน้าที่ทำบัญชี
                ยื่นงบ และยื่นภาษีอยู่ทุกปี
              </p>
            </div>

            <ul className="creg-dissolution__list">
              {DISSOLUTION_ITEMS.map((item) => (
                <li key={item}>
                  <Check size={20} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="creg-dissolution__actions">
              <Link href="#quote" className="btn btn-primary btn-large">
                ปรึกษาการเลิกบริษัท
              </Link>
              <Link href="/services/company-dissolution" className="creg-dissolution__more-link">
                ดูรายละเอียดบริการจดทะเบียนเลิกบริษัท →
              </Link>
            </div>
          </div>

          <div className="creg-dissolution__right reveal-on-scroll delay-2">
            <div className="creg-dissolution__photo">
              <Image
                src="/images/process_desk.jpg"
                alt="ลงนามเอกสารจดทะเบียนเลิกบริษัทและชำระบัญชี"
                fill
                sizes="(max-width: 991px) 100vw, 960px"
                quality={90}
                className="creg-dissolution__img"
              />
            </div>

            <div className="creg-dissolution__card">
              <h3>จดเลิกบริษัท กับปิดบริษัทเสร็จ เหมือนกันไหม</h3>
              <p>
                <strong>ไม่เหมือนกัน</strong> จดเลิกเป็นแค่ขั้นแรก
                บริษัทจะสิ้นสภาพจริงเมื่อชำระบัญชีและจดทะเบียนเสร็จการชำระบัญชีแล้ว
              </p>
              <ol className="creg-dissolution__steps">
                <li>
                  <span>1</span>
                  <strong>จดทะเบียนเลิก</strong>
                </li>
                <li>
                  <span>2</span>
                  <strong>ชำระบัญชี</strong>
                </li>
                <li>
                  <span>3</span>
                  <strong>จดเสร็จการชำระบัญชี</strong>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===== R9: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/process_meeting.jpg"
              alt="ทีมงานดีถาวรการบัญชีที่สำนักงาน"
              fill
              sizes="100vw"
              quality={90}
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “เริ่มตั้งแต่จดบริษัทและจด VAT จนตอนนี้ให้ดูแลบัญชีรายเดือนต่อ อธิบายเข้าใจง่าย
                ตอบ LINE เร็ว ไม่เคยปล่อยให้ค้าง”
              </p>
              <footer>— คุณปาริชาติ วงศ์สุวรรณ, ธุรกิจอีคอมเมิร์ซและนำเข้าสินค้า</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมจดทะเบียนบริษัท
                <br />
                กับดีถาวร
              </h2>
            </div>

            <div className="ma-trust__list">
              {TRUST_POINTS.map((item) => (
                <div key={item.title} className="ma-trust__item">
                  <span className="ma-trust__check" aria-hidden="true">
                    <CheckCircle2 size={24} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== R10: RELATED SERVICES (#related) ===== */}
      <section id="related" className="section creg-related">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">หลังจดทะเบียนบริษัท</p>
              <h2>
                บริการที่ต้องใช้
                <br />
                หลังเปิดบริษัท
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ได้หนังสือรับรองแล้ว บริษัทมีหน้าที่ทำบัญชีและยื่นภาษีตั้งแต่เดือนแรก
              วางระบบไว้ก่อน ปลายปีจะไม่ต้องตามเก็บเอกสาร
            </p>
          </div>

          <div className="creg-related__grid">
            {RELATED_SERVICES.map((svc, idx) => (
              <Link
                key={svc.href}
                href={svc.href}
                className={`creg-related__card reveal-on-scroll delay-${(idx % 4) + 1}`}
              >
                <div className="creg-related__photo">
                  <Image
                    src={svc.image}
                    alt={svc.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    quality={90}
                    className="creg-related__img"
                  />
                </div>
                <div className="creg-related__body">
                  <h3>{svc.title}</h3>
                  <p>{svc.detail}</p>
                  <span className="creg-related__more">ดูบริการ →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== R11: FAQ (#faq — 7 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              จดทะเบียนบริษัท
            </h2>
            <p>ไม่เจอคำตอบที่ต้องการ โทรถามได้ในเวลาทำการ</p>
            <div className="ma-faq__phones">
              <a href="tel:0991495656">099-149-5656</a>
              <a href="tel:0919415656">091-941-5656</a>
            </div>
          </div>

          <div className="ma-faq__list reveal-on-scroll delay-2">
            {COMPANY_REG_FAQS.map((faq, idx) => (
              <details key={faq.q} className="ma-faq__item" open={idx === 0}>
                <summary>
                  <h3>{faq.q}</h3>
                  <span className="ma-faq__toggle" aria-hidden="true">
                    <Plus size={16} />
                  </span>
                </summary>
                <p>
                  {faq.a}
                  {idx === 6 && (
                    <>
                      {' '}
                      (ดูส่วน <a href="#dissolution">รับจดทะเบียนเลิกบริษัท</a>)
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== R12A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>อ่านก่อนเปิดบริษัท</h2>
              <p>บทความจากทีมดีถาวร อ่านแล้วยังสงสัย ทัก LINE ถามต่อได้</p>
            </div>
            <Link href="/knowledge" className="ma-knowledge__all-btn">
              <span>ดูบทความทั้งหมด</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="ma-knowledge__grid">
            <Link
              href="/knowledge/5-things-before-company-registration"
              className="ma-kb-card ma-kb-card--featured reveal-on-scroll delay-1"
            >
              <div className="ma-kb-card__photo">
                <Image
                  src="/uploads/articles/cover-company-reg.jpg"
                  alt="ภาพปกบทความเรื่องจดทะเบียนบริษัท"
                  fill
                  sizes="(max-width: 920px) 100vw, 960px"
                  quality={90}
                  className="ma-kb-card__img"
                />
                <span className="ma-kb-card__tag">จดทะเบียนธุรกิจ</span>
              </div>
              <div className="ma-kb-card__body">
                <span className="ma-kb-card__date">18 ก.พ. 2569</span>
                <h3>
                  5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีและป้องกันปัญหาหุ้นส่วน
                </h3>
                <p>เรื่องที่ควรตกลงกันก่อนจด ทั้งทุน สัดส่วนหุ้น และอำนาจลงนาม</p>
                <span className="ma-kb-card__more">อ่านบทความ →</span>
              </div>
            </Link>

            <div className="ma-knowledge__side">
              <Link
                href="/knowledge/vat-registration-guide"
                className="ma-kb-card ma-kb-card--horizontal reveal-on-scroll delay-2"
              >
                <div className="ma-kb-card__photo">
                  <Image
                    src="/uploads/articles/cover-vat-guide.jpg"
                    alt="ภาพปกบทความเรื่องการจด VAT"
                    fill
                    sizes="(max-width: 920px) 100vw, 640px"
                    quality={90}
                    className="ma-kb-card__img"
                  />
                </div>
                <div className="ma-kb-card__body">
                  <span className="ma-kb-card__meta">
                    <strong>ภาษีอากร</strong> · 3 มี.ค. 2569
                  </span>
                  <h3>
                    ภาษีมูลค่าเพิ่ม (VAT 7%) ธุรกิจแบบไหนต้องจด เกณฑ์รายได้ 1.8 ล้านบาท
                    และขั้นตอนที่ถูกต้อง
                  </h3>
                  <span className="ma-kb-card__more">อ่านบทความ →</span>
                </div>
              </Link>

              <Link
                href="/knowledge/difference-between-cpa-and-ta"
                className="ma-kb-card ma-kb-card--horizontal reveal-on-scroll delay-3"
              >
                <div className="ma-kb-card__photo">
                  <Image
                    src="/uploads/articles/cover-cpa-audit.jpg"
                    alt="ภาพปกบทความเรื่อง CPA และ TA"
                    fill
                    sizes="(max-width: 920px) 100vw, 240px"
                    className="ma-kb-card__img"
                  />
                </div>
                <div className="ma-kb-card__body">
                  <span className="ma-kb-card__meta">
                    <strong>ตรวจสอบบัญชี</strong> · 20 ม.ค. 2569
                  </span>
                  <h3>
                    ข้อแตกต่างระหว่างผู้สอบบัญชีรับอนุญาต (CPA) และผู้สอบบัญชีภาษีอากร (TA)
                  </h3>
                  <span className="ma-kb-card__more">อ่านบทความ →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== R12B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              กำลังจะเปิดบริษัท?
              <br />
              ให้ดีถาวรช่วยจดทะเบียน
            </h2>
            <p className="ma-quote__lead">
              บอกชื่อที่อยากได้ ประเภทธุรกิจ และจำนวนผู้ถือหุ้น ทีมงานโทรกลับภายใน 1 วันทำการ
              พร้อมแจ้งค่าจดทะเบียนบริษัทและเอกสารที่ต้องเตรียม
            </p>

            <div className="ma-quote__contacts">
              <div className="ma-quote__contact-item">
                <Phone size={18} aria-hidden="true" />
                <div>
                  <small>โทร</small>
                  <a href="tel:0991495656">099-149-5656</a>
                  <a href="tel:0919415656">091-941-5656</a>
                </div>
              </div>
              <div className="ma-quote__contact-item">
                <Mail size={18} aria-hidden="true" />
                <div>
                  <small>อีเมล</small>
                  <a href="mailto:dtv_accounting@hotmail.com">dtv_accounting@hotmail.com</a>
                </div>
              </div>
            </div>

            <div className="ma-quote__line-box">
              <div className="ma-quote__qr">
                <Image
                  src="/images/line-qr.png"
                  alt="QR Code สำหรับเพิ่มเพื่อน LINE ดีถาวรการบัญชี"
                  width={108}
                  height={108}
                />
              </div>
              <div className="ma-quote__line-copy">
                <h4>คุยเรื่องจดบริษัททาง LINE ก็ได้</h4>
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ma-quote__line-btn"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  <span>แอด LINE คุยกับเรา</span>
                </a>
              </div>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <CompanyRegQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
