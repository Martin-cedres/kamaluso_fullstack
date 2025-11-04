import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { withAuth } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Category from '../../../../models/Category';
import { uploadFileToS3 } from '../../../../lib/s3-upload';
import os from 'os';
import { revalidateCategoryPaths } from '../../../../lib/utils'; // Importar la función de revalidación
import mongoose from 'mongoose';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectDB();

  await new Promise<void>((resolve, reject) => {
    const form = formidable({ multiples: false, uploadDir: os.tmpdir() });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'Error processing form', details: String(err) });
        return reject(err);
      }

      try {
        const { nombre, slug, descripcion, parent } = fields;

        if (!nombre || !slug || !descripcion) {
          res.status(400).json({ error: 'Nombre, slug y descripción son obligatorios.' });
          return reject(new Error('Campos obligatorios faltantes'));
        }

        const newCategory: any = {
          nombre: String(nombre),
          slug: String(slug),
          descripcion: String(descripcion),
        };

        const parentId = Array.isArray(parent) ? parent[0] : parent;

        if (parentId && mongoose.Types.ObjectId.isValid(String(parentId))) {
          newCategory.parent = new mongoose.Types.ObjectId(String(parentId));
        } else {
          newCategory.parent = null;
        }

        const imageFileArray = files.imagen as formidable.File[];
        const imageFile = imageFileArray && imageFileArray.length > 0 ? imageFileArray[0] : null;

        if (imageFile) {
          const imageUrl = await uploadFileToS3(imageFile);
          newCategory.imagen = imageUrl;
        }

        const category = new Category(newCategory);
        await category.save();

        await revalidateCategoryPaths(newCategory.slug, newCategory.parent);

        res.status(201).json({ success: true, message: 'Categoría creada con éxito', data: category });
        resolve();

      } catch (error: any) {
        if (error.code === 11000) {
          res.status(409).json({ error: 'Ya existe una categoría con ese nombre o slug.' });
        } else {
          console.error('[CREATE CATEGORY ERROR]:', error);
          res.status(500).json({ error: 'Error interno al crear la categoría' });
        }
        reject(error);
      }
    });
  });
};

export default withAuth(handler);
