const mongoose = require('mongoose');
const Product = require('../models/Product.ts').default; // Asumiendo que el modelo Product es accesible
require('dotenv').config({ path: './.env.local' }); // Cargar variables de entorno

async function fixImageUrls() {
  console.log('Iniciando script para corregir URLs de imágenes en la base de datos...');

  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB.');

    // Buscar todos los productos
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      let changed = false;

      // Corregir la URL de la imagen principal (imageUrl)
      if (product.imageUrl && product.imageUrl.match(/-\d+w\.webp$/)) {
        product.imageUrl = product.imageUrl.replace(/-\d+w\.webp$/, '.webp');
        changed = true;
        console.log(`Corregida imageUrl para producto ${product._id}: ${product.imageUrl}`);
      }

      // Corregir las URLs de las imágenes secundarias (images array)
      if (product.images && Array.isArray(product.images)) {
        const cleanedImages = product.images.map(imgUrl => {
          if (imgUrl && imgUrl.match(/-\d+w\.webp$/)) {
            changed = true;
            return imgUrl.replace(/-\d+w\.webp$/, '.webp');
          }
          return imgUrl;
        });
        // Solo actualizar si hubo cambios para evitar escrituras innecesarias
        if (changed) {
          product.images = cleanedImages;
          console.log(`Corregidas secondary images para producto ${product._id}`);
        }
      }

      // Guardar el producto si hubo cambios
      if (changed) {
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Script finalizado. Se actualizaron ${updatedCount} productos.`);
  } catch (error) {
    console.error('Error ejecutando el script:', error);
  } finally {
    // Desconectar de MongoDB
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB.');
  }
}

fixImageUrls();
