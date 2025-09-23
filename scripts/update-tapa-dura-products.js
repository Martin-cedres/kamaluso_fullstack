require('dotenv').config({ path: '.env.local' })
const clientPromise = require('../lib/mongodb')

async function updateTapaDuraProducts() {
  console.log('Iniciando script de actualización de productos...')
  try {
    console.log('Intentando conectar a la base de datos...')
    const client = await clientPromise
    const db = client.db('kamaluso') // Asegúrate de que 'kamaluso' sea el nombre correcto de tu base de datos
    console.log('Conexión a la base de datos establecida.')

    console.log(
      'Buscando productos en la categoría "tapa-dura" para actualizar...',
    )
    const result = await db.collection('products').updateMany(
      { categoria: { $regex: /^tapa-dura$/i } }, // Busca productos en la categoría 'tapa-dura' (insensible a mayúsculas/minúsculas)
      { $set: { tapa: 'Tapa Dura' } }, // Establece el campo 'tapa' a 'Tapa Dura'
    )

    console.log('Operación de actualización de la base de datos completada.')
    console.log(
      `Resumen: ${result.matchedCount} productos encontrados, ${result.modifiedCount} productos modificados.`,
    )

    if (result.matchedCount === 0) {
      console.log(
        'No se encontraron productos en la categoría "tapa-dura". Asegúrate de que la categoría esté escrita correctamente en la base de datos.',
      )
    }
  } catch (error) {
    console.error('Error crítico durante la actualización de productos:', error)
  } finally {
    console.log('Script de actualización de productos finalizado.')
    // No cerramos la conexión aquí si clientPromise maneja la conexión globalmente
    // Si clientPromise devuelve una nueva conexión cada vez, deberías cerrarla.
    // Para este caso, asumimos que clientPromise maneja la conexión de forma persistente.
  }
}

updateTapaDuraProducts()
