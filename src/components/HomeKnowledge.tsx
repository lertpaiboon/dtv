import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface HomeArticleItem {
  slug: string;
  title: string;
  category: string;
  dateLabel: string;
  coverImage: string;
  coverAlt: string;
}

export const defaultHomeArticles: HomeArticleItem[] = [
  {
    slug: 'vat-registration-guide',
    title: 'VAT 7% ธุรกิจแบบไหนต้องจด เกณฑ์รายได้ 1.8 ล้านบาท และขั้นตอนที่ถูกต้อง',
    category: 'ภาษีอากร',
    dateLabel: '3 มี.ค. 2569',
    coverImage: '/uploads/articles/cover-vat-guide.jpg',
    coverAlt: 'ภาพปกบทความ VAT 7% ธุรกิจแบบไหนต้องจด',
  },
  {
    slug: '5-things-before-company-registration',
    title: '5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด เพื่อวางแผนภาษีและป้องกันปัญหาหุ้นส่วน',
    category: 'จดทะเบียนธุรกิจ',
    dateLabel: '18 ก.พ. 2569',
    coverImage: '/uploads/articles/cover-company-reg.jpg',
    coverAlt: 'ภาพปกบทความ 5 ข้อควรรู้ก่อนจดทะเบียนบริษัทจำกัด',
  },
  {
    slug: 'difference-between-cpa-and-ta',
    title: 'CPA กับ TA ต่างกันอย่างไร ธุรกิจแบบไหนต้องใช้ใคร',
    category: 'ตรวจสอบบัญชี',
    dateLabel: '20 ม.ค. 2569',
    coverImage: '/uploads/articles/cover-cpa-audit.jpg',
    coverAlt: 'ภาพปกบทความ CPA กับ TA ต่างกันอย่างไร',
  },
];

export default function HomeKnowledge({ items = defaultHomeArticles }: { items?: HomeArticleItem[] }) {
  const articles = items.length > 0 ? items : defaultHomeArticles;

  return (
    <section className="section home-knowledge" id="knowledge">
      <div className="container home-knowledge__inner">
        <div className="section-heading home-knowledge__heading reveal-on-scroll">
          <p className="section-kicker">คลังความรู้</p>
          <h2>บทความจากทีมดีถาวร</h2>
        </div>

        <div className="home-knowledge__grid">
          {articles.map((article, index) => {
            const delayClass = `delay-${(index % 3) + 1}`;
            return (
              <Link
                key={article.slug}
                href={`/knowledge/${article.slug}`}
                className={`home-knowledge__card reveal-on-scroll ${delayClass}`}
              >
                <div className="home-knowledge__cover">
                  <Image
                    src={article.coverImage}
                    alt={article.coverAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="home-knowledge__img"
                  />
                </div>
                <div className="home-knowledge__body">
                  <div className="home-knowledge__meta">
                    <span>{article.dateLabel}</span>
                    <span className="home-knowledge__dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="home-knowledge__category">{article.category}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <span className="home-knowledge__readmore">
                    อ่านบทความ <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="home-knowledge__footer reveal-on-scroll delay-4">
          <Link href="/knowledge" className="home-knowledge__all-link">
            ดูบทความทั้งหมด <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
