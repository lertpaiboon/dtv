import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ChevronRight, Calendar, Clock, Tag, Zap, ArrowLeft, ShieldCheck, Layers, ArrowUpRight } from 'lucide-react';
import { getCachedArticleBySlug, getRelatedArticles, getArticleRedirect, getPillarHubForCategory } from '@/lib/articles/queries';
import { getSiteUrl, toAbsoluteUrl } from '@/lib/seo/site-url';
import { executeServerRedirectIfMatched } from '@/lib/seo/redirects';
import ArticleBody from '@/components/articles/ArticleBody';
import ArticleToc from '@/components/articles/ArticleToc';
import ArticleFaq from '@/components/articles/ArticleFaq';
import ArticleCitations from '@/components/articles/ArticleCitations';
import ArticleAuthor from '@/components/articles/ArticleAuthor';
import ArticleCta from '@/components/articles/ArticleCta';
import ArticleCard from '@/components/articles/ArticleCard';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

/**
 * 1. Dynamic Metadata for SEO, AEO, and Social Sharing
 */
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);

  if (!article) {
    return {
      title: 'ไม่พบบทความ | ดีถาวรการบัญชี',
      description: 'บทความที่คุณกำลังค้นหาไม่มีอยู่ในระบบหรือยังไม่ได้รับการเผยแพร่',
    };
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = article.canonicalUrl || `${siteUrl}/knowledge/${article.slug}`;
  const ogImageUrl = toAbsoluteUrl(article.ogImage || article.coverImage || '/images/hero-tax.png');
  const metaTitle = article.seoTitle || `${article.title} | ดีถาวรการบัญชี`;
  const metaDescription = article.seoDescription || article.summary;

  return {
    title: metaTitle,
    description: metaDescription,
    robots: {
      index: !article.isNoIndex,
      follow: !article.isNoIndex,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'บริษัท ดีถาวรการบัญชี จำกัด',
      locale: 'th_TH',
      type: 'article',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.coverImageAlt || article.title,
        },
      ],
      publishedTime: article.publishedAt,
      modifiedTime: article.contentUpdatedAt || article.publishedAt,
      authors: [article.author.name],
      section: article.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle || article.title,
      description: metaDescription,
      images: [ogImageUrl],
    },
  };
}

/**
 * 2. Master Reader Page
 */
export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);

  if (!article) {
    const redirectTarget = await getArticleRedirect(slug);
    if (redirectTarget) {
      permanentRedirect(`/knowledge/${redirectTarget}`);
    }
    await executeServerRedirectIfMatched(`/knowledge/${slug}`);
    notFound();
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = article.canonicalUrl || `${siteUrl}/knowledge/${article.slug}`;
  const relatedArticles = await getRelatedArticles(article.slug, article.category, 3);
  const pillarHub = getPillarHubForCategory(article.category);

  const publishedDateThai = new Date(article.publishedAt).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const reviewedDateThai = article.reviewedAt
    ? new Date(article.reviewedAt).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // 3. Schema.org JSON-LD Structured Data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    image: [toAbsoluteUrl(article.coverImage || '/images/hero-tax.png')],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    author: {
      '@type': 'Person',
      name: article.author.name,
      jobTitle: article.author.role,
      url: toAbsoluteUrl('/#why-us'),
    },
    publisher: {
      '@type': 'AccountingService',
      name: 'บริษัท ดีถาวรการบัญชี จำกัด',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl('/images/DTV%20LOGO.png'),
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.contentUpdatedAt || article.publishedAt,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'คลังความรู้',
        item: toAbsoluteUrl('/knowledge'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.category,
        item: toAbsoluteUrl(`/knowledge?category=${encodeURIComponent(article.category)}`),
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema =
    article.faqs && article.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <article
      className="knowledge-detail-page"
      style={{
        padding: '50px 0 100px',
        background: '#ffffff',
        minHeight: '80vh',
      }}
    >
      {/* JSON-LD Injections with < escaping to prevent XSS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
        />
      )}

      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Navigation Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.85rem',
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
          <span style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>{article.category}</span>
        </nav>

        {/* Back link */}
        <Link
          href="/knowledge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: '20px',
          }}
          className="hover-gold"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>กลับไปยังคลังความรู้ทั้งหมด</span>
        </Link>

        {/* Article Header */}
        <header style={{ marginBottom: '36px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--accent-dark)',
                background: 'rgba(197, 160, 89, 0.14)',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Tag size={13} aria-hidden="true" />
              {article.category}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <Clock size={14} aria-hidden="true" />
              อ่านประมาณ {article.readTime}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <Calendar size={14} aria-hidden="true" />
              เผยแพร่เมื่อ: {publishedDateThai}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--primary)',
              lineHeight: 1.35,
              marginBottom: '20px',
            }}
          >
            {article.title}
          </h1>

          {/* Author attribution subhead */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 18px',
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
            }}
          >
            <div>
              เขียนโดย:{' '}
              {article.author.slug ? (
                <Link
                  href={`/authors/${article.author.slug}`}
                  className="hover-gold"
                  style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
                >
                  {article.author.name}
                </Link>
              ) : (
                <strong>{article.author.name}</strong>
              )}{' '}
              ({article.author.role})
            </div>
            {article.reviewer && reviewedDateThai && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#16a34a',
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>
                  ตรวจสอบความถูกต้องโดย{' '}
                  {article.reviewer.slug ? (
                    <Link
                      href={`/authors/${article.reviewer.slug}`}
                      className="hover-gold"
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                    >
                      {article.reviewer.name}
                    </Link>
                  ) : (
                    article.reviewer.name
                  )}{' '}
                  ({reviewedDateThai})
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Featured Cover Image */}
        {article.coverImage && (
          <figure
            style={{
              margin: '0 0 36px 0',
              padding: 0,
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxHeight: '460px', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                loading="eager"
                decoding="async"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '460px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            {article.coverImageAlt && (
              <figcaption
                style={{
                  padding: '10px 18px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  color: '#64748b',
                  textAlign: 'center',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>📷</span>
                <span>{article.coverImageAlt}</span>
              </figcaption>
            )}
          </figure>
        )}

        {/* AEO: Quick Answer / Key Takeaways Box (BLUF) */}
        {article.quickAnswer && (
          <aside
            aria-label="สรุปประเด็นสำคัญใน 1 นาที"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1px solid #bfdbfe',
              borderLeft: '5px solid #2563eb',
              borderRadius: 'var(--radius-md)',
              padding: '24px 28px',
              marginBottom: '36px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#1e40af',
                marginBottom: '10px',
              }}
            >
              <Zap size={18} color="#2563eb" aria-hidden="true" />
              <span>สรุปประเด็นสำคัญใน 1 นาที (Quick Answer / Key Takeaways)</span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.98rem',
                lineHeight: 1.7,
                color: '#1e293b',
                fontWeight: 500,
              }}
            >
              {article.quickAnswer}
            </p>
          </aside>
        )}

        {/* Table of Contents */}
        <ArticleToc contentMarkdown={article.contentMarkdown} />

        {/* Article Body Prose */}
        <div>
          <ArticleBody contentMarkdown={article.contentMarkdown} />
        </div>

        {/* Citations / Legal References */}
        <ArticleCitations citations={article.citations} />

        {/* FAQs Section */}
        <ArticleFaq faqs={article.faqs} />

        {/* Author / Reviewer E-E-A-T Profile & Legal Disclaimer */}
        <ArticleAuthor
          author={article.author}
          reviewer={article.reviewer}
          publishedAt={article.publishedAt}
          contentUpdatedAt={article.contentUpdatedAt}
          reviewedAt={article.reviewedAt}
        />

        {/* Lead Conversion CTA Box */}
        <ArticleCta
          headline={article.primaryCta?.headline}
          subheadline={article.primaryCta?.subheadline}
          buttonText={article.primaryCta?.buttonText}
          lineMessage={article.primaryCta?.lineMessage}
          articleSlug={article.slug}
          articleTitle={article.title}
          category={article.category}
        />

        {/* Automated Topic Cluster & Pillar Service Hub */}
        <section
          aria-labelledby="topic-cluster-hub-title"
          style={{
            marginTop: '64px',
            padding: '32px',
            background: 'linear-gradient(135deg, #091c3a 0%, #122b54 100%)',
            borderRadius: '18px',
            color: '#ffffff',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            boxShadow: '0 16px 36px -10px rgba(9, 28, 58, 0.25)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#e5c158',
              background: 'rgba(197, 160, 89, 0.16)',
              padding: '5px 12px',
              borderRadius: '999px',
              marginBottom: '14px',
            }}
          >
            <Layers size={14} aria-hidden="true" />
            <span>Pillar Service Hub · หมวด{article.category}</span>
          </div>

          <h2
            id="topic-cluster-hub-title"
            style={{
              fontSize: 'clamp(1.35rem, 2.5vw, 1.7rem)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '10px',
              lineHeight: 1.35,
            }}
          >
            {pillarHub.title}
          </h2>

          <p
            style={{
              fontSize: '0.96rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.7,
              marginBottom: '22px',
            }}
          >
            {pillarHub.description}
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '22px',
            }}
          >
            {pillarHub.subServices.map((sub) => (
              <Link
                key={sub.url}
                href={sub.url}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>{sub.title}</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>

          <Link
            href={pillarHub.url}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 20px',
              borderRadius: '10px',
              background: '#c5a059',
              color: '#091c3a',
              fontWeight: 700,
              fontSize: '0.92rem',
              textDecoration: 'none',
            }}
          >
            <span>ดูรายละเอียดบริการหลักในหมวดนี้</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>

        {/* Related Topic Cluster Articles Section */}
        {relatedArticles.length > 0 && (
          <section
            aria-labelledby="related-articles-title"
            style={{ marginTop: '56px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <h3
                id="related-articles-title"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  margin: 0,
                }}
              >
                บทความในคลัสเตอร์เดียวกัน ({article.category})
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '4px 12px',
                  borderRadius: '999px',
                }}
              >
                <ShieldCheck size={14} aria-hidden="true" />
                <span>คัดสรรตามคุณภาพเนื้อหา E-E-A-T & SEO Score</span>
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px',
              }}
            >
              {relatedArticles.map((rel) => (
                <div key={rel.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#166534',
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={13} aria-hidden="true" />
                      <span>{rel.reviewer ? `สอบทานโดย ${rel.reviewer.name}` : 'E-E-A-T Verified'}</span>
                    </span>
                    {typeof rel.seoScore === 'number' && rel.seoScore > 0 && (
                      <span
                        style={{
                          background: rel.seoScore >= 80 ? '#dcfce7' : '#fef9c3',
                          color: rel.seoScore >= 80 ? '#166534' : '#854d0e',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        SEO {rel.seoScore}/100
                      </span>
                    )}
                  </div>
                  <ArticleCard article={rel} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
