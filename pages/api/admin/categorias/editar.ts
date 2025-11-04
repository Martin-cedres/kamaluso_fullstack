import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { withAuth } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Category from '../../../../models/Category';
import { uploadFileToS3 } from '../../../../lib/s3-upload';
import os from 'os';
import { ObjectId } from 'mongodb';
import { revalidateCategoryPaths } from '../../../../lib/utils'; // Importar la función de revalidación
import mongoose from 'mongoose';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
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
        const { id, nombre, slug, descripcion, parent } = fields;

        if (!id || !ObjectId.isValid(String(id))) {
          res.status(400).json({ error: 'ID de categoría inválido.' });
          return reject(new Error('ID de categoría inválido'));
        }

        const updateData: any = {
          nombre: String(nombre),
          slug: String(slug),
          descripcion: String(descripcion),
        };

        const parentId = Array.isArray(parent) ? parent[0] : parent;
        if (parentId && mongoose.Types.ObjectId.isValid(String(parentId))) {
          updateData.parent = new mongoose.Types.ObjectId(String(parentId));
        } else {
          updateData.parent = null;
        }

        const imageFileArray = files.imagen as formidable.File[];
        const imageFile = imageFileArray && imageFileArray.length > 0 ? imageFileArray[0] : null;

        if (imageFile) {
          const imageUrl = await uploadFileToS3(imageFile);
          updateData.imagen = imageUrl;
        }

        const updatedCategory = await Category.findByIdAndUpdate(String(id), updateData, { new: true });

        if (!updatedCategory) {
          res.status(404).json({ error: 'Categoría no encontrada.' });
          return reject(new Error('Categoría no encontrada'));
        }

        await revalidateCategoryPaths(updatedCategory.slug, updatedCategory.parent?.toString());

        res.status(200).json({ success: true, message: 'Categoría actualizada con éxito', data: updatedCategory });
        resolve();

      } catch (error: any) {
        if (error.code === 11000) {
          res.status(409).json({ error: 'Ya existe una categoría con ese nombre o slug.' });
        } else {
          console.error('[UPDATE CATEGORY ERROR]:', error);
          res.status(500).json({ error: 'Error interno al actualizar la categoría' });
        }
        reject(error);
      }
    });
  });
};

export default withAuth(handler);
