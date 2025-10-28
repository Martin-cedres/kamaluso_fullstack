import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads a raw file to the 'uploads/' folder in S3 to trigger the Lambda processor.
 * @param file The formidable file object to upload.
 * @returns The base URL pattern for the processed image.
 */
export const uploadFileToS3 = async (file: formidable.File) => {
  if (!file || !file.filepath) throw new Error('Archivo inválido para S3');

  // Read the raw file from the temporary path
  const fileStream = fs.createReadStream(file.filepath);
  const originalFilename = file.originalFilename || 'unknown-file';
  const extension = path.extname(originalFilename);
  const baseKey = uuidv4(); // Generate a unique ID for the file

  // The key for the raw file in the 'uploads' folder
  const s3Key = `uploads/${baseKey}${extension}`;

  // Upload the raw file to S3, which will trigger our Lambda function
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
      Body: fileStream,
      ContentType: file.mimetype || 'application/octet-stream',
    }),
  );

  // Clean up the temporary file from the server
  try {
    fs.unlinkSync(file.filepath);
  } catch (e) {
    console.error("Error eliminando archivo temporal:", e);
  }

  // The Lambda will create files like 'processed/UUID-400w.webp'.
  // We will save a base URL pattern in the database.
  // The frontend loader will use this pattern to build the full URL for the desired size.
  const finalUrlBase = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/processed/${baseKey}.webp`;

  return finalUrlBase;
};

/**
 * Deletes a file (and its processed variants) from S3.
 * @param imageUrl The full S3 URL or the finalUrlBase pattern of the image to delete.
 */
export const deleteFileFromS3 = async (imageUrl: string) => {
  // Extract the baseKey from the imageUrl (e.g., from '.../processed/UUID.webp' get 'UUID')
  const parts = imageUrl.split('/');
  const filenameWithExtension = parts[parts.length - 1]; // e.g., UUID.webp
  const baseKey = filenameWithExtension.split('.')[0]; // e.g., UUID

  if (!baseKey) {
    console.warn('Could not extract baseKey from imageUrl for deletion:', imageUrl);
    return;
  }

  // List objects in the 'processed/' folder that start with the baseKey
  const listParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Prefix: `processed/${baseKey}`,
  };

  const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

  if (listedObjects.Contents && listedObjects.Contents.length > 0) {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
        Quiet: false,
      },
    };

    await s3.send(new DeleteObjectsCommand(deleteParams));
    console.log(`Deleted ${listedObjects.Contents.length} objects with baseKey: ${baseKey}`);
  } else {
    console.log(`No objects found to delete with baseKey: ${baseKey}`);
  }
};