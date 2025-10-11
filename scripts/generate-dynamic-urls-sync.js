require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

// Ampliamos el esquema para incluir _id
const productSchema = new mongoose.Schema({
  _id: String,
  slug: String,
  categoria: String,
  subCategoria: [String], // Array de strings para subcategorías
})

const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)

async function getDynamicUrlsSync() {
  let connection
  try {
    if (!MONGODB_URI) {
      throw new Error('La variable de entorno MONGODB_URI no está definida.')
    }
    connection = await mongoose.connect(MONGODB_URI)

    // Pedimos también _id y usamos un Set para evitar URLs duplicadas
    const products = await Product.find({}, '_id slug categoria subCategoria').lean()
    const urlSet = new Set()

    products.forEach((p) => {
      if (p._id) {
        urlSet.add(`/productos/detail/${p._id}`)
      }
    })

    return Array.from(urlSet)
  } catch (error) {
    console.error('Error generando URLs dinámicas:', error)
    return []
  } finally {
    if (connection) {
      await mongoose.disconnect()
    }
  }
}

module.exports = { getDynamicUrlsSync }
