import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import Product from '../models/Product';
import dbConnect from '../lib/mongoose';
import util from 'util';

// IDs de los productos que fallaron en la ejecución anterior
const PROBLEMATIC_IDS = [
  '68e71777fcf38bded0ebe95d',
  '68e87a2766307465bd1682f6',
  '68e87d5e66307465bd168314',
  '68e87f8666307465bd168349',
  '68f54a4de3ba1cc015ce04db',
  '68e8815e66307465bd168370'
];

async function diagnosticarDatos() {
  console.log('Iniciando script de diagnóstico...');
  await dbConnect();

  const productos = await Product.find({ _id: { $in: PROBLEMATIC_IDS } });

  console.log(`Se encontraron ${productos.length} de los productos problemáticos para analizar.`);
  console.log('--- INICIO DEL ANÁLISIS ---');

  for (const producto of productos) {
    console.log(`
--- Analizando Producto: "${producto.nombre}" (ID: ${producto._id}) ---`);
    const customGroups = producto.customizationGroups;

    console.log(`1. typeof customizationGroups: ${typeof customGroups}`);
    console.log(`2. Array.isArray(customizationGroups): ${Array.isArray(customGroups)}`);
    
    if (Array.isArray(customGroups) && customGroups.length > 0) {
        console.log(`3. El array tiene ${customGroups.length} elemento(s).`);
        console.log(`4. typeof customizationGroups[0]: ${typeof customGroups[0]}`);
        console.log('5. Valor del primer elemento (console.log):', customGroups[0]);
        console.log('6. Valor del primer elemento (util.inspect):\n', util.inspect(customGroups[0], { depth: null, colors: true }));
    } else if (customGroups) {
        console.log('3. El campo no es un array o está vacío.');
        console.log('4. Valor completo del campo (util.inspect):\n', util.inspect(customGroups, { depth: null, colors: true }));
    } else {
        console.log('3. El campo es nulo o indefinido.');
    }
  }

  console.log('\n--- FIN DEL ANÁLISIS ---');
  await mongoose.connection.close();
  console.log('Conexión a la base de datos cerrada.');
}

diagnosticarDatos().catch(console.error);
