import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { pillarPageId, clusterPostIds, clusterProductIds } = req.body;

    if (!pillarPageId || !Array.isArray(clusterPostIds) || !Array.isArray(clusterProductIds)) {
      return res.status(400).json({ message: 'Datos inválidos. Se requiere "pillarPageId", "clusterPostIds" y "clusterProductIds".' });
    }

    const pillarPage = await PillarPage.findById(pillarPageId);

    if (!pillarPage) {
      return res.status(404).json({ message: 'Página Pilar no encontrada.' });
    }

    // Actualizar las referencias del cluster
    // Se convierten los strings a ObjectIds de Mongoose
    pillarPage.clusterPosts = clusterPostIds.map(id => new mongoose.Types.ObjectId(id));
    pillarPage.clusterProducts = clusterProductIds.map(id => new mongoose.Types.ObjectId(id));

    await pillarPage.save();

    res.status(200).json({ message: 'Cluster actualizado con éxito', pillarPage });

  } catch (error: any) {
    console.error('Error al actualizar el cluster:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
