import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    const pillarPages = await PillarPage.find({}).sort({ createdAt: -1 });

    res.status(200).json(pillarPages);
  } catch (error: any) {
    console.error('Error al listar las páginas pilares:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
