import Link from 'next/link';
import { Building2, Calculator, Check, FileCheck2 } from 'lucide-react';

const plans = [
  {
    icon: Calculator,
    name: 'ทำบัญชีรายเดือน',
    price: '1,000',
    unit: 'บาท / เดือน',
    note: 'สำหรับฟรีแลนซ์ ร้านค้า หจก. และบริษัท',
    features: ['บันทึกบัญชีตามมาตรฐาน', 'ยื่นภาษีรายเดือน', 'ประกันสังคม', 'ปรึกษาภาษีตลอดสัญญา'],
    featured: true,
    cta: 'ขอราคาทำบัญชี',
  },
  {
    icon: Building2,
    name: 'งานทะเบียนธุรกิจ',
    price: '1,500',
    unit: 'บาท เริ่มต้น',
    note: 'สำหรับผู้เริ่มธุรกิจหรือแก้ไขข้อมูลนิติบุคคล',
    features: ['จัดตั้งบริษัทและ หจก.', 'จด VAT', 'แก้ไขกรรมการหรือที่ตั้ง', 'ยื่นขอรหัส e-Filing'],
    featured: false,
    cta: 'ปรึกษางานทะเบียน',
  },
  {
    icon: FileCheck2,
    name: 'ตรวจสอบบัญชี',
    price: 'ประเมินราคา',
    unit: 'ตามขนาดกิจการ',
    note: 'ตรวจงบประจำปีโดยผู้สอบบัญชีรับอนุญาต',
    features: ['ตรวจตามมาตรฐาน TSA', 'ออกรายงาน CPA', 'ตรวจระบบควบคุมภายใน', 'รองรับธุรกิจทุกขนาด'],
    featured: false,
    cta: 'ประเมินราคาตรวจบัญชี',
  },
];

export default function Pricing() {
  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section-heading pricing__heading reveal-on-scroll">
          <p className="section-kicker">ค่าบริการเบื้องต้น</p>
          <h2>รู้กรอบราคา ก่อนตัดสินใจ</h2>
          <p>ราคาจริงขึ้นอยู่กับปริมาณเอกสารและความซับซ้อนของกิจการ เราจะประเมินและยืนยันกับคุณก่อนเริ่มงานทุกครั้ง</p>
        </div>

        <div className="pricing__grid">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const delayClass = `delay-${index + 1}`;
            return (
              <article className={`price-card${plan.featured ? ' price-card--featured' : ''} reveal-on-scroll ${delayClass}`} key={plan.name}>
                <div className="price-card__name"><Icon aria-hidden="true" /><h3>{plan.name}</h3></div>
                <p className="price-card__note">{plan.note}</p>
                <div className="price-card__price">
                  {plan.price !== 'ประเมินราคา' && <span>เริ่มต้น</span>}
                  <strong>{plan.price}</strong>
                  <small>{plan.unit}</small>
                </div>
                <ul>
                  {plan.features.map((feature) => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}
                </ul>
                <Link className={`btn ${plan.featured ? 'btn-light' : 'btn-secondary'}`} href="/#contact">{plan.cta}</Link>
              </article>
            );
          })}
        </div>
        <p className="pricing__fineprint reveal-on-scroll delay-4">ไม่มีค่ากระดาษ ค่านำส่ง สบช.3 หรือค่าปรึกษาระหว่างสัญญาแอบแฝง</p>
      </div>
    </section>
  );
}
