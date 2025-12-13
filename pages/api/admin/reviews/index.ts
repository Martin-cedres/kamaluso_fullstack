
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import Review from '../../../../models/Review';
import { isAdmin } from '../../../../lib/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !isAdmin(token)) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere ser administrador.' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const reviewsRaw = await Review.find({})
          .sort({ createdAt: -1 })
          .populate('product', 'nombre slug imageUrl')
          .lean();

        // Filter out reviews where product is null (deleted products)
        const reviews = reviewsRaw.filter((review: any) => review.product !== null);

        res.status(200).json(reviews);
      } catch (error) {
        console.error('Error al listar las reseñas para admin:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
      break;

    case 'PUT':
      try {
        const { reviewId, isApproved } = req.body;
        if (!reviewId || typeof isApproved !== 'boolean') {
          return res.status(400).json({ error: 'Faltan parámetros (reviewId, isApproved)' });
        }

        const updatedReview = await Review.findByIdAndUpdate(
          reviewId,
          { isApproved },
          { new: true }
        );

        if (!updatedReview) {
          return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.status(200).json(updatedReview);
      } catch (error) {
        console.error('Error al actualizar la reseña:', error);
        res.status(500).json({ error: 'Error al actualizar la reseña' });
      }
      break;

    case 'DELETE':
      try {
        const { reviewId } = req.body;
        if (!reviewId) {
          return res.status(400).json({ error: 'Falta el parámetro reviewId' });
        }

        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
          return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.status(200).json({ message: 'Reseña eliminada correctamente' });
      } catch (error) {
        console.error('Error al eliminar la reseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Método ${req.method} no permitido`);
  }
};

export default handler;
