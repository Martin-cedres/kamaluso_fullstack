import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import CoverDesign, { ICoverDesign } from '../../../../models/CoverDesign'; // Direct import
import { Model } from 'mongoose'; // Import Model

const CoverDesignModel: Model<ICoverDesign> = CoverDesign; // Explicitly cast

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  try {
    const coverDesigns = await CoverDesignModel.find({}).sort({ code: 1 });
    res.status(200).json(coverDesigns);
  } catch (error: any) {
    console.error('Error listing cover designs:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
