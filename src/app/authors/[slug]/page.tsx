import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ChevronRight,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  BookOpen,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { getAuthorBySlug, getAllActiveAuthors } from '@/lib/articles/queries';
import { getSiteUrl, toAbsoluteUrl } from '@/lib/seo/site-url';
import ArticleCard from '@/components/articles/ArticleCard';

export const dynamic = 'force-dynamic';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const authors = await getAllActiveAuthors();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthorBySlug(slug);

  if (!data) {
    return {
      title: 'ไม่พบข้อมูลผู้เขียน | บริษัท ดีถาวรการบัญชี จำกัด',
    };
  }

  const { author } = data;
  const canonicalUrl = toAbsoluteUrl(`/authors/${author.slug}`);
  const description =
    author.bio ||
    `${author.name} ${author.role} ${author.credentials} ผู้เชี่ยวชาญด้านบัญชีและภาษีอากร บริษัท ดีถาวรการบัญชี จำกัด`;

  return {
    title: `${author.name} (${author.role}) | บริษัท ดีถาวรการบัญชี จำกัด`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${author.name} - ผู้เชี่ยวชาญด้านบัญชีและภาษีอากร`,
      description,
      url: canonicalUrl,
      type: 'profile',
      siteName: 'บริษัท ดีถาวรการบัญชี จำกัด',
      locale: 'th_TH',
      images: [
        {
          url: toAbsoluteUrl(author.profileImage || '/images/DTV%20LOGO.png'),
          width: 800,
          height: 800,
          alt: author.name,
        },
      ],
    },
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const data = await getAuthorBySlug(slug);

  if (!data) {
    notFound();
  }

  const { author, authoredArticles, reviewedArticles } = data;
  const siteUrl = getSiteUrl();
  const canonicalUrl = toAbsoluteUrl(`/authors/${author.slug}`);

  // Schema.org E-E-A-T Person & ProfilePage JSON-LD
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      '@id': `${canonicalUrl}#person`,
      name: author.name,
      jobTitle: author.role,
      description: author.bio || author.credentials,
      image: toAbsoluteUrl(author.profileImage || '/images/DTV%20LOGO.png'),
      worksFor: {
        '@type': 'AccountingService',
        name: 'บริษัท ดีถาวรการบัญชี จำกัด',
        url: siteUrl,
      },
      hasCredential: author.credentials,
      sameAs: Array.isArray(author.sameAs) && author.sameAs.length > 0 ? author.sameAs : undefined,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'คลังความรู้',
        item: `${siteUrl}/knowledge`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: author.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div style={{ padding: '60px 0 100px', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />

      <div className="container" style={{ maxWidth: '1060px' }}>
        {/* Navigation Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            marginBottom: '32px',
          }}
        >
          <Link href="/" className="hover-gold" style={{ color: 'inherit', textDecoration: 'none' }}>
            หน้าแรก
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/knowledge" className="hover-gold" style={{ color: 'inherit', textDecoration: 'none' }}>
            คลังความรู้
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{author.name}</span>
        </nav>

        {/* Author E-E-A-T Hero Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 30px rgba(11, 25, 44, 0.05)',
            marginBottom: '60px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '32px',
              alignItems: 'flex-start',
            }}
          >
            {/* Author Avatar / Photo */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(11, 25, 44, 0.15)',
                border: '4px solid #ffffff',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {author.profileImage &&
              !author.profileImage.includes('DTV') &&
              !author.profileImage.includes('LOGO') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.profileImage}
                  alt={author.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UserCheck size={60} aria-hidden="true" />
              )}
            </div>

            {/* Author Information */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  margin: '0 0 6px 0',
                }}
              >
                {author.name}
              </h1>

              <div
                style={{
                  fontSize: '1.05rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                {author.role} &bull; บริษัท ดีถาวรการบัญชี จำกัด
              </div>

              {/* Credentials Highlight */}
              {author.credentials && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid var(--accent)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    fontSize: '0.92rem',
                    color: '#334155',
                    lineHeight: 1.5,
                  }}
                >
                  <ShieldCheck size={20} color="var(--accent-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>คุณวุฒิและใบอนุญาตวิชาชีพ:</strong> {author.credentials}
                  </div>
                </div>
              )}

              {/* Biography */}
              {author.bio && (
                <p
                  style={{
                    fontSize: '0.98rem',
                    lineHeight: 1.7,
                    color: 'var(--text-main)',
                    margin: '0 0 20px 0',
                  }}
                >
                  {author.bio}
                </p>
              )}

              {/* External Profile Links (sameAs) */}
              {Array.isArray(author.sameAs) && author.sameAs.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
                    ข้อมูลอ้างอิงเพิ่มเติม:
                  </span>
                  {author.sameAs.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                      className="hover-gold"
                    >
                      <span>ทำความรู้จักทีมงาน</span>
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '30px',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <BookOpen size={24} color="var(--primary)" />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {authoredArticles.length}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>บทความที่เขียนและเผยแพร่</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                background: '#f0fdf4',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <FileCheck2 size={24} color="#16a34a" />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                  {reviewedArticles.length}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>บทความที่สอบทานความถูกต้อง</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Authored Articles */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <BookOpen size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
              บทความที่เขียนโดย {author.name} ({authoredArticles.length})
            </h2>
          </div>

          {authoredArticles.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '30px',
              }}
            >
              {authoredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              ยังไม่มีบทความที่เขียนโดยผู้เชี่ยวชาญท่านนี้ที่เผยแพร่ในปัจจุบัน
            </div>
          )}
        </section>

        {/* Section 2: Reviewed Articles (if any) */}
        {reviewedArticles.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <ShieldCheck size={24} color="#16a34a" />
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                  บทความที่สอบทานความถูกต้องโดย {author.name} ({reviewedArticles.length})
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  ตรวจสอบความสอดคล้องตามประมวลรัษฎากรและมาตรฐานการรายงานทางการเงิน (TFRS)
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '30px',
              }}
            >
              {reviewedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Consulting Callout */}
        <div
          style={{
            padding: '40px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: 'var(--radius-lg)',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
            ต้องการคำปรึกษาด้านบัญชีและภาษีจากทีมงานผู้เชี่ยวชาญ?
          </h3>
          <p style={{ color: '#cbd5e1', maxWidth: '640px', margin: '0 auto 24px', fontSize: '1rem', lineHeight: 1.6 }}>
            ดีถาวรการบัญชี ให้บริการโดยทีมงานผู้สอบบัญชีรับอนุญาต (CPA) และผู้สอบบัญชีภาษีอากร (TA)
            พร้อมดูแลกิจการของคุณอย่างถูกต้องและประหยัดภาษีอย่างถูกกฎหมาย
          </p>
          <Link
            href="/#contact"
            className="btn btn-primary"
            style={{
              padding: '12px 28px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <span>ติดต่อปรึกษาทีมงานทันที</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
