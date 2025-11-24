import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({});

const SIZES = [400, 800, 1200];

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const sizeFile = event.Records[0].s3.object.size;

  // Ignorar carpetas, archivos vacíos o archivos fuera de uploads/
  if (key.endsWith("/") || sizeFile === 0 || !key.startsWith("uploads/")) {
    return { statusCode: 200, body: "Ignorado" };
  }

  const filename = key.split("/").pop()?.split(".").slice(0, -1).join(".") || "unknown";

  try {
    const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const imageBuffer = await streamToBuffer(Body);

    await Promise.all(
      SIZES.map(async (width) => {
        const newKey = `processed/${filename}-${width}w.webp`;
        const resizedBuffer = await sharp(imageBuffer)
          .resize({ width })
          .webp({ quality: 80 })
          .toBuffer();

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: newKey,
            Body: resizedBuffer,
            ContentType: "image/webp",
            // ACL ELIMINADO: La Bucket Policy se encarga de hacerlo público
          })
        );
      })
    );

    return { statusCode: 200, body: "Procesamiento completado." };
  } catch (error) {
    console.error("Error procesando la imagen:", error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};