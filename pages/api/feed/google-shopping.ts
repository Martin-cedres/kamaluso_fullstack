import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Product from '../../../models/Product';
import { siteConfig } from '../../../lib/seoConfig';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI as string);
};

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const products = await Product.find({ status: 'activo' });
    const baseUrl = siteConfig.baseUrl || 'https://www.papeleriapersonalizada.uy'; // Fallback to correct domain

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${escapeXml(siteConfig.organization?.name || 'Kamaluso')}</title>
<link>${baseUrl}</link>
<description>Catálogo de productos de Kamaluso</description>
`;

    products.forEach((product) => {
      const productUrl = `${baseUrl}/productos/${product.slug}`;
      // Google Shopping requires an image URL. Use the first one if available.
      const imageUrl = product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${baseUrl}${product.imageUrl}`) : '';

      // Price formatting: Google expects "100.00 UYU"
      const price = `${product.basePrice.toFixed(2)} UYU`;

      xml += `
<item>
  <g:id>${product._id}</g:id>
  <g:title>${escapeXml(product.nombre)}</g:title>
  <g:description>${escapeXml(product.descripcionBreve || product.descripcion || '')}</g:description>
  <g:link>${productUrl}</g:link>
  <g:image_link>${imageUrl}</g:image_link>
  <g:condition>new</g:condition>
  <g:availability>in stock</g:availability>
  <g:price>${price}</g:price>
  <g:brand>${escapeXml(siteConfig.organization?.name || 'Kamaluso')}</g:brand>
  <g:identifier_exists>no</g:identifier_exists>
</item>`;
    });

    xml += `
</channel>
</rss>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(xml);
    res.end();

  } catch (error) {
    console.error('Error generating feed:', error);
    res.status(500).json({ error: 'Error generating feed' });
  }
}
