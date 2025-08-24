import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { requireAuth } from '../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { ObjectId } from 'mongodb';

export const config = { api: { bodyParser: false } };

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadFileToS3 = async (file: formidable.File) => {
  const buffer = fs.readFileSync(file.filepath);
  const ext = path.extname(file.originalFilename || '');
  const key = `productos/${uuidv4()}${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    })
  );
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Método no permitido' });

  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'Error al procesar formulario', detalles: err.message });

    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Falta el ID del producto' });

      const client = await clientPromise;
      const db = client.db('kamaluso');
      const productsCollection = db.collection('products');
      const objectId = new ObjectId(id);

      const existingProduct = await productsCollection.findOne({ _id: objectId });
      if (!existingProduct) return res.status(404).json({ error: 'Producto no encontrado' });

      // Imagen principal
      let imagen = existingProduct.imagen;
      if (files.image) imagen = await uploadFileToS3(Array.isArray(files.image) ? files.image[0] : files.image);

      // Imágenes secundarias
      let images = existingProduct.images || [];
      if (files.images) {
        const filesArray = Array.isArray(files.images) ? files.images : [files.images];
        images = await Promise.all(filesArray.map(f => uploadFileToS3(f as formidable.File)));
      }

      const destacado = fields.destacado === 'true' ? true : fields.destacado === 'false' ? false : existingProduct.destacado || false;

      const updatedProduct: any = {
        nombre: fields.nombre || existingProduct.nombre,
        slug: fields.slug || existingProduct.slug,
        descripcion: fields.descripcion || existingProduct.descripcion,
        categoria: fields.categoria || existingProduct.categoria,
        precio: parseFloat(fields.precio as string) || existingProduct.precio || 0,
        precioFlex: parseFloat(fields.precioFlex as string) || existingProduct.precioFlex || 0,
        precioDura: parseFloat(fields.precioDura as string) || existingProduct.precioDura || 0,
        tapa: fields.tapa || existingProduct.tapa || 'flex',
        seoTitle: fields.seoTitle || existingProduct.seoTitle || '',
        seoDescription: fields.seoDescription || existingProduct.seoDescription || '',
        seoKeywords: fields.seoKeywords || existingProduct.seoKeywords || '',
        alt: fields.alt || existingProduct.alt || '',
        notes: fields.notes || existingProduct.notes || '',
        status: fields.status || existingProduct.status || 'activo',
        destacado,
        imagen,
        images,
        actualizadoEn: new Date(),
      };

      await productsCollection.updateOne({ _id: objectId }, { $set: updatedProduct });

      res.status(200).json({ ok: true, mensaje: 'Producto actualizado correctamente', imagen, images });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ error: 'Error interno al actualizar producto' });
    }
  });
};

export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}
