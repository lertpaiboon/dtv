import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site-url';

const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Google-Extended',
  'ClaudeBot',
  'anthropic-ai',
  'Applebot-Extended',
];

const AI_ALLOWED_PATHS = [
  '/',
  '/llms.txt',
  '/llms-full.txt',
  '/knowledge/',
  '/services/',
  '/authors/',
  '/pricing',
  '/faq',
  '/about',
  '/contact',
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      ...AI_SEARCH_BOTS.map((bot) => ({
        userAgent: bot,
        allow: AI_ALLOWED_PATHS,
        disallow: ['/api/', '/admin/'],
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
