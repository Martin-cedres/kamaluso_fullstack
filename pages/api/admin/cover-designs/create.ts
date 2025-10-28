import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadFileToS3 } from '../../../../lib/s3-upload';
import connectDB from '../../../../lib/mongoose';
import CoverDesign, { ICoverDesign } from '../../../../models/CoverDesign'; // Direct import
import { Model } from 'mongoose'; // Import Model

const CoverDesignModel: Model<ICoverDesign> = CoverDesign; // Explicitly cast

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();

  const form = formidable({
    uploadDir: './tmp', // temporary directory to store files
    keepExtensions: true,
    multiples: false,
  });

  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { code, name, priceModifier, groups } = fields;
    const imageFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;

    if (!code || !imageFile) {
      return res.status(400).json({ message: 'Código e imagen son obligatorios.' });
    }

    let imageUrl = '';
    if (imageFile) {
      imageUrl = await uploadFileToS3(imageFile); // Use the original uploadFileToS3
    }

    const newCoverDesign = new CoverDesignModel({
      code: Array.isArray(code) ? code[0] : code,
      name: Array.isArray(name) ? name[0] : name,
      imageUrl,
      priceModifier: priceModifier ? parseFloat(Array.isArray(priceModifier) ? priceModifier[0] : priceModifier) : 0,
      groups: groups ? JSON.parse(Array.isArray(groups) ? groups[0] : groups) : [],
    });

    await newCoverDesign.save();

    res.status(201).json({ message: 'Diseño de tapa creado con éxito', coverDesign: newCoverDesign });
  } catch (error: any) {
    console.error('Error creating cover design:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
