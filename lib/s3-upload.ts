import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
      // ACL removido - la Bucket Policy maneja el acceso público
    })
  );

  try { fs.unlinkSync(file.filepath); } catch (e) { console.error(e); }

  // URL pública del archivo subido
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${baseKey}${extension}`;
};

export const deleteFileFromS3 = async (fileUrl: string) => {
  if (!fileUrl) throw new Error("URL de archivo inválida para eliminar de S3.");

  const bucketName = process.env.AWS_BUCKET_NAME!;
  const region = process.env.AWS_REGION!;

  // Extraer la clave S3 de la URL
  // Asume el formato: https://<bucket-name>.s3.<region>.amazonaws.com/uploads/...
  const s3Prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  if (!fileUrl.startsWith(s3Prefix)) {
    // Si la URL no tiene el prefijo S3 esperado, puede ser una imagen local o un placeholder,
    // en cuyo caso no intentamos eliminarla de S3.
    console.warn(`Attempted to delete a non-S3 URL from S3: ${fileUrl}`);
    return;
  }
  const s3Key = fileUrl.substring(s3Prefix.length);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
  );
};
