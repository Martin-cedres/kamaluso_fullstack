import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import Review from '../../../models/Review';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { productId } = req.query;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ error: 'Falta el ID del producto' });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  await connectDB();

  try {
    const reviews = await Review.find({ product: productId, isApproved: true }).sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error al listar los comentarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default handler;
