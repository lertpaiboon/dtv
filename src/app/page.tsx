import Hero from '@/components/Hero';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import Pricing from '@/components/Pricing';
import FAQ, { defaultFaqs, FaqItem } from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';
import { prisma } from '@/lib/prisma';

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
  const faqItems = await getHomeFaqs();

  return (
    <>
      <Hero />
      <Services />
      <WhyUs />
      <Pricing />
      <FAQ items={faqItems} />
      <ContactForm />
    </>
  );
}
