const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

// Definimos un esquema simple que coincida con los campos que necesitamos
const productSchema = new mongoose.Schema({
  slug: String,
  categoria: String,
})

// Evita recompilar el modelo si ya existe
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)

// Definimos un esquema simple para categorías
const categorySchema = new mongoose.Schema({
  slug: String,
})
const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema)

async function getDynamicUrlsSync() {
  let connection
  try {
    if (!MONGODB_URI) {
      throw new Error('La variable de entorno MONGODB_URI no está definida.')
    }
    // Reutilizar conexión si ya existe
    if (mongoose.connections[0].readyState) {
      connection = mongoose.connections[0];
    } else {
      connection = await mongoose.connect(MONGODB_URI);
    }

    const products = await Product.find({}, 'slug categoria').lean()
    const categories = await Category.find({}, 'slug').lean()

    const productUrls = products.map((p) => `/productos/${p.categoria}/${p.slug}`)
    const categoryUrls = categories.map((c) => `/productos/${c.slug}`)

    return [...productUrls, ...categoryUrls]
  } catch (error) {
    console.error('Error generando URLs dinámicas:', error)
    return []
  } finally {
    // Asegurarse de que la conexión se cierre SOLO si la abrimos en esta función
    if (connection && connection.readyState === 1 && !mongoose.connections[0].readyState) {
      await mongoose.disconnect()
    }
  }
}

module.exports = { getDynamicUrlsSync }
