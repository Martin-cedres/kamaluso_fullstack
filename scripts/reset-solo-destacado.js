const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: La variable de entorno MONGODB_URI no está definida en tu archivo .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado exitosamente a la base de datos.');

    const database = client.db('kamaluso'); // Reemplaza 'kamaluso' si tu base de datos tiene otro nombre
    const productsCollection = database.collection('products');

    console.log("Buscando productos con 'soloDestacado: true' para actualizarlos...");

    const result = await productsCollection.updateMany(
      { soloDestacado: true },
      { $set: { soloDestacado: false, destacado: false } }
    );

    if (result.matchedCount === 0) {
        console.log('No se encontraron productos con la marca \'soloDestacado: true\'.');
    } else {
        console.log(`¡Éxito! ${result.modifiedCount} de ${result.matchedCount} productos encontrados fueron actualizados.`);
        console.log("Todos los productos 'solo destacado' han sido convertidos a productos normales.");
    }
    
    console.log("Ahora deberían aparecer en la lista principal del panel de administración.");

  } catch (err) {
    console.error('Ocurrió un error durante la operación:', err);
  } finally {
    await client.close();
    console.log('Conexión con la base de datos cerrada.');
  }
}

run();
