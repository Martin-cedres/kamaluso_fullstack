import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new IncomingForm();
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
    },
  });

  try {
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const uploadedImageUrls: string[] = [];

    if (files.images) {
      const imagesArray = Array.isArray(files.images) ? files.images : [files.images];

      for (const imageFile of imagesArray) {
        const ext = mime.extension(imageFile.mimetype || "");
        const newFileName = Date.now() + ".webp"; // Convert to webp
        const filePath = imageFile.filepath;

        // Convert image to WebP using sharp
        const webpBuffer = await sharp(filePath).webp().toBuffer();

        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: newFileName,
          Body: webpBuffer,
          ACL: "public-read",
          ContentType: "image/webp",
        }));

        uploadedImageUrls.push(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileName}`);
      }
    }

    return res.status(200).json({ urls: uploadedImageUrls });
  } catch (error) {
    console.error("Error uploading review images:", error);
    return res.status(500).json({ message: "Error uploading images", error: String(error) });
  }
}
