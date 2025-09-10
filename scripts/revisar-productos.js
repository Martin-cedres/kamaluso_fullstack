// scripts/revisar-productos.js
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

    if (allProducts.length === 0) {
      console.log("No se encontraron productos en la base de datos.");
    } else {
      console.log(`Se encontraron ${allProducts.length} productos:`);
      console.log(JSON.stringify(allProducts, null, 2));
    }

  } catch (err) {
    console.error("Ha ocurrido un error:", err);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
  }
}

run();
