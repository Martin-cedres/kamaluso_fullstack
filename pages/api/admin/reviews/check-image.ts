import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { S3Client, HeadObjectCommand, CopyObjectCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { isAdmin } from '../../../../lib/auth';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Helper function to convert S3 stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
    if (!stream) {
        throw new Error('Stream is null or undefined');
    }

    // AWS SDK v3 streams can be different types
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !isAdmin(token)) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere ser administrador.' });
    }

    try {
        const { imageUrl } = req.body;

        if (!imageUrl || typeof imageUrl !== 'string') {
            return res.status(400).json({ error: 'Se requiere imageUrl' });
        }

        // Extract the key from the URL
        // Expected format: https://bucket.s3.region.amazonaws.com/processed/uuid.webp
        const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

        if (!imageUrl.startsWith(bucketUrl)) {
            return res.status(400).json({ error: 'URL de imagen inválida' });
        }

        const key = imageUrl.substring(bucketUrl.length);

        // Extract the base key (remove .webp and size suffix if present)
        const baseKey = key.replace(/^processed\//, '').replace(/-\d+w\.webp$/, '').replace(/\.webp$/, '');

        console.log(`🔍 Checking image variants for: ${baseKey}`);

        // Check which WebP variants exist
        const sizes = [480, 800, 1200, 1920];
        const checkResults = await Promise.allSettled(
            sizes.map(async (size) => {
                const variantKey = `processed/${baseKey}-${size}w.webp`;
                try {
                    await s3.send(
                        new HeadObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME!,
                            Key: variantKey,
                        })
                    );
                    return { size, exists: true, key: variantKey };
                } catch (error: any) {
                    if (error.name === 'NotFound') {
                        return { size, exists: false, key: variantKey };
                    }
                    throw error;
                }
            })
        );

        const variants = checkResults.map((result, idx) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return { size: sizes[idx], exists: false, key: `processed/${baseKey}-${sizes[idx]}w.webp`, error: result.reason };
            }
        });

        // Check base WebP
        let baseWebpExists = false;
        try {
            await s3.send(
                new HeadObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `processed/${baseKey}.webp`,
                })
            );
            baseWebpExists = true;
        } catch (error: any) {
            if (error.name !== 'NotFound') {
                console.error('Error checking base WebP:', error);
            }
        }

        const missingVariants = variants.filter(v => !v.exists);

        console.log(`✅ Found ${variants.filter(v => v.exists).length} variants`);
        console.log(`❌ Missing ${missingVariants.length} variants:`, missingVariants.map(v => `${v.size}w`).join(', '));

        // If we have missing variants, try to re-trigger Lambda
        if (missingVariants.length > 0) {

            // Case 1: Base WebP exists - just copy it to uploads/
            if (baseWebpExists) {
                console.log(`🔄 Re-triggering Lambda by copying base WebP to uploads/`);

                const uploadKey = `uploads/${baseKey}.webp`;

                try {
                    await s3.send(
                        new CopyObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME!,
                            CopySource: `${process.env.AWS_BUCKET_NAME}/processed/${baseKey}.webp`,
                            Key: uploadKey,
                        })
                    );

                    console.log(`✅ Copied to uploads/, Lambda should process in 2-16 seconds`);

                    return res.status(200).json({
                        message: 'Lambda re-triggered. Las variantes faltantes deberían generarse en 2-16 segundos.',
                        method: 'copy-base-webp',
                        baseKey,
                        variants,
                        missingVariants,
                        retriggered: true,
                    });
                } catch (error) {
                    console.error('Error re-triggering Lambda:', error);
                    return res.status(500).json({ error: 'Error al re-activar Lambda', details: error });
                }
            }

            // Case 2: Base WebP doesn't exist - download from existing variant and re-upload
            // This handles old images that only have some variants
            console.log(`📥 Base WebP not found. Looking for existing variant to download...`);

            try {
                // Find the largest existing variant to download
                const existingVariant = variants.filter(v => v.exists).sort((a, b) => b.size - a.size)[0];

                if (!existingVariant) {
                    return res.status(400).json({
                        error: 'No se puede re-procesar: no existe ni el base WebP ni ninguna variante',
                        baseKey,
                        variants,
                        missingVariants,
                        retriggered: false,
                    });
                }

                // Download from S3 using the existing variant
                const s3Key = existingVariant.key;

                console.log(`📥 Downloading from S3: ${s3Key} (${existingVariant.size}w - largest existing)`);

                const getObjectResponse = await s3.send(
                    new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME!,
                        Key: s3Key,
                    })
                );

                // Convert stream to buffer
                const buffer = await streamToBuffer(getObjectResponse.Body);

                // Determine content type and extension
                const contentType = getObjectResponse.ContentType || 'image/webp';
                let extension = '.webp';
                if (contentType.includes('png')) extension = '.png';
                else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = '.jpg';

                const uploadKey = `uploads/${baseKey}${extension}`;

                console.log(`📤 Uploading to ${uploadKey} (${buffer.length} bytes)`);

                // Upload to S3 uploads/ folder - this will trigger Lambda
                await s3.send(
                    new PutObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME!,
                        Key: uploadKey,
                        Body: buffer,
                        ContentType: contentType,
                    })
                );

                console.log(`✅ Uploaded to uploads/, Lambda should process in 2-16 seconds`);

                return res.status(200).json({
                    message: 'Imagen re-subida. Lambda generará todas las variantes en 2-16 segundos.',
                    method: 'download-and-reupload',
                    sourceVariant: `${existingVariant.size}w`,
                    baseKey,
                    variants,
                    missingVariants,
                    retriggered: true,
                });

            } catch (error) {
                console.error('Error downloading and re-uploading image:', error);
                return res.status(500).json({
                    error: 'No se pudo descargar y re-subir la imagen',
                    details: error,
                    suggestion: 'Intenta re-subir la imagen manualmente desde el panel de administración'
                });
            }
        }

        res.status(200).json({
            message: 'Todas las variantes existen',
            baseKey,
            variants,
            missingVariants,
            baseWebpExists,
            retriggered: false,
        });

    } catch (error) {
        console.error('Error checking image variants:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error });
    }
};

export default handler;
