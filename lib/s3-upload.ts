import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Inicializar cliente S3
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (file: formidable.File) => {
  if (!file || !file.filepath) throw new Error("Archivo inválido para S3");

  const originalFilename = file.originalFilename || "unknown-file";
  const extension = path.extname(originalFilename);
  const baseKey = uuidv4();

  const fileBuffer = fs.readFileSync(file.filepath);
  const s3Key = `uploads/${baseKey}${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.mimetype || "application/octet-stream",
      ACL: "public-read", // 🔑 Hacer público
    })
  );

  try { fs.unlinkSync(file.filepath); } catch (e) { console.error(e); }

  // URL pública del archivo subido
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${baseKey}${extension}`;
};
