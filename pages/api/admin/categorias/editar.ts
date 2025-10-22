import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { withAuth } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Category from '../../../../models/Category';
import { uploadFileToS3 } from '../../../../lib/s3-upload';
import os from 'os';
import { ObjectId } from 'mongodb';
import { revalidateCategoryPaths } from '../../../../lib/utils'; // Importar la función de revalidación

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectDB();

  const form = formidable({ multiples: false, uploadDir: os.tmpdir() });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing form', details: String(err) });
    }

    try {
      const { id, nombre, slug, descripcion, parent } = fields;

      if (!id || !ObjectId.isValid(String(id))) {
        return res.status(400).json({ error: 'ID de categoría inválido.' });
      }

      const updateData: any = {
        nombre: String(nombre),
        slug: String(slug),
        descripcion: String(descripcion),
      };

      if (parent && String(parent)) {
        updateData.parent = String(parent);
      } else {
        updateData.parent = null;
      }

      // formidable can return an array of files, even for a single upload. Handle this case.
      const imageFileArray = files.imagen as formidable.File[];
      const imageFile = imageFileArray && imageFileArray.length > 0 ? imageFileArray[0] : null;

      if (imageFile) {
        try {
          const imageUrl = await uploadFileToS3(imageFile);
          updateData.imagen = imageUrl;
        } catch (uploadError: any) {
          console.error('[S3 UPLOAD ERROR]:', uploadError);
          const fileInfo = files.imagen ? JSON.stringify(files.imagen, null, 2) : 'No file object found in request.';
          const errorMessage = `${uploadError.message}. Details: ${fileInfo}`;
          return res.status(500).json({ error: errorMessage });
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(String(id), updateData, { new: true });

      if (!updatedCategory) {
        return res.status(404).json({ error: 'Categoría no encontrada.' });
      }

      // Revalidar las rutas de la categoría
      await revalidateCategoryPaths(updatedCategory.slug, updatedCategory.parent?.toString());

      res.status(200).json({ success: true, message: 'Categoría actualizada con éxito', data: updatedCategory });
    } catch (error: any) {
      if (error.code === 11000) { // Duplicate key error
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre o slug.' });
      }
      console.error('[UPDATE CATEGORY ERROR]:', error);
      res.status(500).json({ error: 'Error interno al actualizar la categoría' });
    }
  });
};

export default withAuth(handler);
