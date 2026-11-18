/** @type {import('next').NextConfig} */
const rawIndexNowKey = (process.env.INDEXNOW_KEY || '').trim();
const indexNowKey = /^[a-zA-Z0-9-]{8,128}$/.test(rawIndexNowKey) ? rawIndexNowKey : '';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    if (!indexNowKey) {
      return [];
    }
    return [
      {
        source: `/${indexNowKey}.txt`,
        destination: '/api/indexnow',
      },
    ];
  },
};

export default nextConfig;
