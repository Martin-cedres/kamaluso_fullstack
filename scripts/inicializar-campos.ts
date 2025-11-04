
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import Product from '../models/Product';
import dbConnect from '../lib/mongoose';

async function inicializarCampos() {
  console.log('Iniciando script para inicializar campos faltantes...');
  await dbConnect();

  try {
    // Encuentra productos donde el campo `customizationGroups` no existe
    const productosAInicializar = await Product.find({ 
      customizationGroups: { $exists: false } 
    });

    if (productosAInicializar.length === 0) {
      console.log('No se encontraron productos que necesiten inicialización. Nada que hacer.');
      return;
    }

    console.log(`Se encontraron ${productosAInicializar.length} productos para inicializar.`);

    for (const producto of productosAInicializar) {
      console.log(`- Inicializando campo en: "${producto.nombre}" (ID: ${producto._id})`);
      try {
        producto.customizationGroups = [];
        await producto.save();
        console.log(`  => ÉXITO: Campo inicializado en "${producto.nombre}".`);
      } catch (error) {
        console.error(`  !! ERROR al inicializar "${producto.nombre}":`, error.message);
      }
    }

  } catch (error) {
    console.error('Ocurrió un error fatal durante el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada.');
  }
}

inicializarCampos().catch(console.error);
