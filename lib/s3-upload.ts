import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Processes an image file using sharp and uploads it to an S3 bucket.
 * @param file The formidable file object to upload.
 * @param folder The folder within the S3 bucket to upload to (e.g., 'productos', 'reviews').
 * @returns The public URL of the uploaded file.
 */
export const uploadFileToS3 = async (file: formidable.File, folder: string) => {
  if (!file || !file.filepath) throw new Error('Archivo inválido para S3');

  // Process image with sharp
  const processedImageBuffer = await sharp(file.filepath)
    .resize({ width: 1080, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // Generate a unique key for the S3 object
  const key = `${folder}/${uuidv4()}.webp`;

  // Upload the processed image to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: processedImageBuffer,
      ContentType: 'image/webp',
      ACL: 'public-read',
    }),
  );

  // Clean up the temporary file
  try {
    fs.unlinkSync(file.filepath);
  } catch (e) {
    console.error("Error eliminando archivo temporal:", e);
  }

  // Return the public URL
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};