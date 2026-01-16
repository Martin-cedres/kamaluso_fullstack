require('dotenv').config({ path: ['.env.local', '.env'] })
const fs = require('fs')
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI // Assuming this env var exists

const BASE_URL = 'https://www.papeleriapersonalizada.uy'

async function generateSitemap() {
  console.log('Generating sitemap...')

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined. Cannot generate sitemap.')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db()

  const products = await db
    .collection('products')
    .find({}, { projection: { slug: 1 } })
    .toArray()
  const categories = await db
    .collection('categories')
    .find({}, { projection: { slug: 1 } })
    .toArray()

  const sitemap = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contacto</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/regalos-empresariales</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/regalos-empresariales/tapa-dura-premium</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/preguntas-frecuentes-b2b</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  ${categories
      .map(({ slug }) => {
        return `
  <url>
    <loc>${BASE_URL}/productos/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
      `
      })
      .join('')}

  ${products
      .map(({ slug }) => {
        return `
  <url>
            <loc>${BASE_URL}/productos/detail/${slug}</loc>    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
      `
      })
      .join('')}
</urlset>
  `

  fs.writeFileSync('public/sitemap.xml', sitemap)

  console.log('Sitemap generated successfully!')
  client.close()
}

generateSitemap().catch((err) => {
  console.error(err)
  process.exit(1)
})
