import Hero from '@/components/Hero';
import Services from '@/components/Services';
import QuoteBand from '@/components/QuoteBand';
import WhyUs from '@/components/WhyUs';
import WorkProcess from '@/components/WorkProcess';
import CustomerReviews from '@/components/CustomerReviews';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import HomeKnowledge from '@/components/HomeKnowledge';
import ContactForm from '@/components/ContactForm';
import {
  defaultCustomerReviews,
  defaultFaqs,
  type CustomerReviewItem,
  type FaqItem,
} from '@/lib/default-content';
import { prisma } from '@/lib/prisma';

async function getHomeReviews(): Promise<CustomerReviewItem[]> {
  if (!process.env.DATABASE_URL) return defaultCustomerReviews;
  try {
    const rows = await prisma.customerReview.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (rows.length === 0) return defaultCustomerReviews;
    return rows.map((r) => ({
      id: r.id,
      headline: r.headline,
      quote: r.quote,
      authorName: r.authorName,
      authorImage: r.authorImage,
      companyName: r.companyName,
      businessType: r.businessType,
      rating: r.rating,
      sourceUrl: r.sourceUrl,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
    }));
  } catch {
    return defaultCustomerReviews;
  }
}

async function getHomeFaqs(): Promise<FaqItem[]> {
  if (!process.env.DATABASE_URL) return defaultFaqs;
  try {
    const rows = await prisma.faq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
    if (rows.length === 0) return defaultFaqs;
    return rows.map((r) => ({ q: r.question, a: r.answer }));
  } catch {
    return defaultFaqs;
  }
}

export default async function HomePage() {
  const [reviewItems, faqItems] = await Promise.all([
    getHomeReviews(),
    getHomeFaqs(),
  ]);

  return (
    <>
      <Hero />
      <Services />
      <QuoteBand />
      <WhyUs />
      <WorkProcess />
      <CustomerReviews items={reviewItems} />
      <Pricing />
      <FAQ items={faqItems} />
      <HomeKnowledge />
      <ContactForm />
    </>
  );
}
