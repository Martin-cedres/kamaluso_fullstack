const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Added this line
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi-bucket-kamaluso.s3.sa-east-1.amazonaws.com',
      },
    ],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
