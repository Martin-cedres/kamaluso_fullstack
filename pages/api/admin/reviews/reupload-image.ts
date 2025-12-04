import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import formidable from 'formidable';
import { isAdmin } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Review from '../../../../models/Review';
import { uploadFileToS3 } from '../../../../lib/s3-upload';

export const config = {
    api: {
        bodyParser: false,
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !isAdmin(token)) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere ser administrador.' });
    }

    try {
        await connectDB();

        const form = formidable();

        const [fields, files] = await form.parse(req);

        const reviewId = fields.reviewId?.[0];
        const file = files.image?.[0];

        if (!reviewId) {
            return res.status(400).json({ error: 'Se requiere reviewId' });
        }

        if (!file) {
            return res.status(400).json({ error: 'Se requiere un archivo de imagen' });
        }

        console.log(`🔄 Re-subiendo imagen para review ${reviewId}...`);

        // Upload to S3 and wait for Lambda processing
        // This function handles the upload to uploads/ and waits for processed/ to appear
        const imageUrl = await uploadFileToS3(file);

        console.log(`✅ Imagen procesada: ${imageUrl}`);

        // Update the review with the new image URL
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { imageUrl },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }

        res.status(200).json({
            message: 'Imagen actualizada correctamente',
            review: updatedReview,
            imageUrl
        });

    } catch (error) {
        console.error('Error re-uploading review image:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error });
    }
};

export default handler;
