// scripts/revisar-tipo-categoria.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority';
const dbName = 'kamaluso';

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const db = client.db(dbName);
    const productsCollection = db.collection('products');

    console.log('Buscando productos donde la categoría no es un string...');

    const productsWithInvalidCategory = await productsCollection.find({
      $and: [
        { categoria: { $exists: true } },
        { categoria: { $ne: null } },
        { categoria: { $not: { $type: "string" } } }
      ]
    }).toArray();

    if (productsWithInvalidCategory.length === 0) {
      console.log('¡Excelente! Todas las categorías de productos son strings.');
    } else {
      console.log(`Se encontraron ${productsWithInvalidCategory.length} productos con un tipo de categoría inválido:`);
      productsWithInvalidCategory.forEach(product => {
        console.log(`- ID: ${product._id}, Nombre: "${product.nombre}", Tipo de Categoría: ${typeof product.categoria}, Valor: ${JSON.stringify(product.categoria)}`);
      });
      console.log('\nPor favor, revisa estos productos en tu base de datos y asegúrate de que la categoría sea un string.');
    }

  } catch (err) {
    console.error('Ha ocurrido un error:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

run();
