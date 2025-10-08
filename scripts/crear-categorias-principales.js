
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// This is a simplified version of the Category model.
// We don't need to import the full model, just the schema basics for the script.
const CategorySchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  imagen: { type: String },
  keywords: [{ type: String }],
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definida en .env.local');
  process.exit(1);
}

const mainCategories = [
  {
    nombre: 'Tapa Dura',
    slug: 'tapa-dura',
    descripcion: 'Agendas y cuadernos con tapa dura, resistentes y elegantes.',
  },
  {
    nombre: 'Tapa Flex',
    slug: 'tapa-flex',
    descripcion: 'Agendas y cuadernos con tapa flexible, ligeros y prácticos.',
  },
];

async function createMainCategories() {
  try {
    console.log('Conectando a la base de datos...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conexión exitosa.');

    for (const cat of mainCategories) {
      const existingCategory = await Category.findOne({ slug: cat.slug });
      if (existingCategory) {
        console.log(`La categoría "${cat.nombre}" ya existe. Saltando.`);
      } else {
        console.log(`Creando categoría "${cat.nombre}"...`);
        const newCategory = new Category({
          ...cat,
          parent: null, // Explicitly set as a main category
        });
        await newCategory.save();
        console.log(`Categoría "${cat.nombre}" creada con éxito.`);
      }
    }

  } catch (error) {
    console.error('Ocurrió un error:', error);
  } finally {
    console.log('Cerrando conexión...');
    await mongoose.disconnect();
    console.log('Conexión cerrada.');
  }
}

createMainCategories();
