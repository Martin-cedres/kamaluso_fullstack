import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({});

const SIZES = [480, 800, 1200, 1920]; // Optimizado para móvil HD, tablet, laptop, desktop HD

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

  console.log(`📥 Lambda disparada para: ${key} (${sizeFile} bytes)`);

  // Ignorar carpetas, archivos vacíos o archivos fuera de uploads/
  if (key.endsWith("/") || sizeFile === 0 || !key.startsWith("uploads/")) {
    console.log(`⏭️ Ignorando archivo: ${key}`);
    return { statusCode: 200, body: "Ignorado" };
  }

  const filename = key.split("/").pop()?.split(".").slice(0, -1).join(".") || "unknown";
  console.log(`🔄 Procesando: ${filename}`);

  try {
    const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const imageBuffer = await streamToBuffer(Body);

    // Obtener metadata de la imagen original
    const metadata = await sharp(imageBuffer).metadata();
    const originalWidth = metadata.width || 1200;
    const originalHeight = metadata.height || 1200;

    console.log(`📐 Dimensiones originales: ${originalWidth}x${originalHeight}px`);

    // Generar SIEMPRE todos los tamaños estándar para evitar 404s en el frontend
    // Sharp con withoutEnlargement: true no upscaleará, pero guardaremos el archivo con el nombre esperado (ej: 480w)
    const validSizes = SIZES;

    console.log(`✨ Generando versiones: ${validSizes.join(', ')}px`);

    // Procesar cada tamaño en paralelo
    await Promise.all(
      validSizes.map(async (width) => {
        const newKey = `processed/${filename}-${width}w.webp`;

        try {
          const resizedBuffer = await sharp(imageBuffer)
            .resize({
              width,
              withoutEnlargement: true, // Nunca upscalear
              fit: 'inside'  // Mantener aspect ratio
            })
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

          console.log(`✅ Generado: ${newKey} (${resizedBuffer.length} bytes)`);
        } catch (error) {
          console.error(`❌ Error generando ${width}px:`, error);
          throw error; // Re-lanzar para que falle toda la operación
        }
      })
    );

    // Además, generar una versión "base" sin sufijo de tamaño (será la más grande)
    const largestSize = Math.max(...validSizes);
    const baseKey = `processed/${filename}.webp`;
    const baseBuffer = await sharp(imageBuffer)
      .resize({
        width: largestSize,
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toBuffer();

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: baseKey,
        Body: baseBuffer,
        ContentType: "image/webp",
      })
    );

    console.log(`✅ Generado base: ${baseKey} (${baseBuffer.length} bytes)`);
    console.log(`🎉 Procesamiento completado exitosamente para: ${filename}`);

    // Eliminar el archivo original de uploads/ para ahorrar espacio
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
      console.log(`🗑️ Original eliminado: ${key}`);
    } catch (deleteError) {
      console.warn(`⚠️ No se pudo eliminar el original ${key}:`, deleteError);
      // No fallar la operación completa si solo falla la eliminación
    }

    return { statusCode: 200, body: "Procesamiento completado." };
  } catch (error) {
    console.error("❌ Error procesando la imagen:", error);
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};