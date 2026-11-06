import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import AuditDocChecklist from '@/components/AuditDocChecklist';
import AuditQuoteForm from '@/components/AuditQuoteForm';

const SCOPE_CARDS = [
  {
    icon: BarChart3,
    title: 'ตรวจสอบงบการเงินประจำปี',
    detail: 'ตรวจงบและหมายเหตุประกอบงบ จนได้หลักฐานพอที่จะแสดงความเห็น',
  },
  {
    icon: SearchCheck,
    title: 'ตรวจรายการที่มีสาระสำคัญ',
    detail: 'รายได้ ค่าใช้จ่าย ลูกหนี้ เจ้าหนี้ เงินสด และสินทรัพย์',
  },
  {
    icon: AlertTriangle,
    title: 'ประเมินความเสี่ยง',
    detail: 'หาจุดที่งบอาจแสดงข้อมูลผิดจากความจริงอย่างมีสาระสำคัญ',
  },
  {
    icon: Lock,
    title: 'ทำความเข้าใจระบบควบคุมภายใน',
    detail: 'ดูวิธีอนุมัติและเก็บเอกสารของบริษัท เพื่อวางวิธีตรวจให้เหมาะ',
  },
  {
    icon: FileCheck2,
    title: 'ออกรายงานของผู้สอบบัญชี',
    detail: 'รายงานพร้อมความเห็นต่องบ ใช้ประกอบการยื่นงบต่อ DBD',
  },
  {
    icon: MessageSquare,
    title: 'แจ้งข้อสังเกตต่อผู้บริหาร',
    detail: 'บอกจุดที่ควรปรับปรุงในระบบบัญชี เพื่อให้ปีหน้าตรวจได้ราบรื่นขึ้น',
  },
];

const WHY_AUDIT_CARDS = [
  {
    title: 'เป็นหน้าที่ตามกฎหมาย',
    detail: 'บริษัทจำกัดต้องให้ผู้สอบบัญชีตรวจงบก่อนเสนอที่ประชุมผู้ถือหุ้น',
  },
  {
    title: 'ต้องใช้ยื่นงบ',
    detail: 'ยื่นงบต่อ DBD และ ภ.ง.ด.50 พร้อมรายงานผู้สอบบัญชี',
  },
  {
    title: 'คนภายนอกเชื่อตัวเลข',
    detail: 'ธนาคาร คู่ค้า และผู้ลงทุนใช้งบที่ตรวจแล้วประกอบการตัดสินใจ',
  },
  {
    title: 'ผู้บริหารเห็นจุดอ่อน',
    detail: 'ข้อสังเกตจากผู้สอบบัญชีช่วยปรับระบบบัญชีปีถัดไป',
  },
];

const COMPARE_ROWS = [
  {
    topic: 'ทำเพื่ออะไร',
    prepare: 'สรุปและนำเสนอตัวเลขทั้งปี',
    audit: 'ตรวจและแสดงความเห็นต่องบ',
  },
  {
    topic: 'ใครทำ',
    prepare: 'ผู้บริหารและผู้ทำบัญชี',
    audit: 'ผู้สอบบัญชีรับอนุญาต (CPA)',
  },
  {
    topic: 'ได้อะไร',
    prepare: 'งบการเงินประจำปี',
    audit: 'รายงานของผู้สอบบัญชี',
  },
  {
    topic: 'ลักษณะงาน',
    prepare: 'รวบรวม ปรับปรุง สรุปบัญชี',
    audit: 'ตรวจหลักฐาน ประเมินความเสี่ยง',
  },
];

const CPA_DUTIES = [
  'วางแผนและกำหนดขอบเขตการตรวจ',
  'ประเมินความเสี่ยงของงบการเงิน',
  'ตรวจเอกสารและหลักฐานทางบัญชี',
  'ดูว่านโยบายบัญชีและการเปิดเผยข้อมูลเหมาะสมไหม',
  'ออกรายงานแสดงความเห็นต่องบการเงิน',
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'ประเมินขอบเขตงาน',
    detail: 'บอกประเภทธุรกิจ รอบบัญชี รายได้โดยประมาณ และงบพร้อมแค่ไหน',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'เสนอราคาและรับงาน',
    detail: 'เช็กความเป็นอิสระก่อนรับงาน แล้วแจ้งค่าตรวจสอบและระยะเวลา',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'วางแผนการตรวจ',
    detail: 'ประเมินความเสี่ยง และกำหนดว่าจะตรวจรายการไหนอย่างไร',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'ตรวจงบการเงิน',
    detail: 'ตรวจเอกสาร ยืนยันยอดกับธนาคารและคู่ค้า และสอบถามผู้บริหาร',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ออกรายงานผู้สอบบัญชี',
    detail: 'สรุปผล แจ้งข้อสังเกต และส่งรายงานพร้อมงบที่ตรวจแล้ว',
  },
];

const TRUST_POINTS = [
  {
    title: 'บอกชื่อและเลขทะเบียน CPA',
    detail: 'รู้ตั้งแต่แรกว่าใครเป็นผู้ลงนามรับรองงบ และตรวจสอบใบอนุญาตได้เอง',
  },
  {
    title: 'แยกคนทำบัญชีกับคนตรวจชัดเจน',
    detail: 'ผู้สอบบัญชีเป็นอิสระจากผู้จัดทำงบตามจรรยาบรรณวิชาชีพ',
  },
  {
    title: 'ขอบเขตงานและวันส่งชัดตั้งแต่แรก',
    detail: 'บอกว่าต้องเตรียมอะไร ตรวจเมื่อไร และรายงานจะเสร็จวันไหน',
  },
  {
    title: 'คุยกับทีมตรวจได้โดยตรง',
    detail: 'มีคำถามระหว่างตรวจ โทรหรือทัก LINE ได้ จันทร์–ศุกร์',
  },
  {
    title: 'เอกสารบริษัทเป็นความลับ',
    detail: 'ใช้เพื่องานตรวจสอบเท่านั้น ตามข้อกำหนดวิชาชีพ',
  },
];

const PRICING_FACTORS = [
  {
    label: 'ขนาดและประเภทธุรกิจ',
    detail: 'รายได้ จำนวนสาขา และลักษณะการดำเนินงาน',
  },
  {
    label: 'จำนวนรายการบัญชี',
    detail: 'ปริมาณธุรกรรมและเอกสารที่ต้องตรวจ',
  },
  {
    label: 'ความพร้อมของงบ',
    detail: 'งบเสร็จและเอกสารครบหรือยัง',
  },
  {
    label: 'ความซับซ้อน',
    detail: 'เช่น รายการกับบริษัทในเครือ หรือสินค้าคงเหลือจำนวนมาก',
  },
  {
    label: 'ระยะเวลา',
    detail: 'กำหนดส่งรายงานเร็วแค่ไหน',
  },
];

const AUDIT_FAQS = [
  {
    q: 'ตรวจสอบบัญชีคืออะไร',
    a: 'คือการที่ผู้สอบบัญชีตรวจงบการเงินและหลักฐานของบริษัท เพื่อให้ได้ความเชื่อมั่นอย่างสมเหตุสมผลว่างบไม่มีข้อมูลผิดอย่างมีสาระสำคัญ แล้วออกรายงานแสดงความเห็น',
  },
  {
    q: 'บริษัทจำกัดต้องมีผู้สอบบัญชีทุกปีไหม',
    a: 'ต้อง บริษัทจำกัดแต่งตั้งผู้สอบบัญชีในที่ประชุมผู้ถือหุ้นทุกปี และต้องให้ผู้สอบบัญชีรับอนุญาต (CPA) ตรวจงบก่อนเสนอที่ประชุมอนุมัติ',
  },
  {
    q: 'ผู้สอบบัญชี CPA กับผู้ทำบัญชีต่างกันอย่างไร',
    a: 'ผู้ทำบัญชีลงบัญชีและจัดทำงบ ส่วนผู้สอบบัญชี CPA ตรวจงบนั้นแล้วแสดงความเห็นอย่างเป็นอิสระ คนเดียวกันทำทั้งสองอย่างให้บริษัทเดียวกันไม่ได้',
  },
  {
    q: 'ค่าตรวจสอบบัญชีราคาเท่าไหร่',
    a: 'ขึ้นกับขนาดกิจการ จำนวนรายการ ความซับซ้อน และความพร้อมของงบ ส่งงบทดลองหรืองบปีก่อนมาให้ดู เราแจ้งค่าตรวจสอบบัญชีเป็นตัวเลขก่อนเริ่มงาน',
  },
  {
    q: 'บริษัทไม่มีรายได้ต้องตรวจสอบบัญชีไหม',
    a: 'ต้อง ตราบที่บริษัทยังไม่ได้จดเลิก ต้องจัดทำงบและให้ผู้สอบบัญชีตรวจทุกปี แม้ไม่มีรายได้หรือยังไม่เริ่มดำเนินกิจการ',
  },
  {
    q: 'ตรวจสอบบัญชีใช้เวลากี่วัน',
    a: 'โดยทั่วไปใช้เวลาประมาณ 7–14 วันทำการหลังจากได้รับงบการเงินและเอกสารประกอบครบถ้วน ขึ้นอยู่กับขนาดธุรกิจและความซับซ้อน เราแจ้งวันส่งรายงานพร้อมใบเสนอราคา',
  },
  {
    q: 'บริการตรวจสอบบัญชีรวมจัดทำงบการเงินไหม',
    a: 'ไม่รวม เป็นงานคนละส่วน และผู้สอบบัญชีต้องเป็นอิสระจากผู้จัดทำงบ ถ้าต้องการให้จัดทำงบด้วย สามารถดูบริการรับปิดงบการเงินของเราได้',
  },
];

export default function AuditServicePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: AUDIT_FAQS.map((f) => ({
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

      {/* ===== U1: HERO & META TITLE (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการ</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">รับตรวจสอบบัญชี</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">ตรวจสอบบัญชี + งบประจำปี</p>
              <h1 className="ma-hero__title">
                <span>รับตรวจสอบบัญชี</span>
                <span className="ma-hero__subtitle">
                  และงบการเงินประจำปี โดยผู้สอบบัญชีรับอนุญาต (CPA)
                </span>
              </h1>
              <p className="page-hero__lead">
                ตรวจงบประจำปีของบริษัทจำกัดและ SME ตามมาตรฐานการสอบบัญชี
                แล้วออกรายงานของผู้สอบบัญชีให้ทันใช้ประชุมผู้ถือหุ้นและยื่นงบ เราแจ้งขอบเขตงาน
                ระยะเวลา และค่าตรวจสอบบัญชีเป็นตัวเลขก่อนเริ่ม
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  ขอใบเสนอราคาตรวจสอบบัญชี <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light btn-large"
                >
                  <MessageCircle aria-hidden="true" /> ปรึกษาผู้สอบบัญชี
                </a>
              </div>
            </div>

            <div className="aud-hero__card">
              <div className="aud-hero__card-top">
                <div className="aud-hero__badge-icon" aria-hidden="true">
                  <ShieldCheck size={28} strokeWidth={1.8} />
                </div>
                <div className="aud-hero__card-title">
                  <span>ผู้สอบบัญชีรับอนุญาต</span>
                  <strong>เครือข่ายผู้สอบบัญชี CPA พันธมิตร</strong>
                </div>
              </div>
              <div className="aud-hero__card-meta">
                <span>เลขทะเบียน CPA</span>
                <strong>แจ้งในใบเสนอราคาทุกครั้ง</strong>
              </div>
              <p className="aud-hero__card-desc">
                ผู้สอบบัญชีทุกท่านได้รับใบอนุญาตถูกต้องตามกฎหมาย และเป็นอิสระจากผู้จัดทำงบการเงิน
              </p>
              <a
                href="https://www.tfac.or.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="aud-hero__tfac-link"
              >
                ตรวจสอบสถานะได้ที่สภาวิชาชีพบัญชี →
              </a>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการรับตรวจสอบบัญชี">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ตรวจโดย CPA ที่มีใบอนุญาต</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ตามมาตรฐานการสอบบัญชี</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>เป็นอิสระจากผู้จัดทำงบ</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>แจ้งค่าตรวจสอบก่อนเริ่ม</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== U2: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการตรวจสอบบัญชี
                <br />
                เหมาะกับธุรกิจแบบไหน
              </h2>
            </div>
            <p className="silo-subservices__lead">
              บริษัทจำกัดทุกแห่งต้องให้ผู้สอบบัญชีรับอนุญาตตรวจงบทุกปี
              ส่วนกิจการอื่นใช้งบที่ตรวจแล้วเพื่อเพิ่มความน่าเชื่อถือ
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทจำกัด</h3>
              <p>ต้องมีงบที่ CPA ตรวจแล้วก่อนประชุมผู้ถือหุ้นและยื่นงบทุกปี</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <Briefcase size={28} strokeWidth={1.7} />
              </span>
              <h3>SME ที่ต้องใช้งบตรวจแล้ว</h3>
              <p>ใช้ยื่นกู้ธนาคาร ประมูลงาน หรือให้ผู้ร่วมลงทุนดู</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <Sparkles size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทเปิดใหม่</h3>
              <p>ต้องแต่งตั้งผู้สอบบัญชีและเตรียมตัวสำหรับการตรวจรอบบัญชีแรก</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <TrendingUp size={28} strokeWidth={1.7} />
              </span>
              <h3>หจก. ที่เกินเกณฑ์ TA</h3>
              <p>ทุน สินทรัพย์ หรือรายได้เกินเกณฑ์ ต้องเปลี่ยนมาใช้ผู้สอบบัญชี CPA</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== U3: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container">
          <div className="aud-scope__layout">
            <div className="aud-scope__left">
              <div className="section-heading reveal-on-scroll">
                <p className="section-kicker">ขอบเขตงาน</p>
                <h2>
                  รับตรวจสอบบัญชี
                  <br />
                  ตรวจอะไรบ้าง
                </h2>
                <p>
                  ผู้สอบบัญชีประเมินความเสี่ยง ตรวจหลักฐาน
                  แล้วแสดงความเห็นต่องบการเงินตามมาตรฐานการสอบบัญชี
                </p>
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

              <div className="aud-scope__assurance reveal-on-scroll">
                การตรวจสอบบัญชีให้<strong>ความเชื่อมั่นอย่างสมเหตุสมผล</strong>{' '}
                ไม่ใช่การรับประกันว่าจะพบข้อผิดพลาดหรือการทุจริตทุกกรณี
                ถ้าต้องการความเห็นเรื่องระบบควบคุมภายในโดยเฉพาะ เป็นงานแยกต่างหาก
              </div>
            </div>

            <div className="aud-scope__right reveal-on-scroll delay-2">
              <div className="aud-scope__photo">
                <Image
                  src="/images/process_desk.jpg"
                  alt="ผู้สอบบัญชีตรวจสอบแฟ้มกระดาษทำการและงบการเงิน"
                  fill
                  sizes="(max-width: 991px) 100vw, 480px"
                  className="aud-scope__img"
                />
              </div>
              <div className="aud-scope__deliverable-card">
                <span>สิ่งที่คุณได้รับเมื่อตรวจเสร็จ</span>
                <strong>
                  รายงานของผู้สอบบัญชี พร้อมงบการเงินที่ตรวจแล้ว ใช้ประชุมผู้ถือหุ้นและยื่นงบได้ทันที
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== U4: AEO — WHAT IS AUDIT + COMPARE (#what-is-audit) ===== */}
      <section id="what-is-audit" className="section aud-aeo">
        <div className="container aud-aeo__wrap">
          <div className="aud-aeo__top reveal-on-scroll">
            <div>
              <p className="section-kicker">พื้นฐานที่ควรรู้</p>
              <h2>
                ตรวจสอบบัญชีคืออะไร
                <br />
                ทำไมบริษัทต้องตรวจ
              </h2>
            </div>

            <div className="aud-aeo__quick-answer">
              <p>
                <strong>การตรวจสอบบัญชี (Financial Statement Audit)</strong>{' '}
                คือการที่ผู้สอบบัญชีตรวจงบการเงินและหลักฐานของบริษัท เพื่อให้ได้
                <strong>ความเชื่อมั่นอย่างสมเหตุสมผล</strong>
                ว่างบโดยรวมไม่มีข้อมูลที่ผิดจากความจริงอย่างมีสาระสำคัญ
                แล้วออกรายงานแสดงความเห็นตามมาตรฐานการสอบบัญชี
              </p>
            </div>
          </div>

          <div className="aud-aeo__grid">
            <div className="aud-aeo__reasons reveal-on-scroll">
              <h3>ทำไมบริษัทต้องตรวจสอบงบการเงินประจำปี</h3>
              <div className="aud-aeo__reasons-grid">
                {WHY_AUDIT_CARDS.map((item) => (
                  <article key={item.title} className="aud-aeo__reason-card">
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="aud-aeo__compare reveal-on-scroll delay-2">
              <h3>จัดทำงบการเงินกับตรวจสอบบัญชีต่างกันอย่างไร</h3>
              <div className="aud-aeo__table-wrap">
                <table className="aud-aeo__table">
                  <thead>
                    <tr>
                      <th scope="col">ประเด็น</th>
                      <th scope="col">จัดทำงบการเงิน</th>
                      <th scope="col" className="aud-aeo__th-hot">
                        ตรวจสอบบัญชี
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => (
                      <tr key={row.topic}>
                        <td className="aud-aeo__td-key">{row.topic}</td>
                        <td>{row.prepare}</td>
                        <td className="aud-aeo__td-hot">{row.audit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="aud-aeo__internal-link">
                ต้องการให้จัดทำงบให้ก่อนตรวจ ดู{' '}
                <Link href="/services/annual-financial-statements">รับปิดงบการเงิน</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== U5: WHO IS CPA (#cpa — Navy Section) ===== */}
      <section id="cpa" className="section aud-cpa">
        <div className="container aud-cpa__layout">
          <div className="aud-cpa__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ผู้สอบบัญชี CPA</p>
              <h2>
                ผู้สอบบัญชีรับอนุญาต (CPA)
                <br />
                คือใคร
              </h2>
              <p className="aud-cpa__lead">
                ผู้สอบบัญชีรับอนุญาต หรือ CPA (Certified Public Accountant)
                คือนักบัญชีที่ได้รับใบอนุญาตตามกฎหมายให้ตรวจสอบและแสดงความเห็นต่องบการเงิน ต้อง
                <strong>เป็นอิสระ</strong>จากบริษัทที่ตรวจ และปฏิบัติตามจรรยาบรรณวิชาชีพ
              </p>
            </div>

            <h3 className="aud-cpa__duties-title">หน้าที่ของผู้สอบบัญชี CPA</h3>
            <ul className="aud-cpa__duties">
              {CPA_DUTIES.map((duty) => (
                <li key={duty}>
                  <Check size={20} aria-hidden="true" />
                  <span>{duty}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="aud-cpa__right reveal-on-scroll delay-2">
            <div className="aud-cpa__photo">
              <Image
                src="/images/office_atmosphere.png"
                alt="ผู้สอบบัญชีรับอนุญาตตรวจสอบงบการเงินที่โต๊ะทำงาน"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="aud-cpa__img"
              />
            </div>

            <div className="aud-cpa__vs-card">
              <h3>งบของคุณต้องให้ CPA หรือ TA ตรวจ</h3>
              <div className="aud-cpa__vs-rows">
                <div className="aud-cpa__vs-row">
                  <span>บริษัทจำกัดทุกแห่ง</span>
                  <strong className="aud-cpa__tag--cpa">CPA</strong>
                </div>
                <div className="aud-cpa__vs-row">
                  <span>หจก. ทุนไม่เกิน 5 ล้าน สินทรัพย์และรายได้ไม่เกิน 30 ล้าน</span>
                  <strong className="aud-cpa__tag--both">TA หรือ CPA</strong>
                </div>
                <div className="aud-cpa__vs-row">
                  <span>หจก. ที่เกินเกณฑ์ข้อใดข้อหนึ่ง</span>
                  <strong className="aud-cpa__tag--cpa">CPA</strong>
                </div>
              </div>
              <Link
                href="/knowledge/difference-between-cpa-and-ta"
                className="aud-cpa__vs-link"
              >
                อ่านเพิ่ม: CPA กับ TA ต่างกันอย่างไร →
              </Link>
            </div>

            <div className="aud-cpa__criteria">
              <h3>หาผู้สอบบัญชี ดูอะไรบ้าง</h3>
              <p>
                เลขทะเบียน CPA ที่ตรวจสอบได้ · เคยตรวจธุรกิจแบบเดียวกัน · ขอบเขตงานและระยะเวลาชัด ·
                เป็นอิสระจากคนทำบัญชี · ค่าตรวจสอบบัญชีบอกเป็นตัวเลข
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== U6: DOCUMENT CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents">
        <div className="container afs-documents__layout">
          <div className="afs-documents__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เช็กลิสต์เอกสาร</p>
              <h2>
                เอกสารที่ต้องเตรียม
                <br />
                สำหรับตรวจสอบบัญชี
              </h2>
              <p>ยิ่งเอกสารพร้อม ผู้สอบบัญชียิ่งตรวจได้เร็ว ติ๊กเพื่อดูว่าคุณมีอะไรแล้วบ้าง</p>
            </div>

            <div className="afs-documents__photo">
              <Image
                src="/images/graphic_abstract.png"
                alt="เตรียมแฟ้มเอกสารบัญชีสำหรับส่งให้ผู้สอบบัญชีตรวจ"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="afs-documents__img"
              />
            </div>

            <div className="afs-documents__reassure">
              <strong>ไม่แน่ใจว่าเอกสารที่มีครบพร้อมตรวจหรือยัง</strong>
              <p>ส่งงบทดลองหรืองบปีก่อนมาให้ดูก่อนได้ เราช่วยเช็กรายการที่ต้องเตรียมเพิ่มให้</p>
              <a
                href="https://line.me/ti/p/DliAyJfUXd"
                target="_blank"
                rel="noopener noreferrer"
                className="ma-quote__line-btn"
              >
                <MessageCircle size={18} aria-hidden="true" />
                <span>ส่งงบให้ดูทาง LINE</span>
              </a>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <AuditDocChecklist />
          </div>
        </div>
      </section>

      {/* ===== U7: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอน</p>
              <h2>
                ขั้นตอนตรวจสอบบัญชี
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ติดต่อเราล่วงหน้าอย่างน้อย 2–4 สัปดาห์ก่อนวันประชุมผู้ถือหุ้น เพื่อให้มีเวลาตรวจพอ
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

      {/* ===== U8: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/process_meeting.jpg"
              alt="ทีมตรวจสอบบัญชีประชุมวางแผนตรวจงบการเงิน"
              fill
              sizes="(max-width: 991px) 100vw, 50vw"
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ย้ายมาจากสำนักงานบัญชีเดิมเพราะตามงานยาก พอมาทำกับดีถาวร
                แจ้งราคาชัดเจนตั้งแต่ก่อนเริ่มงาน ปิดงบส่ง CPA ทันกำหนด”
              </p>
              <footer>— คุณกิตติพงศ์ วัฒนากุล, บริษัทที่ปรึกษาด้านวิศวกรรมและระบบไอที</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมเลือกสำนักงานสอบบัญชี
                <br />
                ดีถาวร
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

      {/* ===== U9: PRICING (#pricing) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าตรวจสอบบัญชี
                <br />
                คิดอย่างไร
              </h2>
              <p>
                สำนักงานสอบบัญชีส่วนใหญ่คิดตามขนาดและความซับซ้อนของงาน
                เราขอดูงบทดลองหรืองบปีก่อนแล้วแจ้งค่าตรวจสอบเป็นตัวเลข
              </p>
            </div>

            <h3 className="ma-pricing__factors-title">ปัจจัยที่มีผลกับค่าตรวจสอบบัญชี</h3>
            <div className="aud-pricing__factors-table">
              {PRICING_FACTORS.map((item) => (
                <div key={item.label} className="aud-pricing__factor-row">
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ma-pricing__card reveal-on-scroll delay-2">
            <div className="ma-pricing__price-block">
              <span className="aud-pricing__card-kicker">ตรวจสอบงบประจำปีโดย CPA</span>
              <div className="ma-pricing__price-value">
                <strong style={{ fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', lineHeight: 1.25 }}>
                  ราคาตามขนาดกิจการ
                </strong>
              </div>
              <p className="aud-pricing__card-desc">
                รวมการตรวจสอบตามมาตรฐาน รายงานของผู้สอบบัญชี และข้อสังเกตต่อผู้บริหาร
              </p>
            </div>

            <ul className="aud-pricing__checks">
              <li>
                <Check size={18} aria-hidden="true" />
                <span>ตรวจตามมาตรฐาน TSA</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>รับทั้งบริษัทจำกัดและ หจก.</span>
              </li>
              <li>
                <Check size={18} aria-hidden="true" />
                <span>แจ้งราคาและวันส่งรายงานก่อนเริ่ม</span>
              </li>
            </ul>

            <Link href="#quote" className="ma-pricing__cta">
              ขอใบเสนอราคาตรวจสอบบัญชี
            </Link>
            <span className="ma-pricing__footnote">
              ส่งงบทดลองหรืองบปีก่อนเพื่อประเมินราคา ไม่มีค่าใช้จ่าย
            </span>
          </div>
        </div>
      </section>

      {/* ===== U10: FAQ (#faq — 7 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              ตรวจสอบบัญชี
            </h2>
            <p>ไม่เจอคำตอบที่ต้องการ โทรถามได้ในเวลาทำการ</p>
            <div className="ma-faq__phones">
              <a href="tel:0991495656">099-149-5656</a>
              <a href="tel:0919415656">091-941-5656</a>
            </div>
          </div>

          <div className="ma-faq__list reveal-on-scroll delay-2">
            {AUDIT_FAQS.map((faq, idx) => (
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
                      (ดู <Link href="/services/annual-financial-statements">รับปิดงบการเงิน</Link>)
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== U11A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>
                อ่านเรื่องผู้สอบบัญชี
                <br />
                ก่อนเลือกสำนักงานสอบบัญชี
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
              href="/knowledge/difference-between-cpa-and-ta"
              className="ma-kb-card ma-kb-card--featured reveal-on-scroll delay-1"
            >
              <div className="ma-kb-card__photo">
                <Image
                  src="/uploads/articles/cover-cpa-audit.jpg"
                  alt="ภาพปกบทความเรื่อง CPA และ TA"
                  fill
                  sizes="(max-width: 920px) 100vw, 50vw"
                  className="ma-kb-card__img"
                />
                <span className="ma-kb-card__tag">ตรวจสอบบัญชี</span>
              </div>
              <div className="ma-kb-card__body">
                <span className="ma-kb-card__date">20 ม.ค. 2569</span>
                <h3>
                  ข้อแตกต่างระหว่างผู้สอบบัญชีรับอนุญาต (CPA) และผู้สอบบัญชีภาษีอากร (TA)
                  ธุรกิจแบบไหนต้องใช้ใคร
                </h3>
                <p>เช็กก่อนหาผู้สอบบัญชี ว่ากิจการของคุณต้องใช้ CPA หรือใช้ TA ได้</p>
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
                href="/knowledge/vat-registration-guide"
                className="ma-kb-card ma-kb-card--horizontal reveal-on-scroll delay-3"
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
            </div>
          </div>
        </div>
      </section>

      {/* ===== U11B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              กำลังหาผู้สอบบัญชี CPA
              <br />
              สำหรับบริษัทของคุณ?
            </h2>
            <p className="ma-quote__lead">
              บอกประเภทกิจการ วันสิ้นรอบบัญชี และรายได้โดยประมาณ ทีมงานโทรกลับภายใน 1 วันทำการ
              พร้อมแจ้งค่าตรวจสอบบัญชีและวันส่งรายงาน
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
                <h4>ส่งงบปีก่อนให้ดูทาง LINE ก็ได้</h4>
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
            <AuditQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
