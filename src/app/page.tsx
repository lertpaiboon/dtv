import Hero from '@/components/Hero';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <WhyUs />
      <Pricing />
      <FAQ />
      <ContactForm />
    </>
  );
}
