const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Force rebuild
  poweredByHeader: false, // Added this line
  images: {
    // loader: 'custom',
    // loaderFile: './lib/s3-loader.ts',
    unoptimized: true, // Temporary for Next.js 16 migration
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
}

module.exports = withBundleAnalyzer(nextConfig)
