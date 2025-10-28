import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadFileToS3, deleteFileFromS3 } from '../../../../lib/s3-upload';
import connectDB from '../../../../lib/mongoose';
import CoverDesign, { ICoverDesign } from '../../../../models/CoverDesign'; // Direct import
import { Model } from 'mongoose'; // Import Model
import mongoose from 'mongoose';

const CoverDesignModel: Model<ICoverDesign> = CoverDesign; // Explicitly cast

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { id, code, name, priceModifier, imageUrl: existingImageUrlField, groups } = fields;
    const imageFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;

    if (!id || !code) {
      return res.status(400).json({ message: 'ID y código son obligatorios para actualizar.' });
    }

    const coverDesign = await CoverDesignModel.findById(id);
    if (!coverDesign) {
      return res.status(404).json({ message: 'Diseño de tapa no encontrado.' });
    }

    let finalImageUrl = coverDesign.imageUrl; // Default to current image URL

    if (imageFile) {
      // New image uploaded, delete old one and upload new
      if (coverDesign.imageUrl) {
        await deleteFileFromS3(coverDesign.imageUrl);
      }
      finalImageUrl = await uploadFileToS3(imageFile);
    } else if (existingImageUrlField && Array.isArray(existingImageUrlField) && existingImageUrlField[0] === '') {
      // Existing image was explicitly removed (imageUrl field sent as empty string)
      if (coverDesign.imageUrl) {
        await deleteFileFromS3(coverDesign.imageUrl);
      }
      finalImageUrl = '';
    }
    else if (existingImageUrlField && Array.isArray(existingImageUrlField) && existingImageUrlField[0]) {
      // Existing image is kept
      finalImageUrl = existingImageUrlField[0];
    }

    coverDesign.code = Array.isArray(code) ? code[0] : code;
    coverDesign.name = Array.isArray(name) ? name[0] : name;
    coverDesign.imageUrl = finalImageUrl;
    coverDesign.priceModifier = priceModifier ? parseFloat(Array.isArray(priceModifier) ? priceModifier[0] : priceModifier) : 0;
    coverDesign.groups = groups ? JSON.parse(Array.isArray(groups) ? groups[0] : groups) : [];

    await coverDesign.save();

    res.status(200).json({ message: 'Diseño de tapa actualizado con éxito', coverDesign });
  } catch (error: any) {
    console.error('Error updating cover design:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}

