import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { withAuth } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Category from '../../../../models/Category';
import { uploadFileToS3 } from '../../../../lib/s3-upload';
import os from 'os';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectDB();

  const form = formidable({ multiples: false, uploadDir: os.tmpdir() });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing form', details: String(err) });
    }

    try {
      const { nombre, slug, descripcion } = fields;

      if (!nombre || !slug || !descripcion) {
        return res.status(400).json({ error: 'Nombre, slug y descripción son obligatorios.' });
      }

      const newCategory: any = {
        nombre: String(nombre),
        slug: String(slug),
        descripcion: String(descripcion),
      };

      const imageFile = files.imagen as formidable.File;
      if (imageFile) {
        const imageUrl = await uploadFileToS3(imageFile, 'categorias');
        newCategory.imagen = imageUrl;
      }

      const category = new Category(newCategory);
      await category.save();

      res.status(201).json({ success: true, message: 'Categoría creada con éxito', data: category });
    } catch (error: any) {
      if (error.code === 11000) { // Duplicate key error
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre o slug.' });
      }
      console.error('[CREATE CATEGORY ERROR]:', error);
      res.status(500).json({ error: 'Error interno al crear la categoría' });
    }
  });
};

export default withAuth(handler);
