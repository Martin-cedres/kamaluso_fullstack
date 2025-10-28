require('dotenv').config({ path: './.env.local' });

const mongoose = require('mongoose');
const Product = require('../models/Product'); // Adjust path as needed
const connectDB = require('../lib/mongoose').default; // Adjust path as needed
const fs = require('fs');
const path = require('path');
const { toSlug } = require('../lib/utils'); // Import the improved toSlug function

async function updateSlugsAndGenerateRedirects() {
  await connectDB();

  const products = await Product.find({}).lean();
  const redirects = [];

  for (const product of products) {
    const newSlug = toSlug(product.nombre);

    if (product.slug !== newSlug) {
      console.log(`Updating slug for product ${product.nombre}: ${product.slug} -> ${newSlug}`);
      redirects.push({
        source: `/productos/detail/${product.slug}`,
        destination: `/productos/detail/${newSlug}`,
        permanent: true,
      });

      // Update the slug in the database
      await Product.updateOne({ _id: product._id }, { slug: newSlug });
    } else {
      console.log(`Slug for product ${product.nombre} is already optimized: ${product.slug}`);
    }
  }

  const outputPath = path.join(__dirname, '../redirects-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(redirects, null, 2));

  console.log(`
--- Slug Update and Redirects Generation Complete ---
`);
  console.log(`Total products processed: ${products.length}`);
  console.log(`Total redirects generated: ${redirects.length}`);
  console.log(`Redirects map saved to: ${outputPath}`);

  mongoose.connection.close();
}

updateSlugsAndGenerateRedirects().catch(console.error);
