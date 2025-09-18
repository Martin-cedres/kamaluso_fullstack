/** @type {import('next-sitemap').IConfig} */
const { getDynamicUrlsSync } = require('./scripts/generate-dynamic-urls-sync');

module.exports = {
  siteUrl: 'https://www.papeleriapersonalizada.uy',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => {
    const dynamicUrls = await getDynamicUrlsSync();
    return dynamicUrls.map(url => ({
      loc: `${config.siteUrl}${url}`,
      changefreq: 'weekly',
      priority: 0.8
    }));
  }
};

