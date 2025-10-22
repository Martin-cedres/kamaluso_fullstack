import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';
import { revalidateProductPaths } from '../../../../lib/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { newOrder } = req.body;

  if (!newOrder || !Array.isArray(newOrder)) {
    return res.status(400).json({ error: 'Invalid request body. Expected an array of { _id, order }.' });
  }

  await connectDB();

  try {
    const bulkOperations = newOrder.map((item: { _id: string; order: number }) => ({
      updateOne: {
        filter: { _id: new ObjectId(item._id) },
        update: { $set: { order: item.order } },
      },
    }));

    await Product.bulkWrite(bulkOperations);

    // Revalidar las páginas afectadas (página de inicio y páginas de productos)
    // Esto podría ser más granular, pero para simplificar, revalidamos la home y todas las categorías
    await revalidateProductPaths('/', '/', '/'); // Revalidar la home
    // Para revalidar categorías, necesitaríamos los slugs de todas las categorías
    // Por ahora, revalidamos la home y confiamos en el revalidate de los productos individuales

    // Revalidar productos individuales que cambiaron de orden
    for (const item of newOrder) {
      const product = await Product.findById(item._id).lean();
      if (product && product.categoria && product.slug) {
        await revalidateProductPaths(product.categoria, product.slug, product._id.toString());
      }
    }

    return res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('[REORDER PRODUCTS ERROR]:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

export default withAuth(handler);
