// pages/api/products/image.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
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
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files: any) => {
    if (err) {
      console.error('Error parseando archivos:', err);
      return res.status(500).json({ error: 'Error parseando archivos' });
    }

    try {
      const uploadedUrls: string[] = [];

      // Unificar el manejo de archivos únicos y múltiples en un solo array
      const fileArray: formidable.File[] = [];
      if (files.images) {
        // Si 'images' es un array, lo concatena, si no, lo mete en un array
        Array.isArray(files.images)
          ? fileArray.push(...files.images)
          : fileArray.push(files.images);
      }
      // Añadir 'image' (imagen principal) si existe, al principio del array
      if (files.image) {
        fileArray.unshift(files.image);
      }

      if (fileArray.length === 0) {
        return res.status(400).json({ error: 'No se subieron imágenes' });
      }

      // Iterar y subir cada archivo usando la función centralizada
      for (const file of fileArray) {
        // Asegurarse de que el archivo no está vacío y tiene un filepath
        if (file.size > 0 && file.filepath) {
          const url = await uploadFileToS3(file);
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
