import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SubServiceDetailConfig, getRelatedSubServices } from '@/lib/services/sub-services-data';
import WorkProcess from '@/components/WorkProcess';
import FAQ from '@/components/FAQ';
import ContactForm from '@/components/ContactForm';

export default function SubServiceDetailPage({ data }: { data: SubServiceDetailConfig }) {
  const relatedServices = getRelatedSubServices(data.parentCategorySlug, data.slug);

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

      {/* Sub-Service Hero */}
      <section className="page-hero">
        <div className="container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">หน้าแรก</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">บริการทั้งหมด</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/services/${data.parentCategorySlug}`}>{data.parentCategoryTitle}</Link>
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
                  <MessageCircle aria-hidden="true" /> แอด LINE ปรึกษาทีมงาน
                </a>
              </div>
            </div>

            <div className="silo-hero__card">
              <span className="silo-hero__card-label">ค่าบริการเบื้องต้น</span>
              <div className="silo-hero__price">
                <strong>{data.startingPrice}</strong>
                <span>{data.priceUnit}</span>
              </div>
              <p className="silo-hero__card-note">
                แจ้งราคาเป็นตัวเลขชัดเจนก่อนเริ่มงานเสมอ ไม่มีค่ากระดาษ ค่านำส่ง หรือค่าปรึกษาแอบแฝงระหว่างสัญญา
              </p>
              <div className="silo-hero__trust">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>ดูแลโดยทีมนักบัญชีวิชาชีพและผู้สอบบัญชี (CPA)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables & Scope */}
      <section className="section subservice-scope">
        <div className="container">
          <div className="section-heading reveal-on-scroll">
            <p className="section-kicker">ขอบเขตการดูแลของดีถาวร</p>
            <h2>สิ่งที่เราจัดการให้คุณในบริการ{data.title}</h2>
          </div>

          <div className="subservice-deliverables">
            {data.deliverables.map((item, idx) => (
              <article
                key={item.title}
                className={`subservice-deliverable-card reveal-on-scroll delay-${(idx % 4) + 1}`}
              >
                <span className="silo-standards__num">0{idx + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Suitable For & Required Documents */}
          <div className="subservice-info-grid">
            <div className="subservice-info-box reveal-on-scroll">
              <div className="subservice-info-box__head">
                <Users size={22} aria-hidden="true" />
                <h3>บริการนี้เหมาะสำหรับใคร</h3>
              </div>
              <ul>
                {data.suitableFor.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="subservice-info-box reveal-on-scroll delay-2">
              <div className="subservice-info-box__head">
                <FileText size={22} aria-hidden="true" />
                <h3>เอกสารหรือข้อมูลที่ใช้เริ่มต้น</h3>
              </div>
              <ul>
                {data.requiredDocs.map((doc) => (
                  <li key={doc}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services in the Same Silo */}
      {relatedServices.length > 0 && (
        <section className="section silo-subservices">
          <div className="container">
            <div className="section-heading section-heading--split reveal-on-scroll">
              <div>
                <p className="section-kicker">บริการในหมวด{data.parentCategoryTitle}</p>
                <h2>บริการอื่นที่เกี่ยวข้อง</h2>
              </div>
              <p className="silo-subservices__lead">
                เลือกใช้เฉพาะบริการที่ต้องการ หรือให้ทีมดีถาวรดูแลเชื่อมโยงทั้งระบบบัญชี ภาษี และงานทะเบียนครบในที่เดียว
              </p>
            </div>

            <div
              className={`silo-subservices__grid silo-subservices__grid--count-${relatedServices.length}`}
            >
              {relatedServices.map((rel, idx) => (
                <article
                  key={rel.slug}
                  className={`silo-subcard reveal-on-scroll delay-${(idx % 3) + 1}`}
                >
                  <div className="silo-subcard__top">
                    <div className="silo-subcard__head">
                      <div className="silo-subcard__meta">
                        <span className="silo-subcard__index">0{idx + 1}</span>
                        <span className="silo-subcard__label">{rel.kicker}</span>
                      </div>
                      <Link
                        href={`/services/${rel.slug}`}
                        className="silo-subcard__corner"
                        aria-label={`ดูรายละเอียด ${rel.title}`}
                      >
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                    <h3>
                      <Link href={`/services/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <p>{rel.lead}</p>
                  </div>
                  <Link href={`/services/${rel.slug}`} className="silo-subcard__link">
                    <span>ดูรายละเอียดบริการ</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <WorkProcess />
      <FAQ items={data.faqs} />
      <ContactForm />
    </>
  );
}
