require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const PRODUCT_SLUG_TO_DEBUG = 'laaaaa';

// Definir esquemas simples localmente para evitar problemas de importación
const productSchema = new mongoose.Schema({
  nombre: String,
  slug: String,
  categoria: String,
  subCategoria: [String],
});

const categorySchema = new mongoose.Schema({
  nombre: String,
  slug: String,
  parent: mongoose.Schema.Types.ObjectId,
});

// Evita recompilar los modelos si ya existen
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function debugData() {
  if (!MONGODB_URI) {
    console.error('Error: La variable de entorno MONGODB_URI no está definida.');
    return;
  }

  let connection;
  try {
    console.log('Conectando a la base de datos...');
    connection = await mongoose.connect(MONGODB_URI);
    console.log('Conexión exitosa.');

    // 1. Buscar el producto por slug
    console.log(`\n--- 1. Buscando producto con slug: "${PRODUCT_SLUG_TO_DEBUG}" ---`);
    const product = await Product.findOne({ slug: PRODUCT_SLUG_TO_DEBUG }).lean();

    if (!product) {
      console.log(`No se encontró ningún producto con el slug "${PRODUCT_SLUG_TO_DEBUG}".`);
      return;
    }

    console.log('Producto encontrado:');
    console.log(JSON.stringify(product, null, 2));

    // 2. Buscar los documentos de sus categorías
    console.log('\n--- 2. Buscando documentos de categoría asociados ---');
    const productCategoriaSlug = product.categoria;
    const productSubCategoriaSlugs = product.subCategoria || [];

    console.log(`Slug de categoría guardado en producto: ${productCategoriaSlug}`);
    console.log(`Slugs de subcategoría guardados en producto: ${productSubCategoriaSlugs.join(', ')}`);

    const allRelatedSlugs = [productCategoriaSlug, ...productSubCategoriaSlugs].filter(Boolean);
    if (allRelatedSlugs.length > 0) {
        const relatedCategories = await Category.find({ slug: { $in: allRelatedSlugs } }).lean();
        console.log('Documentos de categoría encontrados para esos slugs:');
        console.log(JSON.stringify(relatedCategories, null, 2));
    } else {
        console.log('El producto no tiene slugs de categoría/subcategoría asociados.');
    }

    // 3. Listar TODAS las categorías para ver la estructura completa
    console.log('\n--- 3. Listado de TODAS las categorías en la base de datos ---');
    const allCategories = await Category.find({}).lean();
    console.log('Todas las categorías:');
    console.log(JSON.stringify(allCategories.map(c => ({ nombre: c.nombre, slug: c.slug, parent: c.parent })), null, 2));

  } catch (error) {
    console.error('\nError durante la depuración:', error);
  } finally {
    if (connection) {
        await mongoose.disconnect();
        console.log('\nConexión cerrada.');
    }
  }
}

debugData();