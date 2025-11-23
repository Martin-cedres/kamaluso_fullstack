import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import Post from '../../../models/Post';
import PillarPage from '../../../models/PillarPage'; // Importar el modelo PillarPage
import Product from '../../../models/Product'; // Necesario para poblar productos

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectDB();
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Slug is required' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // 1. Buscar primero en PillarPage
        let pillarPage = await PillarPage.findOne({ slug })
          .populate({
            path: 'clusterPosts',
            select: 'title slug coverImage excerpt', // Campos a seleccionar de Posts
          })
          .populate({
            path: 'clusterProducts',
            select: 'nombre slug imageUrl basePrice', // Campos a seleccionar de Products
          });

        if (pillarPage) {
          // Si se encuentra, añadir el tipo y devolver
          return res.status(200).json({ ...pillarPage.toObject(), type: 'pillar' });
        }

        // 2. Si no es una Pillar Page, buscar en Post
        const post = await Post.findOne({ slug });
        if (post) {
          // Si se encuentra, añadir el tipo y devolver
          return res.status(200).json({ ...post.toObject(), type: 'post' });
        }
        
        // 3. Si no se encuentra ninguno
        return res.status(404).json({ message: 'Content not found' });

      } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
      break;
  }
}
