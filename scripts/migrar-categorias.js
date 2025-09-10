
// scripts/migrar-categorias.js
// Este es un script de un solo uso para poblar la colección de categorías.

const { MongoClient } = require("mongodb");

// --- Configuración ---
// ¡Asegúrate de que tu URI de conexión a MongoDB sea correcta!
// Puedes copiarla de tu archivo .env.local o de donde la tengas guardada.
const uri = "mongodb+srv://martinfernandocedres:mc00232481@kamaluso.t6jigkj.mongodb.net/kamaluso?retryWrites=true&w=majority"; // <-- ¡CAMBIA ESTO!
const dbName = "kamaluso";

// Datos que vamos a insertar (basados en tu lib/categorias.ts)
const categorias = [
  {
    nombre: "Sublimables",
    slug: "sublimables",
    descripcion: "Agendas, recetarios, cuadernos, blocks",
    imagen: "/categorias/sublimables.png",
    subCategorias: [], // Sin subcategorías por ahora
  },
  {
    nombre: "Personalizados",
    slug: "personalizados",
    descripcion: "Productos que el cliente puede personalizar",
    imagen: "/categorias/personalizados.png",
    subCategorias: [
      { nombre: "Tapa Dura", slug: "tapa-dura" },
      { nombre: "Tapa Flex", slug: "tapa-flex" },
    ],
  },
  {
    nombre: "Accesorios y Consumibles",
    slug: "accesorios",
    descripcion: "Accesorios y consumibles para sublimación",
    imagen: "/categorias/accesorios.png",
    subCategorias: [],
  },
  {
    nombre: "ImprimeYa",
    slug: "imprimeya",
    descripcion: "Servicio de impresión rápida",
    imagen: "/categorias/imprimeya.jpg",
    subCategorias: [],
  },
];

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado a la base de datos.");

    const db = client.db(dbName);
    const collection = db.collection("categorias");

    // Limpiar la colección por si ejecutamos el script más de una vez
    await collection.deleteMany({});
    console.log("Colección 'categorias' limpiada.");

    // Insertar los nuevos datos
    const result = await collection.insertMany(categorias);
    console.log(`${result.insertedCount} categorías han sido insertadas.`);

  } catch (err) {
    console.error("Ha ocurrido un error:", err);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
  }
}

run();
