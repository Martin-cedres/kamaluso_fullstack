// pages/api/products/image.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import os from 'os';
import { uploadFileToS3 } from '../../../lib/s3-upload'; // Importar la función refactorizada

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Usar formidable para parsear el formulario.
  // La función de S3 se encargará de la ruta temporal y su limpieza.
  const form = formidable({ multiples: true, uploadDir: os.tmpdir() });

  form.parse(req, async (err, fields, files: any) => {
    if (err) {
      console.error('Error parseando archivos:', err);
      return res.status(500).json({ error: 'Error parseando archivos' });
    }

    console.log('[DEBUG] Files received:', Object.keys(files));
    if (files.image) console.log('[DEBUG] files.image type:', Array.isArray(files.image) ? 'Array' : 'Object');

    try {
      const uploadedUrls: string[] = [];

      const fileArray: formidable.File[] = [];
      if (files.images) {
        Array.isArray(files.images)
          ? fileArray.push(...files.images)
          : fileArray.push(files.images);
      }
      if (files.image) {
        Array.isArray(files.image)
          ? fileArray.unshift(...files.image)
          : fileArray.unshift(files.image);
      }

      console.log('[DEBUG] fileArray length:', fileArray.length);

      if (fileArray.length === 0) {
        return res.status(400).json({ error: 'No se subieron imágenes' });
      }

      for (const file of fileArray) {
        if (file.size > 0 && file.filepath) {
          console.log(`[DEBUG] Archivo temporal de Formidable:
            Nombre original: ${file.originalFilename}
            Ruta temporal: ${file.filepath}
            Tamaño: ${file.size} bytes
            Tipo MIME: ${file.mimetype}`);

          const url = await uploadFileToS3(file);
          console.log('[DEBUG] Uploaded URL:', url);
          uploadedUrls.push(url);
        }
      }

      res.status(200).json({ urls: uploadedUrls });
    } catch (uploadError) {
      console.error('Error subiendo archivos a S3:', uploadError);
      res.status(500).json({ error: 'Error subiendo archivos a S3' });
    }
  });
}
