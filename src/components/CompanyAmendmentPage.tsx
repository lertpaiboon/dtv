import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Settings,
  UserCheck,
} from 'lucide-react';
import CompanyAmendmentDocSelector from '@/components/CompanyAmendmentDocSelector';
import CompanyAmendmentQuoteForm from '@/components/CompanyAmendmentQuoteForm';
import type { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

interface CompanyAmendmentPageProps {
  data: SubServiceDetailConfig;
}

const SERVICE_TYPES = [
  {
    icon: Building2,
    title: 'เปลี่ยนชื่อบริษัท',
    detail: 'จองชื่อใหม่ ลงมติพิเศษ แก้หนังสือบริคณห์สนธิ แล้วจดเปลี่ยนชื่อ บริษัทยังเป็นนิติบุคคลเดิม',
  },
  {
    icon: UserCheck,
    title: 'เปลี่ยนกรรมการบริษัท',
    detail: 'แต่งตั้ง ลาออก หรือเปลี่ยนอำนาจกรรมการผู้ลงนาม ตามมติและข้อบังคับบริษัท',
  },
  {
    icon: MapPin,
    title: 'เปลี่ยนที่อยู่บริษัท',
    detail: 'ย้ายสำนักงานใหญ่ในจังหวัดเดิมหรือข้ามจังหวัด ซึ่งใช้มติและเอกสารต่างกัน',
  },
  {
    icon: Coins,
    title: 'เพิ่มทุน / ลดทุนจดทะเบียน',
    detail: 'ลงมติพิเศษ ออกหุ้นใหม่หรือลดทุน แล้วจดเปลี่ยนแปลงทุนพร้อมรายชื่อผู้ถือหุ้น',
  },
  {
    icon: FileText,
    title: 'แก้ไขวัตถุประสงค์บริษัท',
    detail: 'เพิ่มหรือแก้วัตถุประสงค์ให้ครอบคลุมธุรกิจที่ทำจริง ก่อนเริ่มธุรกิจใหม่',
  },
  {
    icon: Settings,
    title: 'แก้ไขข้อบังคับและข้อมูลอื่น',
    detail: 'แก้ข้อบังคับบริษัท ตราประทับ หรือข้อมูลทะเบียนอื่นตามประเภทคำขอ',
  },
];

const FOR_WHOM_ITEMS = [
  {
    title: 'บริษัทที่กำลังปรับโครงสร้าง',
    detail: 'เปลี่ยนกรรมการ ผู้มีอำนาจลงนาม หรือโครงสร้างทุน',
  },
  {
    title: 'บริษัทที่ย้ายสำนักงาน',
    detail: 'ย้ายสำนักงานใหญ่ และต้องแก้ที่อยู่กับหลายหน่วยงาน',
  },
  {
    title: 'ธุรกิจที่กำลังขยาย',
    detail: 'เพิ่มทุนเพื่อรับงานใหญ่ หรือเพิ่มวัตถุประสงค์เพื่อทำธุรกิจใหม่',
  },
  {
    title: 'บริษัทที่ข้อมูลไม่ตรงความจริง',
    detail: 'ธนาคารหรือคู่ค้าขอหนังสือรับรองที่เป็นปัจจุบัน',
  },
];

const FIVE_CHECKS = [
  'เปลี่ยนเรื่องไหน กี่รายการ',
  'ต้องใช้มติแบบไหน ใครมีอำนาจอนุมัติ',
  'ข้อมูลและเอกสารประกอบครบหรือยัง',
  'ต้องจดให้ทันภายในวันไหน',
  'ต้องแจ้งหน่วยงานไหนต่อ',
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'บอกเรื่องที่ต้องแก้',
    detail: 'ส่งหนังสือรับรองบริษัทและรายละเอียดที่ต้องการเปลี่ยน',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'เช็กมติและเอกสาร',
    detail: 'ดูประเภทคำขอ มติที่ต้องใช้ และวันที่ต้องจดให้ทัน',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'ร่างเอกสารให้ลงนาม',
    detail: 'หนังสือนัดประชุม รายงานการประชุม และคำขอจดทะเบียน',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'ยื่นจดทะเบียนกับ DBD',
    detail: 'ยื่นผ่านระบบของกรมพัฒนาธุรกิจการค้าและติดตามจนรับจด',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ส่งหนังสือรับรองใหม่',
    detail: 'พร้อมรายการหน่วยงานที่ต้องแจ้งต่อ เช่น สรรพากร ธนาคาร',
  },
];

const AGENCIES_TO_NOTIFY = [
  {
    agency: 'DBD',
    detail: 'จดทะเบียนเปลี่ยนแปลงข้อมูลนิติบุคคล (จุดเริ่มต้น)',
    highlight: true,
  },
  {
    agency: 'กรมสรรพากร',
    detail: 'ย้ายที่อยู่หรือเปลี่ยนชื่อ บริษัทที่จด VAT ต้องแจ้งเปลี่ยนแปลงทะเบียนภาษีมูลค่าเพิ่ม',
    highlight: false,
  },
  {
    agency: 'ประกันสังคม',
    detail: 'ข้อมูลนายจ้างและที่ตั้งสถานประกอบการ',
    highlight: false,
  },
  {
    agency: 'ธนาคาร',
    detail: 'ชื่อบริษัท ที่อยู่ และกรรมการผู้มีอำนาจลงนามในบัญชี',
    highlight: false,
  },
  {
    agency: 'หน่วยงานออกใบอนุญาต',
    detail: 'ธุรกิจที่มีใบอนุญาตเฉพาะ เช่น อาหาร นำเข้า หรือท่องเที่ยว',
    highlight: false,
  },
];

const PRICING_FACTORS = [
  {
    title: 'ประเภทการเปลี่ยนแปลง',
    detail: 'ใช้มติพิเศษหรือไม่ มีขั้นตอนประชุมกี่รอบ',
  },
  {
    title: 'จำนวนรายการ',
    detail: 'แก้เรื่องเดียว หรือหลายเรื่องในคราวเดียว',
  },
  {
    title: 'ความซับซ้อนของเอกสาร',
    detail: 'เช่น ผู้ถือหุ้นต่างชาติ หรือย้ายข้ามจังหวัด',
  },
  {
    title: 'งานแจ้งหน่วยงานอื่น',
    detail: 'ถ้าให้เราแจ้งสรรพากรหรือประกันสังคมต่อ',
  },
];

const COMPARE_ROWS = [
  {
    topic: 'เช็กเงื่อนไข',
    diy: 'ศึกษาข้อกำหนดเอง',
    agency: 'เราบอกประเภทคำขอและมติที่ใช้',
  },
  {
    topic: 'เตรียมเอกสาร',
    diy: 'ร่างเอง',
    agency: 'เราร่าง คุณตรวจและลงนาม',
  },
  {
    topic: 'ยื่นจดทะเบียน',
    diy: 'ยื่นเอง',
    agency: 'เรายื่นและติดตามให้',
  },
  {
    topic: 'กำหนดเวลา',
    diy: 'ต้องคุมเอง',
    agency: 'เราวางวันให้ทัน 14 วัน',
  },
  {
    topic: 'ค่าใช้จ่าย',
    diy: 'เฉพาะค่าธรรมเนียม',
    agency: 'ค่าธรรมเนียม + ค่าบริการ',
  },
  {
    topic: 'แจ้งหน่วยงานอื่น',
    diy: 'หาข้อมูลเอง',
    agency: 'ได้รายการที่ต้องแจ้งต่อ',
  },
];

const TRUST_POINTS = [
  {
    title: 'เช็กมติก่อนประชุม ไม่ใช่หลังประชุม',
    detail: 'มติผิดประเภทต้องประชุมใหม่ เราจึงดูตั้งแต่ก่อนนัดประชุม',
  },
  {
    title: 'คุมกำหนดยื่นให้',
    detail: 'วางวันประชุมและวันยื่นให้ทันกำหนดตามกฎหมาย',
  },
  {
    title: 'เห็นผลกระทบทางบัญชีและภาษี',
    detail: 'เพิ่มทุนต้องบันทึกบัญชีอย่างไร ย้ายที่อยู่กระทบ VAT ไหม เราบอกได้',
  },
  {
    title: 'ไม่รับประกันผลแทนนายทะเบียน',
    detail: 'แต่เตรียมเอกสารให้ครบตามข้อกำหนด เพื่อลดโอกาสถูกขอแก้',
  },
];

const COMPANY_AMENDMENT_FAQS = [
  {
    q: 'แก้ไขข้อมูลบริษัทต้องทำอย่างไร',
    a: 'ดูว่าจะเปลี่ยนเรื่องไหน ประชุมลงมติตามที่กฎหมายหรือข้อบังคับกำหนด แล้วยื่นจดทะเบียนเปลี่ยนแปลงกับกรมพัฒนาธุรกิจการค้าให้ทันกำหนด',
  },
  {
    q: 'เปลี่ยนกรรมการบริษัทใช้เอกสารอะไร',
    a: 'รายงานการประชุมที่มีมติแต่งตั้งหรือถอดถอน หนังสือลาออก (ถ้ามี) สำเนาบัตรกรรมการใหม่ และคำขอจดทะเบียน ถ้าเปลี่ยนอำนาจลงนามต้องระบุให้ชัดด้วย',
  },
  {
    q: 'เปลี่ยนที่อยู่บริษัทต้องแจ้งสรรพากรไหม',
    a: 'ถ้าบริษัทจด VAT ต้องแจ้งเปลี่ยนแปลงทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.09) ล่วงหน้าไม่น้อยกว่า 15 วันก่อนย้าย และควรแจ้งประกันสังคมกับธนาคารเรื่องที่อยู่ใหม่',
  },
  {
    q: 'เปลี่ยนชื่อบริษัทต้องจดทะเบียนใหม่ไหม',
    a: 'ไม่ต้อง เป็นการจดเปลี่ยนชื่อของบริษัทเดิม เลขทะเบียนนิติบุคคลยังเป็นเลขเดิม แต่ต้องลงมติพิเศษและแก้หนังสือบริคณห์สนธิ',
  },
  {
    q: 'เพิ่มทุนจดทะเบียนบริษัทต้องทำอย่างไร',
    a: 'ประชุมผู้ถือหุ้นลงมติพิเศษให้เพิ่มทุน เสนอขายหุ้นใหม่ รับชำระค่าหุ้น แล้วจดทะเบียนเพิ่มทุนภายใน 14 วันนับจากวันลงมติ',
  },
  {
    q: 'แก้ไขข้อมูลบริษัทออนไลน์ได้ไหม',
    a: 'ได้ ยื่นจดทะเบียนเปลี่ยนแปลงผ่านระบบออนไลน์ของกรมพัฒนาธุรกิจการค้าได้ตามประเภทคำขอที่ระบบเปิดให้',
  },
  {
    q: 'แก้ไขข้อมูลบริษัทใช้เวลากี่วัน',
    a: 'ขึ้นกับประเภทการเปลี่ยนแปลงว่าต้องลงมติพิเศษหรือไม่ โดยกรณีทั่วไปที่ใช้มติกรรมการหรือมีมติผู้ถือหุ้นพร้อมแล้ว นายทะเบียน DBD ใช้เวลาพิจารณาอนุมัติประมาณ 1–3 วันทำการ ส่วนกรณีที่ต้องใช้มติพิเศษ (เช่น เปลี่ยนชื่อ ย้ายข้ามจังหวัด เพิ่มทุน) ต้องมีระยะเวลาบอกกล่าวนัดประชุมผู้ถือหุ้นล่วงหน้าไม่น้อยกว่า 14 วันตามกฎหมาย',
  },
  {
    q: 'ค่าบริการแก้ไขข้อมูลบริษัทเท่าไหร่',
    a: 'ขึ้นกับประเภทและจำนวนรายการที่แก้ บวกค่าธรรมเนียมราชการตามประเภทคำขอ ส่งหนังสือรับรองบริษัทมาให้ดู เราแจ้งราคาก่อนเริ่มงาน (ค่าบริการเริ่มต้น 1,500 บาท)',
  },
];

export default function CompanyAmendmentPage({ data }: CompanyAmendmentPageProps) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'บริการ',
        item: toAbsoluteUrl('/services'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.parentCategoryTitle,
        item: toAbsoluteUrl(`/services/${data.parentCategorySlug}`),
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'แก้ไขข้อมูลบริษัท',
        item: toAbsoluteUrl(`/services/${data.slug}`),
      },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'บริการรับจดทะเบียนแก้ไขเปลี่ยนแปลงข้อมูลบริษัท',
    description: data.seoDescription,
    serviceType: 'บริการจดทะเบียนเปลี่ยนแปลงข้อมูลบริษัทกับกรมพัฒนาธุรกิจการค้า (DBD)',
    provider: {
      '@type': 'AccountingService',
      name: 'บริษัท ดีถาวรการบัญชี จำกัด',
      url: toAbsoluteUrl('/'),
      telephone: '+66-99-149-5656',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Thailand',
    },
    url: toAbsoluteUrl(`/services/${data.slug}`),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMPANY_AMENDMENT_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ===== M1: HERO (#top) ===== */}
      <section id="top" className="page-hero ma-hero camd-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการ</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">แก้ไขข้อมูลบริษัท</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการงานทะเบียนธุรกิจ</p>
              <h1 className="ma-hero__title">
                <span>แก้ไขข้อมูลบริษัท</span>
                <span className="ma-hero__subtitle">
                  จดทะเบียนเปลี่ยนแปลงกับ DBD ให้ทันกำหนดและถูกตั้งแต่ครั้งแรก
                </span>
              </h1>
              <p className="page-hero__lead">
                เปลี่ยนกรรมการ ย้ายที่อยู่ เปลี่ยนชื่อ เพิ่มทุน หรือแก้วัตถุประสงค์
                เราดูว่าต้องใช้มติแบบไหน ร่างเอกสารให้ลงนาม ยื่นกับกรมพัฒนาธุรกิจการค้า
                แล้วบอกต่อว่าต้องแจ้งสรรพากร ธนาคาร หรือหน่วยงานไหนอีก
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  ปรึกษาแก้ไขข้อมูลบริษัท <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#pricing" className="btn btn-light btn-large">
                  ขอใบเสนอราคา
                </Link>
              </div>
            </div>

            <div className="camd-hero__card">
              <span className="camd-hero__card-label">งานที่ลูกค้าให้เราทำบ่อย</span>
              <div className="camd-hero__pills">
                <span>เปลี่ยนกรรมการ</span>
                <span>ย้ายที่อยู่</span>
                <span>เพิ่มทุน</span>
                <span>เปลี่ยนชื่อ</span>
                <span>แก้วัตถุประสงค์</span>
              </div>
              <div className="camd-hero__deadline">
                <span>ส่วนใหญ่ต้องจดภายใน</span>
                <strong>
                  14 วัน <small>นับจากวันลงมติ</small>
                </strong>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการแก้ไขข้อมูลบริษัท">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>เช็กมติและเอกสารก่อนยื่น</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ยื่นจดทะเบียนกับ DBD ให้</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>บอกต่อว่าต้องแจ้งที่ไหนอีก</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>แจ้งค่าบริการก่อนเริ่ม</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== M2: SERVICE TYPES 6 CARDS (#types) ===== */}
      <section id="types" className="section camd-types">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">รับแก้ไขข้อมูลบริษัท</p>
              <h2>
                แก้ไขข้อมูลบริษัท
                <br />
                เรื่องอะไรได้บ้าง
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ข้อมูลบนหนังสือรับรองบริษัทเปลี่ยนเมื่อไร
              ต้องจดทะเบียนเปลี่ยนแปลงบริษัทกับกรมพัฒนาธุรกิจการค้า
              เพื่อให้ข้อมูลตรงกับความจริงและใช้ทำธุรกรรมได้
            </p>
          </div>

          <div className="camd-types__grid">
            {SERVICE_TYPES.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <article
                  key={item.title}
                  className={`ma-scope__card reveal-on-scroll delay-${(idx % 3) + 1}`}
                >
                  <span className="ma-scope__icon" aria-hidden="true">
                    <IconComponent size={22} strokeWidth={1.75} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== M3: FOR WHOM (#for) ===== */}
      <section id="for" className="section camd-for">
        <div className="container camd-for__layout">
          <div className="camd-for__photo reveal-on-scroll">
            <Image
              src="/images/office_atmosphere.png"
              alt="อาคารสำนักงานของบริษัทที่กำลังปรับข้อมูลทะเบียน"
              fill
              sizes="100vw"
              quality={95}
              className="camd-for__img"
            />
          </div>

          <div className="camd-for__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการแก้ไขข้อมูลบริษัท
                <br />
                เหมาะกับใคร
              </h2>
            </div>

            <div className="camd-for__list">
              {FOR_WHOM_ITEMS.map((item) => (
                <div key={item.title} className="camd-for__item">
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

      {/* ===== M4: DOCUMENTS INTERACTIVE SELECTOR + 5 CHECKS (#documents) ===== */}
      <section id="documents" className="section camd-documents">
        <div className="container camd-documents__wrap">
          <div className="aud-aeo__top reveal-on-scroll">
            <div>
              <p className="section-kicker">เอกสารจดทะเบียนเปลี่ยนแปลง</p>
              <h2>
                จดทะเบียนเปลี่ยนแปลงบริษัท
                <br />
                ต้องใช้เอกสารอะไร
              </h2>
            </div>
            <div className="aud-aeo__quick-answer">
              <p>
                เอกสารขึ้นกับเรื่องที่เปลี่ยน ทุกกรณีต้องมี<strong>มติที่ประชุม</strong>
                ตามที่กฎหมายหรือข้อบังคับกำหนด คำขอจดทะเบียน และหลักฐานเฉพาะเรื่อง เช่น
                เอกสารสถานที่ตั้งเมื่อย้ายที่อยู่ หรือรายชื่อผู้ถือหุ้นเมื่อเพิ่มทุน
              </p>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <CompanyAmendmentDocSelector />
          </div>

          <div className="camd-documents__five-checks reveal-on-scroll delay-3">
            <h3>
              ก่อนยื่นแก้ไขข้อมูลบริษัท
              <br />
              ควรเช็ก 5 เรื่องนี้
            </h3>
            <ol className="camd-documents__five-list">
              {FIVE_CHECKS.map((item, idx) => (
                <li key={item}>
                  <span>{idx + 1}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== M5: PROCESS 5 STEPS (#process) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอน</p>
              <h2>
                ขั้นตอนแก้ไขข้อมูลบริษัท
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ถ้ายังไม่ได้ประชุมลงมติ ติดต่อเราก่อน จะได้วางวันประชุมและวันยื่นให้ทันกำหนด
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

      {/* ===== M6: AGENCIES TO NOTIFY (#agencies — Navy Section) ===== */}
      <section id="agencies" className="section camd-agencies">
        <div className="container camd-agencies__layout">
          <div className="camd-agencies__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">หลังแก้ไขกับ DBD</p>
              <h2>
                เปลี่ยนแปลงข้อมูลบริษัท
                <br />
                ต้องแจ้งหน่วยงานไหนบ้าง
              </h2>
              <p className="vreg-after__lead">
                จดเปลี่ยนแปลงกับ DBD แล้ว<strong>ยังไม่จบ</strong> บางเรื่องต้องแจ้งกรมสรรพากร
                ประกันสังคม ธนาคาร หรือหน่วยงานที่ออกใบอนุญาตต่อ
                โดยเฉพาะการย้ายที่อยู่และเปลี่ยนกรรมการผู้ลงนาม
              </p>
            </div>

            <div className="vreg-after__links">
              <span>เกี่ยวกับภาษี:</span>
              <Link href="/services/vat-registration">จดทะเบียน VAT →</Link>
              <Link href="/services/tax-consulting">ที่ปรึกษาภาษี →</Link>
            </div>
          </div>

          <div className="camd-agencies__table reveal-on-scroll delay-2">
            {AGENCIES_TO_NOTIFY.map((row) => (
              <div key={row.agency} className="camd-agencies__row">
                <strong className={row.highlight ? 'camd-agencies__key--highlight' : ''}>
                  {row.agency}
                </strong>
                <span>{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== M7: PRICING (#pricing) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าจดทะเบียนเปลี่ยนแปลงบริษัท
                <br />
                คิดอย่างไร
              </h2>
              <p>
                ค่าใช้จ่ายมี 2 ส่วน คือ<strong>ค่าธรรมเนียมราชการ</strong>ตามประเภทคำขอ
                (บางเรื่องคิดตามจำนวนทุนที่เพิ่ม) และ<strong>ค่าบริการ</strong>เตรียมเอกสารและยื่นแทน
                แก้หลายเรื่องพร้อมกันมักคุ้มกว่าแยกยื่น
              </p>
            </div>

            <div className="camd-pricing__factors-grid">
              {PRICING_FACTORS.map((factor) => (
                <div key={factor.title} className="camd-pricing__factor-card">
                  <strong>{factor.title}</strong>
                  <span>{factor.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ma-pricing__card reveal-on-scroll delay-2">
            <div className="ma-pricing__price-block">
              <span className="aud-pricing__card-kicker">จดทะเบียนเปลี่ยนแปลงบริษัท</span>
              <span className="ma-pricing__price-label">ค่าบริการเริ่มต้นต่อรายการ</span>
              <div className="ma-pricing__price-value">
                <strong>1,500</strong>
                <span>บาท เริ่มต้น</span>
              </div>
              <p className="aud-pricing__card-desc">
                ไม่รวมค่าธรรมเนียมราชการตามประเภทคำขอ (ราคาขึ้นอยู่กับประเภทการแก้ไข เช่น
                เปลี่ยนกรรมการ ย้ายที่ตั้งสำนักงาน หรือเพิ่มทุนจดทะเบียน)
              </p>
            </div>

            <ul className="aud-pricing__checks">
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ร่างหนังสือนัดประชุมและรายงานการประชุม</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>เตรียมคำขอและยื่นกับ DBD</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ส่งหนังสือรับรองฉบับใหม่</span>
              </li>
            </ul>

            <Link href="#quote" className="ma-pricing__cta">
              ขอใบเสนอราคาแก้ไขข้อมูลบริษัท
            </Link>
            <span className="ma-pricing__footnote">
              แจ้งค่าบริการและค่าธรรมเนียมราชการให้ทราบล่วงหน้าก่อนเริ่มงานทุกครั้ง
            </span>
          </div>
        </div>
      </section>

      {/* ===== M8: COMPARE DIY VS DEETHAVORN (#compare) ===== */}
      <section id="compare" className="section creg-compare">
        <div className="container creg-compare__layout">
          <div className="creg-compare__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เปรียบเทียบ</p>
              <h2>
                แก้ไขข้อมูลบริษัทเอง
                <br />
                หรือใช้สำนักงานบัญชี
              </h2>
            </div>
            <div className="creg-compare__summary">
              แก้เองได้ถ้าเป็นเรื่องเดียวและเข้าใจขั้นตอน แต่ถ้ามีหลายรายการ ต้องใช้มติพิเศษ
              หรือมีกำหนดเวลาบีบ การใช้สำนักงานบัญชีช่วยลดโอกาสเอกสารผิดและยื่นไม่ทัน
            </div>
          </div>

          <div className="aud-aeo__table-wrap reveal-on-scroll delay-2">
            <table className="aud-aeo__table">
              <thead>
                <tr>
                  <th scope="col">ประเด็น</th>
                  <th scope="col">ทำเอง</th>
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

      {/* ===== M9: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__content reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมแก้ไขข้อมูลบริษัท
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

          <div className="ma-trust__visual reveal-on-scroll delay-2">
            <Image
              src="/images/process_meeting.jpg"
              alt="ทีมงานดีถาวรการบัญชีที่ดูแลงานทะเบียนเปลี่ยนแปลงบริษัท"
              fill
              sizes="100vw"
              quality={90}
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ดูแลครบทั้งบัญชี ภาษี และงานทะเบียน
                เวลาต้องแก้ไขข้อมูลบริษัทหรือเตรียมเอกสารประชุมผู้ถือหุ้น
                ทีมงานช่วยร่างและตรวจความถูกต้องให้ครบ ไม่ต้องกังวลเรื่องกำหนดเวลา”
              </p>
              <footer>— คุณกิตติพงศ์ วัฒนากูล, กรรมการผู้จัดการ ธุรกิจซอฟต์แวร์</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ===== M10: FAQ (#faq — 8 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              แก้ไขข้อมูลบริษัท
            </h2>
            <p>ไม่เจอคำตอบที่ต้องการ โทรถามได้ในเวลาทำการ</p>
            <div className="ma-faq__phones">
              <a href="tel:0991495656">099-149-5656</a>
              <a href="tel:0919415656">091-941-5656</a>
            </div>
          </div>

          <div className="ma-faq__list reveal-on-scroll delay-2">
            {COMPANY_AMENDMENT_FAQS.map((faq, idx) => (
              <details key={faq.q} className="ma-faq__item" open={idx === 0}>
                <summary>
                  <h3>{faq.q}</h3>
                  <span className="ma-faq__toggle" aria-hidden="true">
                    <Plus size={16} />
                  </span>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== M11A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>อ่านเรื่องงานทะเบียนบริษัท</h2>
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
                <p>ทุน สัดส่วนหุ้น และอำนาจลงนาม ที่ตั้งดีตั้งแต่แรกจะไม่ต้องแก้ทีหลัง</p>
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
                    sizes="(max-width: 920px) 100vw, 640px"
                    quality={90}
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

      {/* ===== M11B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              ต้องการแก้ไขข้อมูลบริษัท?
              <br />
              ให้ดีถาวรช่วยดูแล
            </h2>
            <p className="ma-quote__lead">
              บอกว่าจะเปลี่ยนเรื่องไหน แนบหนังสือรับรองบริษัทมาด้วยก็ได้ ทีมงานโทรกลับภายใน 1
              วันทำการ พร้อมบอกมติที่ต้องใช้ วันที่ต้องยื่นให้ทัน และค่าบริการ
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
                <h4>ส่งหนังสือรับรองให้ดูทาง LINE ก็ได้</h4>
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
            <CompanyAmendmentQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
