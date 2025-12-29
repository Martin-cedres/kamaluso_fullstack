
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Category = require('./models/Category').default || require('./models/Category');

async function listCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const cats = await Category.find({}).select('nombre slug').lean();

        console.log('--- FOUND CATEGORIES ---');
        cats.forEach(c => console.log(`- ${c.nombre} (${c.slug})`));
        console.log('---------------------');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listCategories();
