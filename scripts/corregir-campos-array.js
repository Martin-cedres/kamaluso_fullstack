// scripts/corregir-campos-array.js
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority';
const dbName = 'kamaluso';

const idsToFix = [
  '68c9cbe9d220d9aef923d31d', // "prueba"
  '68cd7e480b28d6720ce0e28d'  // "prueba despues del debug"
];

const fieldsToFix = [
  'nombre',
  'slug',
  'descripcion',
  'tapa',
  'seoTitle',
  'seoDescription',
  'alt',
  'notes',
  'status'
];

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const db = client.db(dbName);
    const productsCollection = db.collection('products');

    console.log(`Intentando corregir ${idsToFix.length} productos...`);

    const objectIds = idsToFix.map(id => new ObjectId(id));

    const productsToFix = await productsCollection.find({ _id: { $in: objectIds } }).toArray();

    let updatedCount = 0;

    for (const product of productsToFix) {
      const updateDoc = {};
      let needsUpdate = false;

      fieldsToFix.forEach(field => {
        if (Array.isArray(product[field])) {
          updateDoc[field] = String(product[field][0] || '');
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        const result = await productsCollection.updateOne(
          { _id: product._id },
          { $set: updateDoc }
        );
        if (result.modifiedCount > 0) {
          updatedCount++;
          console.log(`- Producto "${product.nombre}" (ID: ${product._id}) actualizado.`);
        }
      }
    }

    console.log(`Operación completada. ${updatedCount} productos fueron actualizados.`);

  } catch (err) {
    console.error('Ha ocurrido un error:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

run();
