// scripts/revisar-categorias.js
const { MongoClient } = require('mongodb');

// --- Configuración ---
// ¡ATENCIÓN! La URI de conexión se toma del script existente.
const uri = 'mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority';
const dbName = 'kamaluso';

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const db = client.db(dbName);
    const productsCollection = db.collection('products');

    console.log('Buscando productos sin categoría o con categoría vacía...');

    const productsWithoutCategory = await productsCollection.find({
      $or: [
        { categoria: { $exists: false } },
        { categoria: null },
        { categoria: '' }
      ]
    }).toArray();

    if (productsWithoutCategory.length === 0) {
      console.log('¡Excelente! Todos los productos tienen una categoría asignada.');
    } else {
      console.log(`Se encontraron ${productsWithoutCategory.length} productos sin categoría:`);
      productsWithoutCategory.forEach(product => {
        console.log(`- ID: ${product._id}, Nombre: "${product.nombre}"`);
      });
      console.log('\nPor favor, revisa estos productos en tu base de datos y asígnales una categoría.');
    }

  } catch (err) {
    console.error('Ha ocurrido un error:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

run();
