'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { defaultCustomerReviews, type CustomerReviewItem } from '@/lib/default-content';

export type { CustomerReviewItem };

const REVIEWS_PER_PAGE = 4;

function ReviewCard({ item }: { item: CustomerReviewItem }) {
  const starCount = Math.min(5, Math.max(1, item.rating ?? 5));
  const subtitleParts = [item.companyName, item.businessType].filter(Boolean);

  return (
    <figure className="review-card">
      <div className="review-card__stars" aria-label={`คะแนน ${starCount} ดาว`}>
        {[...Array(starCount)].map((_, i) => (
          <Star key={i} aria-hidden="true" />
        ))}
      </div>
      <h3>{item.headline}</h3>
      <blockquote>{item.quote}</blockquote>
      <figcaption className={item.authorImage ? 'review-card__meta review-card__meta--with-avatar' : 'review-card__meta'}>
        {item.authorImage && (
          <div className="review-card__avatar">
            <Image
              src={item.authorImage}
              alt={item.authorName}
              width={44}
              height={44}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        )}
        <div className="review-card__meta-text">
          <span className="review-card__author">
            {item.authorImage ? item.authorName : `— ${item.authorName}`}
          </span>
          {subtitleParts.length > 0 && (
            <span className="review-card__biz">{subtitleParts.join(' • ')}</span>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export default function CustomerReviews({ items = defaultCustomerReviews }: { items?: CustomerReviewItem[] }) {
  const activeItems = Array.isArray(items) && items.length > 0 ? items : defaultCustomerReviews;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / REVIEWS_PER_PAGE));
  const [currentPage, setCurrentPage] = useState(0);

  const safePage = Math.min(currentPage, totalPages - 1);

  const pages: CustomerReviewItem[][] = [];
  for (let i = 0; i < activeItems.length; i += REVIEWS_PER_PAGE) {
    pages.push(activeItems.slice(i, i + REVIEWS_PER_PAGE));
  }

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <section className="section reviews" id="reviews">
      <div className="reviews__bg-pattern" aria-hidden="true" />
      <div className="reviews__watermark" aria-hidden="true">
        รีวิวจริง
      </div>

      <div className="container reviews__layout">
        <div className="reviews__intro reveal-on-scroll">
          <p className="section-kicker">เสียงจากลูกค้า</p>
          <h2>
            ลูกค้าพูดถึง
            <br />
            ดีถาวรการบัญชี
          </h2>
          <p className="reviews__lead">
            ความไว้วางใจจากเจ้าของกิจการ SME ฟรีแลนซ์ และนิติบุคคลที่ให้เราดูแลบัญชีและภาษีอย่างต่อเนื่อง
          </p>
          <a
            href="https://maps.app.goo.gl/Wi5FnyBApoioAP3J7"
            target="_blank"
            rel="noopener noreferrer"
            className="reviews__maps-link"
          >
            อ่านรีวิวบน Google Maps <ArrowUpRight aria-hidden="true" />
          </a>

          {totalPages > 1 && (
            <div className="reviews__pagination" aria-label="เลื่อนดูรีวิวลูกค้า">
              <button
                type="button"
                className="reviews__nav-btn"
                onClick={handlePrev}
                aria-label="รีวิวชุดก่อนหน้า"
              >
                <ChevronLeft aria-hidden="true" />
              </button>

              <div className="reviews__dots" role="tablist" aria-label="หน้ารีวิว">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={idx === safePage}
                    aria-label={`หน้ารีวิวชุดที่ ${idx + 1}`}
                    className={idx === safePage ? 'reviews__dot reviews__dot--active' : 'reviews__dot'}
                    onClick={() => setCurrentPage(idx)}
                  />
                ))}
              </div>

              <span className="reviews__page-count">
                {safePage + 1} / {totalPages}
              </span>

              <button
                type="button"
                className="reviews__nav-btn"
                onClick={handleNext}
                aria-label="รีวิวชุดถัดไป"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="reviews__pages-wrapper reveal-on-scroll delay-2">
          {pages.map((pageItems, pageIdx) => {
            const leftColReviews = pageItems.filter((_, idx) => idx % 2 === 0);
            const rightColReviews = pageItems.filter((_, idx) => idx % 2 === 1);
            const isCurrent = pageIdx === safePage;

            return (
              <div
                key={pageIdx}
                className={isCurrent ? 'reviews__masonry reviews__page--active' : 'reviews__masonry reviews__page--hidden'}
                aria-hidden={!isCurrent}
              >
                <div className="reviews__col">
                  {leftColReviews.map((item, idx) => (
                    <ReviewCard key={item.id ?? `p${pageIdx}-left-${idx}-${item.headline}`} item={item} />
                  ))}
                </div>
                <div className="reviews__col reviews__col--offset">
                  {rightColReviews.map((item, idx) => (
                    <ReviewCard key={item.id ?? `p${pageIdx}-right-${idx}-${item.headline}`} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
