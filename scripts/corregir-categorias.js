// scripts/corregir-categorias.js
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority';
const dbName = 'kamaluso';

const idsToFix = [
  '68c9cbe9d220d9aef923d31d',
  '68cd7e480b28d6720ce0e28d'
];

const newCategory = 'tapa-dura';

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const db = client.db(dbName);
    const productsCollection = db.collection('products');

    console.log(`Intentando corregir ${idsToFix.length} productos...`);

    const objectIds = idsToFix.map(id => new ObjectId(id));

    const result = await productsCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { categoria: newCategory } }
    );

    console.log(`Operación completada. ${result.modifiedCount} productos fueron actualizados.`);

    if (result.matchedCount !== idsToFix.length) {
      console.warn('Advertencia: No todos los IDs especificados fueron encontrados en la base de datos.');
    }

  } catch (err) {
    console.error('Ha ocurrido un error:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

run();
