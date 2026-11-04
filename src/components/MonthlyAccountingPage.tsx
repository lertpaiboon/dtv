import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react';
import { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import MonthlyQuoteForm from '@/components/MonthlyQuoteForm';

const PAIN_VS_SOLUTION_ROWS = [
  {
    pain: 'เอกสารกองรวมกันในลิ้นชัก หาไม่เจอตอนจะใช้',
    solution: 'ส่งมาเดือนละครั้ง เราคัดแยกและเก็บเป็นหมวดให้',
  },
  {
    pain: 'ไม่มีเวลานั่งลงบัญชีเองทุกสิ้นเดือน',
    solution: 'เอาเวลาไปดูแลลูกค้าและงานขายแทน',
  },
  {
    pain: 'กลัวยื่นภาษีช้าแล้วโดนเบี้ยปรับเงินเพิ่ม',
    solution: 'เราดูกำหนดยื่นทุกเดือนและยื่นให้ตามรอบ',
  },
  {
    pain: 'ไม่แน่ใจว่าเดือนนี้จ่ายภาษีอะไรไปบ้าง',
    solution: 'มีใบเสร็จตัวจริงทุกใบ ถามเราได้ตลอดสัญญา',
  },
  {
    pain: 'ปลายปีต้องรีบรวบรวมเอกสารทั้งปีเพื่อปิดงบ',
    solution: 'บัญชีลงครบมาทุกเดือน ปิดงบได้เร็ว',
  },
];

const BUSINESS_TYPE_CARDS = [
  {
    title: 'รับทำบัญชี SME และบริษัทขนาดเล็ก',
    description:
      'บริษัทและ หจก. ที่มีพนักงาน มีเงินเดือน ภาษีหัก ณ ที่จ่าย และประกันสังคมทุกเดือน เราดูให้ครบในทีมเดียว ไม่ต้องแยกจ้างหลายเจ้า',
    image: '/images/service_reg.png',
    imageAlt: 'ทีมพนักงานบริษัท SME ที่ใช้บริการรับทำบัญชี',
  },
  {
    title: 'รับทำบัญชีร้านค้าออนไลน์',
    description:
      'รวมรายรับจาก Shopee, Lazada, TikTok Shop, เว็บไซต์ และเงินโอนเข้าบัญชี มาลงบัญชีให้ตรงกัน แยกค่าธรรมเนียมแพลตฟอร์มและค่าโฆษณาเป็นค่าใช้จ่าย',
    image: '/images/graphic_abstract.png',
    imageAlt: 'เจ้าของร้านค้าออนไลน์เช็กยอดขาย',
  },
  {
    title: 'รับทำบัญชีออนไลน์ ไม่ต้องเข้าสำนักงาน',
    description:
      'ส่งเอกสารทาง LINE, อีเมล, Google Drive หรือขนส่งเอกชน คุยงานทางโทรศัพท์หรือ LINE ได้ ลูกค้าอยู่ต่างจังหวัดก็ใช้บริการได้',
    image: '/images/process_desk.jpg',
    imageAlt: 'ส่งเอกสารบัญชีผ่านแท็บเล็ต',
  },
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'คุยรายละเอียดธุรกิจ',
    detail:
      'โทรหรือทัก LINE บอกว่าทำธุรกิจอะไร จด VAT หรือยัง มีพนักงานกี่คน เอกสารเดือนละประมาณกี่ใบ',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'รับใบเสนอราคา',
    detail: 'แจ้งราคาเป็นตัวเลข พร้อมรายการงานที่รวมอยู่ ไม่มีค่าใช้จ่ายแอบแฝง',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'ส่งเอกสารเดือนแรก',
    detail: 'ตกลงช่องทางส่งเอกสาร และวันที่ต้องส่งในแต่ละเดือน',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'ลงบัญชีและยื่นภาษี',
    detail: 'ตรวจเอกสาร ลงบัญชี แล้วยื่นแบบภาษีและประกันสังคมตามกำหนด',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'คืนใบเสร็จ ดูแลต่อทุกเดือน',
    detail: 'ส่งใบเสร็จจากสรรพากรคืน และแจ้งทันทีถ้าเอกสารเดือนไหนขาด',
  },
];

const TRUST_POINTS = [
  {
    title: 'ราคาบอกก่อน ไม่มีค่ายิบย่อย',
    detail: 'ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 หรือค่าปรึกษาเพิ่มระหว่างสัญญา',
  },
  {
    title: 'เห็นหลักฐานการยื่นทุกเดือน',
    detail: 'ใบเสร็จตัวจริงจากกรมสรรพากรกลับมาอยู่กับคุณทุกครั้ง',
  },
  {
    title: 'ทีมจบบัญชีโดยตรง งบปีตรวจโดย CPA',
    detail: 'ติดตามกฎหมายภาษีที่เปลี่ยนทุกปี และส่งงบให้ผู้สอบบัญชีรับอนุญาตตรวจ',
  },
  {
    title: 'คุยกับคนที่ทำบัญชีให้คุณได้เลย',
    detail: 'จันทร์–ศุกร์ 08:30–17:30 น. โทรหรือทัก LINE ไม่ต้องผ่านระบบตอบอัตโนมัติ',
  },
  {
    title: 'ข้อมูลธุรกิจเป็นความลับ',
    detail: 'เอกสารและตัวเลขของลูกค้าใช้เพื่องานบัญชีเท่านั้น',
  },
];

const PRICING_FACTORS = [
  'จำนวนเอกสารและรายการบัญชีต่อเดือน',
  'จด VAT แล้วหรือยัง',
  'จำนวนพนักงานที่ต้องยื่นประกันสังคมและ ภ.ง.ด.1',
  'ประเภทธุรกิจและช่องทางขาย เช่น ขายหลาย Marketplace',
  'งานเพิ่มเติม เช่น ปิดงบประจำปี หรือทำเงินเดือน',
];

export default function MonthlyAccountingPage({ data }: { data: SubServiceDetailConfig }) {
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

      {/* ===== S1: HERO & META TITLE (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">รับทำบัญชีรายเดือน</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการทำบัญชีและภาษี</p>
              <h1 className="ma-hero__title">
                <span>รับทำบัญชีรายเดือน</span>
                <span className="ma-hero__subtitle">
                  ลงบัญชี ยื่นภาษี และส่งใบเสร็จคืนให้คุณทุกเดือน
                </span>
              </h1>
              <p className="page-hero__lead">
                สำหรับบริษัท SME หจก. และร้านค้าออนไลน์ ส่งเอกสารมาเดือนละครั้ง เราลงบัญชี ยื่น
                ภ.พ.30 ภ.ง.ด. และประกันสังคมให้ตรงกำหนด แล้วส่งใบเสร็จจากสรรพากรคืนให้คุณเก็บ
                ค่าบริการเริ่ม 1,500 บาทต่อเดือน
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  ขอใบเสนอราคา <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light btn-large"
                >
                  <MessageCircle aria-hidden="true" /> ปรึกษาทาง LINE
                </a>
              </div>
            </div>

            <div className="ma-hero__showcase">
              <div className="ma-hero__photo-wrap">
                <Image
                  src="/images/office_atmosphere.png"
                  alt="ทีมบัญชีดีถาวรคุยงานบัญชีรายเดือนกับลูกค้า"
                  fill
                  priority
                  sizes="(max-width: 920px) 100vw, 480px"
                  className="ma-hero__photo"
                />
              </div>
              <div className="ma-hero__showcase-footer">
                <div className="ma-hero__showcase-price">
                  <span>ค่าบริการเริ่มต้น</span>
                  <strong>
                    1,500 <small>บาท/เดือน</small>
                  </strong>
                </div>
                <p>ประเมินตามปริมาณเอกสารจริง แจ้งราคาก่อนเริ่มงานทุกครั้ง</p>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการรับทำบัญชีรายเดือน">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>เริ่ม 1,500 บาท/เดือน</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>แจ้งราคาก่อนเริ่มงาน</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>คืนใบเสร็จตัวจริงทุกเดือน</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>งบปีตรวจโดย CPA</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== S2: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการรับทำบัญชีรายเดือน
                <br />
                เหมาะกับธุรกิจแบบไหน
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ถ้าธุรกิจของคุณเป็นแบบใดแบบหนึ่งด้านล่าง และยังไม่มีพนักงานบัญชีประจำ
              การจ้างสำนักงานบัญชีมักคุ้มกว่า
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทเปิดใหม่</h3>
              <p>
                เพิ่งจดบริษัทหรือ หจก. อยากวางระบบบัญชีให้ถูกตั้งแต่เดือนแรก
                จะได้ไม่ต้องตามแก้ย้อนหลังตอนปิดงบ
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <Briefcase size={28} strokeWidth={1.7} />
              </span>
              <h3>SME และ หจก.</h3>
              <p>
                เอกสารเยอะขึ้นทุกเดือน มีเงินเดือน ภาษีหัก ณ ที่จ่าย และประกันสังคม
                แต่ยังไม่คุ้มจ้างพนักงานบัญชีประจำ
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <ShoppingCart size={28} strokeWidth={1.7} />
              </span>
              <h3>ร้านค้าออนไลน์</h3>
              <p>
                ขายหลายช่องทาง ทั้ง Shopee, Lazada, TikTok Shop และเว็บของตัวเอง
                รายรับเข้าหลายบัญชีจนสรุปเองไม่ไหว
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <Store size={28} strokeWidth={1.7} />
              </span>
              <h3>ร้านค้าและธุรกิจทั่วไป</h3>
              <p>
                ร้านอาหาร ร้านค้า หรือธุรกิจบริการ ที่อยากให้มีคนดูภาษีให้ทุกเดือน
                แทนที่จะรีบรวบรวมเอกสารตอนใกล้กำหนด
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== S3: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container ma-scope__layout">
          <div className="ma-scope__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">ขอบเขตงาน</p>
              <h2>
                รับทำบัญชีรายเดือน
                <br />
                ได้อะไรบ้าง
              </h2>
              <p>
                ทุกเดือนคุณส่งเอกสาร เราทำงาน 6 อย่างนี้ให้
                รายการที่รวมอยู่ในราคาจะเขียนไว้ในใบเสนอราคาทุกข้อ
              </p>
            </div>

            <div className="ma-scope__photo">
              <Image
                src="/images/process_desk.jpg"
                alt="พนักงานดีถาวรบันทึกบัญชีรายเดือนบนแล็ปท็อป"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="ma-scope__photo-img"
              />
            </div>
          </div>

          <div className="ma-scope__content">
            <div className="ma-scope__grid">
              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <FileText size={22} strokeWidth={1.75} />
                </span>
                <h3>บันทึกบัญชีรายเดือน</h3>
                <p>ลงรายการรายรับ รายจ่าย และธุรกรรมทุกรายการตามมาตรฐานการบัญชี</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <FileCheck2 size={22} strokeWidth={1.75} />
                </span>
                <h3>คัดแยกและตรวจเอกสาร</h3>
                <p>
                  เช็กใบกำกับภาษี ใบเสร็จ และสลิปโอน ใบไหนไม่ครบหรือใช้ไม่ได้ เราบอกก่อนปิดเดือน
                </p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <CalendarCheck size={22} strokeWidth={1.75} />
                </span>
                <h3>ยื่นภาษีรายเดือน</h3>
                <p>ยื่น ภ.พ.30 (ถ้าจด VAT) และ ภ.ง.ด. ทุกประเภทที่ต้องยื่น ให้ทันกำหนดทุกเดือน</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Users size={22} strokeWidth={1.75} />
                </span>
                <h3>ยื่นประกันสังคม</h3>
                <p>ส่งเงินสมทบประกันสังคมของพนักงานตามรอบทุกเดือน</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Receipt size={22} strokeWidth={1.75} />
                </span>
                <h3>คืนใบเสร็จตัวจริง</h3>
                <p>ยื่นแบบเสร็จ ส่งใบเสร็จจากกรมสรรพากรคืนให้ทุกครั้ง คุณตรวจย้อนหลังเองได้</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <MessageCircle size={22} strokeWidth={1.75} />
                </span>
                <h3>ปรึกษาภาษีตลอดสัญญา</h3>
                <p>มีคำถามเรื่องภาษีหรือเอกสาร โทรหรือทัก LINE ถามได้ ไม่คิดค่าปรึกษาเพิ่ม</p>
              </article>
            </div>

            <div className="ma-scope__callout reveal-on-scroll delay-3">
              <strong>งานปลายปี</strong>
              <p>
                ปิดงบการเงินประจำปีและตรวจสอบบัญชีโดย CPA
                (แจ้งค่าปิดงบและค่าสอบบัญชีแยกชัดเจนในใบเสนอราคา) ดูเพิ่มที่{' '}
                <Link href="/services/annual-financial-statements">
                  บริการจัดทำงบการเงินประจำปี
                </Link>{' '}
                และ <Link href="/services/tax-filing">บริการยื่นภาษี</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== S4: WHY MONTHLY (#why-monthly) ===== */}
      <section id="why-monthly" className="section ma-why">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ก่อนและหลัง</p>
              <h2>
                ทำไมธุรกิจควรจ้าง
                <br />
                ทำบัญชีรายเดือน
              </h2>
            </div>
            <p className="ma-why__lead">
              ปัญหาที่เจ้าของธุรกิจเล่าให้เราฟังบ่อยที่สุด กับสิ่งที่เปลี่ยนไปเมื่อมีคนดูบัญชีให้ทุกเดือน
            </p>
          </div>

          <div className="ma-compare reveal-on-scroll delay-2">
            <div className="ma-compare__head" aria-hidden="true">
              <span>ปัญหาที่เจอ</span>
              <span>เมื่อใช้บริการรับทำบัญชีรายเดือน</span>
            </div>
            {PAIN_VS_SOLUTION_ROWS.map((row) => (
              <div key={row.pain} className="ma-compare__row">
                <div className="ma-compare__pain">
                  <span className="ma-compare__mobile-label">ปัญหาที่เจอ</span>
                  <span>{row.pain}</span>
                </div>
                <div className="ma-compare__solution">
                  <span className="ma-compare__mobile-label">เมื่อใช้บริการรับทำบัญชีรายเดือน</span>
                  <strong>{row.solution}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== S5: BY BUSINESS TYPE (#types) ===== */}
      <section id="types" className="section ma-types">
        <div className="container">
          <div className="section-heading reveal-on-scroll">
            <p className="section-kicker">แยกตามประเภทธุรกิจ</p>
            <h2>รับทำบัญชีให้ธุรกิจแต่ละแบบ</h2>
            <p>
              งานบัญชีของบริษัทที่มีพนักงาน กับร้านที่ขายผ่าน Marketplace ต่างกัน
              เราถามรูปแบบธุรกิจก่อนเสมอ เพื่อวางขอบเขตงานให้ตรง
            </p>
          </div>

          <div className="ma-types__grid">
            {BUSINESS_TYPE_CARDS.map((card, idx) => (
              <article
                key={card.title}
                className={`ma-type-card reveal-on-scroll delay-${(idx % 3) + 1}`}
              >
                <div className="ma-type-card__photo">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 920px) 100vw, 33vw"
                    className="ma-type-card__img"
                  />
                </div>
                <div className="ma-type-card__body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== S6: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอน</p>
              <h2>เริ่มใช้บริการรับทำบัญชีรายเดือน</h2>
            </div>
            <p className="silo-subservices__lead">
              ตั้งแต่โทรครั้งแรกจนยื่นภาษีเดือนแรก ส่วนใหญ่ไม่ต้องเข้ามาที่สำนักงานเลย
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

      {/* ===== S7: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/process_meeting.jpg"
              alt="ห้องประชุมสำนักงานดีถาวรการบัญชี อโศก"
              fill
              sizes="(max-width: 991px) 100vw, 50vw"
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ใช้บริการมาขึ้นปีที่ 3 แล้ว ทีมงานช่วยตรวจเอกสารและส่งใบเสร็จสรรพากรตัวจริงกลับมาให้เก็บเข้าแฟ้มทุกเดือน”
              </p>
              <footer>— คุณอัญญาณี ภัทรานนท์, ธุรกิจนำเข้าและจัดจำหน่ายอุปกรณ์ตกแต่งภายใน</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมเลือกทำบัญชีรายเดือน
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

      {/* ===== S8: PRICING (#pricing) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าทำบัญชีรายเดือน
                <br />
                คิดจากอะไร
              </h2>
              <p>
                ราคาเริ่มต้นเท่ากันทุกธุรกิจ แต่ราคาจริงขึ้นกับ 5 เรื่องนี้ เราขอดูเอกสารตัวอย่างก่อน
                แล้วแจ้งราคาเป็นตัวเลข
              </p>
            </div>

            <h3 className="ma-pricing__factors-title">ปัจจัยที่มีผลกับค่าบริการ</h3>
            <ol className="ma-pricing__factors-list">
              {PRICING_FACTORS.map((factor, idx) => (
                <li key={factor}>
                  <span className="ma-pricing__factor-num">{idx + 1}</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="ma-pricing__card reveal-on-scroll delay-2">
            <span className="ma-pricing__pill">ทำบัญชีรายเดือน</span>
            <div className="ma-pricing__price-block">
              <span className="ma-pricing__price-label">เริ่มต้น</span>
              <div className="ma-pricing__price-value">
                <strong>1,500</strong>
                <span>บาท/เดือน</span>
              </div>
            </div>
            <p className="ma-pricing__for">สำหรับฟรีแลนซ์ ร้านค้า หจก. และบริษัท</p>

            <ul className="ma-pricing__features">
              <li>
                <Check size={18} aria-hidden="true" />
                <span>บันทึกบัญชีตามมาตรฐาน</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ยื่น ภ.พ.30 และ ภ.ง.ด. รายเดือน</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ยื่นประกันสังคม</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>คืนใบเสร็จตัวจริงทุกเดือน</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ปรึกษาภาษีได้ตลอดสัญญา</span>
              </li>
            </ul>

            <Link href="#quote" className="ma-pricing__cta">
              แจ้งรายละเอียดเพื่อรับใบเสนอราคา
            </Link>
            <span className="ma-pricing__footnote">
              ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 หรือค่าปรึกษาระหว่างสัญญา
            </span>
          </div>
        </div>
      </section>

      {/* ===== S9: FAQ (#faq — 6 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              รับทำบัญชีรายเดือน
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

      {/* ===== S10A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>
                อ่านความรู้เรื่องบัญชีและภาษี
                <br />
                ที่เจ้าของธุรกิจควรรู้
              </h2>
              <p>
                บทความจากทีมดีถาวร เขียนจากคำถามที่ลูกค้าถามเราบ่อย อ่านแล้วยังสงสัย ทัก LINE
                ถามต่อได้
              </p>
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
                  sizes="(max-width: 920px) 100vw, 50vw"
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
                <p>
                  รายได้ถึงเท่าไรต้องจด VAT จดแล้วต้องยื่นอะไรทุกเดือน และถ้าจดช้ามีผลอย่างไร
                </p>
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
                    sizes="(max-width: 920px) 100vw, 240px"
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

      {/* ===== S10B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              เล่าธุรกิจของคุณ
              <br />
              แล้วรับราคาทำบัญชีรายเดือน
            </h2>
            <p className="ma-quote__lead">
              กรอกข้อมูลสั้นๆ ทีมงานโทรกลับภายใน 1 วันทำการ
              การประเมินราคาไม่มีค่าใช้จ่ายและไม่มีข้อผูกมัด
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
                <h4>ส่งรูปเอกสารให้ดูทาง LINE ก็ได้</h4>
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
            <MonthlyQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
