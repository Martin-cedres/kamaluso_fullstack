import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { uploadFileToS3Original } from '@/lib/s3-upload';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const form = new IncomingForm({
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
        });

        const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image;

        if (!uploadedFile) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        // Validar que sea una imagen
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(uploadedFile.mimetype || '')) {
            return res.status(400).json({ message: 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF)' });
        }

        // Usar la versión original para asegurar compatibilidad con PDF y evitar espera de Lambda
        const imageUrl = await uploadFileToS3Original(uploadedFile);

        res.status(200).json({
            success: true,
            imageUrl,
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error al subir la imagen' });
    }
}
