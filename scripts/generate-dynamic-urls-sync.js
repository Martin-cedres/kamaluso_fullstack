require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

// --- Esquemas Mínimos para la Generación de URLs ---
const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  slug: String,
})

const categorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  slug: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
})

const postSchema = new mongoose.Schema({
  slug: String,
})

// --- Modelos ---
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)
const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema)
const Post = mongoose.models.Post || mongoose.model('Post', postSchema)

async function getDynamicUrlsSync() {
  let connection
  try {
    if (!MONGODB_URI) {
      throw new Error('La variable de entorno MONGODB_URI no está definida.')
    }
    connection = await mongoose.connect(MONGODB_URI)

    const urlSet = new Set()

    // 1. URLs de Productos
    const products = await Product.find({}, '_id slug').lean()
    products.forEach((p) => {
      if (p._id) {
        urlSet.add(`/productos/detail/${p.slug}`)
      }
    })

    // 2. URLs de Posts del Blog
    const posts = await Post.find({}, 'slug').lean()
    posts.forEach((post) => {
      if (post.slug) {
        urlSet.add(`/blog/${post.slug}`)
      }
    })

    // 3. URLs de Categorías y Subcategorías
    const categories = await Category.find({}, 'slug parent').lean()
    const categoryMap = new Map(categories.map((cat) => [cat._id.toString(), cat.slug]))

    categories.forEach((cat) => {
      if (cat.parent) {
        const parentSlug = categoryMap.get(cat.parent.toString())
        if (parentSlug) {
          // Es una subcategoría
          urlSet.add(`/productos/${parentSlug}/${cat.slug}`)
        }
      } else {
        // Es una categoría principal
        urlSet.add(`/productos/${cat.slug}`)
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
