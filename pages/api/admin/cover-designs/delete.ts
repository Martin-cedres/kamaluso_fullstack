import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import { deleteFileFromS3 } from '../../../../lib/s3-upload';
import mongoose, { Model } from 'mongoose'; // Import Model
import { ICoverDesign } from '../../../../models/CoverDesign'; // Import interface

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de diseño de tapa inválido.' });
  }

  try {
    const CoverDesign = mongoose.connection.models.CoverDesign as Model<ICoverDesign>; // Retrieve model
    const coverDesign = await CoverDesign.findById(new mongoose.Types.ObjectId(id as string));

    if (!coverDesign) {
      return res.status(404).json({ message: 'Diseño de tapa no encontrado.' });
    }

    // Delete image from S3 using the imageUrl (finalUrlBase)
    if (coverDesign.imageUrl) {
      await deleteFileFromS3(coverDesign.imageUrl);
    }

    await coverDesign.deleteOne();

    res.status(200).json({ message: 'Diseño de tapa eliminado con éxito.' });
  } catch (error: any) {
    console.error('Error deleting cover design:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
