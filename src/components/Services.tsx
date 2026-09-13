import Link from 'next/link';
import { BriefcaseBusiness, Building2, Calculator, Check, FileCheck2, UsersRound } from 'lucide-react';

const services = [
  {
    id: 'accounting',
    icon: Calculator,
    title: 'บัญชีและภาษีอากร',
    intro: 'เห็นตัวเลขชัด ยื่นแบบตรงเวลา และวางแผนภาษีอย่างถูกกฎหมาย',
    description: 'ดูแลบัญชีรายเดือนและรายปี ตั้งแต่บันทึกเอกสาร ยื่นภาษี ไปจนถึงสรุปภาพรวมที่เจ้าของธุรกิจอ่านแล้วนำไปใช้ต่อได้',
    points: ['ภ.พ.30 และ ภ.ง.ด. ทุกประเภท', 'สมุดบัญชีและงบการเงินมาตรฐาน', 'คืนใบเสร็จตัวจริงทุกครั้ง'],
    price: 'เริ่มต้น 1,500 บาท/เดือน',
    tone: 'feature',
  },
  {
    id: 'audit',
    icon: FileCheck2,
    title: 'ตรวจสอบบัญชี',
    intro: 'รับรองงบการเงินโดยผู้สอบบัญชีรับอนุญาต',
    description: 'ตรวจสอบตามมาตรฐาน TSA พร้อมข้อเสนอแนะที่ช่วยให้ระบบควบคุมภายในของกิจการรัดกุมขึ้น',
    points: ['รายงานผู้สอบบัญชี CPA', 'รองรับบริษัทและห้างหุ้นส่วน', 'ประเมินความเสี่ยงก่อนตรวจจริง'],
    price: 'ประเมินตามขนาดกิจการ',
    tone: 'light',
  },
  {
    id: 'registration',
    icon: Building2,
    title: 'งานทะเบียนธุรกิจ',
    intro: 'เริ่มต้นและเปลี่ยนแปลงธุรกิจโดยเอกสารถูกต้องครบถ้วน',
    description: 'จัดตั้งบริษัท หจก. จดทะเบียนพาณิชย์ VAT รวมถึงแก้ไขกรรมการ ที่ตั้ง และทุนจดทะเบียนกับ DBD',
    points: ['จัดตั้งบริษัทและ หจก.', 'จด VAT และทะเบียนพาณิชย์', 'แก้ไขรายการจดทะเบียน'],
    price: 'เริ่มต้น 1,500 บาท',
    tone: 'light',
  },
  {
    id: 'hr',
    icon: UsersRound,
    title: 'HR และ Payroll',
    intro: 'ระบบคนและเงินเดือนที่โตไปพร้อมกับองค์กร',
    description: 'คำนวณเงินเดือน OT ภาษี และประกันสังคม พร้อมวางโครงสร้างองค์กร ข้อบังคับ และ Job Description ให้ทำงานได้จริง',
    points: ['เงินเดือน OT และ ภ.ง.ด.1', 'ประกันสังคมรายเดือน', 'โครงสร้างองค์กรและ JD'],
    price: 'ประเมินตามจำนวนพนักงาน',
    tone: 'soft',
  },
];

export default function Services() {
  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section-heading section-heading--split reveal-on-scroll">
          <div>
            <p className="section-kicker"><BriefcaseBusiness aria-hidden="true" /> บริการของเรา</p>
            <h2>เรื่องธุรกิจที่สำคัญ<br />ให้ทีมเดียวดูแลจบ</h2>
          </div>
          <p>ลดเวลาจัดการเอกสารและความเสี่ยงจากงานที่ตกหล่น ด้วยผู้เชี่ยวชาญที่เข้าใจทั้งบัญชี ภาษี กฎหมายธุรกิจ และระบบบุคคล</p>
        </div>

        <div className="services__grid">
          {services.map((service, index) => {
            const Icon = service.icon;
            const delayClass = `delay-${(index % 4) + 1}`;
            return (
              <article className={`service-card service-card--${service.tone} reveal-on-scroll ${delayClass}`} key={service.id}>
                <div className="service-card__top">
                  <span className="service-card__icon"><Icon aria-hidden="true" /></span>
                  <span className="service-card__price">{service.price}</span>
                </div>
                <h3>{service.title}</h3>
                <p className="service-card__intro">{service.intro}</p>
                <p className="service-card__description">{service.description}</p>
                <ul>
                  {service.points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}
                </ul>
                <Link href="/#contact">ขอรายละเอียดบริการ</Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
