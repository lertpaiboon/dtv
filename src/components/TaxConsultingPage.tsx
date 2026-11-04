import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  HelpCircle,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  ShieldAlert,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import TaxConsultingDocChecklist from '@/components/TaxConsultingDocChecklist';
import TaxConsultingQuoteForm from '@/components/TaxConsultingQuoteForm';

const COMMON_QUESTIONS = [
  'รายได้เท่านี้ ควรจด VAT เลยไหม',
  'ค่าใช้จ่ายนี้เอามาหักภาษีได้ไหม',
  'ได้จดหมายจากสรรพากร ต้องทำอะไร',
  'ควรจดบริษัทหรือทำในนามบุคคล',
];

const PROBLEM_ROWS = [
  {
    problem: 'ไม่แน่ใจว่าค่าใช้จ่ายไหนเอามาหักภาษีได้',
    solution: 'ไล่ดูทีละรายการว่าเข้าเงื่อนไขกฎหมายไหม และต้องมีเอกสารอะไร',
  },
  {
    problem: 'ยื่นภาษีผิดหรือยื่นเลยกำหนด',
    solution: 'ดูว่าผิดตรงไหน ต้องยื่นเพิ่มเติมไหม และคำนวณเบี้ยปรับเงินเพิ่มให้รู้ก่อน',
  },
  {
    problem: 'ภาษีซื้อขอคืนไม่ได้ หรือ VAT ไม่ตรงกับยอดขาย',
    solution: 'เช็กใบกำกับภาษีและรายงานภาษีซื้อขาย หาจุดที่ไม่ตรง',
  },
  {
    problem: 'ภาษีปลายปีสูงกว่าที่คิดไว้มาก',
    solution: 'หาว่าตัวเลขมาจากไหน และวางแผนตั้งแต่ต้นปีสำหรับรอบถัดไป',
  },
  {
    problem: 'ได้หนังสือเชิญพบหรือขอเอกสารจากสรรพากร',
    solution:
      'อ่านหนังสือให้ บอกว่าต้องเตรียมเอกสารอะไร ช่วยเตรียมคำชี้แจง และแนะแนวทางชี้แจงต่อเจ้าหน้าที่',
  },
  {
    problem: 'ธุรกิจโตเร็ว ธุรกรรมเริ่มซับซ้อน',
    solution: 'ประเมินผลภาษีก่อนทำธุรกรรมใหญ่ เช่น ซื้อสินทรัพย์หรือรับเงินจากต่างประเทศ',
  },
];

const PLANNING_STEPS = [
  {
    step: '1',
    title: 'ดูตัวเลขจริงของปีนี้',
    detail: 'รวบรวมรายได้ รายจ่าย และงบทดลองล่าสุด',
  },
  {
    step: '2',
    title: 'ประเมินภาษีที่ต้องจ่าย',
    detail: 'คำนวณภาษีทั้งปีคร่าวๆ จากตัวเลขที่มี',
  },
  {
    step: '3',
    title: 'เช็กสิทธิประโยชน์ที่ใช้ได้',
    detail: 'รายจ่ายและสิทธิทางภาษีที่กิจการเข้าเงื่อนไข',
  },
  {
    step: '4',
    title: 'ดูผลภาษีก่อนทำธุรกรรมใหญ่',
    detail: 'ซื้อสินทรัพย์ ทำสัญญา หรือเปลี่ยนโครงสร้างธุรกิจ',
  },
  {
    step: '5',
    title: 'ทบทวนแผนทุกไตรมาส',
    detail: 'ปรับตามผลประกอบการและกฎหมายที่เปลี่ยน',
  },
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'เล่าเรื่องที่อยากปรึกษา',
    detail: 'ประเภทธุรกิจ เรื่องที่สงสัย และมีกำหนดเวลาที่ต้องตอบใครไหม',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'ประเมินขอบเขตและราคา',
    detail: 'บอกว่าปรึกษาครั้งเดียวพอ หรือควรดูต่อเนื่อง พร้อมราคาเป็นตัวเลข',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'ดูเอกสารก่อนวันนัด',
    detail: 'วิเคราะห์ข้อมูลบัญชี แบบภาษี และเอกสารที่เกี่ยวข้อง',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'คุยทางเลือก',
    detail: 'อธิบายแต่ละทางเลือก ผลภาษี ความเสี่ยง และสิ่งที่ต้องทำต่อ',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ติดตามผล',
    detail: 'ตามเรื่องที่ค้างและตอบคำถามเพิ่มตามขอบเขตที่ตกลง',
  },
];

const TRUST_POINTS = [
  {
    title: 'คนทำบัญชีจริงเป็นคนให้คำปรึกษา',
    detail: 'เห็นปัญหาภาษีจากงานบัญชีของลูกค้าทุกเดือน คำแนะนำจึงทำได้จริงในทางปฏิบัติ',
  },
  {
    title: 'ดูจากเอกสารจริง ไม่เดา',
    detail: 'ขอดูตัวเลขและเอกสารก่อนให้คำตอบ ถ้าข้อมูลไม่พอ เราบอกตรงๆ ว่ายังตอบไม่ได้',
  },
  {
    title: 'อธิบายให้เจ้าของธุรกิจเข้าใจ',
    detail: 'ใช้ตัวเลขของบริษัทคุณเป็นตัวอย่าง ไม่ใช้ศัพท์กฎหมายจนฟังไม่รู้เรื่อง',
  },
  {
    title: 'ลูกค้ารายเดือนปรึกษาฟรีตลอดสัญญา',
    detail: 'ถ้าทำบัญชีรายเดือนกับเรา ถามเรื่องภาษีได้โดยไม่คิดค่าปรึกษาเพิ่ม',
  },
  {
    title: 'ข้อมูลธุรกิจเป็นความลับ',
    detail: 'เอกสารและตัวเลขที่ส่งมาใช้เพื่อการปรึกษาเท่านั้น',
  },
];

const PRICING_FACTORS = [
  'เรื่องที่ปรึกษาและความซับซ้อน',
  'จำนวนเอกสารที่ต้องดู',
  'ปรึกษาครั้งเดียวหรือต่อเนื่อง',
  'ต้องทำรายงานสรุปหรือไม่',
  'ต้องประสานกับสรรพากรหรือไม่',
];

export default function TaxConsultingPage({ data }: { data: SubServiceDetailConfig }) {
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

      {/* ===== C1: HERO & META TITLE (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">ที่ปรึกษาภาษี</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการทำบัญชีและภาษี · ที่ปรึกษาภาษี</p>
              <h1 className="ma-hero__title">
                <span>ที่ปรึกษาภาษี</span>
                <span className="ma-hero__subtitle">
                  รับวางแผนภาษีธุรกิจ และช่วยแก้ปัญหาภาษีให้บริษัท SME
                </span>
              </h1>
              <p className="page-hero__lead">
                ก่อนจด VAT ก่อนเซ็นสัญญาใหญ่ หรือตอนได้จดหมายจากสรรพากร คุยกับเราก่อนตัดสินใจ
                เราดูจากตัวเลขและเอกสารจริงของบริษัทคุณ แล้วอธิบายทางเลือกที่ทำได้ตามกฎหมาย
                พร้อมผลภาษีของแต่ละทาง
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  นัดคุยกับที่ปรึกษาภาษี <ArrowRight aria-hidden="true" />
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
                  alt="ที่ปรึกษาภาษีของดีถาวรคุยแผนภาษีกับเจ้าของธุรกิจ"
                  fill
                  priority
                  sizes="(max-width: 920px) 100vw, 480px"
                  className="ma-hero__photo"
                />
              </div>
              <div className="ma-hero__showcase-footer">
                <div className="ma-hero__showcase-price">
                  <span>ลูกค้าทำบัญชีรายเดือน</span>
                  <strong>ไม่คิดเพิ่ม</strong>
                  <small>หรือนัดปรึกษาเป็นครั้ง / รายปี</small>
                </div>
                <p>ดูจากตัวเลขและเอกสารจริงของบริษัท อธิบายทางเลือกและผลภาษีที่ทำได้ตามกฎหมาย</p>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการที่ปรึกษาภาษี">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ดูจากเอกสารจริงของบริษัท</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>อธิบายเป็นภาษาคนทำธุรกิจ</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>วางแผนตามกฎหมายเท่านั้น</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ข้อมูลธุรกิจเป็นความลับ</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== C2: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการที่ปรึกษาภาษี
                <br />
                เหมาะกับธุรกิจแบบไหน
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ไม่ใช่ทุกบริษัทต้องมีที่ปรึกษาภาษีประจำ แต่ถ้าคุณอยู่ในสถานการณ์ด้านล่าง
              การรับปรึกษาภาษีธุรกิจก่อนตัดสินใจมักถูกกว่าตามแก้ทีหลัง
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>กำลังจะเปิดบริษัท</h3>
              <p>
                ยังไม่แน่ใจว่าควรจดบริษัท จด หจก. หรือทำในนามบุคคลต่อ และจะจด VAT ตอนไหนดี
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <Briefcase size={28} strokeWidth={1.7} />
              </span>
              <h3>SME ที่อยากรู้ภาษีล่วงหน้า</h3>
              <p>
                อยากรู้ว่าปีนี้จะเสียภาษีประมาณเท่าไร และมีรายจ่ายหรือสิทธิประโยชน์ไหนที่ใช้ได้ถูกต้อง
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <TrendingUp size={28} strokeWidth={1.7} />
              </span>
              <h3>ธุรกิจที่กำลังขยาย</h3>
              <p>
                จะซื้อสินทรัพย์ใหญ่ เปิดสาขา รับงานต่างประเทศ หรือเพิ่มหุ้นส่วน อยากรู้ผลภาษีก่อนลงมือ
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <Mail size={28} strokeWidth={1.7} />
              </span>
              <h3>ได้หนังสือจากสรรพากร</h3>
              <p>
                ได้จดหมายเชิญพบ ขอเอกสาร หรือแจ้งประเมินภาษี และไม่แน่ใจว่าต้องเตรียมอะไร
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== C3: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container tf-scope__layout">
          <div className="tf-scope__left">
            <div className="section-heading reveal-on-scroll">
              <p className="section-kicker">ขอบเขตงาน</p>
              <h2>
                รับวางแผนภาษีและปรึกษา
                <br />
                เรื่องอะไรได้บ้าง
              </h2>
              <p>
                ปรึกษาเรื่องเดียวหรือหลายเรื่องพร้อมกันก็ได้
                พร้อมสรุปประเด็นสำคัญและรายการเอกสารที่ต้องใช้ให้ชัดเจนหลังคุย
              </p>
            </div>

            <div className="ma-scope__grid">
              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <BarChart3 size={22} strokeWidth={1.75} />
                </span>
                <h3>วางแผนภาษีธุรกิจ</h3>
                <p>ดูรายได้ รายจ่าย และโครงสร้างธุรกิจ แล้วประเมินภาษีทั้งปีก่อนปิดรอบบัญชี</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Landmark size={22} strokeWidth={1.75} />
                </span>
                <h3>ภาษีเงินได้นิติบุคคล</h3>
                <p>รายจ่ายไหนหักได้ หักไม่ได้ ใช้สิทธิประโยชน์อะไรได้บ้างตามเงื่อนไขของกิจการ</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Receipt size={22} strokeWidth={1.75} />
                </span>
                <h3>ภาษีมูลค่าเพิ่ม (VAT)</h3>
                <p>ควรจด VAT ตอนไหน ภาษีซื้อแบบไหนขอคืนไม่ได้ และการออกใบกำกับให้ถูก</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <FileSpreadsheet size={22} strokeWidth={1.75} />
                </span>
                <h3>ภาษีหัก ณ ที่จ่าย</h3>
                <p>จ่ายเงินแบบนี้ต้องหักไหม หักกี่เปอร์เซ็นต์ และยื่นแบบไหน</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Wrench size={22} strokeWidth={1.75} />
                </span>
                <h3>รับแก้ไขปัญหาภาษี</h3>
                <p>ยื่นผิด ยื่นช้า หรือได้หนังสือจากสรรพากร ดูข้อเท็จจริงและเอกสารแล้วบอกทางแก้</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <ShieldAlert size={22} strokeWidth={1.75} />
                </span>
                <h3>ตรวจความเสี่ยงภาษี</h3>
                <p>
                  ไล่ดูจุดที่อาจโดนประเมินเพิ่ม แล้วแนะนำวิธีเก็บเอกสารและวิธีทำงานที่รัดกุมขึ้น
                </p>
              </article>
            </div>

            <p className="tf-scope__links reveal-on-scroll delay-3">
              ต้องการให้ยื่นแบบให้ด้วย ดู <Link href="/services/tax-filing">บริการยื่นภาษี</Link> ·
              ลงบัญชีทุกเดือน ดู <Link href="/services/monthly-accounting">รับทำบัญชีรายเดือน</Link>{' '}
              · ปิดงบปลายปี ดู{' '}
              <Link href="/services/annual-financial-statements">รับปิดงบการเงิน</Link>
            </p>
          </div>

          <div className="tf-scope__showcase reveal-on-scroll delay-2">
            <div className="tf-scope__photo">
              <Image
                src="/images/process_desk.jpg"
                alt="เอกสารและตัวเลขที่ใช้วางแผนภาษีบริษัท"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="tf-scope__img"
              />
            </div>

            <div className="tf-scope__badge-card tc-scope__badge-card">
              <strong>คำถามที่ลูกค้ามักมาถาม</strong>
              <ul>
                {COMMON_QUESTIONS.map((q) => (
                  <li key={q}>
                    <span className="tc-scope__q-icon" aria-hidden="true">
                      <HelpCircle size={15} strokeWidth={2.2} />
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== C4: PROBLEMS (#problems) ===== */}
      <section id="problems" className="section ma-why">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ปัญหาที่เจอบ่อย</p>
              <h2>
                ปัญหาภาษีที่ธุรกิจเจอบ่อย
                <br />
                และที่ปรึกษาช่วยอะไรได้
              </h2>
            </div>
            <p className="ma-why__lead">
              เรารับแก้ไขปัญหาภาษีจากข้อเท็จจริงและเอกสารของกิจการ ไม่ใช่คำตอบสำเร็จรูปที่ใช้กับทุกบริษัท
            </p>
          </div>

          <div className="ma-why__table reveal-on-scroll delay-2">
            <div className="ma-why__head" aria-hidden="true">
              <span>ปัญหาที่เจอ</span>
              <span>สิ่งที่ที่ปรึกษาทำ</span>
            </div>
            {PROBLEM_ROWS.map((row) => (
              <div key={row.problem} className="ma-why__row">
                <span className="ma-why__problem">{row.problem}</span>
                <span className="ma-why__solution">{row.solution}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== C5: HOW TO PLAN (AEO — #how-to-plan) ===== */}
      <section id="how-to-plan" className="section tc-plan">
        <div className="container tc-plan__layout">
          <div className="tc-plan__left reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">วางแผนภาษี</p>
              <h2>
                วางแผนภาษีธุรกิจอย่างไร
                <br />
                ให้ถูกต้องตามกฎหมาย
              </h2>
            </div>

            <p className="tc-plan__summary">
              การวางแผนภาษีธุรกิจ คือการดูรายได้ รายจ่าย และธุรกรรมของบริษัทล่วงหน้า
              เพื่อเลือกวิธีทำงานที่เสียภาษีถูกต้องและใช้สิทธิประโยชน์ที่กฎหมายให้ได้ครบ
              ควรเริ่มก่อนสิ้นรอบบัญชี เพราะหลังปิดงบแล้วตัวเลขส่วนใหญ่เปลี่ยนไม่ได้
            </p>

            <div className="tc-plan__warning">
              <h3>สิ่งที่เราไม่ทำ</h3>
              <p>
                ไม่แต่งตัวเลข ไม่ใช้เอกสารที่ไม่มีธุรกรรมจริง และไม่แนะนำวิธีเลี่ยงภาษีที่ผิดกฎหมาย
                เพราะสุดท้ายภาระตกอยู่ที่บริษัทและกรรมการ
              </p>
            </div>

            <p className="tc-plan__note">
              อ้างอิงหลักเกณฑ์จาก{' '}
              <a href="https://www.rd.go.th/" target="_blank" rel="noopener noreferrer">
                กรมสรรพากร
              </a>{' '}
              · เนื้อหาตรวจโดย ทีมที่ปรึกษาภาษีและผู้สอบบัญชีรับอนุญาต (CPA) · อัปเดต ต.ค. 2569
            </p>
          </div>

          <div className="tc-plan__right reveal-on-scroll delay-2">
            <h3 className="tc-plan__steps-title">5 ขั้นตอนวางแผนภาษีบริษัท</h3>
            <ol className="tc-plan__steps">
              {PLANNING_STEPS.map((item) => (
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
      </section>

      {/* ===== C6: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process ma-process--dark">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ขั้นตอน</p>
              <h2>
                ขั้นตอนปรึกษาภาษี
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ยิ่งส่งเอกสารให้ดูก่อนวันนัด ยิ่งได้คำแนะนำที่ตรงกับกรณีของคุณ
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

      {/* ===== C7: DOCUMENT CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents">
        <div className="container afs-documents__layout">
          <div className="afs-documents__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เช็กลิสต์เอกสาร</p>
              <h2>
                เอกสารที่ควรเตรียม
                <br />
                ก่อนปรึกษาภาษี
              </h2>
              <p>
                ไม่ต้องมีครบทุกข้อ เอกสารที่ใช้จริงขึ้นกับเรื่องที่อยากปรึกษา
                ติ๊กเพื่อดูว่าคุณมีอะไรแล้วบ้าง
              </p>
            </div>

            <div className="afs-documents__photo">
              <Image
                src="/images/service_reg.png"
                alt="เตรียมเอกสารบริษัทก่อนปรึกษาภาษี"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="afs-documents__img"
              />
            </div>

            <div className="afs-documents__reassure">
              <strong>ได้จดหมายจากสรรพากรและมีกำหนดตอบ</strong>
              <p>ถ่ายรูปจดหมายส่งมาทาง LINE ก่อนได้เลย เราดูให้ว่าเรื่องอะไรและต้องรีบแค่ไหน</p>
              <a
                href="https://line.me/ti/p/DliAyJfUXd"
                target="_blank"
                rel="noopener noreferrer"
                className="ma-quote__line-btn"
              >
                <MessageCircle size={18} aria-hidden="true" />
                <span>ส่งรูปจดหมายทาง LINE</span>
              </a>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <TaxConsultingDocChecklist />
          </div>
        </div>
      </section>

      {/* ===== C8: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust ma-trust--ice">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/office_atmosphere.png"
              alt="ห้องประชุมสำหรับปรึกษาภาษีที่สำนักงานดีถาวร อโศก"
              fill
              sizes="(max-width: 991px) 100vw, 50vw"
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ก่อนเปลี่ยนจากร้านค้าบุคคลธรรมดามาจดบริษัทและจด VAT มาปรึกษาทีมดีถาวรก่อน
                พี่ๆ ช่วยดูตัวเลขจริงและอธิบายทางเลือกภาษีเป็นภาษาที่เข้าใจง่ายมากค่ะ”
              </p>
              <footer>— คุณปิยะนุช สุวรรณรัตน์, บริษัทเอเจนซี่และที่ปรึกษาการตลาด</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมเลือกที่ปรึกษาภาษี
                <br />
                จากดีถาวร
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

      {/* ===== C9: PRICING (#pricing — 3 Cards + Factors Bar) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container tc-pricing__wrap">
          <div className="tc-pricing__head reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าบริการที่ปรึกษาภาษี
                <br />
                คิดอย่างไร
              </h2>
            </div>
            <p className="tc-pricing__lead">
              ราคาขึ้นกับเรื่องที่ปรึกษา ความซับซ้อน จำนวนเอกสารที่ต้องดู และรูปแบบการปรึกษา
              เราแจ้งราคาเป็นตัวเลขก่อนเริ่มทุกครั้ง
            </p>
          </div>

          <div className="tc-pricing__cards reveal-on-scroll delay-2">
            <article className="tc-pricing__card">
              <h3>ปรึกษาเป็นครั้ง</h3>
              <strong className="tc-pricing__price">แจ้งราคาก่อนนัดคุย</strong>
              <p>เหมาะกับคำถามเฉพาะเรื่อง เช่น จด VAT ดีไหม หรือได้หนังสือจากสรรพากร</p>
              <Link href="#quote" className="tc-pricing__link">
                <span>นัดปรึกษา</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="tc-pricing__card tc-pricing__card--featured">
              <h3>รับวางแผนภาษีทั้งปี</h3>
              <strong className="tc-pricing__price">ประเมินตามกิจการ</strong>
              <p>ประเมินภาษีทั้งปี ทบทวนรายไตรมาส และดูผลภาษีก่อนธุรกรรมใหญ่</p>
              <Link href="#quote" className="tc-pricing__link">
                <span>ขอใบเสนอราคา</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>

            <article className="tc-pricing__card">
              <h3>ลูกค้าทำบัญชีรายเดือน</h3>
              <strong className="tc-pricing__price">ไม่คิดเพิ่ม</strong>
              <p>ปรึกษาภาษีได้ตลอดสัญญารับทำบัญชีรายเดือน เริ่ม 1,500 บาท/เดือน</p>
              <Link href="/services/monthly-accounting" className="tc-pricing__link">
                <span>ดูรับทำบัญชีรายเดือน</span>
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

      {/* ===== C10: FAQ (#faq — 6 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              ที่ปรึกษาภาษี
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

      {/* ===== C11A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>
                อ่านเรื่องภาษีธุรกิจ
                <br />
                ก่อนคุยกับที่ปรึกษา
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
              href="/knowledge/5-things-before-company-registration"
              className="ma-kb-card ma-kb-card--featured reveal-on-scroll delay-1"
            >
              <div className="ma-kb-card__photo">
                <Image
                  src="/uploads/articles/cover-company-reg.jpg"
                  alt="ภาพปกบทความเรื่องจดทะเบียนบริษัทและวางแผนภาษี"
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
                <p>เรื่องที่ควรคิดเรื่องภาษีตั้งแต่ก่อนจดบริษัท</p>
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

      {/* ===== C11B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">นัดปรึกษา</p>
            <h2>
              เล่าเรื่องภาษีที่ค้างใจ
              <br />
              แล้วนัดคุยกับที่ปรึกษา
            </h2>
            <p className="ma-quote__lead">
              กรอกสั้นๆ ว่าอยากปรึกษาเรื่องอะไร ทีมงานโทรกลับภายใน 1 วันทำการเพื่อนัดวันและแจ้งราคา
              ถ้ามีกำหนดต้องตอบสรรพากร บอกเราด้วย
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
                <h4>ส่งคำถามหรือรูปเอกสารทาง LINE</h4>
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
            <TaxConsultingQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
