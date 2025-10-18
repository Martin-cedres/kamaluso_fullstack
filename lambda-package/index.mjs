// Importar las librerías necesarias
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp"; // Sharp viene de la capa de Lambda que cree

// Inicializar el cliente de S3
const s3Client = new S3Client({});

// Tamaños estándar para las imágenes redimensionadas
const SIZES = [400, 800, 1200];

// Función principal que se ejecuta con el trigger
export const handler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  // Extraer el bucket y la clave (nombre del archivo) del evento de S3
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const size = event.Records[0].s3.object.size;

  // --- NUEVA COMPROBACIÓN ---
  // Ignorar eventos de creación de carpetas o archivos de tamaño cero
  if (key.endsWith("/") || size === 0) {
    console.log(`Clave de objeto '${key}' parece ser una carpeta o un archivo vacío. Ignorando.`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Evento de carpeta o archivo vacío ignorado." }),
    };
  }
  
  // Ignorar archivos que no estén en la carpeta 'uploads/' para evitar bucles
  if (!key.startsWith("uploads/")) {
    console.log(`El archivo ${key} no está en la carpeta 'uploads/'. Ignorando.`);
    return;
  }

  // Extraer el nombre del archivo sin la carpeta 'uploads/' y la extensión
  const filename = key.split("/").pop().split(".").slice(0, -1).join(".");
  
  console.log(`Procesando imagen: ${filename} del bucket: ${bucket}`);

  try {
    // 1. OBTENER LA IMAGEN ORIGINAL DE S3
    const getObjectParams = {
      Bucket: bucket,
      Key: key,
    };
    const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
    const imageBuffer = await Body.transformToByteArray();
    console.log("Imagen original descargada de S3.");

    // 2. PROCESAR Y SUBIR LAS IMÁGENES REDIMENSIONADAS
    // Usamos Promise.all para procesar todos los tamaños en paralelo
    await Promise.all(
      SIZES.map(async (size) => {
        const newKey = `processed/${filename}-${size}w.webp`;
        
        console.log(`Redimensionando a ${size}px de ancho y convirtiendo a WebP...`);
        
        // Usar Sharp para redimensionar, convertir a webp y optimizar
        const resizedImageBuffer = await sharp(imageBuffer)
          .resize({ width: size })
          .webp({ quality: 80 })
          .toBuffer();

        console.log(`Subiendo imagen procesada a S3 en: ${newKey}`);
        
        // Subir la nueva imagen a la carpeta 'processed/'
        const putObjectParams = {
          Bucket: bucket,
          Key: newKey,
          Body: resizedImageBuffer,
          ContentType: "image/webp",
          ACL: "public-read",
        };
        await s3Client.send(new PutObjectCommand(putObjectParams));
      })
    );

    console.log("Todas las versiones de la imagen fueron procesadas y subidas con éxito.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Procesamiento completado exitosamente." }),
    };

  } catch (error) {
    console.error("ERROR al procesar la imagen:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error en el procesamiento.", error: error.message }),
    };
  }
};