import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { isAdmin } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Review from '../../../../models/Review';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !isAdmin(token)) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere ser administrador.' });
    }

    try {
        await connectDB();

        // Get all reviews with images
        const reviews = await Review.find({ imageUrl: { $exists: true, $ne: null } })
            .populate('user', 'name')
            .populate('product', 'nombre')
            .sort({ createdAt: -1 })
            .lean();

        const reviewsWithImageInfo = reviews.map((review: any) => {
            const imageUrl = review.imageUrl;

            // Analyze the URL structure
            const urlParts = {
                fullUrl: imageUrl,
                isS3: imageUrl?.includes('s3.sa-east-1.amazonaws.com'),
                isProcessed: imageUrl?.includes('/processed/'),
                isUploads: imageUrl?.includes('/uploads/'),
                hasVariantSuffix: /-\d+w\.webp$/.test(imageUrl || ''),
            };

            return {
                _id: review._id,
                userName: review.user?.name,
                productName: review.product?.nombre,
                imageUrl: imageUrl,
                urlAnalysis: urlParts,
                createdAt: review.createdAt,
            };
        });

        res.status(200).json({
            total: reviewsWithImageInfo.length,
            reviews: reviewsWithImageInfo,
        });

    } catch (error) {
        console.error('Error debugging review images:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error });
    }
};

export default handler;
