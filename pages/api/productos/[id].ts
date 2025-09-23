// pages/api/productos/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query

  if (!id) return res.status(400).json({ error: 'Falta el id' })

  try {
    const client = await clientPromise
    const db = client.db()

    // Buscar el producto por _id
    const producto = await db
      .collection('productos')
      .findOne({ _id: new ObjectId(id as string) })

    if (!producto)
      return res.status(404).json({ error: 'Producto no encontrado' })

    // Adaptar precios para frontend (ya que los guardás directamente)
    const responseProducto = {
      ...producto,
      precio: producto.precio || null,
      precioFlex: producto.precioFlex || null,
      precioDura: producto.precioDura || null,
    }

    res.status(200).json(responseProducto)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
