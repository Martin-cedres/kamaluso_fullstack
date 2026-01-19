const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,


  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion', 'swiper'],
  },

  modularizeImports: {
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
  },

  images: {
    // loaderFile: './lib/s3-loader.ts', // Global loader disabled to allow Vercel Optimization fallback
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi-bucket-kamaluso.s3.sa-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    const redirectsMapPath = path.join(__dirname, 'redirects-map.json');
    let redirects = [];

    if (fs.existsSync(redirectsMapPath)) {
      const rawData = fs.readFileSync(redirectsMapPath, 'utf8');
      redirects = JSON.parse(rawData);
      console.log(`Loaded ${redirects.length} redirects from redirects-map.json`);
    } else {
      console.log('redirects-map.json not found. No redirects loaded.');
    }

    return redirects;
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = withBundleAnalyzer(nextConfig)
