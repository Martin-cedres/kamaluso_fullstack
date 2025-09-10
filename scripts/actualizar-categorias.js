// scripts/actualizar-categorias.js
const { MongoClient } = require("mongodb");

// --- Configuración ---
// ¡ATENCIÓN! CAMBIA ESTA LÍNEA CON TU URI DE CONEXIÓN A MONGODB
const uri = "mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority"; // <-- ¡CAMBIA ESTO!
const dbName = "kamaluso";

const nuevasCategorias = [
  {
    nombre: 'Tapa Dura',
    slug: 'tapa-dura',
    descripcion: 'Productos con tapa dura',
    imagen: '/categorias/tapa-dura.png',
  },
  {
    nombre: 'Tapa Flex',
    slug: 'tapa-flex',
    descripcion: 'Productos con tapa flexible',
    imagen: '/categorias/tapa-flex.png',
  },
];

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado a la base de datos.");

    const db = client.db(dbName);
    const collection = db.collection("categorias");

    await collection.deleteMany({});
    console.log("Colección 'categorias' limpiada.");

    const result = await collection.insertMany(nuevasCategorias);
    console.log(`${result.insertedCount} categorías han sido insertadas.`);

  } catch (err) {
    console.error("Ha ocurrido un error:", err);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
  }
}

run();
