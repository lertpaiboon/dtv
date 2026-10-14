/** @type {import('next').NextConfig} */
const indexNowKey = process.env.INDEXNOW_KEY || 'd9f8b4a2e5c1473682b09a71deethavorn';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
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
    return [
      {
        source: `/${indexNowKey}.txt`,
        destination: '/api/indexnow',
      },
    ];
  },
};

export default nextConfig;
