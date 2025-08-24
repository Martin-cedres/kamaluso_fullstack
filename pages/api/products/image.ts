import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Falta la key de la imagen o es inválida' });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key.trim(),
    });
    const data = await s3.send(command);

    res.setHeader('Content-Type', data.ContentType || 'image/webp');

    if (!data.Body) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    if (data.Body instanceof Readable) {
      data.Body.pipe(res);
    } else {
      const chunks: any[] = [];
      for await (const chunk of data.Body as any) {
        chunks.push(chunk);
      }
      res.end(Buffer.concat(chunks));
    }
  } catch (err: any) {
    console.error('Error al obtener la imagen:', err);
    res.status(404).json({ error: 'Imagen no encontrada', detalles: err.message || String(err) });
  }
}

