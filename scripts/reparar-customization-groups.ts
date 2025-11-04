
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import Product from '../models/Product';
import dbConnect from '../lib/mongoose';

async function repararDatos() {
  console.log('Iniciando script de reparación de datos para `customizationGroups`...');
  await dbConnect();
  console.log('Conexión a la base de datos establecida.');

  try {
    // Un producto está corrupto si el campo `customizationGroups` es un string en lugar de un array
    const productosCorruptos = await Product.find({
      customizationGroups: { $type: 'string' }
    });

    if (productosCorruptos.length === 0) {
      console.log('No se encontraron productos con datos corruptos. Nada que hacer.');
      return;
    }

    console.log(`Se encontraron ${productosCorruptos.length} productos para reparar.`);

    for (const producto of productosCorruptos) {
      console.log(`- Intentando reparar: "${producto.nombre}" (ID: ${producto._id})`);
      
      try {
        const valorProblematico = producto.customizationGroups as any;
        
        if (typeof valorProblematico !== 'string') {
            console.log('  -> El campo no es un string, omitiendo.');
            continue;
        }

        // Intentamos parsear el string, asumiendo que es un JSON válido
        const datosParseados = JSON.parse(valorProblematico);

        if (Array.isArray(datosParseados)) {
          producto.customizationGroups = datosParseados;
          await producto.save();
          console.log(`  => ÉXITO: "${producto.nombre}" ha sido reparado.`);
        } else {
          throw new Error('El contenido del string no es un array JSON.');
        }

      } catch (error) {
        console.error(`  !! ERROR al reparar "${producto.nombre}":`, error.message);
      }
    }

  } catch (error) {
    console.error('Ocurrió un error fatal durante el script de reparación:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada.');
  }
}

repararDatos().catch(console.error);
