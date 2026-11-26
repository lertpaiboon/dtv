import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SUB_SERVICES, getSubServiceBySlug } from '@/lib/services/sub-services-data';
import SubServiceDetailPage from '@/components/SubServiceDetailPage';
import MonthlyAccountingPage from '@/components/MonthlyAccountingPage';
import AnnualFinancialStatementsPage from '@/components/AnnualFinancialStatementsPage';
import TaxFilingPage from '@/components/TaxFilingPage';
import TaxConsultingPage from '@/components/TaxConsultingPage';
import WealthTransferPage from '@/components/WealthTransferPage';
import CompanyRegistrationPage from '@/components/CompanyRegistrationPage';
import VatRegistrationPage from '@/components/VatRegistrationPage';
import CompanyAmendmentPage from '@/components/CompanyAmendmentPage';
import { buildPublicPageMetadata } from '@/lib/seo/page-metadata';
import { buildSubServiceJsonLd, serializeJsonLd } from '@/lib/seo/service-schema';

export function generateStaticParams() {
  return SUB_SERVICES.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getSubServiceBySlug(slug);
  if (!service) {
    return {
      title: 'ไม่พบหน้าบริการ | บริษัท ดีถาวรการบัญชี จำกัด',
    };
  }

  return buildPublicPageMetadata({
    path: `/services/${service.slug}`,
    title: service.seoTitle,
    description: service.seoDescription,
  });
}

export default async function SubServiceRoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getSubServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  if (slug === 'company-amendment') {
    return <CompanyAmendmentPage data={service} />;
  }

  const { breadcrumbJsonLd, serviceJsonLd } = buildSubServiceJsonLd(service);

  let pageContent: React.ReactNode;
  switch (slug) {
    case 'monthly-accounting':
      pageContent = <MonthlyAccountingPage data={service} />;
      break;
    case 'annual-financial-statements':
      pageContent = <AnnualFinancialStatementsPage data={service} />;
      break;
    case 'tax-filing':
      pageContent = <TaxFilingPage data={service} />;
      break;
    case 'tax-consulting':
      pageContent = <TaxConsultingPage data={service} />;
      break;
    case 'wealth-transfer':
      pageContent = <WealthTransferPage data={service} />;
      break;
    case 'company-registration':
      pageContent = <CompanyRegistrationPage data={service} />;
      break;
    case 'vat-registration':
      pageContent = <VatRegistrationPage data={service} />;
      break;
    default:
      pageContent = <SubServiceDetailPage data={service} />;
      break;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      {pageContent}
    </>
  );
}
