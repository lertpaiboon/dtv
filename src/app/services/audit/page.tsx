import type { Metadata } from 'next';
import AuditServicePage from '@/components/AuditServicePage';
import { buildPublicPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPublicPageMetadata({
  path: '/services/audit',
  title: 'รับตรวจสอบบัญชี โดยผู้สอบบัญชี CPA | ดีถาวรการบัญชี',
  description:
    'บริการรับตรวจสอบบัญชีและงบการเงินประจำปี โดยผู้สอบบัญชีรับอนุญาต (CPA) ตามมาตรฐานการสอบบัญชี (TSA) สำหรับบริษัทจำกัดและ SME แจ้งขอบเขตงานและค่าตรวจสอบเป็นตัวเลขก่อนเริ่ม',
  image: '/images/service_audit.png',
  imageAlt: 'บริการรับตรวจสอบบัญชี โดยผู้สอบบัญชี CPA ดีถาวรการบัญชี',
});

export default function AuditServiceRoutePage() {
  return <AuditServicePage />;
}
