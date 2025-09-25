// scripts/revisar-largo-categoria.js
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

    console.log('Revisando las categorías de todos los productos...');

    const allProducts = await productsCollection.find({}).toArray();

    let problematicProducts = [];

    allProducts.forEach(product => {
      if (typeof product.categoria !== 'string') {
        problematicProducts.push({
          id: product._id,
          nombre: product.nombre,
          reason: `Tipo de dato incorrecto: ${typeof product.categoria}`
        });
      } else if (product.categoria.trim().length === 0) {
        problematicProducts.push({
          id: product._id,
          nombre: product.nombre,
          reason: 'Categoría es un string vacío o solo espacios.'
        });
      }
    });

    if (problematicProducts.length === 0) {
      console.log('¡Excelente! No se encontraron problemas con las categorías de los productos.');
    } else {
      console.log(`Se encontraron ${problematicProducts.length} productos con problemas en su categoría:`);
      problematicProducts.forEach(p => {
        console.log(`- ID: ${p.id}, Nombre: "${p.nombre}", Problema: ${p.reason}`);
      });
    }

  } catch (err) {
    console.error('Ha ocurrido un error:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

run();
