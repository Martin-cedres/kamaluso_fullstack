require('dotenv').config({ path: '.env.local' })
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

async function getDynamicUrlsSync() {
  let connection
  try {
    if (!MONGODB_URI) {
      throw new Error('La variable de entorno MONGODB_URI no está definida.')
    }
    connection = await mongoose.connect(MONGODB_URI)

    const products = await Product.find({}, 'slug categoria').lean()

    const urls = products.map((p) => `/productos/${p.categoria}/${p.slug}`)

    return urls
  } catch (error) {
    console.error('Error generando URLs dinámicas:', error)
    return []
  } finally {
    // Asegurarse de que la conexión se cierre
    if (connection) {
      await mongoose.disconnect()
    }
  }
}

module.exports = { getDynamicUrlsSync }

module.exports = { getDynamicUrlsSync }
