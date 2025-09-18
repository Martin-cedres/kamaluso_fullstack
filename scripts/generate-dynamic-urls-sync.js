const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI; // tu conexión a MongoDB

// Modelo de producto, ajusta según tu esquema real
const productSchema = new mongoose.Schema({
  slug: String
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function getDynamicUrlsSync() {
  try {
    await mongoose.connect(MONGO_URI);

    const products = await Product.find({}, 'slug').lean();

    // Devuelve rutas completas para cada producto
    const urls = products.map(p => `/productos/${p.slug}`);

    await mongoose.disconnect();
    return urls;
  } catch (error) {
    console.error('Error generando URLs dinámicas:', error);
    return [];
  }
}

module.exports = { getDynamicUrlsSync };
