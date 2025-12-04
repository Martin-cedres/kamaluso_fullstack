const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const SIZES = [480, 800, 1200, 1920];

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

async function repairImages() {
    console.log('🚀 Iniciando reparación de imágenes...');

    try {
        // 1. Listar todas las imágenes en processed/
        let continuationToken = undefined;
        const processedImages = new Set();
        const baseImages = [];

        do {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: 'processed/',
                ContinuationToken: continuationToken,
            });
            const response = await s3Client.send(command);

            if (response.Contents) {
                response.Contents.forEach(item => {
                    processedImages.add(item.Key);
                    // Identificar imágenes base (las que no tienen -XXXw.webp)
                    if (item.Key.endsWith('.webp') && !/-\d+w\.webp$/.test(item.Key)) {
                        baseImages.push(item.Key);
                    }
                });
            }
            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        console.log(`📦 Total de imágenes procesadas encontradas: ${processedImages.size}`);
        console.log(`🖼️ Total de imágenes base encontradas: ${baseImages.length}`);

        // 2. Verificar qué resoluciones faltan para cada imagen base
        for (const baseKey of baseImages) {
            const filename = baseKey.replace('processed/', '').replace('.webp', '');
            const missingSizes = [];

            for (const size of SIZES) {
                const expectedKey = `processed/${filename}-${size}w.webp`;
                if (!processedImages.has(expectedKey)) {
                    missingSizes.push(size);
                }
            }

            if (missingSizes.length > 0) {
                console.log(`⚠️ Faltan resoluciones para ${filename}: ${missingSizes.join(', ')}w`);

                // 3. Generar las resoluciones faltantes
                console.log(`⬇️ Descargando base: ${baseKey}`);
                const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: baseKey }));
                const imageBuffer = await streamToBuffer(Body);

                for (const size of missingSizes) {
                    const newKey = `processed/${filename}-${size}w.webp`;
                    console.log(`⚙️ Generando ${newKey}...`);

                    const resizedBuffer = await sharp(imageBuffer)
                        .resize({
                            width: size,
                            withoutEnlargement: true, // Importante: no upscalear realmente, pero guardar con el nombre esperado
                            fit: 'inside'
                        })
                        .webp({ quality: 80 })
                        .toBuffer();

                    await s3Client.send(new PutObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: newKey,
                        Body: resizedBuffer,
                        ContentType: "image/webp",
                    }));
                    console.log(`✅ Generado: ${newKey}`);
                }
            }
        }

        console.log('🎉 Reparación completada.');

    } catch (error) {
        console.error('❌ Error en la reparación:', error);
    }
}

repairImages();
