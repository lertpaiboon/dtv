import AuditServicePage from '@/components/AuditServicePage';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export const metadata = {
  title: 'รับตรวจสอบบัญชี โดยผู้สอบบัญชี CPA | ดีถาวรการบัญชี',
  description:
    'บริการรับตรวจสอบบัญชีและงบการเงินประจำปี โดยผู้สอบบัญชีรับอนุญาต (CPA) ตามมาตรฐานการสอบบัญชี (TSA) สำหรับบริษัทจำกัดและ SME แจ้งขอบเขตงานและค่าตรวจสอบเป็นตัวเลขก่อนเริ่ม',
  alternates: {
    canonical: toAbsoluteUrl('/services/audit'),
  },
  openGraph: {
    title: 'รับตรวจสอบบัญชี โดยผู้สอบบัญชี CPA | ดีถาวรการบัญชี',
    description:
      'บริการรับตรวจสอบบัญชีและงบการเงินประจำปี โดยผู้สอบบัญชีรับอนุญาต (CPA) ตามมาตรฐานการสอบบัญชี (TSA) สำหรับบริษัทจำกัดและ SME แจ้งขอบเขตงานและค่าตรวจสอบเป็นตัวเลขก่อนเริ่ม',
    url: toAbsoluteUrl('/services/audit'),
    siteName: 'บริษัท ดีถาวรการบัญชี จำกัด',
    locale: 'th_TH',
    type: 'website',
  },
};

export default function AuditServiceRoutePage() {
  return <AuditServicePage />;
}
