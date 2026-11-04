import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Check,
  FileCheck2,
  UsersRound,
} from 'lucide-react';

interface SubServiceLink {
  label: string;
  href: string;
}

interface ServiceCategory {
  id: string;
  tag: string;
  icon: typeof Calculator;
  title: string;
  description: string;
  price: string;
  tone: 'feature' | 'light' | 'soft';
  href: string;
  subLinks?: SubServiceLink[];
  points?: string[];
  twoColumnSubLinks?: boolean;
}

const services: ServiceCategory[] = [
  {
    id: 'accounting',
    tag: 'Accounting & Tax',
    icon: Calculator,
    title: 'ทำบัญชีและภาษี',
    description: 'บันทึกบัญชี ปิดงบ ยื่นภาษี และวางแผนภาษีให้ธุรกิจ',
    price: 'เริ่มต้น 1,500 บาท/เดือน',
    tone: 'feature',
    href: '/services/accounting-tax',
    twoColumnSubLinks: true,
    subLinks: [
      { label: 'รับทำบัญชีรายเดือน', href: '/services/monthly-accounting' },
      { label: 'จัดทำงบประจำปี', href: '/services/annual-financial-statements' },
      { label: 'บริการยื่นภาษี', href: '/services/tax-filing' },
      { label: 'ที่ปรึกษาภาษี / วางแผนภาษี', href: '/services/tax-consulting' },
      { label: 'วางแผนมรดก', href: '/services/wealth-transfer' },
    ],
  },
  {
    id: 'audit',
    tag: 'Audit & Financial Reporting',
    icon: FileCheck2,
    title: 'ตรวจสอบบัญชี + งบประจำปี',
    description:
      'ตรวจงบประจำปีตามมาตรฐาน TSA โดยผู้สอบบัญชีรับอนุญาต (CPA) ออกรายงานผู้สอบบัญชี รับทั้งบริษัทและ หจก.',
    points: [
      'รายงานผู้สอบบัญชี CPA ตามมาตรฐาน TSA',
      'ตรวจระบบควบคุมภายในและประเมินความเสี่ยง',
      'รับทั้งบริษัทจำกัดและห้างหุ้นส่วนนิติบุคคล',
    ],
    price: 'ประเมินตามขนาดกิจการ',
    tone: 'light',
    href: '/services/audit',
  },
  {
    id: 'registration',
    tag: 'Business',
    icon: Building2,
    title: 'จดทะเบียนธุรกิจ',
    description: 'เปิดกิจการใหม่ จด VAT แก้ไขข้อมูลบริษัท และจดเครื่องหมายการค้า',
    price: 'เริ่มต้น 1,500 บาท',
    tone: 'light',
    href: '/services/business-registration',
    subLinks: [
      { label: 'จดทะเบียนบริษัท', href: '/services/company-registration' },
      { label: 'จดทะเบียน VAT', href: '/services/vat-registration' },
      { label: 'แก้ไขข้อมูลบริษัท', href: '/services/company-amendment' },
      { label: 'จดทะเบียนเครื่องหมายการค้า', href: '/services/trademark-registration' },
    ],
  },
  {
    id: 'hr',
    tag: 'HR & Payroll',
    icon: UsersRound,
    title: 'งานบุคคลและเงินเดือน',
    description: 'ดูแลเงินเดือน ระบบงานบุคคล สรรหาพนักงาน และสวัสดิการ',
    price: 'ประเมินตามจำนวนพนักงาน',
    tone: 'soft',
    href: '/services/hr-payroll',
    twoColumnSubLinks: true,
    subLinks: [
      { label: 'รับทำเงินเดือน', href: '/services/payroll-outsourcing' },
      { label: 'วางระบบงานบุคคล', href: '/services/hr-system' },
      { label: 'Visa & Work Permit', href: '/services/visa-work-permit' },
      { label: 'สรรหาบุคลากร', href: '/services/recruitment' },
      { label: 'กองทุนสำรองเลี้ยงชีพ', href: '/services/provident-fund' },
      { label: 'ประกันกลุ่ม', href: '/services/group-insurance' },
      { label: 'ประกัน Keyman', href: '/services/keyman-insurance' },
    ],
  },
];

export default function Services() {
  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section-heading section-heading--split reveal-on-scroll">
          <div>
            <p className="section-kicker">
              <BriefcaseBusiness aria-hidden="true" /> บริการของดีถาวร
            </p>
            <h2>งานที่ดีถาวรการบัญชีรับทำ</h2>
          </div>
          <div className="services__heading-copy">
            <p>
              รับงานบัญชีทั้งของบริษัท หจก. ร้านค้า และฟรีแลนซ์ เลือกใช้บริการเดียวหรือให้ดูแลทั้งหมดก็ได้{' '}
              <Link href="/#pricing" className="services__inline-link">
                ดูค่าบริการ
              </Link>
            </p>
            <Link href="/services" className="services__all-link">
              ดูบริการทั้งหมด <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="services__grid">
          {services.map((service, index) => {
            const Icon = service.icon;
            const delayClass = `delay-${(index % 4) + 1}`;
            return (
              <article
                className={`service-card service-card--${service.tone} reveal-on-scroll ${delayClass}`}
                key={service.id}
              >
                <div className="service-card__top">
                  <span className="service-card__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <div className="service-card__meta">
                    <span className="service-card__tag">{service.tag}</span>
                    <span className="service-card__price">{service.price}</span>
                  </div>
                </div>

                <h3>{service.title}</h3>
                <p className="service-card__description">{service.description}</p>

                {service.subLinks && service.subLinks.length > 0 && (
                  <ul
                    className={`service-card__sublinks${
                      service.twoColumnSubLinks ? ' service-card__sublinks--cols' : ''
                    }`}
                    aria-label={`บริการย่อยในหมวด${service.title}`}
                  >
                    {service.subLinks.map((sub) => (
                      <li key={sub.href}>
                        <Link href={sub.href} className="service-card__sublink">
                          <span>{sub.label}</span>
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {service.points && service.points.length > 0 && (
                  <ul className="service-card__points">
                    {service.points.map((point) => (
                      <li key={point}>
                        <Check aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                <Link href={service.href} className="service-card__cta">
                  ดูรายละเอียด <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
