const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkHealth() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // 1. Valid Product Slugs
    const products = await db.collection('products').find({}, { projection: { slug: 1 } }).toArray();
    const validProductSlugs = new Set(products.map(p => p.slug));

    // 2. Valid Category Slugs
    const categories = await db.collection('categories').find({}, { projection: { slug: 1 } }).toArray();
    const validCategorySlugs = new Set(categories.map(c => c.slug));

    console.log(`--- SCANNING PILLAR PAGES ---`);
    const pillars = await db.collection('pillarpages').find({}).toArray();
    pillars.forEach(p => {
        const matches = p.content.match(/{{PRODUCT_CARD:([^}]+)}}/g);
        if (matches) {
            matches.forEach(m => {
                const slug = m.match(/{{PRODUCT_CARD:([^}]+)}}/)[1];
                if (!validProductSlugs.has(slug)) {
                    console.log(`[PILLAR: ${p.title}] Broken Product Card: ${slug}`);
                }
            });
        }
    });

    console.log(`\n--- SCANNING BLOG POSTS FOR OLD LINKS ---`);
    const posts = await db.collection('posts').find({}).toArray();
    posts.forEach(post => {
        // Look for internal links like /productos/category/slug or /productos/detail/slug
        const productDetailLinks = post.content.match(/\/productos\/detail\/[a-zA-Z0-9-]+/g);
        if (productDetailLinks) {
            productDetailLinks.forEach(link => {
                const slug = link.replace('/productos/detail/', '');
                if (!validProductSlugs.has(slug)) {
                    console.log(`[BLOG: ${post.title}] Broken Detail Link: ${link}`);
                }
            });
        }

        const categoryLinks = post.content.match(/\/productos\/[a-zA-Z0-9-]+(?!\/detail)/g);
        if (categoryLinks) {
            categoryLinks.forEach(link => {
                const slug = link.replace('/productos/', '');
                if (slug && !validCategorySlugs.has(slug) && slug !== 'detail') {
                    console.log(`[BLOG: ${post.title}] Possible Broken Category Link: ${link}`);
                }
            });
        }
    });

    console.log(`\nScan Finished.`);
    await mongoose.disconnect();
}

checkHealth().catch(console.error);
