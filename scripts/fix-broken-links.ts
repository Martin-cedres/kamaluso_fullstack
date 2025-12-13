import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectDB from '../lib/mongoose';
import PillarPage from '../models/PillarPage';
import Product from '../models/Product';

async function fixBrokenLinks() {
    try {
        await connectDB();

        // 1. Get all valid product slugs
        const products = await Product.find({}, 'slug nombre categoria');
        const validProductSlugs = new Set(products.map(p => p.slug));
        const productsBySlug = products.reduce((acc, p) => {
            acc[p.slug] = p;
            return acc;
        }, {} as any);

        console.log(`Found ${products.length} valid products`);

        // 2. Get all pillar pages
        const pillarPages = await PillarPage.find({});
        console.log(`Checking ${pillarPages.length} pillar pages...`);

        let totalFixed = 0;
        let totalBroken = 0;

        // 3. Check and fix each page
        for (const page of pillarPages) {
            const content = page.content || '';
            const regex = /{{PRODUCT_CARD:([a-zA-Z0-9-]+)}}/g;
            let match;
            let hasChanges = false;
            let newContent = content;
            const brokenInThisPage: string[] = [];

            // First pass: identify broken links
            while ((match = regex.exec(content)) !== null) {
                const productSlug = match[1];
                if (!validProductSlugs.has(productSlug)) {
                    brokenInThisPage.push(productSlug);
                    totalBroken++;
                }
            }

            if (brokenInThisPage.length > 0) {
                console.log(`\n📄 Page: ${page.title}`);
                console.log(`   Found ${brokenInThisPage.length} broken links: ${brokenInThisPage.join(', ')}`);

                // Second pass: replace broken links with valid products
                for (const brokenSlug of brokenInThisPage) {
                    // Find a replacement product (prefer same category if possible)
                    const replacement = products.find(p => p.slug !== brokenSlug);

                    if (replacement) {
                        const oldPattern = `{{PRODUCT_CARD:${brokenSlug}}}`;
                        const newPattern = `{{PRODUCT_CARD:${replacement.slug}}}`;

                        newContent = newContent.replace(oldPattern, newPattern);
                        hasChanges = true;
                        totalFixed++;

                        console.log(`   ✅ Replaced: ${brokenSlug} → ${replacement.slug} (${replacement.nombre})`);
                    }
                }

                // Save changes
                if (hasChanges) {
                    page.content = newContent;
                    await page.save();
                    console.log(`   💾 Saved changes to: ${page.title}`);
                }
            }
        }

        console.log(`\n✨ Summary:`);
        console.log(`   Total broken links found: ${totalBroken}`);
        console.log(`   Total links fixed: ${totalFixed}`);
        console.log(`   Done!`);

    } catch (error) {
        console.error('Error fixing broken links:', error);
        throw error;
    }
}

fixBrokenLinks()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
