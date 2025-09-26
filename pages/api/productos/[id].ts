
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const aggregation = [
      // 1. Match the specific product
      { $match: { _id: new ObjectId(id) } },

      // 2. Join with reviews
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product',
          as: 'productReviews',
        },
      },

      // 3. Add fields for average rating and review count
      {
        $addFields: {
          approvedReviews: {
            $filter: {
              input: '$productReviews',
              as: 'review',
              cond: { $eq: ['$$review.isApproved', true] },
            },
          },
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$approvedReviews.rating' },
          numReviews: { $size: '$approvedReviews' },
        },
      },

      // 4. Remove the temporary reviews array
      { $project: { productReviews: 0, approvedReviews: 0 } },
    ];

    const results = await db.collection('productos').aggregate(aggregation).toArray();

    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = results[0];

    // Clean up null values from aggregation if no reviews are found
    if (producto.averageRating === null) {
      producto.averageRating = 0;
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error('Error al obtener producto con agregación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
