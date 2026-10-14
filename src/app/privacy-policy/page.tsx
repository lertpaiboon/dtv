import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cookie, FileText, UserCheck, Mail, Phone, MapPin, CheckCircle2, ChevronRight, SlidersHorizontal } from 'lucide-react';
import CookiePreferencesButton from '@/components/CookiePreferencesButton';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'นโยบายความเป็นส่วนตัว (PDPA) | บริษัท ดีถาวรการบัญชี จำกัด',
  description:
    'นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) และนโยบายคุกกี้ บริษัท ดีถาวรการบัญชี จำกัด แนวปฏิบัติในการจัดเก็บ ใช้ ประมวลผล และรักษาความลับของข้อมูลลูกค้าตามมาตรฐานวิชาชีพบัญชี',
  alternates: {
    canonical: toAbsoluteUrl('/privacy-policy'),
  },
  openGraph: {
    title: 'นโยบายความเป็นส่วนตัวและคุ้มครองข้อมูลส่วนบุคคล (PDPA) | ดีถาวรการบัญชี',
    description:
      'นโยบายคุ้มครองข้อมูลส่วนบุคคลและมาตรฐานการรักษาความลับของลูกค้า บริษัท ดีถาวรการบัญชี จำกัด สอดคล้องตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562',
    url: toAbsoluteUrl('/privacy-policy'),
    siteName: 'บริษัท ดีถาวรการบัญชี จำกัด',
    locale: 'th_TH',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '50px 0 100px' }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '28px', fontSize: '0.85rem', color: '#64748b' }}>
          <ol style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, margin: 0 }}>
            <li>
              <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>หน้าหลัก</Link>
            </li>
            <li><ChevronRight size={14} style={{ color: '#94a3b8' }} /></li>
            <li style={{ color: '#091c3a', fontWeight: 600 }}>นโยบายความเป็นส่วนตัว (PDPA)</li>
          </ol>
        </nav>

        {/* Header Hero Card */}
        <header
          style={{
            background: 'linear-gradient(135deg, #102a56 0%, #091c3a 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '44px 36px',
            marginBottom: '36px',
            boxShadow: '0 16px 36px -8px rgba(9, 28, 58, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#7dcbe0',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            >
              <ShieldCheck size={16} /> PRIVACY POLICY & PDPA COMPLIANCE
            </span>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px', color: '#ffffff' }}>
              นโยบายคุ้มครองข้อมูลส่วนบุคคลและคุกกี้
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', maxWidth: '680px', lineHeight: 1.6, margin: 0 }}>
              บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.) ให้ความสำคัญสูงสุดต่อการรักษาความลับ
              และความมั่นคงปลอดภัยของข้อมูลส่วนบุคคลของผู้รับบริการและผู้เยี่ยมชมเว็บไซต์ ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '22px', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span>มีผลบังคับใช้: 1 มิถุนายน 2565</span>
              <span>•</span>
              <span>ปรับปรุงล่าสุด: 12 ตุลาคม 2569</span>
            </div>
          </div>
        </header>

        {/* Quick Action Banner for Cookie Preferences */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            boxShadow: '0 4px 16px rgba(16, 42, 86, 0.05)',
          }}
          aria-label="ตั้งค่าความยินยอมคุกกี้แบบด่วน"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#eaf5f8',
                color: '#102a56',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Cookie size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: '#091c3a' }}>
                การจัดการความยินยอมคุกกี้ของคุณ
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                ท่านสามารถตรวจสอบหรือเปลี่ยนแปลงความยินยอมการใช้งานคุกกี้ได้ตลอดเวลา
              </span>
            </div>
          </div>

          <CookiePreferencesButton
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#102a56',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 42, 86, 0.2)',
              fontFamily: 'inherit',
            }}
          >
            <SlidersHorizontal size={15} />
            ตั้งค่าคุกกี้ (Cookie Preferences)
          </CookiePreferencesButton>
        </section>

        {/* Main Content Body */}
        <article
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '40px 44px',
            boxShadow: '0 4px 20px rgba(16, 42, 86, 0.04)',
            lineHeight: 1.7,
            color: '#334155',
          }}
        >
          {/* Section 1 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>1.</span> บทนำและเจตนารมณ์
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              <strong>บริษัท ดีถาวรการบัญชี จำกัด</strong> (“บริษัท” หรือ “เรา”) ในฐานะสำนักงานบัญชีและผู้ให้บริการที่ปรึกษาทางภาษี ตรวจสอบบัญชี จดทะเบียนนิติบุคคล และบริการบริหารงานบุคคล ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน (“เจ้าของข้อมูล”) ซึ่งเป็นไปตาม <em>พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (Personal Data Protection Act: PDPA)</em>
            </p>
            <p style={{ margin: 0 }}>
              นโยบายฉบับนี้จัดทำขึ้นเพื่อชี้แจงรายละเอียดเกี่ยวกับวิธีการเก็บรวบรวม ใช้ เปิดเผย ปกป้อง และระยะเวลาการจัดเก็บข้อมูลส่วนบุคคลของท่าน รวมถึงสิทธิที่ท่านพึงมีตามกฎหมาย
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>2.</span> ข้อมูลส่วนบุคคลที่เราจัดเก็บรวบรวม
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              เพื่อให้การให้บริการวิชาชีพทางบัญชี ภาษีอากร และการปฏิบัติตามกฎหมายดำเนินไปได้อย่างถูกต้อง ครบถ้วน บริษัทอาจจำเป็นต้องจัดเก็บข้อมูลส่วนบุคคลของท่าน ดังต่อไปนี้:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', color: '#102a56', marginBottom: '6px' }}>
                  • ข้อมูลส่วนตัวและการติดต่อ
                </strong>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  ชื่อ–นามสกุล, เลขประจำตัวประชาชน/หนังสือเดินทาง, ที่อยู่ตามทะเบียนบ้าน/ที่อยู่ส่งเอกสาร, เบอร์โทรศัพท์, อีเมล และ LINE ID
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', color: '#102a56', marginBottom: '6px' }}>
                  • ข้อมูลนิติบุคคลและผู้มีอำนาจ
                </strong>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  หนังสือรับรองบริษัท, บัญชีรายชื่อผู้ถือหุ้น (บอจ.5), ข้อมูลกรรมการผู้มีอำนาจลงนาม และเลขประจำตัวผู้เสียภาษีอากร
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', color: '#102a56', marginBottom: '6px' }}>
                  • ข้อมูลการเงิน บัญชี และภาษี
                </strong>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  ใบเสร็จรับเงิน, ใบกำกับภาษี, สเตทเมนต์ธนาคาร, แบบยื่นภาษี (ภ.พ.30, ภ.ง.ด.1/3/53/50/51) และเอกสารจ่ายเงินเดือนพนักงาน (Payroll)
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', color: '#102a56', marginBottom: '6px' }}>
                  • ข้อมูลทางเทคนิคและคุกกี้
                </strong>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  IP Address, ประเภทของเว็บเบราว์เซอร์, ระบบปฏิบัติการ, พฤติกรรมการเยี่ยมชมเว็บไซต์ และข้อมูลการตั้งค่าความยินยอมคุกกี้
                </span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>3.</span> ฐานทางกฎหมายและวัตถุประสงค์ในการประมวลผลข้อมูล
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              บริษัทประมวลผลข้อมูลส่วนบุคคลของท่านภายใต้ฐานทางกฎหมายที่ชอบธรรมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ดังต่อไปนี้:
            </p>
            <ul style={{ paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <strong>ฐานการปฏิบัติตามสัญญา (Contractual Basis):</strong> เพื่อการจัดทำบัญชีรายเดือน ปิดงบการเงิน ยื่นแบบภาษีต่อกรมสรรพากร ตรวจสอบบัญชีโดยผู้สอบบัญชีรับอนุญาต (CPA) และการจดทะเบียนนิติบุคคลตามสัญญาว่าจ้าง
              </li>
              <li>
                <strong>ฐานการปฏิบัติตามกฎหมาย (Legal Obligation):</strong> เพื่อให้เป็นไปตามประมวลรัษฎากร, พระราชบัญญัติการบัญชี พ.ศ. 2543, พระราชบัญญัติกำหนดความผิดเกี่ยวกับห้างหุ้นส่วนจดทะเบียนฯ และกฎหมายประกันสังคม
              </li>
              <li>
                <strong>ฐานประโยชน์อันชอบธรรม (Legitimate Interest):</strong> เพื่อการสื่อสาร ติดตามสถานะงาน รักษาความปลอดภัยของระบบสารสนเทศ และการปรับปรุงคุณภาพบริการ
              </li>
              <li>
                <strong>ฐานความยินยอม (Consent):</strong> กรณีการใช้งานคุกกี้เพื่อการวิเคราะห์และวัดผล (Analytics) หรือการรับข้อมูลข่าวสารสิทธิประโยชน์ทางภาษีที่ท่านได้ให้ความยินยอมไว้
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>4.</span> นโยบายการใช้งานคุกกี้ (Cookies Policy)
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              คุกกี้คือไฟล์ข้อความขนาดเล็กที่จัดเก็บไว้ในอุปกรณ์ของท่านเมื่อเข้าชมเว็บไซต์ของเรา เพื่อบันทึกข้อมูลและสถานะการใช้งาน โดยบริษัทจำแนกคุกกี้ออกเป็น 3 ประเภทหลัก:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px 18px', borderLeft: '4px solid #102a56', background: '#f8fafc', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#091c3a' }}>1. คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary Cookies):</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  จำเป็นต่อการนำทาง ความปลอดภัย การโหลดระบบ และการจดจำการตั้งค่าความยินยอมคุกกี้ ไม่สามารถปิดการใช้งานได้
                </p>
              </div>

              <div style={{ padding: '14px 18px', borderLeft: '4px solid #1689bd', background: '#f8fafc', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#091c3a' }}>2. คุกกี้เพื่อการวิเคราะห์ (Analytics & Performance Cookies):</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  รวบรวมข้อมูลสถิติแบบไม่ระบุตัวตน เช่น หน้าที่ได้รับความนิยม จำนวนผู้เข้าชม และเวลาที่ใช้งาน เพื่อนำมาปรับปรุงระบบให้รวดเร็วและมีประสิทธิภาพ
                </p>
              </div>

              <div style={{ padding: '14px 18px', borderLeft: '4px solid #3db7d6', background: '#f8fafc', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#091c3a' }}>3. คุกกี้เพื่อการตลาด (Marketing Cookies):</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  ใช้เพื่อจัดสรรเนื้อหา ข่าวสาร และแนะนำบริการทางภาษีที่สอดคล้องกับความสนใจของท่าน ผ่านช่องทางประชาสัมพันธ์ต่างๆ
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>5.</span> การเปิดเผยข้อมูลส่วนบุคคลต่อบุคคลภายนอก
            </h2>
            <p style={{ margin: '0 0 10px' }}>
              บริษัทจะไม่เปิดเผย นำไปจำหน่าย หรือแลกเปลี่ยนข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก เว้นแต่เป็นการเปิดเผยตามหน้าที่แห่งวิชาชีพและกฎหมาย ได้แก่:
            </p>
            <ul style={{ paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>หน่วยงานราชการตามกฎหมาย (กรมสรรพากร, กรมพัฒนาธุรกิจการค้า กระทรวงพาณิชย์, สำนักงานประกันสังคม)</li>
              <li>ผู้สอบบัญชีรับอนุญาต (CPA) และผู้ตรวจสอบภายในที่ต้องปฏิบัติงานตามมาตรฐานวิชาชีพ</li>
              <li>สถาบันการเงิน ในกรณีที่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากท่านเพื่อการยื่นขอสินเชื่อหรือเปิดบัญชี</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>6.</span> มาตรการรักษาความมั่นคงปลอดภัยและความลับ (Security & Confidentiality)
            </h2>
            <p style={{ margin: '0 0 10px' }}>
              บริษัท ดีถาวรการบัญชี จำกัด ยึดมั่นใน <strong>จรรยาบรรณวิชาชีพบัญชีด้านการรักษาความลับ (Professional Confidentiality)</strong> อย่างเคร่งครัด โดยมีมาตรการรักษาความปลอดภัยทั้งทางกายภาพและสารสนเทศ:
            </p>
            <ul style={{ paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>จำกัดสิทธิ์การเข้าถึงข้อมูลเฉพาะพนักงานและผู้สอบบัญชีที่รับผิดชอบงานของท่านโดยตรง (Role-Based Access Control)</li>
              <li>การเข้ารหัสข้อมูลที่รับส่งผ่านระบบเครือข่ายด้วยมาตรฐานความปลอดภัยระดับสากล (SSL/TLS Encryption)</li>
              <li>การทำลายเอกสารทางบัญชีอย่างปลอดภัยหลังสิ้นสุดระยะเวลาการจัดเก็บตามกฎหมาย</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>7.</span> ระยะเวลาในการจัดเก็บรักษาข้อมูล
            </h2>
            <p style={{ margin: 0 }}>
              บริษัทจะจัดเก็บรักษาข้อมูลส่วนบุคคลและเอกสารประกอบการลงบัญชีของท่านไว้ตลอดระยะเวลาที่ท่านใช้บริการ และจัดเก็บต่อเนื่องตามระยะเวลาที่กฎหมายบัญญัติ เช่น <strong>ไม่น้อยกว่า 5 ถึง 10 ปี</strong> ตามพระราชบัญญัติการบัญชี พ.ศ. 2543 และประมวลรัษฎากร เพื่อรองรับการตรวจสอบจากหน่วยงานกำกับดูแล เมื่อพ้นกำหนดดังกล่าว บริษัทจะดำเนินการลบหรือทำลายข้อมูลอย่างปลอดภัย
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>8.</span> สิทธิของเจ้าของข้อมูลส่วนบุคคลตาม PDPA
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              ท่านมีสิทธิ์ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ดังต่อไปนี้:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong style={{ color: '#102a56' }}>• สิทธิในการเพิกถอนความยินยอม</strong> (Right to Withdraw Consent)
              </div>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong style={{ color: '#102a56' }}>• สิทธิในการขอเข้าถึงและรับสำเนาข้อมูล</strong> (Right to Access)
              </div>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong style={{ color: '#102a56' }}>• สิทธิในการขอแก้ไขข้อมูลให้ถูกต้อง</strong> (Right to Rectification)
              </div>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong style={{ color: '#102a56' }}>• สิทธิในการขอลบหรือทำลายข้อมูล</strong> (Right to Erasure)
              </div>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong style={{ color: '#102a56' }}>• สิทธิในการขอระงับการใช้ข้อมูล</strong> (Right to Restriction of Processing)
              </div>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem' }}>
                <strong style={{ color: '#102a56' }}>• สิทธิในการคัดค้านการประมวลผล</strong> (Right to Object)
              </div>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              *หมายเหตุ: การใช้สิทธิบางประการอาจถูกจำกัดโดยข้อกำหนดของกฎหมายภาษีอากรและกฎหมายการบัญชีที่บริษัทมีหน้าที่ต้องปฏิบัติตาม
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#091c3a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#1689bd' }}>9.</span> ช่องทางการติดต่อผู้ควบคุมข้อมูลส่วนบุคคล (Data Controller)
            </h2>
            <p style={{ margin: '0 0 16px' }}>
              หากท่านมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว หรือประสงค์จะใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล สามารถติดต่อได้ที่:
            </p>
            <div
              style={{
                background: '#f1f5f9',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '0.92rem',
              }}
            >
              <div>
                <strong style={{ color: '#091c3a', fontSize: '1rem' }}>บริษัท ดีถาวรการบัญชี จำกัด (Deethavorn Accounting Co., Ltd.)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={18} style={{ color: '#146fa8', flexShrink: 0, marginTop: '3px' }} />
                <span>234/116 ถนนอโศก–ดินแดง แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร 10310</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={18} style={{ color: '#146fa8', flexShrink: 0 }} />
                <span>
                  โทร: <a href="tel:0991495656" style={{ color: '#146fa8', textDecoration: 'underline' }}>099-149-5656</a>,{' '}
                  <a href="tel:0919415656" style={{ color: '#146fa8', textDecoration: 'underline' }}>091-941-5656</a>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} style={{ color: '#146fa8', flexShrink: 0 }} />
                <span>
                  อีเมล: <a href="mailto:dtv_accounting@hotmail.com" style={{ color: '#146fa8', textDecoration: 'underline' }}>dtv_accounting@hotmail.com</a>
                </span>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
