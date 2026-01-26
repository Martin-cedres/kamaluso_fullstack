/** @type {import('next-sitemap').IConfig} */
const { getDynamicUrlsSync } = require('./scripts/generate-dynamic-urls-sync')

// Use a Set to store unique URLs
const seen = new Set()

module.exports = {
  siteUrl: 'https://www.papeleriapersonalizada.uy',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin', '/admin/*'], // Exclude admin index and all sub-routes
  additionalPaths: async (config) => {
    const dynamicUrls = await getDynamicUrlsSync()

    // Páginas Core con máxima prioridad
    const corePaths = [
      {
        loc: `${config.siteUrl}/productos/agendas`,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${config.siteUrl}/productos/libretas-y-cuadernos`,
        changefreq: 'weekly',
        priority: 0.9,
      },
    ]

    // Páginas B2B y Sublimación
    const additionalPaths = [
      {
        loc: `${config.siteUrl}/regalos-empresariales`,
        changefreq: 'weekly',
        priority: 0.85,
      },
      {
        loc: `${config.siteUrl}/imprimeya`,
        changefreq: 'weekly',
        priority: 0.85,
      },
      {
        loc: `${config.siteUrl}/sublimacion`,
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${config.siteUrl}/preguntas-frecuentes-b2b`,
        changefreq: 'weekly',
        priority: 0.7,
      },
    ]

    return [
      ...corePaths,
      ...additionalPaths,
      ...dynamicUrls.map((url) => ({
        loc: `${config.siteUrl}${url}`,
        changefreq: 'weekly',
        priority: 0.8,
      })),
    ]
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
