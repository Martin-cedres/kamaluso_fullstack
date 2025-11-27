/**
 * Endpoint temporal para diagnosticar problemas con imágenes en PDFs
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import dbConnect from '../../../../../lib/mongoose';
import { Quote } from '../../../../../models/Quote';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    await dbConnect();

    try {
        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ message: 'Presupuesto no encontrado' });
        }

        // Diagnóstico de imágenes
        const imagesDiagnostic = quote.items.map((item: any, index: number) => ({
            index,
            productName: item.productName,
            imageUrl: item.imageUrl,
            hasImage: !!item.imageUrl,
            imageType: item.imageUrl ?
                (item.imageUrl.startsWith('http') ? 'absolute' :
                    item.imageUrl.startsWith('/') ? 'relative' : 'unknown') : 'none',
        }));

        res.status(200).json({
            quoteId: quote._id,
            quoteNumber: quote.quoteNumber,
            itemsCount: quote.items.length,
            images: imagesDiagnostic,
        });
    } catch (error) {
        console.error('Error diagnosing images:', error);
        res.status(500).json({ message: 'Error al diagnosticar imágenes' });
    }
}
