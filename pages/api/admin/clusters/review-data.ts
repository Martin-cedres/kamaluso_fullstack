import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage, { IPillarPage } from '../../../../models/PillarPage';
import Post, { IPost } from '../../../../models/Post';
import Product, { IProduct } from '../../../../models/Product';

// Definimos una interfaz unificada para los datos de revisión
export interface IReviewItem {
  id: string;
  type: 'PillarPage' | 'Post' | 'Product';
  title: string;
  originalContent: string;
  proposedContent: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { pillarPageId } = req.query;

  if (!pillarPageId || typeof pillarPageId !== 'string') {
    return res.status(400).json({ message: 'Se requiere un "pillarPageId" válido.' });
  }

  try {
    await connectDB();

    const pillarPage = await PillarPage.findById(pillarPageId)
      .populate<{ clusterPosts: IPost[] }>({ path: 'clusterPosts', model: Post })
      .populate<{ clusterProducts: IProduct[] }>({ path: 'clusterProducts', model: Product });

    if (!pillarPage) {
      return res.status(404).json({ message: 'Página Pilar no encontrada.' });
    }

    const reviewItems: IReviewItem[] = [];

    // 1. Comprobar la propia página pilar
    if (pillarPage.status === 'pending_review' && pillarPage.proposedContent) {
      reviewItems.push({
        id: pillarPage._id.toString(),
        type: 'PillarPage',
        title: pillarPage.title,
        originalContent: pillarPage.content,
        proposedContent: pillarPage.proposedContent,
      });
    }

    // 2. Comprobar los artículos del cluster
    for (const post of pillarPage.clusterPosts) {
      if (post.status === 'pending_review' && post.proposedContent) {
        reviewItems.push({
          id: post._id.toString(),
          type: 'Post',
          title: post.title,
          originalContent: post.content,
          proposedContent: post.proposedContent,
        });
      }
    }

    // 3. Comprobar los productos del cluster
    for (const product of pillarPage.clusterProducts) {
      if (product.contentStatus === 'pending_review' && product.proposedContent) {
        reviewItems.push({
          id: product._id.toString(),
          type: 'Product',
          title: product.nombre,
          originalContent: product.descripcionExtensa || '',
          proposedContent: product.proposedContent,
        });
      }
    }

    res.status(200).json({ data: reviewItems });

  } catch (error: any) {
    console.error('Error al obtener los datos para revisión:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
