import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import formidable from 'formidable';
import os from 'os';
import connectDB from '../../../lib/mongoose';
import Review from '../../../models/Review';
import Product from '../../../models/Product';
import mongoose from 'mongoose';
import { uploadFileToS3 } from '../../../lib/s3-upload';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id || !token.name) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const form = formidable({ multiples: false, uploadDir: os.tmpdir() });

  form.parse(req, async (err, fields, files) => {
    try { // Bloque try-catch principal para atrapar todos los errores
      if (err) {
        throw new Error(`Error de Formidable: ${err.message}`);
      }

      // Debugging: Log the entire files object
      // console.log("Objeto 'files' recibido por la API:", JSON.stringify(files, null, 2));

      const productIdValue = fields.productId;
      const productId = Array.isArray(productIdValue) ? productIdValue[0] : productIdValue;

      const ratingValue = fields.rating;
      const rating = Array.isArray(ratingValue) ? ratingValue[0] : ratingValue;

      const commentValue = fields.comment;
      const comment = Array.isArray(commentValue) ? commentValue[0] : commentValue;

      if (!productId || !rating || !comment) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: productId, rating o comment.' });
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: `ID de producto inválido: ${productId}` });
      }

      await connectDB();

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const existingReview = await Review.findOne({ product: productId, 'user.id': token.id });
      if (existingReview) {
        return res.status(409).json({ error: 'Ya has comentado este producto' });
      }

      let imageUrl: string | undefined = undefined;
      const imageFiles = files.image; // This can be an array or a single file
      const imageFile = Array.isArray(imageFiles) ? imageFiles[0] : imageFiles;

      if (imageFile && imageFile.size > 0) { // Check if the file exists and is not empty
        imageUrl = await uploadFileToS3(imageFile, 'reviews');
      }

      const newReview = new Review({
        product: productId,
        user: { id: token.id, name: token.name, image: token.picture },
        rating: Number(rating),
        comment: String(comment),
        imageUrl: imageUrl,
      });

      await newReview.save();

      res.status(201).json({ message: '¡Gracias por tu comentario! Estará visible pronto, una vez que sea aprobado.' });

    } catch (error: any) {
      console.error('Error al crear el comentario:', error);
      // Enviar el error detallado al cliente para depuración
      res.status(500).json({
        error: 'Error interno del servidor.',
        debug: `Error: ${error.message}, Files: ${JSON.stringify(files, null, 2)}`
      });
    }
  });
};

export default handler;