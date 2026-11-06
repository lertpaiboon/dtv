import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  FileText,
  Globe,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  Receipt,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import type { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import VatQuickCheck from '@/components/VatQuickCheck';
import VatDocChecklist from '@/components/VatDocChecklist';
import VatRegQuoteForm from '@/components/VatRegQuoteForm';

const SCOPE_CARDS = [
  {
    icon: MessageSquare,
    title: 'ปรึกษาเรื่องการจด VAT',
    detail: 'ดูประเภทธุรกิจและรายรับ ว่าต้องจด ควรจด หรือยังไม่จำเป็น',
  },
  {
    icon: Building2,
    title: 'ตรวจข้อมูลสถานประกอบการ',
    detail: 'ชื่อ ที่อยู่ และสิทธิใช้สถานที่ ให้ตรงกับเอกสารบริษัท',
  },
  {
    icon: FileText,
    title: 'เตรียมเอกสารจด VAT',
    detail: 'รวบรวมและเช็กเอกสารให้ครบก่อนยื่น ลดโอกาสถูกขอเพิ่ม',
  },
  {
    icon: Globe,
    title: 'ยื่นคำขอ ภ.พ.01',
    detail: 'ยื่นจดทะเบียน VAT ออนไลน์ผ่านระบบของกรมสรรพากร',
  },
  {
    icon: Clock,
    title: 'ติดตามสถานะ',
    detail: 'ส่งเอกสารเพิ่มถ้าถูกขอ และประสานกรณีมีตรวจสถานที่',
  },
  {
    icon: BarChart3,
    title: 'แนะนำหลังจด VAT',
    detail: 'ใบกำกับภาษี ภาษีซื้อ ภาษีขาย และการยื่น ภ.พ.30',
  },
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'เช็กเงื่อนไข',
    detail: 'บอกประเภทธุรกิจและรายรับ เราประเมินว่าต้องจดเมื่อไร',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'รวบรวมเอกสาร',
    detail: 'เช็กข้อมูลบริษัทและเอกสารสถานประกอบการให้ครบ',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'เตรียมคำขอ ภ.พ.01',
    detail: 'กรอกข้อมูลตามแบบของกรมสรรพากร แล้วให้คุณตรวจก่อนยื่น',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'ยื่นและติดตามผล',
    detail: 'ยื่นออนไลน์ ติดตามสถานะ และส่งเอกสารเพิ่มถ้าถูกขอ',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ส่ง ภ.พ.20 และวางงานต่อ',
    detail: 'ส่งใบทะเบียน และอธิบายการออกใบกำกับภาษีกับการยื่น ภ.พ.30',
  },
];

const AFTER_VAT_DUTIES = [
  {
    icon: Receipt,
    title: 'ออกใบกำกับภาษี',
    detail: 'ทุกครั้งที่ขาย ตามรูปแบบที่กฎหมายกำหนด',
  },
  {
    icon: Calculator,
    title: 'คำนวณภาษีซื้อ-ภาษีขาย',
    detail: 'ดูว่าภาษีซื้อใบไหนขอคืนได้ แล้วหักจากภาษีขาย',
  },
  {
    icon: FileText,
    title: 'ทำรายงานภาษี',
    detail: 'รายงานภาษีซื้อ ภาษีขาย และสินค้าคงเหลือ (ถ้ามี)',
  },
  {
    icon: CalendarCheck,
    title: 'ยื่น ภ.พ.30 รายเดือน',
    detail: 'ยื่นภายในเดือนถัดไปตามกำหนดของกรมสรรพากร',
  },
];

const COMPARE_ROWS = [
  {
    topic: 'เช็กเงื่อนไข',
    diy: 'ศึกษาเอง',
    agency: 'เราประเมินให้ก่อน',
  },
  {
    topic: 'เตรียมเอกสาร',
    diy: 'ทำเองทั้งหมด',
    agency: 'เราเช็กความครบให้',
  },
  {
    topic: 'ยื่นคำขอ',
    diy: 'ยื่นเอง',
    agency: 'เรายื่นแทนตามขอบเขต',
  },
  {
    topic: 'ติดตามสถานะ',
    diy: 'ติดต่อสรรพากรเอง',
    agency: 'เราติดตามและประสาน',
  },
  {
    topic: 'ค่าใช้จ่าย',
    diy: 'ไม่มี',
    agency: 'ค่าบริการตามที่ตกลง',
  },
  {
    topic: 'หลังจด VAT',
    diy: 'หาข้อมูลเอง',
    agency: 'ดูแลภาษีรายเดือนต่อได้',
  },
];

const TRUST_POINTS = [
  {
    title: 'บอกตรงๆ ว่าควรจดหรือยัง',
    detail: 'ถ้ายังไม่จำเป็นและจดแล้วไม่คุ้ม เราจะบอก ไม่ได้รับงานทุกกรณี',
  },
  {
    title: 'เช็กเอกสารก่อนยื่น',
    detail: 'ลดโอกาสถูกขอเอกสารเพิ่มหรือยื่นซ้ำ',
  },
  {
    title: 'อธิบายหน้าที่หลังจดให้เข้าใจ',
    detail: 'ออกใบกำกับภาษีอย่างไร เก็บเอกสารอะไร ยื่นเมื่อไร',
  },
  {
    title: 'ทำบัญชีและภาษีต่อได้ทีมเดิม',
    detail: 'จดเสร็จแล้วต่อด้วยยื่น ภ.พ.30 และทำบัญชีรายเดือนได้เลย',
  },
];

const VAT_REG_FAQS = [
  {
    q: 'จดทะเบียน VAT ต้องมีรายได้เท่าไหร่',
    a: 'ต้องจดเมื่อรายรับจากกิจการที่อยู่ในระบบ VAT เกิน 1.8 ล้านบาทต่อปี โดยจดภายใน 30 วันนับจากวันที่รายรับเกิน',
  },
  {
    q: 'บริษัทเปิดใหม่ต้องจด VAT ทันทีไหม',
    a: 'ไม่จำเป็น ถ้ารายรับยังไม่ถึงเกณฑ์ แต่จดโดยสมัครใจได้ ถ้าลูกค้าต้องการใบกำกับภาษี',
  },
  {
    q: 'จดทะเบียน VAT ใช้เอกสารอะไรบ้าง',
    a: 'ข้อมูลบริษัทและผู้มีอำนาจลงนาม เอกสารสิทธิใช้สถานที่ แผนที่และรูปถ่ายสถานประกอบการ และเอกสารอื่นที่กรมสรรพากรขอ',
  },
  {
    q: 'จดทะเบียน VAT ออนไลน์ได้ไหม',
    a: 'ได้ ยื่นคำขอ ภ.พ.01 ผ่านระบบออนไลน์ของกรมสรรพากรที่ rd.go.th',
  },
  {
    q: 'จด VAT ใช้เวลากี่วัน',
    a: 'ขึ้นกับความครบของเอกสารและขั้นตอนการพิจารณาของสรรพากรพื้นที่ โดยทั่วไปการยื่นคำขอ ภ.พ.01 ออนไลน์จะใช้เวลาพิจารณาประมาณ 7–15 วันทำการ (หรือตามนัดหมายในกรณีที่เจ้าหน้าที่สรรพากรขอตรวจสถานประกอบการ)',
  },
  {
    q: 'จดทะเบียน VAT เสียค่าธรรมเนียมไหม',
    a: 'ไม่เสียค่าธรรมเนียมราชการ ถ้าจ้างสำนักงานบัญชีจะมีค่าบริการตามขอบเขตงาน (ค่าบริการเริ่มต้น 1,500 บาท)',
  },
  {
    q: 'จด VAT แล้วไม่มีรายได้ ต้องยื่น ภ.พ.30 ไหม',
    a: 'ต้องยื่นทุกเดือน แม้ไม่มียอดขาย ไม่ยื่นจะมีเบี้ยปรับ',
  },
  {
    q: 'จดทะเบียนบริษัทกับจด VAT เหมือนกันไหม',
    a: 'ไม่เหมือนกัน จดบริษัทคือตั้งนิติบุคคลกับกรมพัฒนาธุรกิจการค้า ส่วนจด VAT คือเข้าระบบภาษีมูลค่าเพิ่มกับกรมสรรพากร',
  },
];

export default function VatRegistrationPage({ data }: { data: SubServiceDetailConfig }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: VAT_REG_FAQS.map((f) => ({
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

      {/* ===== V1: HERO (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการ</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">รับจดทะเบียน VAT</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการจดทะเบียนภาษีมูลค่าเพิ่ม</p>
              <h1 className="ma-hero__title">
                <span>รับจดทะเบียน VAT</span>
                <span className="ma-hero__subtitle">
                  และภาษีมูลค่าเพิ่ม สำหรับบริษัทและผู้ประกอบการ
                </span>
              </h1>
              <p className="page-hero__lead">
                เช็กให้ก่อนว่าธุรกิจของคุณต้องจด VAT แล้วหรือยัง เตรียมเอกสาร ยื่นคำขอ ภ.พ.01
                กับกรมสรรพากรจนได้ใบ ภ.พ.20 แล้วอธิบายว่าหลังจดต้องออกใบกำกับภาษีและยื่น ภ.พ.30
                อย่างไร
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  ปรึกษาการจดทะเบียน VAT <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#pricing" className="btn btn-light btn-large">
                  ขอใบเสนอราคา
                </Link>
              </div>
            </div>

            <div className="vreg-hero__visual">
              <div className="vreg-hero__badge">
                <span className="vreg-hero__badge-top">VAT</span>
                <span className="vreg-hero__badge-num">7%</span>
              </div>
              <div className="vreg-hero__threshold">
                <span>เกณฑ์ต้องจด VAT</span>
                <strong>รายรับเกิน 1.8 ล้าน/ปี</strong>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการรับจดทะเบียน VAT">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>เช็กเงื่อนไขก่อนว่าต้องจดไหม</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>เตรียมเอกสารและยื่นคำขอให้</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ดูแลภาษีรายเดือนต่อได้</span>
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

      {/* ===== V2: WHO MUST REGISTER (AEO + Quick Check + 4 Cards — #who) ===== */}
      <section id="who" className="section vreg-who">
        <div className="container vreg-who__wrap">
          <div className="vreg-who__top">
            <div className="vreg-who__left reveal-on-scroll">
              <div className="section-heading">
                <p className="section-kicker">จด VAT บริษัท</p>
                <h2>
                  ใครบ้างที่ต้อง
                  <br />
                  จดทะเบียน VAT
                </h2>
              </div>

              <div className="aud-aeo__quick-answer">
                <p>
                  ผู้ประกอบการที่ขายสินค้าหรือให้บริการที่อยู่ในระบบภาษีมูลค่าเพิ่ม และมี
                  <strong>รายรับเกิน 1.8 ล้านบาทต่อปี</strong> ต้องจดทะเบียน VAT{' '}
                  <strong>ภายใน 30 วัน</strong>นับจากวันที่รายรับเกิน ส่วนกิจการที่ได้รับยกเว้น VAT
                  ต้องดูเป็นรายกรณี
                </p>
              </div>

              <div className="vreg-who__voluntary">
                <h3>รายรับยังไม่ถึง 1.8 ล้าน จด VAT ได้ไหม</h3>
                <p>
                  ได้ ถ้ากิจการอยู่ในระบบ VAT จดโดยสมัครใจได้
                  เหมาะกับธุรกิจที่ลูกค้าเป็นบริษัทและต้องการใบกำกับภาษี แต่จดแล้วต้องยื่น ภ.พ.30
                  ทุกเดือน จึงควรคุยกันก่อนตัดสินใจ
                </p>
              </div>
            </div>

            <div className="reveal-on-scroll delay-2">
              <VatQuickCheck />
            </div>
          </div>

          <div className="ma-for__grid vreg-who__cards">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทที่รายรับเกินเกณฑ์</h3>
              <p>รายรับเกิน 1.8 ล้านแล้ว ต้องจดภายใน 30 วัน</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <ShoppingBag size={28} strokeWidth={1.7} />
              </span>
              <h3>ร้านค้าออนไลน์</h3>
              <p>ยอดขายจากทุกช่องทางรวมกันใกล้หรือเกินเกณฑ์</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <Briefcase size={28} strokeWidth={1.7} />
              </span>
              <h3>ธุรกิจบริการ</h3>
              <p>รับงานบริการที่อยู่ในระบบ VAT และรายรับถึงเกณฑ์</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <Sparkles size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทเปิดใหม่</h3>
              <p>ลูกค้าขอใบกำกับภาษี จึงอยากจดโดยสมัครใจ</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== V3: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container">
          <div className="vreg-scope__layout">
            <div className="aud-scope__right vreg-scope__left-photo reveal-on-scroll">
              <div className="aud-scope__photo">
                <Image
                  src="/images/service_reg.png"
                  alt="เอกสารจดทะเบียนภาษีมูลค่าเพิ่ม ภ.พ.01 และ ภ.พ.20"
                  fill
                  sizes="100vw"
                  quality={95}
                  className="aud-scope__img"
                />
              </div>
              <div className="aud-scope__deliverable-card">
                <span>สิ่งที่คุณได้รับเมื่อจดเสร็จ</span>
                <strong>ใบทะเบียนภาษีมูลค่าเพิ่ม (ภ.พ.20) และสรุปหน้าที่ภาษีเดือนแรก</strong>
              </div>
            </div>

            <div className="aud-scope__left">
              <div className="section-heading reveal-on-scroll">
                <p className="section-kicker">ขอบเขตงาน</p>
                <h2>
                  บริการรับจดทะเบียน VAT
                  <br />
                  ครอบคลุมอะไรบ้าง
                </h2>
                <p>บริการรับจดทะเบียนภาษีมูลค่าเพิ่ม ตั้งแต่เช็กเงื่อนไขจนได้ใบ ภ.พ.20</p>
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
            </div>
          </div>
        </div>
      </section>

      {/* ===== V4: DOCUMENTS + PP01 VS PP20 + CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents vreg-documents">
        <div className="container afs-documents__layout">
          <div className="afs-documents__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เอกสารจด VAT</p>
              <h2>
                จดทะเบียน VAT
                <br />
                ต้องใช้เอกสารอะไรบ้าง
              </h2>
            </div>

            <div className="aud-aeo__quick-answer">
              <p>
                เอกสารจด VAT มี 3 กลุ่ม คือ <strong>ข้อมูลบริษัทและผู้มีอำนาจลงนาม</strong>{' '}
                <strong>เอกสารสถานประกอบการ</strong> (สิทธิใช้สถานที่ แผนที่ และรูปถ่าย)
                และ<strong>เอกสารอื่นที่กรมสรรพากรขอตามกรณี</strong>{' '}
                รายการจะต่างกันระหว่างบุคคลธรรมดากับนิติบุคคล
              </p>
            </div>

            <h3 className="vreg-documents__subhead">ภ.พ.01 กับ ภ.พ.20 คืออะไร</h3>
            <div className="vreg-documents__forms-grid">
              <article className="vreg-documents__form-card">
                <span className="vreg-documents__form-icon" aria-hidden="true">
                  <FileText size={22} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>ภ.พ.01</strong>
                  <p>แบบคำขอจดทะเบียน ที่คุณ (หรือเรา) ยื่น</p>
                </div>
              </article>

              <article className="vreg-documents__form-card">
                <span className="vreg-documents__form-icon" aria-hidden="true">
                  <FileCheck2 size={22} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>ภ.พ.20</strong>
                  <p>ใบทะเบียน VAT ที่กรมสรรพากรออกให้เมื่อจดสำเร็จ</p>
                </div>
              </article>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <VatDocChecklist />
          </div>
        </div>
      </section>

      {/* ===== V5: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">จดทะเบียน VAT ออนไลน์</p>
              <h2>
                ขั้นตอนจดทะเบียน VAT
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ถ้ารายรับเกินเกณฑ์แล้ว ติดต่อเราเร็วที่สุด เพราะต้องจดให้ทันภายใน 30 วัน
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

      {/* ===== V6: AFTER REGISTRATION (#after — Navy Section) ===== */}
      <section id="after" className="section vreg-after">
        <div className="container vreg-after__layout">
          <div className="vreg-after__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">บริษัทจดทะเบียน VAT แล้ว</p>
              <h2>
                จด VAT แล้ว
                <br />
                ต้องทำอะไรต่อ
              </h2>
              <p className="vreg-after__lead">
                หลังจด VAT บริษัทต้องออกใบกำกับภาษี เก็บภาษีซื้อ ทำรายงานภาษี และ
                <strong>ยื่น ภ.พ.30 ทุกเดือน แม้เดือนนั้นไม่มีรายได้</strong>{' '}
                ถ้าไม่ยื่นจะมีเบี้ยปรับและเงินเพิ่ม
              </p>
            </div>

            <div className="vreg-after__photo">
              <Image
                src="/images/process_desk.jpg"
                alt="นักบัญชีจัดทำรายงานภาษีซื้อและภาษีขายรายเดือน"
                fill
                sizes="(max-width: 991px) 100vw, 960px"
                quality={90}
                className="vreg-after__img"
              />
            </div>
          </div>

          <div className="vreg-after__right reveal-on-scroll delay-2">
            <div className="vreg-after__grid">
              {AFTER_VAT_DUTIES.map((item) => {
                const IconComponent = item.icon;
                return (
                  <article key={item.title} className="vreg-after__card">
                    <span className="vreg-after__card-icon" aria-hidden="true">
                      <IconComponent size={24} strokeWidth={1.75} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </article>
                );
              })}
            </div>

            <div className="vreg-after__links">
              <span>ให้เราดูแลต่อ:</span>
              <Link href="/services/tax-filing">บริการยื่นภาษี →</Link>
              <Link href="/services/monthly-accounting">รับทำบัญชีรายเดือน →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== V7: PRICING (#pricing) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าจดทะเบียน VAT</p>
              <h2>
                ค่าบริการจดทะเบียน VAT
                <br />
                ราคาเท่าไหร่
              </h2>
              <p>
                การจด VAT กับกรมสรรพากร<strong>ไม่มีค่าธรรมเนียมราชการ</strong>{' '}
                ค่าใช้จ่ายมีเฉพาะค่าบริการ ถ้าจ้างสำนักงานบัญชีตรวจเงื่อนไข เตรียมเอกสาร และยื่นแทน
              </p>
            </div>

            <div className="aud-pricing__factors-table">
              <div className="aud-pricing__factor-row">
                <strong>ค่าธรรมเนียมราชการ</strong>
                <span>ไม่มี</span>
              </div>
              <div className="aud-pricing__factor-row">
                <strong>ค่าบริการสำนักงานบัญชี</strong>
                <span>ตามขอบเขตงานและความซับซ้อนของเอกสาร</span>
              </div>
              <div className="aud-pricing__factor-row">
                <strong>ค่าใช้จ่ายเพิ่มเติม</strong>
                <span>เช่น ค่าเอกสารบางรายการตามกรณี</span>
              </div>
              <div className="aud-pricing__factor-row">
                <strong>งานหลังจด VAT</strong>
                <span>ยื่น ภ.พ.30 และทำบัญชีรายเดือน คิดแยก</span>
              </div>
            </div>
          </div>

          <div className="ma-pricing__card reveal-on-scroll delay-2">
            <div className="ma-pricing__price-block">
              <span className="aud-pricing__card-kicker">จดทะเบียน VAT สำหรับบริษัท</span>
              <span className="ma-pricing__price-label">ค่าบริการเริ่มต้น</span>
              <div className="ma-pricing__price-value">
                <strong>1,500</strong>
                <span>บาท</span>
              </div>
              <p className="aud-pricing__card-desc">
                ไม่มีค่าธรรมเนียมราชการ (รวมตรวจเอกสารสถานประกอบการ ยื่น ภ.พ.01 และติดตามผลจนได้รับใบ
                ภ.พ.20)
              </p>
            </div>

            <ul className="aud-pricing__checks">
              <li>
                <Check size={18} aria-hidden="true" />
                <span>เช็กเงื่อนไขและเอกสาร</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ยื่น ภ.พ.01 และติดตามจนได้ ภ.พ.20</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>สรุปหน้าที่ภาษีหลังจด VAT</span>
              </li>
            </ul>

            <Link href="#quote" className="ma-pricing__cta">
              ขอใบเสนอราคาจดทะเบียน VAT
            </Link>
            <span className="ma-pricing__footnote">
              แจ้งค่าบริการชัดเจนก่อนเริ่มงานทุกครั้ง ไม่มีค่าธรรมเนียมราชการแอบแฝง
            </span>
          </div>
        </div>
      </section>

      {/* ===== V8: COMPARE DIY VS DEETHAVORN (#compare) ===== */}
      <section id="compare" className="section creg-compare">
        <div className="container creg-compare__layout">
          <div className="creg-compare__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เปรียบเทียบ</p>
              <h2>
                จด VAT เอง
                <br />
                กับใช้สำนักงานบัญชี
              </h2>
            </div>
            <div className="creg-compare__summary">
              จด VAT เองได้ผ่านระบบออนไลน์ของกรมสรรพากร และไม่เสียค่าบริการ
              ถ้าไม่มีเวลาเตรียมเอกสาร หรืออยากให้มีคนดูภาษีรายเดือนต่อหลังจด
              การใช้สำนักงานบัญชีช่วยประหยัดเวลาและลดโอกาสยื่นผิด
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

      {/* ===== V9: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/process_meeting.jpg"
              alt="ทีมงานดีถาวรการบัญชีที่ดูแลงานภาษีมูลค่าเพิ่ม"
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
                ทำไมรับจดทะเบียน
                <br />
                ภาษีมูลค่าเพิ่มกับดีถาวร
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

      {/* ===== V10: FAQ (#faq — 8 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              จดทะเบียน VAT
            </h2>
            <p>ไม่เจอคำตอบที่ต้องการ โทรถามได้ในเวลาทำการ</p>
            <div className="ma-faq__phones">
              <a href="tel:0991495656">099-149-5656</a>
              <a href="tel:0919415656">091-941-5656</a>
            </div>
          </div>

          <div className="ma-faq__list reveal-on-scroll delay-2">
            {VAT_REG_FAQS.map((faq, idx) => (
              <details key={faq.q} className="ma-faq__item" open={idx === 0}>
                <summary>
                  <h3>{faq.q}</h3>
                  <span className="ma-faq__toggle" aria-hidden="true">
                    <Plus size={16} />
                  </span>
                </summary>
                <p>
                  {faq.a}
                  {idx === 2 && (
                    <>
                      {' '}
                      (ดู <a href="#documents">เช็กลิสต์เอกสาร</a>)
                    </>
                  )}
                  {idx === 6 && (
                    <>
                      {' '}
                      (ดูรายละเอียดที่ <Link href="/services/tax-filing">บริการยื่นภาษี</Link>)
                    </>
                  )}
                  {idx === 7 && (
                    <>
                      {' '}
                      ยังไม่ได้ตั้งบริษัท ดู{' '}
                      <Link href="/services/company-registration">รับจดทะเบียนบริษัท</Link>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== V11A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>อ่านเรื่อง VAT ก่อนจด</h2>
              <p>บทความจากทีมดีถาวร อ่านแล้วยังสงสัย ทัก LINE ถามต่อได้</p>
            </div>
            <Link href="/knowledge" className="ma-knowledge__all-btn">
              <span>ดูบทความทั้งหมด</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="ma-knowledge__grid">
            <Link
              href="/knowledge/vat-registration-guide"
              className="ma-kb-card ma-kb-card--featured reveal-on-scroll delay-1"
            >
              <div className="ma-kb-card__photo">
                <Image
                  src="/uploads/articles/cover-vat-guide.jpg"
                  alt="ภาพปกบทความเรื่องการจด VAT"
                  fill
                  sizes="(max-width: 920px) 100vw, 960px"
                  quality={90}
                  className="ma-kb-card__img"
                />
                <span className="ma-kb-card__tag">ภาษีอากร</span>
              </div>
              <div className="ma-kb-card__body">
                <span className="ma-kb-card__date">3 มี.ค. 2569</span>
                <h3>
                  ภาษีมูลค่าเพิ่ม (VAT 7%) ธุรกิจแบบไหนต้องจด เกณฑ์รายได้ 1.8 ล้านบาท
                  และขั้นตอนที่ถูกต้อง
                </h3>
                <p>อธิบายเกณฑ์ 1.8 ล้าน วิธีนับรายรับ และขั้นตอนจดทีละข้อ</p>
                <span className="ma-kb-card__more">อ่านบทความ →</span>
              </div>
            </Link>

            <div className="ma-knowledge__side">
              <Link
                href="/knowledge/5-things-before-company-registration"
                className="ma-kb-card ma-kb-card--horizontal reveal-on-scroll delay-2"
              >
                <div className="ma-kb-card__photo">
                  <Image
                    src="/uploads/articles/cover-company-reg.jpg"
                    alt="ภาพปกบทความเรื่องจดทะเบียนบริษัท"
                    fill
                    sizes="(max-width: 920px) 100vw, 640px"
                    quality={90}
                    className="ma-kb-card__img"
                  />
                </div>
                <div className="ma-kb-card__body">
                  <span className="ma-kb-card__meta">
                    <strong>จดทะเบียนธุรกิจ</strong> · 18 ก.พ. 2569
                  </span>
                  <h3>
                    5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีและป้องกันปัญหาหุ้นส่วน
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

      {/* ===== V11B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              ต้องการจด VAT ให้บริษัท?
              <br />
              ให้ดีถาวรช่วยดูแล
            </h2>
            <p className="ma-quote__lead">
              บอกประเภทธุรกิจและรายรับโดยประมาณ ทีมงานโทรกลับภายใน 1 วันทำการ
              พร้อมบอกว่าต้องจดเมื่อไร ใช้เอกสารอะไร และค่าบริการเท่าไร
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
                <h4>ถามเรื่อง VAT ทาง LINE ก็ได้</h4>
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
            <VatRegQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
