import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Category from '../../../../models/Category';
import { ObjectId } from 'mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectDB();

  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(String(id))) {
      return res.status(400).json({ error: 'ID de categoría inválido.' });
    }

    // Opcional: Verificar si hay productos en esta categoría antes de borrar.
    // Por ahora, simplemente borramos.

    const deletedCategory = await Category.findByIdAndDelete(String(id));

    if (!deletedCategory) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    res.status(200).json({ success: true, message: 'Categoría eliminada con éxito' });
  } catch (error: any) {
    console.error('[DELETE CATEGORY ERROR]:', error);
    res.status(500).json({ error: 'Error interno al eliminar la categoría' });
  }
};

export default withAuth(handler);
