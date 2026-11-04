import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Landmark,
  Mail,
  MessageCircle,
  Monitor,
  Phone,
  Plus,
  Receipt,
  SearchCheck,
  ShoppingCart,
} from 'lucide-react';
import { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import TaxFilingDocChecklist from '@/components/TaxFilingDocChecklist';
import TaxFilingQuoteForm from '@/components/TaxFilingQuoteForm';

const TAX_TABLE_ROWS = [
  {
    type: 'ภาษีมูลค่าเพิ่ม',
    form: 'ภ.พ.30',
    who: 'บริษัทที่จด VAT',
    frequency: 'ทุกเดือน แม้ไม่มียอดขาย',
    deadline: 'ภายในวันที่ 15 ของเดือนถัดไป',
  },
  {
    type: 'หัก ณ ที่จ่าย เงินเดือน',
    form: 'ภ.ง.ด.1',
    who: 'บริษัทที่จ่ายเงินเดือนพนักงาน',
    frequency: 'เดือนที่มีการจ่าย',
    deadline: 'ภายในวันที่ 7 ของเดือนถัดไป',
  },
  {
    type: 'หัก ณ ที่จ่าย บุคคลธรรมดา',
    form: 'ภ.ง.ด.3',
    who: 'จ่ายค่าบริการ ค่าเช่า ค่าจ้าง ให้บุคคลธรรมดา',
    frequency: 'เดือนที่มีการจ่าย',
    deadline: 'ภายในวันที่ 7 ของเดือนถัดไป',
  },
  {
    type: 'หัก ณ ที่จ่าย นิติบุคคล',
    form: 'ภ.ง.ด.53',
    who: 'จ่ายค่าบริการ ค่าเช่า ให้บริษัทหรือ หจก.',
    frequency: 'เดือนที่มีการจ่าย',
    deadline: 'ภายในวันที่ 7 ของเดือนถัดไป',
  },
  {
    type: 'เงินได้นิติบุคคลครึ่งปี',
    form: 'ภ.ง.ด.51',
    who: 'บริษัทและ หจก. (ยกเว้นรอบบัญชีที่ไม่ถึง 12 เดือน)',
    frequency: 'ปีละครั้ง',
    deadline: 'ภายใน 2 เดือนหลังครบ 6 เดือนแรกของรอบบัญชี',
  },
  {
    type: 'เงินได้นิติบุคคลประจำปี',
    form: 'ภ.ง.ด.50',
    who: 'บริษัทและ หจก. ทุกราย แม้ไม่มีรายได้',
    frequency: 'ปีละครั้ง',
    deadline: 'ภายใน 150 วันนับจากวันสิ้นรอบบัญชี',
  },
];

const BEFORE_AFTER_ROWS = [
  {
    problem: 'ลืมยื่นหรือยื่นเลยวันที่ 7 กับ 15 แล้วโดนเบี้ยปรับเงินเพิ่ม',
    solution: 'เราดูกำหนดยื่นทุกเดือนและยื่นให้ตามรอบ',
  },
  {
    problem: 'ไม่แน่ใจว่ารายจ่ายไหนต้องหัก ณ ที่จ่าย และหักกี่เปอร์เซ็นต์',
    solution: 'ถามเราได้ก่อนจ่ายเงิน และเราเช็กอัตราให้ก่อนยื่น',
  },
  {
    problem: 'ใบกำกับภาษีซื้อผิดรูปแบบ ขอคืนภาษีซื้อไม่ได้',
    solution: 'เราเช็กใบกำกับทุกใบ และแจ้งใบที่ต้องขอใหม่',
  },
  {
    problem: 'ยื่นแล้วไม่ได้เก็บหลักฐาน หาไม่เจอตอนสรรพากรถาม',
    solution: 'ใบเสร็จตัวจริงทุกงวดกลับมาอยู่กับคุณ',
  },
];

const PROCESS_STEPS = [
  {
    step: 'ขั้นที่ 1',
    title: 'บอกรายละเอียดบริษัท',
    detail: 'จด VAT หรือยัง มีพนักงานกี่คน จ่ายค่าบริการให้ใครบ้างในแต่ละเดือน',
  },
  {
    step: 'ขั้นที่ 2',
    title: 'รับใบเสนอราคา',
    detail: 'บอกว่าต้องยื่นแบบไหนบ้าง พร้อมราคาเป็นตัวเลข และวันที่ต้องส่งเอกสารแต่ละเดือน',
  },
  {
    step: 'ขั้นที่ 3',
    title: 'ส่งเอกสารทุกเดือน',
    detail: 'ใบกำกับภาษี ใบเสร็จ และข้อมูลเงินเดือน ตามวันที่ตกลงกัน',
  },
  {
    step: 'ขั้นที่ 4',
    title: 'ตรวจและส่งยอดให้ดู',
    detail: 'ทำแบบภาษี แจ้งยอดที่ต้องชำระ แล้วยื่นเมื่อคุณยืนยัน',
  },
  {
    step: 'ขั้นที่ 5',
    title: 'ส่งใบเสร็จคืน',
    detail: 'ส่งแบบที่ยื่นและใบเสร็จจากสรรพากรให้คุณเก็บทุกงวด',
  },
];

const TRUST_POINTS = [
  {
    title: 'ใบเสร็จตัวจริงกลับมาทุกงวด',
    detail: 'ตรวจย้อนหลังเองได้ว่ายื่นแบบไหน จ่ายไปเท่าไร',
  },
  {
    title: 'ตรวจเอกสารก่อนยื่นทุกครั้ง',
    detail: 'เช็กใบกำกับภาษีและอัตราหัก ณ ที่จ่าย ก่อนส่งยอดให้คุณยืนยัน',
  },
  {
    title: 'ทีมจบบัญชีโดยตรง',
    detail: 'ติดตามประกาศกรมสรรพากรที่เปลี่ยนทุกปี งบปีตรวจโดย CPA',
  },
  {
    title: 'ราคาบอกก่อน ไม่มีค่ายิบย่อย',
    detail: 'ไม่มีค่ากระดาษ ค่านำส่ง หรือค่าปรึกษาเพิ่มระหว่างสัญญา',
  },
  {
    title: 'ถามเรื่องภาษีได้ก่อนจ่ายเงิน',
    detail: 'ไม่แน่ใจว่าต้องหัก ณ ที่จ่ายไหม โทรหรือทัก LINE ถามได้ จันทร์–ศุกร์',
  },
];

const PRICING_FACTORS = [
  'แบบภาษีที่ต้องยื่น เช่น จด VAT หรือไม่',
  'จำนวนใบกำกับภาษีและรายการต่อเดือน',
  'จำนวนพนักงานและผู้รับเงินที่ต้องหัก ณ ที่จ่าย',
  'ยื่นเฉพาะรายเดือน หรือรวม ภ.ง.ด.50 และ 51 ด้วย',
  'ต้องการให้ลงบัญชีหรือวางแผนภาษีให้ด้วยหรือไม่',
];

export default function TaxFilingPage({ data }: { data: SubServiceDetailConfig }) {
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

      {/* ===== T1: HERO & META TITLE (#top) ===== */}
      <section id="top" className="page-hero ma-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">บริการยื่นภาษี</span>
          </nav>

          <div className="silo-hero__grid ma-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">บริการทำบัญชีและภาษี · ยื่นภาษี</p>
              <h1 className="ma-hero__title">
                <span>บริการยื่นภาษี</span>
                <span className="ma-hero__subtitle">
                  ยื่นแบบภาษีบริษัททั้งรายเดือนและรายปี ตรงกำหนด พร้อมหลักฐานการยื่นทุกครั้ง
                </span>
              </h1>
              <p className="page-hero__lead">
                รับยื่นภาษีบริษัทและ SME ทั้ง ภ.พ.30 ภ.ง.ด.1 ภ.ง.ด.3 ภ.ง.ด.53 ไปจนถึง ภ.ง.ด.50
                และ ภ.ง.ด.51 เราตรวจเอกสารก่อนยื่นทุกงวด ยื่นผ่านระบบ e-Filing ของกรมสรรพากร
                แล้วส่งใบเสร็จตัวจริงคืนให้คุณเก็บ
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
                  <MessageCircle aria-hidden="true" /> ถามทีมภาษีทาง LINE
                </a>
              </div>
            </div>

            <div className="ma-hero__showcase">
              <div className="ma-hero__photo-wrap">
                <Image
                  src="/images/office_atmosphere.png"
                  alt="เจ้าหน้าที่ดีถาวรยื่นแบบภาษีของบริษัทผ่านระบบออนไลน์"
                  fill
                  priority
                  sizes="(max-width: 920px) 100vw, 480px"
                  className="ma-hero__photo"
                />
              </div>
              <div className="ma-hero__showcase-footer">
                <div className="ma-hero__showcase-price">
                  <span>รวมในรับทำบัญชีรายเดือน เริ่ม</span>
                  <strong>1,500</strong>
                  <small>บาท / เดือน</small>
                </div>
                <p>ตรวจใบกำกับและยอดภาษีก่อนยื่นทุกงวด ส่งใบเสร็จตัวจริงคืนทุกครั้ง</p>
              </div>
            </div>
          </div>

          <ul className="ma-hero__checks" aria-label="จุดเด่นบริการยื่นภาษี">
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ตรวจเอกสารก่อนยื่นทุกงวด</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ยื่นผ่าน e-Filing</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>คืนใบเสร็จตัวจริงทุกครั้ง</span>
            </li>
            <li>
              <span className="ma-hero__check-icon">
                <Check size={16} aria-hidden="true" />
              </span>
              <span>ไม่มีค่านำส่งแอบแฝง</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ===== T2: WHO IT'S FOR (#for) ===== */}
      <section id="for" className="section ma-for">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">เหมาะกับใคร</p>
              <h2>
                บริการรับยื่นภาษี
                <br />
                เหมาะกับธุรกิจแบบไหน
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ถ้าบริษัทของคุณต้องยื่นแบบทุกเดือน และยังไม่มีคนในทีมที่ดูภาษีได้เต็มเวลา
              การจ้างรับยื่นภาษีบริษัทช่วยกันเรื่องยื่นช้าหรือยื่นผิดแบบ
            </p>
          </div>

          <div className="ma-for__grid">
            <article className="ma-for__item reveal-on-scroll delay-1">
              <span className="ma-for__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทเปิดใหม่</h3>
              <p>เพิ่งจดบริษัทหรือเพิ่งจด VAT ยังไม่รู้ว่าต้องยื่นแบบไหนบ้าง และยังไม่มีรหัส e-Filing</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-2">
              <span className="ma-for__icon" aria-hidden="true">
                <Briefcase size={28} strokeWidth={1.7} />
              </span>
              <h3>SME ที่มีพนักงาน</h3>
              <p>จ่ายเงินเดือน จ่ายค่าบริการ ค่าเช่า ทุกเดือน มีภาษีหัก ณ ที่จ่ายหลายแบบต้องยื่น</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-3">
              <span className="ma-for__icon" aria-hidden="true">
                <ShoppingCart size={28} strokeWidth={1.7} />
              </span>
              <h3>ร้านค้าออนไลน์</h3>
              <p>ยอดขายจากหลาย Marketplace เกินเกณฑ์จด VAT แล้ว ต้องยื่น ภ.พ.30 ทุกเดือน</p>
            </article>

            <article className="ma-for__item reveal-on-scroll delay-4">
              <span className="ma-for__icon" aria-hidden="true">
                <Monitor size={28} strokeWidth={1.7} />
              </span>
              <h3>บริษัทที่ทำบัญชีเอง</h3>
              <p>
                ลงบัญชีเองได้ แต่อยากให้คนตรวจตัวเลขและยื่นแบบแทน จะได้ไม่ต้องกังวลทุกสิ้นเดือน
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== T3: SCOPE (#scope) ===== */}
      <section id="scope" className="section ma-scope">
        <div className="container tf-scope__layout">
          <div className="tf-scope__left">
            <div className="section-heading reveal-on-scroll">
              <p className="section-kicker">ขอบเขตงาน</p>
              <h2>
                รับยื่นภาษีรายเดือนและรายปี
                <br />
                มีอะไรบ้าง
              </h2>
              <p>
                แบ่งเป็น 4 งาน เลือกเฉพาะแบบที่บริษัทต้องยื่น
                ทุกแบบที่รวมในราคาจะเขียนไว้ในใบเสนอราคา
              </p>
            </div>

            <div className="ma-scope__grid">
              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Receipt size={22} strokeWidth={1.75} />
                </span>
                <h3>ยื่นภาษีมูลค่าเพิ่ม (VAT)</h3>
                <p>ทำรายงานภาษีซื้อภาษีขาย เช็กใบกำกับภาษี แล้วยื่น ภ.พ.30 ทุกเดือน</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <FileSpreadsheet size={22} strokeWidth={1.75} />
                </span>
                <h3>ยื่นภาษีหัก ณ ที่จ่าย</h3>
                <p>ภ.ง.ด.1 เงินเดือน ภ.ง.ด.3 จ่ายบุคคลธรรมดา และ ภ.ง.ด.53 จ่ายนิติบุคคล</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-1">
                <span className="ma-scope__icon" aria-hidden="true">
                  <Landmark size={22} strokeWidth={1.75} />
                </span>
                <h3>ยื่นภาษีเงินได้นิติบุคคล</h3>
                <p>ภ.ง.ด.51 ครึ่งปี และ ภ.ง.ด.50 ประจำปี คำนวณจากตัวเลขในบัญชีและงบการเงิน</p>
              </article>

              <article className="ma-scope__card reveal-on-scroll delay-2">
                <span className="ma-scope__icon" aria-hidden="true">
                  <SearchCheck size={22} strokeWidth={1.75} />
                </span>
                <h3>ตรวจข้อมูลก่อนยื่น</h3>
                <p>เช็กเอกสารและยอดภาษีก่อนยื่นทุกงวด ถ้าตัวเลขไม่ตรง เราแจ้งให้แก้ก่อนถึงกำหนด</p>
              </article>
            </div>

            <p className="tf-scope__links reveal-on-scroll delay-3">
              ต้องการคนลงบัญชีให้ด้วย ดู{' '}
              <Link href="/services/monthly-accounting">รับทำบัญชีรายเดือน</Link> · ปิดงบปลายปี ดู{' '}
              <Link href="/services/annual-financial-statements">รับปิดงบการเงิน</Link> ·
              วางแผนภาษี ดู <Link href="/services/tax-consulting">ที่ปรึกษาภาษี</Link>
            </p>
          </div>

          <div className="tf-scope__showcase reveal-on-scroll delay-2">
            <div className="tf-scope__photo">
              <Image
                src="/images/process_desk.jpg"
                alt="ยื่นแบบภาษีบริษัทผ่านระบบ e-Filing บนแล็ปท็อป"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="tf-scope__img"
              />
            </div>

            <div className="tf-scope__badge-card">
              <strong>แบบที่เรายื่นให้</strong>
              <ul>
                <li>
                  <span className="tf-scope__badge-check" aria-hidden="true">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  <span>ภ.พ.30</span>
                </li>
                <li>
                  <span className="tf-scope__badge-check" aria-hidden="true">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  <span>ภ.ง.ด.1 / 3 / 53</span>
                </li>
                <li>
                  <span className="tf-scope__badge-check" aria-hidden="true">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  <span>ภ.ง.ด.50 / 51</span>
                </li>
                <li>
                  <span className="tf-scope__badge-check" aria-hidden="true">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  <span>ยื่นผ่านระบบ e-Filing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== T4: TAX TABLE (AEO — #tax-types) ===== */}
      <section id="tax-types" className="section tf-tax-types">
        <div className="container">
          <div className="tf-tax-types__head reveal-on-scroll">
            <div>
              <p className="section-kicker">ภาษีที่บริษัทต้องยื่น</p>
              <h2>
                บริษัทต้องยื่นภาษี
                <br />
                อะไรบ้าง
              </h2>
            </div>

            <p className="tf-tax-types__summary">
              บริษัทส่วนใหญ่ต้องยื่น 3 กลุ่ม คือ <strong>ภาษีมูลค่าเพิ่ม (ภ.พ.30)</strong>{' '}
              ทุกเดือนถ้าจด VAT, <strong>ภาษีหัก ณ ที่จ่าย (ภ.ง.ด.1, 3, 53)</strong>{' '}
              ในเดือนที่จ่ายเงินเดือนหรือค่าบริการ และ{' '}
              <strong>ภาษีเงินได้นิติบุคคล (ภ.ง.ด.51 และ ภ.ง.ด.50)</strong> ปีละครั้ง
              แม้บริษัทจะไม่มีรายได้ก็ต้องยื่น ภ.ง.ด.50
            </p>
          </div>

          <div className="tf-tax-table-wrap reveal-on-scroll delay-2">
            <table className="tf-tax-table">
              <thead>
                <tr>
                  <th>ประเภทภาษี</th>
                  <th>แบบ</th>
                  <th>ใครต้องยื่น</th>
                  <th>ความถี่</th>
                  <th>กำหนดยื่น (แบบกระดาษ)</th>
                </tr>
              </thead>
              <tbody>
                {TAX_TABLE_ROWS.map((row) => (
                  <tr key={row.form}>
                    <td>{row.type}</td>
                    <td className="tf-tax-table__form">{row.form}</td>
                    <td>{row.who}</td>
                    <td>{row.frequency}</td>
                    <td>{row.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="tf-tax-types__note reveal-on-scroll delay-3">
            ยื่นผ่าน e-Filing ได้เวลาเพิ่มตามประกาศกรมสรรพากร · บางธุรกิจอาจมีแบบภาษีอื่นเพิ่ม ·
            ข้อมูลตรวจเมื่อ ต.ค. 2569 อ้างอิง{' '}
            <a href="https://www.rd.go.th/" target="_blank" rel="noopener noreferrer">
              กรมสรรพากร
            </a>
          </p>
        </div>
      </section>

      {/* ===== T5: BEFORE & AFTER (#why-use) ===== */}
      <section id="why-use" className="section ma-why">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker section-kicker--inverse">ก่อนและหลัง</p>
              <h2>
                ทำไมควรใช้บริการ
                <br />
                รับยื่นภาษี
              </h2>
            </div>
            <p className="ma-why__lead">
              เรื่องที่เจ้าของบริษัทเจอบ่อยเมื่อยื่นภาษีเอง กับสิ่งที่เปลี่ยนเมื่อมีคนดูให้ทุกงวด
            </p>
          </div>

          <div className="ma-why__table reveal-on-scroll delay-2">
            <div className="ma-why__head" aria-hidden="true">
              <span>เมื่อยื่นภาษีเอง</span>
              <span>เมื่อให้ดีถาวรยื่นให้</span>
            </div>
            {BEFORE_AFTER_ROWS.map((row) => (
              <div key={row.problem} className="ma-why__row">
                <span className="ma-why__problem">{row.problem}</span>
                <span className="ma-why__solution">{row.solution}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== T6: DOCUMENT CHECKLIST (#documents) ===== */}
      <section id="documents" className="section afs-documents">
        <div className="container afs-documents__layout">
          <div className="afs-documents__intro reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker">เช็กลิสต์เอกสาร</p>
              <h2>
                เอกสารที่ต้องเตรียม
                <br />
                สำหรับยื่นภาษีบริษัท
              </h2>
              <p>ติ๊กรายการที่คุณมีแล้ว เอกสารที่ต้องใช้ขึ้นกับว่าบริษัทต้องยื่นแบบไหนบ้าง</p>
            </div>

            <div className="afs-documents__photo">
              <Image
                src="/images/service_reg.png"
                alt="เตรียมเอกสารภาษีของบริษัทบนโต๊ะทำงาน"
                fill
                sizes="(max-width: 991px) 100vw, 480px"
                className="afs-documents__img"
              />
            </div>

            <div className="afs-documents__reassure">
              <strong>ไม่แน่ใจว่าต้องยื่นแบบไหน</strong>
              <p>ถ่ายรูปเอกสารเดือนล่าสุดส่งมา เราบอกได้ว่าบริษัทต้องยื่นแบบอะไรบ้าง</p>
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
            <TaxFilingDocChecklist />
          </div>
        </div>
      </section>

      {/* ===== T7: PROCESS (#process — 5 Steps) ===== */}
      <section id="process" className="section ma-process">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">ขั้นตอน</p>
              <h2>
                ขั้นตอนใช้บริการ
                <br />
                ยื่นภาษีกับดีถาวร
              </h2>
            </div>
            <p className="silo-subservices__lead">
              ทุกงวดเราส่งยอดภาษีให้คุณดูก่อนยื่น ไม่มีการยื่นแทนโดยที่คุณไม่รู้
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

      {/* ===== T8: WHY DEETHAVORN (#trust) ===== */}
      <section id="trust" className="section ma-trust">
        <div className="container ma-trust__layout">
          <div className="ma-trust__visual reveal-on-scroll">
            <Image
              src="/images/process_meeting.jpg"
              alt="ทีมบัญชีและภาษีดีถาวรการบัญชี"
              fill
              sizes="(max-width: 991px) 100vw, 50vw"
              className="ma-trust__img"
            />
            <blockquote className="ma-trust__quote">
              <p>
                “ส่งเอกสารทาง LINE เดือนละครั้ง ทีมงานจัดการเรื่อง ภ.พ.30
                และประกันสังคมให้ตรงเวลาทุกงวด ไม่เคยโดนค่าปรับล่าช้าเลย”
              </p>
              <footer>— คุณธนกฤต วรโชติเมธี, ธุรกิจร้านอาหารและคาเฟ่</footer>
            </blockquote>
          </div>

          <div className="ma-trust__content reveal-on-scroll delay-2">
            <div className="section-heading">
              <p className="section-kicker">ทำไมต้องดีถาวร</p>
              <h2>
                ทำไมเลือกยื่นภาษี
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

            <p className="tf-trust__more">
              ดูบริการทั้งหมดใน <Link href="/services/accounting-tax">บริการบัญชีและภาษี</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ===== T9: PRICING (#pricing) ===== */}
      <section id="pricing" className="section ma-pricing">
        <div className="container ma-pricing__layout">
          <div className="ma-pricing__factors reveal-on-scroll">
            <div className="section-heading">
              <p className="section-kicker section-kicker--inverse">ค่าบริการ</p>
              <h2>
                ค่าบริการรับยื่นภาษีบริษัท
                <br />
                คิดจากอะไร
              </h2>
              <p>
                ราคาขึ้นกับว่าบริษัทต้องยื่นแบบไหนบ้าง และมีเอกสารแต่ละเดือนมากแค่ไหน
                เราแจ้งเป็นตัวเลขก่อนเริ่มงาน
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
            <span className="ma-pricing__pill">ยื่นภาษีรายเดือนและรายปี</span>

            <div className="afs-pricing__scenarios">
              <div className="afs-pricing__scenario tf-pricing__scenario--highlight">
                <span className="tf-pricing__sub">รวมอยู่ในรับทำบัญชีรายเดือน</span>
                <div className="tf-pricing__num">
                  <strong>1,500</strong>
                  <span>บาท/เดือน ขึ้นไป</span>
                </div>
                <span>
                  ลงบัญชี ยื่น ภ.พ.30 ภ.ง.ด. และประกันสังคม{' '}
                  <Link href="/services/monthly-accounting" className="tf-pricing__inline-link">
                    ดูรายละเอียด
                  </Link>
                </span>
              </div>

              <div className="afs-pricing__scenario tf-pricing__scenario--dashed">
                <strong>ยื่นภาษีอย่างเดียว ไม่รวมลงบัญชี</strong>
                <span>
                  รับตรวจและยื่นภาษีเฉพาะแบบสำหรับบริษัทที่ทำบัญชีเอง
                  ประเมินราคาตามประเภทแบบภาษีและจำนวนรายการต่อเดือน แจ้งราคาชัดเจนก่อนเริ่มงาน
                </span>
              </div>
            </div>

            <Link href="#quote" className="ma-pricing__cta">
              ขอใบเสนอราคายื่นภาษี
            </Link>
            <span className="ma-pricing__footnote">
              ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 หรือค่าปรึกษาระหว่างสัญญา
            </span>
          </div>
        </div>
      </section>

      {/* ===== T10: FAQ (#faq — 6 Questions) ===== */}
      <section id="faq" className="section ma-faq">
        <div className="container ma-faq__layout">
          <div className="ma-faq__intro reveal-on-scroll">
            <p className="section-kicker">คำถามที่พบบ่อย</p>
            <h2>
              คำถามเรื่อง
              <br />
              ยื่นภาษีบริษัท
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

      {/* ===== T11A: KNOWLEDGE (#knowledge) ===== */}
      <section id="knowledge" className="section ma-knowledge">
        <div className="container">
          <div className="ma-knowledge__header reveal-on-scroll">
            <div>
              <p className="section-kicker">คลังความรู้</p>
              <h2>
                อ่านเรื่องภาษีบริษัท
                <br />
                ก่อนถึงวันยื่น
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
                <p>รายได้ถึงเท่าไรต้องจด VAT และจดแล้วต้องยื่น ภ.พ.30 อย่างไรทุกเดือน</p>
                <span className="ma-kb-card__more">อ่านบทความ →</span>
              </div>
            </Link>

            <div className="ma-knowledge__side">
              <Link
                href="/knowledge/difference-between-cpa-and-ta"
                className="ma-kb-card ma-kb-card--horizontal reveal-on-scroll delay-2"
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

              <Link
                href="/knowledge/5-things-before-company-registration"
                className="ma-kb-card ma-kb-card--horizontal reveal-on-scroll delay-3"
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
            </div>
          </div>
        </div>
      </section>

      {/* ===== T11B: FINAL CTA + QUOTE FORM (#quote) ===== */}
      <section id="quote" className="section ma-quote">
        <div className="container ma-quote__layout">
          <div className="ma-quote__intro reveal-on-scroll">
            <p className="section-kicker section-kicker--inverse">ขอใบเสนอราคา</p>
            <h2>
              บอกเราว่าบริษัทต้องยื่นภาษีอะไร
              <br />
              แล้วรับราคาภายใน 1 วันทำการ
            </h2>
            <p className="ma-quote__lead">
              ไม่แน่ใจว่าต้องยื่นแบบไหนก็กรอกเท่าที่รู้ ทีมงานโทรกลับไปถามรายละเอียดเอง
              การประเมินราคาไม่มีค่าใช้จ่าย
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
                <h4>ถามทีมภาษีทาง LINE</h4>
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
            <TaxFilingQuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
