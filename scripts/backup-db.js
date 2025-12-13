
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI no está definida en .env.local');
    process.exit(1);
}

// Schemas simplificados para lectura
const ProductSchema = new mongoose.Schema({}, { strict: false });
const CategorySchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function backup() {
    try {
        console.log('Conectando a la base de datos...');
        await mongoose.connect(MONGODB_URI);

        // Backup Categories
        console.log('Haciendo backup de Categorias...');
        const categories = await Category.find({}).lean();
        fs.writeFileSync(
            path.join(__dirname, '../backup_categories.json'),
            JSON.stringify(categories, null, 2)
        );
        console.log(`Guardadas ${categories.length} categorías en backup_categories.json`);

        // Backup Products
        console.log('Haciendo backup de Productos...');
        const products = await Product.find({}).lean();
        fs.writeFileSync(
            path.join(__dirname, '../backup_products.json'),
            JSON.stringify(products, null, 2)
        );
        console.log(`Guardados ${products.length} productos en backup_products.json`);

    } catch (error) {
        console.error('Error durante el backup:', error);
    } finally {
        await mongoose.disconnect();
    }
}

backup();
