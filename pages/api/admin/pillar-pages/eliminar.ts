import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'El ID de la página es requerido.' });
    }

    const deletedPage = await PillarPage.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ message: 'Página Pilar no encontrada para eliminar.' });
    }

    res.status(200).json({ message: 'Página Pilar eliminada con éxito.' });
  } catch (error: any) {
    console.error('Error al eliminar la página pilar:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
