const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

        const categories = await Category.find().lean();
        const products = await Product.find().limit(20).lean();

        console.log('═══════════════════════════════════════');
        console.log('CATEGORÍAS ACTUALES EN LA BD:');
        console.log('═══════════════════════════════════════\n');
        categories.forEach(c => {
            console.log(`- ${c.nombre}`);
            console.log(`  Slug: ${c.slug}`);
            console.log(`  Parent: ${c.parent || 'null (es categoría principal)'}\n`);
        });

        console.log('\n═══════════════════════════════════════');
        console.log('PRIMEROS 20 PRODUCTOS:');
        console.log('═══════════════════════════════════════\n');
        products.forEach(p => {
            console.log(`- ${p.nombre}`);
            console.log(`  Categoría: ${p.categoria}`);
            console.log(`  SubCategoría: ${JSON.stringify(p.subCategoria)}\n`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkCategories();
