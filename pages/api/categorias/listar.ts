// pages/api/categorias/listar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const client = await clientPromise
    const db = client.db('kamaluso')

    const categorias = await db
      .collection('categories')
      .find({})
      .sort({ nombre: 1 }) // Ordenar alfabéticamente
      .toArray()

    res.status(200).json(categorias)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener las categorías' })
  }
}
