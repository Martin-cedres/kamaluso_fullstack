// pages/api/products/get.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res
      .status(400)
      .json({ error: 'Falta el ID del producto o es inválido' })
  }

  try {
    const client = await clientPromise
    const db = client.db('kamaluso')

    const product = await db
      .collection('products')
      .findOne({ _id: new ObjectId(id) })

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    // Asegurarse de que el formato es el esperado por el frontend
    const formattedProduct = {
      ...product,
      _id: product._id.toString(),
      destacado: !!product.destacado, // Asegurar que sea un booleano
    }

    res.status(200).json(formattedProduct)
  } catch (err) {
    console.error('Error al obtener el producto:', err)
    // Manejar error de ID inválido de MongoDB
    if (
      err instanceof Error &&
      err.message.includes(
        'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters',
      )
    ) {
      return res
        .status(400)
        .json({ error: 'ID de producto con formato inválido' })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
