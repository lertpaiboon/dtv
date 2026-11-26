import type { SubServiceDetailConfig } from '@/lib/services/sub-services-data';
import { toAbsoluteUrl } from '@/lib/seo/site-url';

export function serializeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

const SERVICE_PROVIDER = {
  '@type': 'AccountingService',
  name: 'บริษัท ดีถาวรการบัญชี จำกัด',
  url: toAbsoluteUrl('/'),
  telephone: '+66-99-149-5656',
};

const AREA_SERVED = {
  '@type': 'Country',
  name: 'Thailand',
};

export interface ServiceCategorySchemaInput {
  slug: string;
  name: string;
  description: string;
  serviceType: string;
}

export function buildServiceCategoryJsonLd(input: ServiceCategorySchemaInput) {
  const pageUrl = toAbsoluteUrl(`/services/${input.slug}`);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'บริการทั้งหมด',
        item: toAbsoluteUrl('/services'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: input.name,
        item: pageUrl,
      },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: input.serviceType,
    provider: SERVICE_PROVIDER,
    areaServed: AREA_SERVED,
    url: pageUrl,
  };

  return { breadcrumbJsonLd, serviceJsonLd };
}

export function buildSubServiceJsonLd(data: SubServiceDetailConfig) {
  const pageUrl = toAbsoluteUrl(`/services/${data.slug}`);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'บริการทั้งหมด',
        item: toAbsoluteUrl('/services'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.parentCategoryTitle,
        item: toAbsoluteUrl(`/services/${data.parentCategorySlug}`),
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: data.title,
        item: pageUrl,
      },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.title,
    description: data.seoDescription,
    serviceType: data.parentCategoryTitle,
    provider: SERVICE_PROVIDER,
    areaServed: AREA_SERVED,
    url: pageUrl,
  };

  return { breadcrumbJsonLd, serviceJsonLd };
}
