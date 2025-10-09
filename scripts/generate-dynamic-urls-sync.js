require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

// Ampliamos el esquema para incluir subCategoria
const productSchema = new mongoose.Schema({
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

    // Pedimos también subCategoria y usamos un Set para evitar URLs duplicadas
    const products = await Product.find({}, 'slug categoria subCategoria').lean()
    const urlSet = new Set()

    products.forEach((p) => {
      // URL para la categoría principal
      if (p.categoria && p.slug) {
        urlSet.add(`/productos/${p.categoria}/${p.slug}`)
      }

      // URLs para las subcategorías
      if (p.subCategoria && p.subCategoria.length > 0) {
        p.subCategoria.forEach((subCatSlug) => {
          if (subCatSlug && p.slug) {
            urlSet.add(`/productos/${subCatSlug}/${p.slug}`)
          }
        })
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
