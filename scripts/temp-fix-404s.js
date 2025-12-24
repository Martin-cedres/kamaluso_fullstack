const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    const redirects = JSON.parse(fs.readFileSync('redirects-map.json', 'utf8'));

    for (const p of products) {
        if (p.slug.includes('pgina')) {
            const oldSlug = p.slug;
            const newSlug = p.slug.replace(/pgina/g, 'pagina');
            console.log(`Updating slug: ${oldSlug} -> ${newSlug}`);

            await mongoose.connection.db.collection('products').updateOne(
                { _id: p._id },
                { $set: { slug: newSlug } }
            );

            // Add redirect for the product detail
            redirects.push({
                source: `/productos/detail/${oldSlug}`,
                destination: `/productos/detail/${newSlug}`,
                permanent: true
            });

            // Also add for the old category-based style just in case Google has it
            if (p.categoria) {
                redirects.push({
                    source: `/productos/${p.categoria}/${oldSlug}`,
                    destination: `/productos/detail/${newSlug}`,
                    permanent: true
                });
            }
        }
    }

    // Add User's specific high-value redirects
    const extraRedirects = [
        {
            source: "/blog/elegir-tapa-flex-vs-dura",
            destination: "/blog/tapa-dura-eleccion-inteligente-estilo-vida",
            permanent: true
        },
        {
            source: "/productos/tapa-dura/agendas-tapa-dura",
            destination: "/productos/agendas-tapa-dura",
            permanent: true
        }
    ];

    extraRedirects.forEach(extra => {
        if (!redirects.some(r => r.source === extra.source)) {
            console.log(`Adding high-value redirect: ${extra.source} -> ${extra.destination}`);
            redirects.push(extra);
        }
    });

    fs.writeFileSync('redirects-map.json', JSON.stringify(redirects, null, 2));
    console.log('Update complete.');
    await mongoose.disconnect();
}

run().catch(console.error);
