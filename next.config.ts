import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https: https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https:; font-src 'self' data: https:; connect-src 'self' https: https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'self';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // 301 Permanent Redirect: xivizley.xyz -> xivizley.com.tr (Canonical SEO domain)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'xivizley.xyz',
          },
        ],
        destination: 'https://xivizley.com.tr/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.xivizley.xyz',
          },
        ],
        destination: 'https://xivizley.com.tr/:path*',
        permanent: true,
      },
      // 301 Permanent Redirect: /contact -> /destek (Canonical Turkish support page)
      {
        source: '/contact',
        destination: '/destek',
        permanent: true,
      },
      // Clean up legacy WordPress URLs and permanently redirect to home (301)
      {
        source: '/wp-admin/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-content/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-includes/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-json/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/xmlrpc.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-cron.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tag/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/author/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
