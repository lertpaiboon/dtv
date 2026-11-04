import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  FilePenLine,
  Landmark,
  Mail,
  MessageCircle,
  Monitor,
  Phone,
  Plus,
  Receipt,
  Scale,
  SearchCheck,
  Send,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import AnnualDocChecklist from '@/components/AnnualDocChecklist';
import AnnualQuoteForm from '@/components/AnnualQuoteForm';

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'ส่งข้อมูลเบื้องต้น',
    detail: 'บอกประเภทกิจการ วันสิ้นรอบบัญชี และตอนนี้บัญชีลงไว้ถึงไหน',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'ตรวจเอกสารและเสนอราคา',
    detail: 'ดูว่าเอกสารครบแค่ไหน แล้วแจ้งราคาและระยะเวลาเป็นตัวเลข',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'ปิดบัญชีสิ้นปี',
    detail: 'กระทบยอด ปรับปรุงรายการ ตั้งค่าเสื่อมราคาและค่าใช้จ่ายค้างจ่าย',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'จัดทำงบการเงิน',
    detail: 'งบแสดงฐานะการเงิน งบกำไรขาดทุน และหมายเหตุประกอบงบ',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ส่งต่อ CPA และยื่นงบ',
    detail: 'ส่งงบให้ผู้สอบบัญชีตรวจ และยื่นต่อหน่วยงานรัฐตามขอบเขตที่ตกลง',
  },
];

const TRUST_POINTS = [
  {
    title: 'ดูเอกสารจริงก่อนบอกราคา',
    detail: 'ราคาและระยะเวลาเป็นตัวเลขตั้งแต่แรก ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 เพิ่มทีหลัง',
  },
  {
    title: 'บอกตั้งแต่ต้นว่าขาดเอกสารอะไร',
    detail: 'ไม่ปล่อยให้รู้ตอนใกล้วันยื่น มีเวลาตามเอกสารจากคู่ค้าหรือธนาคาร',
  },
  {
    title: 'ทีมจบบัญชีโดยตรง งบปีตรวจโดย CPA',
    detail: 'ติดตามมาตรฐานบัญชีและกฎหมายภาษีที่เปลี่ยนทุกปี',
  },
  {
    title: 'ประสานกับผู้สอบบัญชีให้',
    detail: 'ตอบคำถามและส่งเอกสารเพิ่มระหว่างตรวจ คุณไม่ต้องคุยเองทุกเรื่อง',
  },
  {
    title: 'คุยกับคนที่ทำงบให้คุณได้เลย',
    detail: 'จันทร์–ศุกร์ 08:30–17:30 น. โทรหรือทัก LINE',
  },
];

const PRICING_FACTORS = [
  'จำนวนรายการบัญชีตลอดรอบปี',
  'เอกสารครบและถูกต้องแค่ไหน',
  'ความซับซ้อนของธุรกรรม เช่น สินค้าคงเหลือ หรือเงินตราต่างประเทศ',
  'บัญชีที่ผ่านมาลงไว้ครบหรือต้องลงย้อนหลัง',
  'งานเพิ่ม เช่น ค่าผู้สอบบัญชี หรือการยื่นงบและภาษี',
];

export default function AnnualFinancialStatementsPage({ data }: { data: SubServiceDetailConfig }) {
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

      {/* ===== A1: HERO & META TITLE (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">รับปิดงบการเงิน</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการทำบัญชีและภาษี · ปิดงบประจำปี</p>
              <h1 className="ma-hero__title">
                <span>รับปิดงบการเงิน</span>
                <span className="ma-hero__subtitle">
                  ปิดบัญชีสิ้นปีและจัดทำงบการเงินให้บริษัท ทันกำหนดยื่น
                </span>
              </h1>
              <p className="page-hero__lead">
                รับปิดงบให้บริษัทจำกัดและ หจก. ทั้งลูกค้าที่ทำบัญชีกับเราอยู่แล้ว
                และบริษัทที่ทำบัญชีเองหรือมาจากสำนักงานอื่น เราตรวจเอกสารทั้งปี กระทบยอด
                ปรับปรุงรายการ แล้วจัดทำงบให้พร้อมส่งผู้สอบบัญชี ราคาและระยะเวลาแจ้งหลังดูเอกสารจริง
              </p>

              <div className="page-hero__actions">
                <Link href="#quote" className="btn btn-primary btn-large">
                  ขอใบเสนอราคาปิดงบ <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light btn-large"
                >
                  <MessageCircle aria-hidden="true" /> ส่งเอกสารให้ดูทาง LINE
                </a>
              </div>
            </div>

            <div className="ma-hero__showcase">
              <div className="ma-hero__photo-wrap">
                <Image
                  src="/images/graphic_abstract.png"
                  alt="ทีมบัญชีดีถาวรตรวจงบการเงินประจำปีบนแท็บเล็ต"
                  fill
                  priority
                  sizes="(max-width: 920px) 100vw, 480px"
                  className="ma-hero__photo"
                />
              </div>
              <div className="ma-hero__showcase-footer">
                <div className="ma-hero__showcase-price">
                  <span>ค่าบริการปิดงบประจำปี</span>
                  <strong style={{ fontSize: '1.35rem' }}>ประเมินตามสถานะบัญชี</strong>
                </div>
                <p>ดูงบทดลองและเอกสารจริงก่อนแจ้งราคา ไม่มีค่าใช้จ่ายในการประเมิน</p>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการรับปิดงบการเงิน">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ดูเอกสารจริงก่อนเสนอราคา</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>รับปิดงบรอบบัญชีแรก</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>งบปีตรวจโดย CPA</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ไม่มีค่าใช้จ่ายแอบแฝง</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== A2: DEADLINES (#deadlines) ===== */}
      <section id="deadlines" className="afs-deadlines">
        <div className="container afs-deadlines__layout">
          <div className="afs-deadlines__intro reveal-on-scroll">
            <p className="section-kicker">กำหนดส่งงบ</p>
            <h2>
              ปิดงบให้ทัน
              <br />
              ต้องรู้ 3 กำหนดนี้
            </h2>
            <p>
              นับจากวันสิ้นรอบบัญชีของบริษัทจำกัด หจก. มีกำหนดต่างกันเล็กน้อย
              เราเช็กให้ตามประเภทกิจการ
            </p>
          </div>

          <div className="afs-deadlines__grid">
            <article className="afs-deadline-card reveal-on-scroll delay-1">
              <strong className="afs-deadline-card__time">ภายใน 4 เดือน</strong>
              <h3>ประชุมผู้ถือหุ้นอนุมัติงบ</h3>
              <p>งบการเงินต้องปิดเสร็จและผ่านการตรวจของผู้สอบบัญชีก่อนวันประชุม</p>
            </article>

            <article className="afs-deadline-card reveal-on-scroll delay-2">
              <strong className="afs-deadline-card__time">ภายใน 1 เดือน</strong>
              <h3>ยื่นงบต่อกรมพัฒนาธุรกิจการค้า</h3>
              <p>นับจากวันที่ที่ประชุมผู้ถือหุ้นอนุมัติงบ ยื่นผ่านระบบ DBD e-Filing</p>
            </article>

            <article className="afs-deadline-card reveal-on-scroll delay-3">
              <strong className="afs-deadline-card__time">ภายใน 150 วัน</strong>
              <h3>ยื่น ภ.ง.ด.50 ต่อสรรพากร</h3>
              <p>ภาษีเงินได้นิติบุคคลประจำปี นับจากวันสิ้นรอบบัญชี</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== A3: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการรับปิดงบการเงิน
                <br />
                เหมาะกับบริษัทแบบไหน
              </h2>
            </div>
            <p className="silo-subservices__lead">
              เรารับปิดงบบริษัทจำกัดและ หจก. ไม่ว่าตอนนี้บัญชีจะลงไว้ครบหรือยังไม่ครบ
              ขอแค่ส่งเอกสารที่มีให้ดูก่อน
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทเปิดใหม่</h3>
              <p>ปิดงบรอบบัญชีแรก ซึ่งมักสั้นกว่า 12 เดือน และต้องตั้งยอดให้ถูกตั้งแต่ต้น</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <Briefcase size={28} strokeWidth={1.7} />
              </span>
              <h3>ลูกค้าทำบัญชีรายเดือนกับเรา</h3>
              <p>บัญชีลงไว้ครบทั้งปีแล้ว ปิดงบต่อได้ทันที ไม่ต้องส่งเอกสารซ้ำ</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <Monitor size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทที่ทำบัญชีเอง</h3>
              <p>
                มีโปรแกรมบัญชีหรือ Excel อยู่แล้ว อยากให้คนตรวจและจัดทำงบให้ถูกก่อนส่งผู้สอบบัญชี
              </p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <Clock size={28} strokeWidth={1.7} />
              </span>
              <h3>ใกล้ถึงกำหนดยื่น</h3>
              <p>
                เวลาเหลือไม่มาก หรือสำนักงานบัญชีเดิมส่งงานไม่ทัน ต้องการคนเข้ามาจัดการต่อ
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== A4: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container">
          <div className="ma-scope__layout">
            <div className="ma-scope__intro reveal-on-scroll">
              <div className="section-heading">
                <p className="section-kicker">ขอบเขตงาน</p>
                <h2>
                  รับปิดงบบัญชี
                  <br />
                  ทำอะไรให้บ้าง
                </h2>
                <p>
                  งานปิดงบมี 6 ส่วน รายการที่รวมอยู่ในราคาจะเขียนไว้ในใบเสนอราคาทุกข้อ
                </p>
              </div>

              <div className="ma-scope__photo">
                <Image
                  src="/images/process_desk.jpg"
                  alt="เอกสารงบการเงินประจำปีบนโต๊ะทำงาน"
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
                    <FileCheck2 size={22} strokeWidth={1.75} />
                  </span>
                  <h3>ตรวจความครบของบัญชีทั้งปี</h3>
                  <p>ไล่ดูเอกสารและรายการที่ลงไว้ตลอดรอบบัญชี บอกว่าขาดอะไรตั้งแต่วันแรก</p>
                </article>

                <article className="ma-scope__card reveal-on-scroll delay-2">
                  <span className="ma-scope__icon" aria-hidden="true">
                    <FilePenLine size={22} strokeWidth={1.75} />
                  </span>
                  <h3>ปรับปรุงรายการสิ้นปี</h3>
                  <p>ค่าเสื่อมราคา ค่าใช้จ่ายค้างจ่าย รายได้รับล่วงหน้า และรายการที่ลงผิดหมวด</p>
                </article>

                <article className="ma-scope__card reveal-on-scroll delay-1">
                  <span className="ma-scope__icon" aria-hidden="true">
                    <ArrowLeftRight size={22} strokeWidth={1.75} />
                  </span>
                  <h3>กระทบยอดบัญชี</h3>
                  <p>เทียบยอดธนาคาร ลูกหนี้ เจ้าหนี้ และภาษีที่ยื่นไปแล้ว ให้ตรงกับในบัญชี</p>
                </article>

                <article className="ma-scope__card reveal-on-scroll delay-2">
                  <span className="ma-scope__icon" aria-hidden="true">
                    <BarChart3 size={22} strokeWidth={1.75} />
                  </span>
                  <h3>จัดทำงบการเงินประจำปี</h3>
                  <p>งบแสดงฐานะการเงิน งบกำไรขาดทุน และหมายเหตุประกอบงบการเงิน</p>
                </article>

                <article className="ma-scope__card reveal-on-scroll delay-1">
                  <span className="ma-scope__icon" aria-hidden="true">
                    <SearchCheck size={22} strokeWidth={1.75} />
                  </span>
                  <h3>เตรียมเอกสารให้ผู้สอบบัญชี</h3>
                  <p>รวบรวมเอกสารประกอบ และตอบคำถามของ CPA ระหว่างตรวจ</p>
                </article>

                <article className="ma-scope__card afs-scope__card--dashed reveal-on-scroll delay-2">
                  <span className="ma-scope__icon" aria-hidden="true">
                    <Send size={22} strokeWidth={1.75} />
                  </span>
                  <h3>ยื่นงบและ ภ.ง.ด.50</h3>
                  <p>
                    ยื่นงบต่อ DBD และยื่นภาษีเงินได้นิติบุคคล (รวมอยู่ในขอบเขตงานตามใบเสนอราคา)
                  </p>
                </article>
              </div>
            </div>
          </div>

          <div className="afs-three-roles reveal-on-scroll delay-2">
            <h3>3 งานที่คนมักเรียกรวมกันว่า “ปิดงบ”</h3>
            <div className="afs-three-roles__grid">
              <article className="afs-role-card afs-role-card--primary">
                <span className="afs-role-card__kicker">งานที่ 1 · ดีถาวรทำ</span>
                <h4>จัดทำงบการเงิน</h4>
                <p>ปิดบัญชี กระทบยอด ปรับปรุงรายการ และจัดทำงบ คือบริการในหน้านี้</p>
              </article>

              <article className="afs-role-card">
                <span className="afs-role-card__kicker">งานที่ 2 · ผู้สอบบัญชีรับอนุญาต</span>
                <h4>ตรวจสอบและรับรองงบ</h4>
                <p>
                  CPA ที่เป็นอิสระจากผู้จัดทำงบเป็นผู้ตรวจ (แจ้งค่าสอบบัญชีแยกชัดเจนในใบเสนอราคา){' '}
                  <Link href="/services/audit">ดูบริการตรวจสอบบัญชี</Link>
                </p>
              </article>

              <article className="afs-role-card">
                <span className="afs-role-card__kicker">งานที่ 3 · ยื่นต่อหน่วยงานรัฐ</span>
                <h4>ยื่นงบและภาษีประจำปี</h4>
                <p>
                  ยื่นงบต่อ DBD และ ภ.ง.ด.50 ต่อสรรพากร{' '}
                  <Link href="/services/tax-filing">ดูบริการยื่นภาษี</Link>
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ===== A5: WHY CLOSE (#why-close) ===== */}
      <section id="why-close" className="section afs-why-close">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ความสำคัญ</p>
              <h2>
                ทำไมบริษัทต้อง
                <br />
                ปิดงบการเงินทุกปี
              </h2>
            </div>
            <p className="ma-why__lead">
              ปิดงบไม่ใช่แค่หน้าที่ตามกฎหมาย ตัวเลขในงบยังใช้ต่ออีกหลายเรื่องตลอดปีถัดไป
            </p>
          </div>

          <div className="afs-why-close__grid">
            <article className="afs-why-card reveal-on-scroll delay-1">
              <Scale size={28} strokeWidth={1.7} aria-hidden="true" />
              <h3>ทำตามกฎหมาย</h3>
              <p>บริษัทและ หจก. ต้องจัดทำงบทุกรอบบัญชี ให้ผู้สอบบัญชีตรวจ และยื่นตามกำหนด</p>
            </article>

            <article className="afs-why-card reveal-on-scroll delay-2">
              <TrendingUp size={28} strokeWidth={1.7} aria-hidden="true" />
              <h3>รู้กำไรจริงของทั้งปี</h3>
              <p>เห็นรายได้ ค่าใช้จ่าย และกำไรขาดทุนหลังปรับปรุงรายการครบแล้ว</p>
            </article>

            <article className="afs-why-card reveal-on-scroll delay-3">
              <Receipt size={28} strokeWidth={1.7} aria-hidden="true" />
              <h3>ใช้คำนวณภาษีประจำปี</h3>
              <p>ตัวเลขในงบเป็นฐานของการยื่น ภ.ง.ด.50</p>
            </article>

            <article className="afs-why-card reveal-on-scroll delay-4">
              <Landmark size={28} strokeWidth={1.7} aria-hidden="true" />
              <h3>ใช้ยื่นกู้และวางแผน</h3>
              <p>ธนาคารและผู้ร่วมลงทุนมักขอดูงบการเงินที่ตรวจแล้ว</p>
            </article>

            <article className="afs-why-card reveal-on-scroll delay-1">
              <ShieldCheck size={28} strokeWidth={1.7} aria-hidden="true" />
              <h3>ผู้สอบบัญชีตรวจได้เร็ว</h3>
              <p>เอกสารเรียบร้อย ตอบคำถามของ CPA ได้ทันที งานไม่ค้าง</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== A6: DOCUMENT CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents">
        <div className="container afs-documents__layout">
          <div className="afs-documents__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เช็กลิสต์เอกสาร</p>
              <h2>
                เอกสารที่ต้องเตรียม
                <br />
                สำหรับปิดงบการเงิน
              </h2>
              <p>
                ติ๊กรายการที่คุณมีแล้ว จะได้รู้ว่ายังขาดอะไร
                รายการจริงต่างกันตามประเภทธุรกิจและระบบบัญชีที่ใช้
              </p>
            </div>

            <div className="afs-documents__photo">
              <Image
                src="/images/service_reg.png"
                alt="เจ้าของธุรกิจรวบรวมเอกสารสำหรับปิดงบ"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="afs-documents__img"
              />
            </div>

            <div className="afs-documents__reassure">
              <strong>เอกสารยังไม่ครบก็ส่งมาได้</strong>
              <p>ส่งเท่าที่มีให้ดูก่อน เราจะบอกว่าต้องหาอะไรเพิ่ม และอะไรทำแทนได้</p>
              <a
                href="https://line.me/ti/p/DliAyJfUXd"
                target="_blank"
                rel="noopener noreferrer"
                className="ma-quote__line-btn"
              >
                <MessageCircle size={18} aria-hidden="true" />
                <span>ส่งเอกสารทาง LINE</span>
              </a>
            </div>
          </div>

          <div className="reveal-on-scroll delay-2">
            <AnnualDocChecklist />
          </div>
        </div>
      </section>

      {/* ===== A7: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอน</p>
              <h2>
                ขั้นตอนปิดงบการเงิน
                <br />
                กับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ยิ่งส่งเอกสารเร็ว ยิ่งมีเวลาให้ผู้สอบบัญชีตรวจก่อนกำหนดประชุมผู้ถือหุ้น
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

      {/* ===== A8: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/process_meeting.jpg"
              alt="ทีมดีถาวรการบัญชีประชุมปิดงบในสำนักงาน"
              fill
              sizes="(max-width: 991px) 100vw, 50vw"
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ย้ายมาให้ดีถาวรช่วยปิดงบประจำปี ทีมงานไล่เช็กเอกสารให้ละเอียดและประสานงานกับผู้สอบบัญชีจนยื่นงบเสร็จทันกำหนดครับ”
              </p>
              <footer>— คุณภูริพัฒน์ วัฒนากูล, ธุรกิจคลินิกความงามและสุขภาพ</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมเลือกปิดงบการเงิน
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

      {/* ===== A9: PRICING (#pricing) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าบริการรับปิดงบบัญชี
                <br />
                คิดจากอะไร
              </h2>
              <p>
                งานปิดงบของแต่ละบริษัทต่างกันมาก เราจึงขอดูงบทดลองและเอกสารก่อน
                แล้วแจ้งราคาเป็นตัวเลข
              </p>
            </div>

            <h3 className="ma-pricing__factors-title">ปัจจัยที่มีผลกับค่าปิดงบ</h3>
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
            <span className="ma-pricing__pill">ปิดงบการเงินประจำปี</span>
            <div className="ma-pricing__price-block">
              <div className="ma-pricing__price-value">
                <strong style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.45rem)', lineHeight: 1.25 }}>
                  ประเมินตามสถานะบัญชี
                </strong>
              </div>
            </div>

            <div className="afs-pricing__scenarios">
              <div className="afs-pricing__scenario">
                <strong>ทำบัญชีรายเดือนกับดีถาวรอยู่แล้ว</strong>
                <span>
                  แจ้งอัตราค่าปิดงบประจำปีและค่าสอบบัญชีไว้ล่วงหน้าในสัญญา ไม่ต้องรวบรวมเอกสารใหม่
                </span>
              </div>
              <div className="afs-pricing__scenario">
                <strong>ทำบัญชีเอง หรือมาจากสำนักงานอื่น</strong>
                <span>ส่งงบทดลองและเอกสารให้ดู แจ้งราคาภายใน 1 วันทำการ</span>
              </div>
            </div>

            <Link href="#quote" className="ma-pricing__cta">
              ขอใบเสนอราคาปิดงบการเงิน
            </Link>
            <span className="ma-pricing__footnote">
              ประเมินราคาไม่มีค่าใช้จ่าย ไม่มีข้อผูกมัด
            </span>
          </div>
        </div>
      </section>

      {/* ===== A10: FAQ (#faq — 6 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              ปิดงบการเงิน
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

      {/* ===== A11A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>
                อ่านเรื่องงบการเงินและภาษี
                <br />
                ก่อนถึงรอบปิดงบ
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
                <p>ก่อนปิดงบต้องรู้ว่างบของกิจการคุณต้องให้ CPA หรือ TA เป็นผู้ตรวจ</p>
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

      {/* ===== A11B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              เตรียมปิดงบประจำปี
              <br />
              ส่งเอกสารให้ดีถาวรดูก่อน
            </h2>
            <p className="ma-quote__lead">
              บอกวันสิ้นรอบบัญชีและสถานะบัญชีตอนนี้ ทีมงานโทรกลับภายใน 1 วันทำการ
              พร้อมบอกว่าต้องเตรียมอะไรเพิ่ม
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
                <h4>ส่งงบทดลองหรือรูปเอกสารทาง LINE ก็ได้</h4>
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
            <AnnualQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
