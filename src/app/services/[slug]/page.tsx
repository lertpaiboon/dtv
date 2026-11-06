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
import { toAbsoluteUrl } from '@/lib/seo/site-url';

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

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: {
      canonical: toAbsoluteUrl(`/services/${service.slug}`),
    },
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: toAbsoluteUrl(`/services/${service.slug}`),
      siteName: 'บริษัท ดีถาวรการบัญชี จำกัด',
      locale: 'th_TH',
      type: 'website',
    },
  };
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

  if (slug === 'monthly-accounting') {
    return <MonthlyAccountingPage data={service} />;
  }

  if (slug === 'annual-financial-statements') {
    return <AnnualFinancialStatementsPage data={service} />;
  }

  if (slug === 'tax-filing') {
    return <TaxFilingPage data={service} />;
  }

  if (slug === 'tax-consulting') {
    return <TaxConsultingPage data={service} />;
  }

  if (slug === 'wealth-transfer') {
    return <WealthTransferPage data={service} />;
  }

  if (slug === 'company-registration') {
    return <CompanyRegistrationPage data={service} />;
  }

  if (slug === 'vat-registration') {
    return <VatRegistrationPage data={service} />;
  }

  if (slug === 'company-amendment') {
    return <CompanyAmendmentPage data={service} />;
  }

  return <SubServiceDetailPage data={service} />;
}
