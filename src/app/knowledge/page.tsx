import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Tag, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'คลังความรู้บัญชีและภาษี | ดีถาวรการบัญชี',
  description: 'รวมบทความและเกร็ดความรู้ด้านภาษี บัญชี การจดทะเบียนธุรกิจ และการบริหารบุคคล โดยทีมงานมืออาชีพ บริษัท ดีถาวรการบัญชี จำกัด',
};

const articles = [
  {
    id: 1,
    slug: '5-things-before-company-registration',
    title: '5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีอย่างมีประสิทธิภาพ',
    summary: 'ก่อนตัดสินใจจดทะเบียนจัดตั้งบริษัทหรือ หจก. ต้องเตรียมทุนจดทะเบียนเท่าไหร่ กรรมการกี่คน และมีข้อผูกพันภาษีอะไรบ้าง สรุปเข้าใจง่ายใน 5 นาที',
    category: 'จดทะเบียนธุรกิจ',
    readTime: '5 นาที',
    date: '10 มีนาคม 2026',
    author: 'ทีมงานดีถาวรการบัญชี'
  },
  {
    id: 2,
    slug: 'vat-registration-guide',
    title: 'ภาษีมูลค่าเพิ่ม (VAT 7%) ธุรกิจแบบไหนต้องจด และเตรียมความพร้อมอย่างไร',
    summary: 'เจาะลึกเกณฑ์รายได้ 1.8 ล้านบาทต่อปี หน้าที่ของผู้ประกอบการจดทะเบียน VAT การออกใบกำกับภาษี และสิ่งที่ต้องระวังเพื่อไม่ให้โดนเบี้ยปรับเงินเพิ่ม',
    category: 'ภาษีอากร',
    readTime: '7 นาที',
    date: '3 มีนาคม 2026',
    author: 'ผู้เชี่ยวชาญด้านภาษี'
  },
  {
    id: 3,
    slug: 'why-freelance-sme-need-monthly-accounting',
    title: 'ทำไมฟรีแลนซ์และ SME ยุคใหม่ ควรเริ่มทำบัญชีรายเดือนตั้งแต่ต้นปี',
    summary: 'การสะสมเอกสารมาทำปลายปีสร้างความเสี่ยงต่อการเสียภาษีย้อนหลังและพลาดสิทธิลดหย่อน การมีนักบัญชีดูแลรายเดือนช่วยให้คุณเห็นกำไรแท้จริงและตัดสินใจธุรกิจได้แม่นยำ',
    category: 'การทำบัญชี',
    readTime: '4 นาที',
    date: '24 กุมภาพันธ์ 2026',
    author: 'ทีมงานดีถาวรการบัญชี'
  },
  {
    id: 4,
    slug: 'difference-between-cpa-and-ta',
    title: 'ข้อแตกต่างระหว่าง ผู้สอบบัญชีรับอนุญาต (CPA) และ ผู้สอบบัญชีภาษีอากร (TA)',
    summary: 'ธุรกิจประเภทไหนต้องให้ CPA รับรองงบการเงิน และธุรกิจขนาดใดที่สามารถใช้ TA ได้ พร้อมเกณฑ์มาตรฐานการตรวจสอบบัญชีสากล',
    category: 'ตรวจสอบบัญชี',
    readTime: '6 นาที',
    date: '15 กุมภาพันธ์ 2026',
    author: 'ผู้สอบบัญชีรับอนุญาต (CPA)'
  },
  {
    id: 5,
    slug: 'hr-payroll-and-sso-guide',
    title: 'แนวทางบริหารงานบุคคล เงินเดือน (Payroll) และการนำส่งประกันสังคมให้ถูกต้อง',
    summary: 'สูตรคำนวณค่าล่วงเวลา (OT) การหักภาษี ณ ที่จ่าย ภ.ง.ด.1 และการบริหารจัดการ Job Description เพื่อให้องค์กรทำงานอย่างเป็นระบบ',
    category: 'บริหารทรัพยากรบุคคล',
    readTime: '5 นาที',
    date: '5 กุมภาพันธ์ 2026',
    author: 'ฝ่ายบริหารบุคคล'
  }
];

export default function KnowledgePage() {
  return (
    <div style={{ padding: '80px 0 100px', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="heading-badge">KNOWLEDGE HUB</div>
          <h1 className="section-title">
            คลังความรู้ <span className="gold-text">บัญชี ภาษี และธุรกิจ</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '14px auto 0' }}>
            รวบรวมสาระน่ารู้ บทความภาษี กฎหมายธุรกิจ และเทคนิคการบริหารจัดการงบการเงิน จากประสบการณ์ตรงของทีมงานดีถาวรการบัญชี
          </p>
        </div>

        {/* Categories Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '50px'
        }}>
          {['ทั้งหมด', 'ภาษีอากร', 'การทำบัญชี', 'ตรวจสอบบัญชี', 'จดทะเบียนธุรกิจ', 'บริหารทรัพยากรบุคคล'].map((cat, i) => (
            <button
              key={i}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: i === 0 ? 'var(--primary)' : '#ffffff',
                color: i === 0 ? '#ffffff' : 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {articles.map((item) => (
            <article
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)'
              }}
              className="hover-lift"
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--accent-dark)',
                    background: 'rgba(197, 160, 89, 0.12)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    <Tag size={12} />
                    {item.category}
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    <Clock size={13} />
                    {item.readTime}
                  </span>
                </div>

                <h2 style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  lineHeight: 1.4,
                  marginBottom: '12px'
                }}>
                  {item.title}
                </h2>

                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.65,
                  marginBottom: '24px'
                }}>
                  {item.summary}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  <Calendar size={13} />
                  <span>{item.date}</span>
                </div>

                <Link
                  href={`#`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--accent-dark)'
                  }}
                >
                  <span>อ่านบทความ</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Consulting Callout */}
        <div style={{
          marginTop: '60px',
          padding: '40px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px' }}>
            มีข้อสงสัยเกี่ยวกับภาษีหรือระบบบัญชีของกิจการคุณ?
          </h3>
          <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 24px', fontSize: '1rem' }}>
            อย่าปล่อยให้ความไม่แน่ใจกลายเป็นความเสี่ยง ปรึกษาทีมงานนักบัญชีและผู้ตรวจสอบบัญชีของดีถาวรการบัญชีได้ทันที
          </p>
          <Link href="/#contact" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            <span>ปรึกษาทีมงานฟรีทันที</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
