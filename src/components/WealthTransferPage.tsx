import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  FileCheck2,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import WealthTransferDocChecklist from '@/components/WealthTransferDocChecklist';
import WealthTransferQuoteForm from '@/components/WealthTransferQuoteForm';

const WHY_PLAN_CARDS = [
  {
    icon: Users,
    title: 'ลดเรื่องขัดแย้งในครอบครัว',
    detail: 'เขียนให้ชัดว่าใครได้อะไร ลดโอกาสที่พี่น้องต้องมาตกลงกันเองทีหลัง',
  },
  {
    icon: FileText,
    title: 'รู้ภาระภาษีก่อนส่งต่อ',
    detail: 'ทั้งภาษีการรับมรดก ภาษีการให้ และค่าธรรมเนียมโอนที่ดิน',
  },
  {
    icon: TrendingUp,
    title: 'ธุรกิจเดินต่อได้',
    detail: 'วางให้ชัดว่าใครถือหุ้น ใครบริหาร ก่อนเกิดเหตุที่ไม่คาดคิด',
  },
  {
    icon: ShieldCheck,
    title: 'คนข้างหลังมีเงินใช้ระหว่างรอ',
    detail: 'การจัดการมรดกใช้เวลา ควรมีเงินสำรองไว้ให้ครอบครัวใช้ระหว่างนั้น',
  },
];

const SCOPE_CARDS = [
  {
    role: 'ดีถาวรดูแลโดยตรง',
    roleType: 'own' as const,
    title: 'รวบรวมทรัพย์สินและหนี้สิน',
    detail: 'ทำรายการทรัพย์สิน หนี้สิน และผู้เกี่ยวข้องทั้งหมด ให้เห็นภาพรวมก่อนวางแผน',
  },
  {
    role: 'ดีถาวรดูแลโดยตรง',
    roleType: 'own' as const,
    title: 'ประเมินภาษีมรดกและภาษีการให้',
    detail: 'คำนวณภาษีของแต่ละทางเลือก เช่น ให้ตอนนี้ หรือส่งต่อเป็นมรดก',
  },
  {
    role: 'ดีถาวรดูแลโดยตรง',
    roleType: 'own' as const,
    title: 'วางแผนส่งต่อทรัพย์สินให้ทายาท',
    detail: 'ดูวิธีส่งต่อเงินฝาก ที่ดิน หุ้น และกองทุน ให้ตรงกับเป้าหมายของครอบครัว',
  },
  {
    role: 'ดีถาวรดูแลโดยตรง',
    roleType: 'own' as const,
    title: 'วางแผนส่งต่อธุรกิจครอบครัว',
    detail: 'ดูโครงสร้างผู้ถือหุ้นและผลภาษีของการโอนหุ้นให้ทายาท',
  },
  {
    role: 'ร่วมกับที่ปรึกษาการเงิน',
    roleType: 'partner' as const,
    title: 'ประกันชีวิตเพื่อวางแผนมรดก',
    detail: 'ประเมินว่าครอบครัวต้องการเงินสำรองเท่าไร แล้วคุยกับตัวแทนที่มีใบอนุญาต',
  },
  {
    role: 'ร่วมกับทนายความ',
    roleType: 'partner' as const,
    title: 'พินัยกรรมและเอกสารทางกฎหมาย',
    detail: 'ส่งข้อมูลแผนให้ทนายความจัดทำพินัยกรรมหรือเอกสารที่จำเป็น',
  },
];

const INHERITANCE_TAX_ROWS = [
  {
    heir: 'คู่สมรสที่ชอบด้วยกฎหมาย',
    netValue: 'ทุกจำนวน',
    rate: 'ยกเว้น',
  },
  {
    heir: 'บุพการีหรือผู้สืบสันดาน (พ่อแม่ ลูก หลาน)',
    netValue: 'ส่วนที่เกิน 100 ล้านบาท',
    rate: '5%',
  },
  {
    heir: 'ผู้รับประเภทอื่น',
    netValue: 'ส่วนที่เกิน 100 ล้านบาท',
    rate: '10%',
  },
];

const START_PLAN_STEPS = [
  {
    step: '1',
    title: 'ทำรายการทรัพย์สินและหนี้สิน',
    detail: 'ทุกอย่างที่มีชื่อคุณ รวมถึงหุ้นบริษัทและกรมธรรม์',
  },
  {
    step: '2',
    title: 'ตัดสินใจว่าอยากให้ใครได้อะไร',
    detail: 'รวมถึงใครจะดูแลธุรกิจต่อ',
  },
  {
    step: '3',
    title: 'ประเมินภาษีและค่าใช้จ่าย',
    detail: 'เทียบระหว่างให้ตอนนี้กับส่งต่อเป็นมรดก',
  },
  {
    step: '4',
    title: 'เลือกเครื่องมือ',
    detail: 'พินัยกรรม การให้ระหว่างมีชีวิต การโอนหุ้น หรือประกันชีวิต',
  },
  {
    step: '5',
    title: 'ทบทวนเมื่อชีวิตเปลี่ยน',
    detail: 'แต่งงาน มีลูก ขายธุรกิจ หรือซื้อทรัพย์สินใหญ่',
  },
];

const INSURANCE_POINTS = [
  {
    icon: Coins,
    title: 'มีเงินสดให้ทายาททันที',
    detail: 'ใช้จ่ายค่าดำเนินการ หนี้ หรือภาษี โดยไม่ต้องรีบขายทรัพย์สิน',
  },
  {
    icon: Users,
    title: 'ดูแลคนที่ต้องพึ่งพารายได้',
    detail: 'คู่สมรส ลูกที่ยังเรียน หรือพ่อแม่ที่ต้องดูแล',
  },
  {
    icon: FileCheck2,
    title: 'กำหนดผู้รับผลประโยชน์ได้ชัด',
    detail: 'ระบุชื่อและสัดส่วนไว้ในกรมธรรม์ได้ตั้งแต่วันนี้',
  },
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'คุยเป้าหมาย',
    detail: 'ทรัพย์สินมีอะไรบ้าง อยากดูแลใคร และกังวลเรื่องไหนที่สุด',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'รวบรวมข้อมูล',
    detail: 'เอกสารทรัพย์สิน หนี้สิน หุ้น และกรมธรรม์ที่มีอยู่',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'ประเมินภาษีแต่ละทางเลือก',
    detail: 'เทียบตัวเลขให้เห็นว่าแต่ละวิธีเสียภาษีและค่าใช้จ่ายเท่าไร',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'สรุปแผนเป็นเอกสาร',
    detail: 'พร้อมส่งต่อทนายความหรือตัวแทนประกันในส่วนที่ต้องทำต่อ',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ทบทวนแผน',
    detail: 'ปรับเมื่อครอบครัว ทรัพย์สิน หรือกฎหมายเปลี่ยน',
  },
];

const TRUST_POINTS = [
  {
    title: 'คำนวณภาษีจากตัวเลขจริง',
    detail: 'เทียบทางเลือกเป็นตัวเลขบาท ไม่ใช่คำแนะนำกว้างๆ',
  },
  {
    title: 'เข้าใจธุรกิจครอบครัว',
    detail: 'เราดูแลบัญชีและภาษีบริษัทอยู่แล้ว จึงเห็นผลของการโอนหุ้นต่อทั้งบริษัท',
  },
  {
    title: 'บอกตรงๆ ว่าเรื่องไหนต้องใช้ทนาย',
    detail: 'งานกฎหมายและประกันส่งต่อให้ผู้มีใบอนุญาต พร้อมข้อมูลที่เตรียมไว้แล้ว',
  },
  {
    title: 'เรื่องครอบครัวเป็นความลับ',
    detail: 'ข้อมูลทรัพย์สินและครอบครัวใช้เพื่อวางแผนเท่านั้น',
  },
];

const PRICING_FACTORS = [
  'จำนวนและประเภททรัพย์สิน',
  'โครงสร้างหุ้นธุรกิจครอบครัว',
  'จำนวนผู้รับมรดก',
  'ความซับซ้อนของทางเลือกภาษี',
  'การประสานทนายความหรือตัวแทนประกัน',
];

export default function WealthTransferPage({ data }: { data: SubServiceDetailConfig }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
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

      {/* ===== W1: HERO & META TITLE (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">วางแผนมรดก</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">ที่ปรึกษาภาษี · วางแผนมรดก</p>
              <h1 className="ma-hero__title">
                <span>วางแผนมรดกและภาษี</span>
                <span className="ma-hero__subtitle">
                  ส่งต่อทรัพย์สินและธุรกิจ ให้คนที่คุณรัก ตามที่คุณตั้งใจ
                </span>
              </h1>
              <p className="page-hero__lead">
                ใครจะได้อะไร ต้องเสียภาษีเท่าไร และธุรกิจครอบครัวจะเดินต่ออย่างไร
                คุยเรื่องเหล่านี้ตอนที่ทุกคนยังนั่งคุยกันได้ เราช่วยรวบรวมทรัพย์สิน
                ประเมินภาษีการรับมรดกและภาษีการให้ แล้ววางทางเลือกร่วมกับทนายความและตัวแทนประกันเมื่อจำเป็น
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  นัดปรึกษาวางแผนมรดก <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="#pricing" className="btn btn-light btn-large">
                  ดูรูปแบบและค่าบริการ
                </Link>
              </div>
            </div>

            <div className="ma-hero__showcase">
              <div className="ma-hero__photo-wrap">
                <Image
                  src="/images/process_meeting.jpg"
                  alt="ที่ปรึกษาวางแผนมรดกและภาษีพูดคุยแนวทางส่งต่อทรัพย์สินและธุรกิจครอบครัว"
                  fill
                  priority
                  sizes="(max-width: 920px) 100vw, 480px"
                  className="ma-hero__photo"
                />
              </div>
              <div className="ma-hero__showcase-footer">
                <div className="ma-hero__showcase-price">
                  <span>คุยปรึกษาเบื้องต้น</span>
                  <strong>ไม่มีค่าใช้จ่าย</strong>
                  <small>แจ้งราคาแผนเป็นตัวเลขหลังคุยครั้งแรก</small>
                </div>
                <p>
                  ประเมินภาษีการรับมรดก ภาษีการให้ และโครงสร้างหุ้นบริษัทจากข้อมูลทรัพย์สินจริงของครอบครัว
                </p>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการวางแผนมรดกและภาษี">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ประเมินภาษีจากทรัพย์สินจริง</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>วางแผนส่งต่อหุ้นบริษัท</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ทำงานร่วมกับทนายและตัวแทนประกัน</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ข้อมูลครอบครัวเป็นความลับ</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== W2: WHY PLAN EARLY (#why-plan) ===== */}
      <section id="why-plan" className="section wt-why-plan">
        <div className="container wt-why-plan__layout">
          <div className="wt-why-plan__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องเริ่มตอนนี้</p>
              <h2>
                ทำไมควรวางแผนมรดก
                <br />
                ล่วงหน้า
              </h2>
              <p>
                ไม่ต้องรอให้มีทรัพย์สินมาก ถ้ามีบ้าน มีธุรกิจ หรือมีคนที่ต้องดูแล
                การวางแผนตอนนี้ช่วยให้ทุกอย่างเป็นไปตามที่คุณตั้งใจ
              </p>
            </div>

            <div className="wt-why-plan__grid">
              {WHY_PLAN_CARDS.map((card) => {
                const IconComponent = card.icon;
                return (
                  <article key={card.title} className="wt-why-plan__card">
                    <span className="wt-why-plan__icon" aria-hidden="true">
                      <IconComponent size={24} strokeWidth={1.75} />
                    </span>
                    <h3>{card.title}</h3>
                    <p>{card.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="wt-why-plan__visual reveal-on-scroll delay-2">
            <Image
              src="/images/office_atmosphere.png"
              alt="การวางแผนส่งต่อทรัพย์สินและธุรกิจให้คนรุ่นถัดไปอย่างราบรื่น"
              fill
              sizes="(max-width: 991px) 100vw, 48vw"
              className="wt-why-plan__img"
            />
            <div className="wt-why-plan__caption">
              <p>“คุยเรื่องมรดกตอนนี้ ดีกว่าให้ลูกหลานต้องเดากันเอง”</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== W3: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการวางแผนมรดก
                <br />
                เหมาะกับใคร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ยิ่งทรัพย์สินหลายประเภทหรือมีธุรกิจครอบครัว ยิ่งควรวางแผนให้ชัด
              เพราะแต่ละอย่างโอนและเสียภาษีไม่เหมือนกัน
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>เจ้าของธุรกิจและผู้ถือหุ้น</h3>
              <p>อยากส่งต่อหุ้นและการบริหารให้ลูก โดยที่บริษัทยังเดินต่อได้</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <Home size={28} strokeWidth={1.7} />
              </span>
              <h3>ผู้มีบ้านและที่ดิน</h3>
              <p>อยากรู้ว่าโอนให้ตอนนี้ หรือให้เป็นมรดก แบบไหนเสียภาษีและค่าธรรมเนียมเท่าไร</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <Users size={28} strokeWidth={1.7} />
              </span>
              <h3>ครอบครัวที่มีทายาทหลายคน</h3>
              <p>อยากแบ่งให้ลูกแต่ละคนอย่างเป็นธรรม และดูแลคนที่ยังต้องพึ่งพา</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <BarChart3 size={28} strokeWidth={1.7} />
              </span>
              <h3>ผู้มีทรัพย์สินหลายประเภท</h3>
              <p>เงินฝาก หุ้น กองทุน ที่ดิน และกรมธรรม์ อยากเห็นภาพรวมและวางแผนภาษีในที่เดียว</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== W4: SCOPE WITH ROLE BADGES (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container wt-scope__wrap">
          <div className="wt-scope__head reveal-on-scroll">
            <div>
              <p className="section-kicker">ขอบเขตงาน</p>
              <h2>
                วางแผนมรดกและภาษี
                <br />
                ครอบคลุมอะไรบ้าง
              </h2>
            </div>
            <div className="wt-scope__intro">
              <p>
                <span className="wt-nowrap">เราดูแลเรื่องบัญชีและภาษีเองโดยตรง</span>{' '}
                <span className="wt-nowrap">ส่วนงานกฎหมายและประกันชีวิต</span>{' '}
                <span className="wt-nowrap">เราประสานงานร่วมกับทนายความ</span>{' '}
                <span className="wt-nowrap">และที่ปรึกษาการเงิน ผู้วางแผนการลงทุน</span>{' '}
                <span className="wt-nowrap">ที่มีใบอนุญาตถูกต้องตามกฎหมาย</span>
              </p>
            </div>
          </div>

          <div className="wt-scope__grid">
            {SCOPE_CARDS.map((item, idx) => (
              <article
                key={item.title}
                className={`wt-scope__card wt-scope__card--${item.roleType} reveal-on-scroll delay-${(idx % 3) + 1}`}
              >
                <span
                  className={`wt-role ${
                    item.roleType === 'own' ? 'wt-role--own' : 'wt-role--partner'
                  }`}
                >
                  {item.role}
                </span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>

          <p className="tf-scope__links reveal-on-scroll delay-3">
            ต้องการวางแผนภาษีธุรกิจควบคู่กัน ดู <Link href="/services/tax-consulting">ที่ปรึกษาภาษี</Link>{' '}
            · แก้ไขสัดส่วนผู้ถือหุ้นบริษัท ดู{' '}
            <Link href="/services/company-amendment">แก้ไขข้อมูลบริษัท</Link> · ดูแลบัญชีต่อเนื่อง ดู{' '}
            <Link href="/services/monthly-accounting">รับทำบัญชีรายเดือน</Link>
          </p>
        </div>
      </section>

      {/* ===== W5: AEO — INHERITANCE TAX & 5 STEPS (#inheritance-tax) ===== */}
      <section id="inheritance-tax" className="section wt-tax-aeo">
        <div className="container wt-tax-aeo__wrap">
          <div className="wt-tax-aeo__top reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">สิ่งที่ต้องรู้</p>
              <h2>
                วางแผนมรดกและภาษี
                <br />
                ต้องรู้อะไรบ้าง
              </h2>
            </div>

            <p className="wt-tax-aeo__quick-answer">
              การวางแผนมรดกและภาษี คือการกำหนดล่วงหน้าว่าทรัพย์สินแต่ละอย่างจะส่งต่อให้ใคร
              ด้วยวิธีไหน และต้องเสียภาษีเท่าไร โดยดูทั้งประเภททรัพย์สิน หนี้สิน และผู้รับ
              เพื่อให้การส่งต่อเป็นไปตามที่เจ้าของตั้งใจและถูกต้องตามกฎหมาย
            </p>
          </div>

          <div className="wt-tax-aeo__grid">
            <div className="wt-tax-aeo__left reveal-on-scroll delay-1">
              <h3>ภาษีการรับมรดกคิดอย่างไร</h3>
              <p className="wt-tax-aeo__desc">
                ผู้รับเป็นผู้เสียภาษี เฉพาะมรดกสุทธิส่วนที่{' '}
                <strong>เกิน 100 ล้านบาท</strong> ที่ได้รับจากเจ้ามรดกแต่ละราย
                และต้องยื่นแบบภายใน 150 วันนับจากวันที่ได้รับมรดก
              </p>

              <div className="wt-tax-table-wrap">
                <table className="wt-tax-table">
                  <thead>
                    <tr>
                      <th scope="col">ผู้รับมรดก</th>
                      <th scope="col">มูลค่ามรดกสุทธิ</th>
                      <th scope="col">อัตราภาษี</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INHERITANCE_TAX_ROWS.map((row) => (
                      <tr key={row.heir}>
                        <td>{row.heir}</td>
                        <td>{row.netValue}</td>
                        <td className="wt-tax-table__rate">{row.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="wt-gift-callout">
                <strong>ให้ตอนยังมีชีวิตก็มีภาษี</strong>
                <p>
                  เงินหรือทรัพย์สินที่ให้บุตรหรือบุพการี ได้รับยกเว้นภาษีการให้ไม่เกิน 20
                  ล้านบาทต่อปี ส่วนที่เกินเสียภาษี 5% การโอนที่ดินยังมีค่าธรรมเนียมและภาษีอื่นเพิ่ม
                </p>
              </div>

              <p className="tc-plan__note">
                อ้างอิง พ.ร.บ.ภาษีการรับมรดก พ.ศ. 2558 และ{' '}
                <a href="https://www.rd.go.th/" target="_blank" rel="noopener noreferrer">
                  กรมสรรพากร
                </a>{' '}
                · ข้อมูลตรวจเมื่อ ต.ค. 2569 · เนื้อหาตรวจโดย ทีมที่ปรึกษาภาษีและผู้สอบบัญชีรับอนุญาต
                (CPA)
              </p>
            </div>

            <div className="tc-plan__right reveal-on-scroll delay-2">
              <h3 className="tc-plan__steps-title">ควรเริ่มวางแผนมรดกจากอะไร</h3>
              <ol className="tc-plan__steps">
                {START_PLAN_STEPS.map((item) => (
                  <li key={item.step} className="tc-plan__step">
                    <span className="tc-plan__step-num">{item.step}</span>
                    <div className="tc-plan__step-body">
                      <strong className="tc-plan__step-title">{item.title}</strong>
                      <span className="tc-plan__step-desc">{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===== W6: INSURANCE FOR ESTATE PLANNING (#insurance) ===== */}
      <section id="insurance" className="section wt-insurance">
        <div className="container wt-insurance__layout">
          <div className="wt-insurance__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">วางแผนประกันมรดก</p>
              <h2>
                ประกันชีวิต
                <br />
                ช่วยวางแผนมรดกได้อย่างไร
              </h2>
              <p>
                ประกันชีวิตเพื่อวางแผนมรดกช่วยให้ครอบครัวได้รับเงินก้อนตามที่กำหนดไว้ในกรมธรรม์
                ซึ่งมักได้เร็วกว่าการแบ่งทรัพย์สินอื่น
              </p>
            </div>

            <div className="wt-insurance__list">
              {INSURANCE_POINTS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.title} className="wt-insurance__item">
                    <span className="wt-insurance__icon" aria-hidden="true">
                      <IconComponent size={22} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="wt-insurance__note">
              ผลทางภาษีของเงินประกันขึ้นกับเงื่อนไขกรมธรรม์และข้อเท็จจริงแต่ละกรณี
              เราประเมินให้ก่อนตัดสินใจ ส่วนการเสนอแบบประกันทำโดยตัวแทนที่มีใบอนุญาต
            </div>
          </div>

          <div className="wt-insurance__visual reveal-on-scroll delay-2">
            <Image
              src="/images/process_meeting.jpg"
              alt="ที่ปรึกษาพูดคุยเรื่องประกันชีวิตเพื่อวางแผนมรดกและสภาพคล่องของครอบครัว"
              fill
              sizes="(max-width: 991px) 100vw, 48vw"
              className="wt-insurance__img"
            />
          </div>
        </div>
      </section>

      {/* ===== W7: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอน</p>
              <h2>
                ขั้นตอนวางแผนมรดก
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              พาคนในครอบครัวที่เกี่ยวข้องมาคุยด้วยได้ บางเรื่องคุยพร้อมกันทีเดียวจะชัดกว่า
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

      {/* ===== W8: DOCUMENT CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents">
        <div className="container afs-documents__layout">
          <div className="afs-documents__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เช็กลิสต์เอกสาร</p>
              <h2>
                เอกสารที่ควรเตรียม
                <br />
                ก่อนวางแผนมรดก
              </h2>
              <p>
                ครั้งแรกไม่ต้องมีครบ แค่รายการคร่าวๆ ก็เริ่มคุยได้ ติ๊กเพื่อดูว่ามีอะไรแล้วบ้าง
              </p>
            </div>

            <div className="afs-documents__photo">
              <Image
                src="/images/process_desk.jpg"
                alt="โต๊ะทำงานพร้อมแฟ้มเอกสารทรัพย์สิน หุ้นบริษัท และกรมธรรม์"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="afs-documents__img"
              />
            </div>

            <div className="afs-documents__reassure">
              <strong>ยังไม่แน่ใจว่าต้องเริ่มจากเอกสารชิ้นไหน</strong>
              <p>
                ทัก LINE เล่าคร่าวๆ ว่ามีทรัพย์สินประเภทไหนบ้าง ทีมงานช่วยแนะนำรายการที่ควรใช้ให้ก่อนวันนัด
              </p>
              <a
                href="https://line.me/ti/p/DliAyJfUXd"
                target="_blank"
                rel="noopener noreferrer"
                className="ma-quote__line-btn"
              >
                <MessageCircle size={18} aria-hidden="true" />
                <span>ถามเบื้องต้นทาง LINE</span>
              </a>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <WealthTransferDocChecklist />
          </div>
        </div>
      </section>

      {/* ===== W9: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust ma-trust--ice">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/office_atmosphere.png"
              alt="ห้องประชุมส่วนตัวสำหรับคุยเรื่องวางแผนมรดกที่สำนักงานดีถาวร"
              fill
              sizes="(max-width: 991px) 100vw, 50vw"
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ต้องการวางแผนส่งต่อหุ้นบริษัทและที่ดินให้ลูก 2 คน
                ทีมดีถาวรช่วยคำนวณภาษีเทียบให้เห็นเป็นตัวเลขชัดเจนว่าโอนตอนนี้กับส่งต่อเป็นมรดกต่างกันอย่างไร
                สบายใจขึ้นมากครับ”
              </p>
              <footer>— คุณวรพจน์ กิตติธนากุล, เจ้าของธุรกิจครอบครัวและอสังหาริมทรัพย์</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมเลือกวางแผนมรดก
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

      {/* ===== W10: PRICING (#pricing — 3 Cards + Factors Bar) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container tc-pricing__wrap">
          <div className="tc-pricing__head reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าบริการวางแผนมรดก
                <br />
                คิดอย่างไร
              </h2>
            </div>
            <p className="tc-pricing__lead">
              ขึ้นกับจำนวนและประเภททรัพย์สิน จำนวนผู้รับมรดก
              และต้องประสานผู้เชี่ยวชาญด้านอื่นหรือไม่ เราแจ้งราคาเป็นตัวเลขหลังคุยครั้งแรก
            </p>
          </div>

          <div className="tc-pricing__cards reveal-on-scroll delay-2">
            <article className="tc-pricing__card">
              <h3>คุยครั้งแรก</h3>
              <strong className="tc-pricing__price">ปรึกษาเบื้องต้นฟรี</strong>
              <p>รู้ว่าต้องวางแผนเรื่องไหนก่อน และงานแบบไหนต้องใช้ผู้เชี่ยวชาญ</p>
              <Link href="#quote" className="tc-pricing__link">
                <span>นัดคุย</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="tc-pricing__card tc-pricing__card--featured">
              <h3>วางแผนมรดกและภาษี</h3>
              <strong className="tc-pricing__price">ประเมินตามทรัพย์สิน</strong>
              <p>รายการทรัพย์สิน ประเมินภาษีทุกทางเลือก และแผนสรุปเป็นเอกสาร</p>
              <Link href="#quote" className="tc-pricing__link">
                <span>ขอใบเสนอราคา</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="tc-pricing__card">
              <h3>งานของผู้เชี่ยวชาญอื่น</h3>
              <strong className="tc-pricing__price">แยกตามจริง</strong>
              <p>ค่าทนายความทำพินัยกรรม และเบี้ยประกัน จ่ายตรงกับผู้ให้บริการตามขอบเขตที่ตกลง</p>
              <Link href="#quote" className="tc-pricing__link">
                <span>สอบถามเพิ่มเติม</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </div>

          <div className="tc-pricing__factors-bar reveal-on-scroll delay-3">
            <strong>ปัจจัยที่มีผลกับราคา:</strong>
            {PRICING_FACTORS.map((factor, idx) => (
              <span key={factor} className="tc-pricing__factor-item">
                {idx > 0 && <i aria-hidden="true">·</i>}
                <span>{factor}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== W11A: FAQ (#faq — 6 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              วางแผนมรดก
            </h2>
            <p>ไม่เจอคำตอบที่ต้องการ โทรถามได้ในเวลาทำการ</p>
            <div className="ma-faq__phones">
              <a href="tel:0991495656">099-149-5656</a>
              <a href="tel:0919415656">091-941-5656</a>
            </div>
          </div>

          <div className="ma-faq__list reveal-on-scroll delay-2">
            {data.faqs.map((faq, idx) => (
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

      {/* ===== W11B: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>
                อ่านเรื่องภาษีและทรัพย์สิน
                <br />
                ก่อนวางแผน
              </h2>
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
                  alt="ภาพปกบทความเรื่องจดทะเบียนบริษัทและหุ้นส่วน"
                  fill
                  sizes="(max-width: 920px) 100vw, 50vw"
                  className="ma-kb-card__img"
                />
                <span className="ma-kb-card__tag">จดทะเบียนธุรกิจ</span>
              </div>
              <div className="ma-kb-card__body">
                <span className="ma-kb-card__date">18 ก.พ. 2569</span>
                <h3>
                  5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีและป้องกันปัญหาหุ้นส่วน
                </h3>
                <p>โครงสร้างผู้ถือหุ้นที่วางไว้ตั้งแต่แรก มีผลกับการส่งต่อธุรกิจในวันหน้า</p>
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
                    sizes="(max-width: 920px) 100vw, 240px"
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
                    ธุรกิจแบบไหนต้องใช้ใคร
                  </h3>
                  <span className="ma-kb-card__more">อ่านบทความ →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== W11C: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">นัดปรึกษา</p>
            <h2>
              เริ่มวางแผนมรดกวันนี้
              <br />
              ให้ครอบครัวไม่ต้องเดา
            </h2>
            <p className="ma-quote__lead">
              บอกเราคร่าวๆ ว่ามีทรัพย์สินแบบไหนและกังวลเรื่องอะไร ทีมงานโทรกลับภายใน 1
              วันทำการเพื่อนัดวันคุย จะคุยที่สำนักงานหรือออนไลน์ก็ได้
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
                <MapPin size={18} aria-hidden="true" />
                <div>
                  <small>สำนักงาน</small>
                  <span>234/116 ถ.อโศก–ดินแดง ใกล้ MRT เพชรบุรี</span>
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
                <h4>ถามเบื้องต้นทาง LINE ก่อนก็ได้</h4>
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
            <WealthTransferQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
