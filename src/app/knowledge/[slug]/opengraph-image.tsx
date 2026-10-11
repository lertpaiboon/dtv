import { ImageResponse } from 'next/og';
import { getArticleBySlug } from '@/lib/articles/queries';

export const alt = 'บริษัท ดีถาวรการบัญชี จำกัด | คลังความรู้';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.title || 'คลังความรู้บัญชีและภาษี';
  const category = article?.category || 'บทความวิชาชีพ';
  const authorName = article?.author?.name || 'ทีมงานดีถาวรการบัญชี';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                background: '#C5A059',
                color: '#0B192C',
                padding: '8px 22px',
                borderRadius: '999px',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {category}
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.7)' }}>
              DEETHAVORN KNOWLEDGE HUB
            </div>
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#C5A059',
              letterSpacing: '0.08em',
            }}
          >
            DEETHAVORN.COM
          </div>
        </div>

        {/* Center Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.35,
            color: '#ffffff',
            maxWidth: '1060px',
          }}
        >
          {title}
        </div>

        {/* Bottom Author & Brand Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#C5A059',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B192C',
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              ✓
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>{authorName}</div>
              <div style={{ fontSize: 18, color: '#C5A059' }}>บริษัท ดีถาวรการบัญชี จำกัด</div>
            </div>
          </div>

          <div
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.8)',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '10px 24px',
              borderRadius: '12px',
            }}
          >
            ผู้เชี่ยวชาญด้านบัญชี ภาษี และตรวจสอบบัญชี
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
