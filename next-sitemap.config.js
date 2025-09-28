/** @type {import('next-sitemap').IConfig} */
const { getDynamicUrlsSync } = require('./scripts/generate-dynamic-urls-sync')

// Use a Set to store unique URLs
const seen = new Set()

module.exports = {
  siteUrl: 'https://www.papeleriapersonalizada.uy',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/admin' },
      { userAgent: '*', disallow: '/api/' },
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin', '/admin/*'], // Exclude admin index and all sub-routes
  additionalPaths: async (config) => {
    const dynamicUrls = await getDynamicUrlsSync()
    return dynamicUrls.map((url) => ({
      loc: `${config.siteUrl}${url}`,
      changefreq: 'weekly',
      priority: 0.8,
    }))
  },
  // Add a transform function to remove duplicates
  transform: async (config, path) => {
    if (seen.has(path)) {
      return null // Exclude duplicate
    }
    seen.add(path)
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
