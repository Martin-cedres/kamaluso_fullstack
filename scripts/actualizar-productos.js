// scripts/actualizar-productos.js
const { MongoClient } = require("mongodb");

// --- Configuración ---
// ¡ATENCIÓN! CAMBIA ESTA LÍNEA CON TU URI DE CONEXIÓN A MONGODB
const uri = "mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority"; // <-- ¡CAMBIA ESTO!
const dbName = "kamaluso";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado a la base de datos.");

    const db = client.db(dbName);
    const productsCollection = db.collection("products");

    const allProducts = await productsCollection.find({}).toArray();

    let updatedCount = 0;
    let deletedCount = 0;

    for (const product of allProducts) {
      let newCategory = null;
      const subCategoria = Array.isArray(product.subCategoria) ? product.subCategoria.join(' ') : product.subCategoria;

      if (subCategoria && /tapa-dura|tapas-dura/.test(subCategoria)) {
        newCategory = 'tapa-dura';
      } else if (subCategoria && /tapa-flex|tapas-flex/.test(subCategoria)) {
        newCategory = 'tapa-flex';
      }

      if (newCategory) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { categoria: newCategory }, $unset: { subCategoria: "" } }
        );
        updatedCount++;
      } else {
        // Eliminar productos que no encajan en las nuevas categorías
        await productsCollection.deleteOne({ _id: product._id });
        deletedCount++;
      }
    }

    console.log(`Migración completada.`);
    console.log(`${updatedCount} productos actualizados.`);
    console.log(`${deletedCount} productos eliminados.`);

  } catch (err) {
    console.error("Ha ocurrido un error:", err);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
  }
}

run();
