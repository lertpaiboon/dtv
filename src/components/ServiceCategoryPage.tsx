import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';
import WorkProcess from '@/components/WorkProcess';
import FAQ, { FaqItem } from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';

export interface SubServiceCardItem {
  title: string;
  slug: string;
  summary: string;
  bullets: string[];
  badge?: string;
}

export interface CategoryPillarConfig {
  slug: string;
  kicker: string;
  title: string;
  lead: string;
  startingPrice: string;
  priceUnit: string;
  heroImage: string;
  heroImageAlt: string;
  subServicesHeading: string;
  subServicesLead: string;
  subServices: SubServiceCardItem[];
  standardsTitle: string;
  standardsLead: string;
  standards: {
    title: string;
    detail: string;
  }[];
  faqs: FaqItem[];
}

export default function ServiceCategoryPage({ data }: { data: CategoryPillarConfig }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Pillar Hero */}
      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{data.title}</span>
          </nav>

          <div className="silo-hero__grid">
            <div className="silo-hero__copy">
              <p className="page-hero__kicker">{data.kicker}</p>
              <h1>{data.title}</h1>
              <p className="page-hero__lead">{data.lead}</p>

              <div className="page-hero__actions">
                <Link href="#contact" className="btn btn-primary btn-large">
                  ขอใบเสนอราคา <ArrowRight aria-hidden="true" />
                </Link>
                <a
                  href="https://line.me/ti/p/DliAyJfUXd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light btn-large"
                >
                  <MessageCircle aria-hidden="true" /> แอด LINE คุยก่อน
                </a>
              </div>
            </div>

            <div className="silo-hero__card">
              <span className="silo-hero__card-label">อัตราค่าบริการเบื้องต้น</span>
              <div className="silo-hero__price">
                <strong>{data.startingPrice}</strong>
                <span>{data.priceUnit}</span>
              </div>
              <p className="silo-hero__card-note">
                ประเมินราคาตามปริมาณเอกสารจริงและแจ้งเป็นตัวเลขก่อนเริ่มงานทุกครั้ง ไม่มีค่ากระดาษหรือค่าปรึกษาแอบแฝง
              </p>
              <div className="silo-hero__trust">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>คืนใบเสร็จตัวจริงจากกรมสรรพากรทุกเดือน</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-services Grid */}
      <section className="section silo-subservices">
        <div className="container">
          <div className="section-heading section-heading--split reveal-on-scroll">
            <div>
              <p className="section-kicker">บริการย่อยในหมวดนี้</p>
              <h2>{data.subServicesHeading}</h2>
            </div>
            <p className="silo-subservices__lead">{data.subServicesLead}</p>
          </div>

          <div
            className={`silo-subservices__grid silo-subservices__grid--count-${data.subServices.length}`}
          >
            {data.subServices.map((sub, idx) => (
              <article
                key={sub.slug}
                className={`silo-subcard reveal-on-scroll delay-${(idx % 3) + 1}`}
              >
                <div className="silo-subcard__top">
                  <div className="silo-subcard__head">
                    <div className="silo-subcard__meta">
                      <span className="silo-subcard__index">0{idx + 1}</span>
                      {sub.badge && <span className="silo-subcard__label">{sub.badge}</span>}
                    </div>
                    <Link
                      href={`/services/${sub.slug}`}
                      className="silo-subcard__corner"
                      aria-label={`ดูรายละเอียด ${sub.title}`}
                    >
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                  <h3>
                    <Link href={`/services/${sub.slug}`}>{sub.title}</Link>
                  </h3>
                  <p>{sub.summary}</p>
                </div>

                <ul className="silo-subcard__bullets">
                  {sub.bullets.map((b) => (
                    <li key={b}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/services/${sub.slug}`} className="silo-subcard__link">
                  <span>ดูรายละเอียดบริการ</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Standards & Showcase */}
      <section className="section silo-standards">
        <div className="container silo-standards__layout">
          <div className="silo-standards__media reveal-on-scroll">
            <div className="silo-standards__photo">
              <Image
                src={data.heroImage}
                alt={data.heroImageAlt}
                fill
                sizes="(max-width: 920px) 100vw, 48vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <div className="silo-standards__content reveal-on-scroll delay-2">
            <p className="section-kicker">มาตรฐานการทำงานของดีถาวร</p>
            <h2>{data.standardsTitle}</h2>
            <p className="silo-standards__lead">{data.standardsLead}</p>

            <div className="silo-standards__list">
              {data.standards.map((st, idx) => (
                <div key={st.title} className="silo-standards__item">
                  <span className="silo-standards__num">0{idx + 1}</span>
                  <div>
                    <h3>{st.title}</h3>
                    <p>{st.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WorkProcess />
      <FAQ items={data.faqs} />
      <ContactForm />
    </>
  );
}
