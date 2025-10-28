
require('dotenv').config({ path: '../.env' });
const connectDB = require('../lib/mongoose.js');
const Product = require('../models/Product.js');

async function fixCoverDesignUrls() {
  try {
    await connectDB();
    console.log('Conectado a la base de datos.');

    const productsToUpdate = await Product.find({ 
      'customizationGroups.name': /^Diseño de Tapa/ 
    });

    if (productsToUpdate.length === 0) {
      console.log('No se encontraron productos con grupos de "Diseño de Tapa" para actualizar.');
      return;
    }

    console.log(`Se encontraron ${productsToUpdate.length} productos para revisar...`);

    let updatedCount = 0;
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucketName || !region) {
      console.error('Error: Las variables de entorno AWS_BUCKET_NAME y AWS_REGION deben estar definidas.');
      return;
    }

    const s3BasePath = `https://${bucketName}.s3.${region}.amazonaws.com/processed/`;

    for (const product of productsToUpdate) {
      let needsUpdate = false;
      product.customizationGroups.forEach(group => {
        if (group.name && group.name.startsWith('Diseño de Tapa') && group.options) {
          group.options.forEach(option => {
            if (option.image && !option.image.startsWith('http')) {
              console.log(`- Corrigiendo imagen en producto "${product.nombre}": ${option.image}`);
              option.image = `${s3BasePath}${option.image}`;
              needsUpdate = true;
            }
          });
        }
      });

      if (needsUpdate) {
        await product.save();
        updatedCount++;
        console.log(`  Producto "${product.nombre}" actualizado.`);
      }
    }

    console.log('----------------------------------------');
    console.log(`Proceso completado. Se actualizaron ${updatedCount} productos.`);

  } catch (error) {
    console.error('Ocurrió un error durante el proceso:', error);
  } finally {
    // Mongoose.disconnect() no es un método estándar, la conexión se cierra sola.
    console.log('Cerrando conexión a la base de datos.');
  }
}

fixCoverDesignUrls();
