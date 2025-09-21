/** @type {import('next-sitemap').IConfig} */
const { getDynamicUrlsSync } = require('./scripts/generate-dynamic-urls-sync');

module.exports = {
  siteUrl: 'https://www.papeleriapersonalizada.uy',
  generateRobotsTxt: true, // Let next-sitemap manage the robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/admin' },
      { userAgent: '*', disallow: '/api/' },
    ],
    additionalSitemaps: [
      `https://www.papeleriapersonalizada.uy/sitemap.xml`,
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*'], // Exclude only admin routes
  additionalPaths: async (config) => {
    // This part for dynamic URLs seems correct and will be preserved
    const dynamicUrls = await getDynamicUrlsSync();
    return dynamicUrls.map(url => ({
      loc: `${config.siteUrl}${url}`,
      changefreq: 'weekly',
      priority: 0.8
    }));
  }
};

