import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import CoverDesign from '../../../../models/CoverDesign';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  try {
    // Usamos distinct para obtener una lista de todos los valores únicos en el campo 'groups'
    const groups = await CoverDesign.distinct('groups');
    res.status(200).json(groups.sort()); // Devolvemos los grupos ordenados alfabéticamente
  } catch (error: any) {
    console.error('Error fetching distinct cover design groups:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
