
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import Product from '../models/Product';
import dbConnect from '../lib/mongoose'; // Asumimos un helper de conexión

// URL de la API interna que creamos
const API_URL = 'http://localhost:3000/api/admin/generate-seo';

async function procesarProductos() {
  console.log('Iniciando el script de generación de contenido masivo...');
  await dbConnect();
  console.log('Conexión a la base de datos exitosa.');

  try {
    // Buscamos productos que aún no tengan una descripción breve para no reprocesarlos
    const productos = await Product.find({ descripcionBreve: { $exists: false } });

    if (productos.length === 0) {
      console.log('No hay productos nuevos que necesiten actualización. El catálogo ya está al día.');
      return;
    }

    console.log(`Se encontraron ${productos.length} productos para actualizar.`);

    for (const producto of productos) {
      console.log(`- Procesando: "${producto.nombre}" (ID: ${producto._id})`);

      // FIX: Asegurarse de que customizationGroups exista antes de guardar
      if (!producto.customizationGroups) {
        console.log(`  -> Inicializando campo 'customizationGroups' faltante.`);
        producto.customizationGroups = [];
      }

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            categoria: producto.categoria,
          }),
        });

        if (!res.ok) {
          throw new Error(`La API devolvió un error: ${res.statusText}`);
        }

        const contenidoGenerado = await res.json();

        // Actualizamos el documento del producto con la nueva información
        producto.seoTitle = contenidoGenerado.seoTitle;
        producto.seoDescription = contenidoGenerado.seoDescription;
        producto.descripcionBreve = contenidoGenerado.descripcionBreve;
        producto.puntosClave = contenidoGenerado.puntosClave;
        producto.descripcionExtensa = contenidoGenerado.descripcionExtensa;

        await producto.save();
        console.log(`  => "${producto.nombre}" actualizado correctamente.`);

      } catch (e) {
        console.error(`  !! Error al procesar "${producto.nombre}":`, e);
      }

      // Pequeña pausa para no sobrecargar el servidor de desarrollo o la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\nProceso completado.');

  } catch (error) {
    console.error('Ocurrió un error fatal durante el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a la base de datos cerrada.');
  }
}

procesarProductos();
