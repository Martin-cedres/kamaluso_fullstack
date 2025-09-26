import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../lib/mongoose';
import Review from '../../../models/Review';
import Product from '../../../models/Product';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id || !token.name) {
    return res.status(401).json({
      error: 'No autenticado: El token de sesión no existe o no contiene la información de usuario necesaria.',
      cookieHeader: req.headers.cookie,
    });
  }

  // Access fields directly from req.body
  const { productId, rating, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  await connectDB();

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const existingReview = await Review.findOne({
      product: productId,
      'user.id': token.id,
    });

    if (existingReview) {
      return res.status(409).json({ error: 'Ya has comentado este producto' });
    }

    const newReview = new Review({
      product: productId,
      user: {
        id: token.id,
        name: token.name,
        image: token.picture,
      },
      rating: rating,
      comment: comment,
    });

    await newReview.save();

    res.status(201).json({ message: '¡Gracias por tu comentario! Estará visible pronto, una vez que sea aprobado.' });
  } catch (error) {
    console.error('Error al crear el comentario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default handler;
