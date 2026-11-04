import Link from 'next/link';
import { Building2, Calculator, Check, FileCheck2 } from 'lucide-react';

const plans = [
  {
    icon: Calculator,
    name: 'ทำบัญชีรายเดือน',
    price: '1,500',
    startLabel: 'เริ่มต้น',
    unit: 'บาท / เดือน',
    note: 'สำหรับฟรีแลนซ์ ร้านค้า หจก. และบริษัท',
    features: ['บันทึกบัญชีตามมาตรฐาน', 'ยื่น ภ.พ.30 และ ภ.ง.ด.', 'ยื่นประกันสังคม', 'ปรึกษาภาษีได้ตลอดสัญญา'],
    featured: true,
    cta: 'ขอราคาทำบัญชี →',
  },
  {
    icon: Building2,
    name: 'จดทะเบียนธุรกิจ',
    price: '1,500',
    startLabel: 'เริ่มต้น',
    unit: 'บาท เริ่มต้น',
    note: 'เปิดกิจการใหม่หรือแก้ไขข้อมูลนิติบุคคล',
    features: ['จดตั้งบริษัทและ หจก.', 'จด VAT', 'แก้ไขกรรมการหรือที่ตั้ง', 'ขอรหัส e-Filing'],
    featured: false,
    cta: 'ปรึกษางานจดทะเบียน →',
  },
  {
    icon: FileCheck2,
    name: 'ตรวจสอบบัญชี',
    price: 'CPA',
    startLabel: 'รับรองงบการเงินโดย',
    unit: 'ราคาตามขนาดกิจการ',
    note: 'ตรวจงบประจำปีโดยผู้สอบบัญชีรับอนุญาต',
    features: ['ตรวจตามมาตรฐาน TSA', 'ออกรายงานผู้สอบบัญชี', 'ดูระบบควบคุมภายใน', 'รับทั้งบริษัทและ หจก.'],
    featured: false,
    cta: 'ขอราคาตรวจบัญชี →',
  },
];

export default function Pricing() {
  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section-heading pricing__heading reveal-on-scroll">
          <p className="section-kicker">ค่าบริการ</p>
          <h2>ค่าบริการของ ดีถาวรการบัญชี</h2>
          <p>
            ราคาด้านล่างเป็นราคาเริ่มต้น ราคาจริงขึ้นกับจำนวนเอกสารต่อเดือน เราแจ้งเป็นตัวเลขก่อนเริ่มงานเสมอ ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 หรือค่าปรึกษาระหว่างสัญญา
          </p>
        </div>

        <div className="pricing__grid">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const delayClass = `delay-${index + 1}`;
            return (
              <article
                className={`price-card${plan.featured ? ' price-card--featured' : ''} reveal-on-scroll ${delayClass}`}
                key={plan.name}
              >
                <div className="price-card__name">
                  <Icon aria-hidden="true" />
                  <h3>{plan.name}</h3>
                </div>
                <p className="price-card__note">{plan.note}</p>
                <div className="price-card__price">
                  <span>{plan.startLabel}</span>
                  <strong>{plan.price}</strong>
                  <small>{plan.unit}</small>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className={`btn ${plan.featured ? 'btn-light' : 'btn-secondary'}`} href="/#contact">
                  {plan.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
