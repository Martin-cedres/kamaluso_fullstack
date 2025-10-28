import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.query; // Expecting the full S3 URL as a query parameter

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid image URL.' });
  }

  try {
    // Extract bucket name and key from the S3 URL
    const s3Url = new URL(url);
    const bucketName = process.env.AWS_BUCKET_NAME; // Use env var for bucket name
    let key = s3Url.pathname.substring(1); // Remove leading slash

    // Transform the key to request a sized version, similar to s3-loader
    // Assuming the stored URL is like .../processed/UUID.webp
    // We need to request .../processed/UUID-1200w.webp (or another size)
    if (key.endsWith('.webp') && !/-\d+w\.webp$/.test(key)) {
      const baseUrl = key.slice(0, -5); // Remove ".webp"
      key = `${baseUrl}-1200w.webp`; // Request a large size by default
    }

    if (!bucketName || !key.startsWith('processed/')) {
      return res.status(400).json({ message: 'Invalid S3 URL format or bucket name.' });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const { Body, ContentType, ContentLength } = await s3.send(command);

    if (!Body) {
      return res.status(404).json({ message: 'Image not found in S3.' });
    }

    // Set appropriate headers for image streaming
    res.setHeader('Content-Type', ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', ContentLength || 0);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for a year

    if (Body) {
      // AWS SDK v3 way to get a Web Stream
      const webStream = Body.transformToWebStream();
      // Convert Web Stream to Node.js Readable Stream
      const nodeStream = require('stream').Readable.fromWeb(webStream);
      nodeStream.pipe(res);
    } else {
      return res.status(404).json({ message: 'Image body is empty.' });
    }

  } catch (error: any) {
    console.error('Error proxying image from S3:', error);
    if (error.name === 'NoSuchKey') {
      return res.status(404).json({ message: 'Image not found.' });
    }
    return res.status(500).json({ message: 'Failed to proxy image.', error: error.message });
  }
}
