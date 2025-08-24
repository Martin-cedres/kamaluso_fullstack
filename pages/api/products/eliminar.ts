import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';
import { requireAuth } from '../../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Falta el ID del producto o es inválido' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('kamaluso');

    // Intentamos eliminar el producto
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.status(200).json({ ok: true, mensaje: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar el producto:', error);
    // Manejo específico si el ID no es válido
    if (error.name === 'BSONError' || error.message.includes('Argument passed in must be a single String of 12 bytes or a string of 24 hex characters')) {
      return res.status(400).json({ error: 'Formato de ID inválido' });
    }
    return res.status(500).json({ error: 'Error interno del servidor al eliminar el producto' });
  }
};

// Exportamos con autenticación
export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}
