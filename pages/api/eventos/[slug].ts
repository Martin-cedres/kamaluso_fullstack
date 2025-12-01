import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import EventPage from '../../../models/EventPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ message: 'Slug inválido.' });
    }

    try {
        await connectDB();

        const eventPage = await EventPage.findOne({ slug, status: 'published' })
            .populate('selectedProducts', 'nombre slug imageUrl basePrice descripcion categoria alt images');

        if (!eventPage) {
            return res.status(404).json({ message: 'Event Page no encontrada' });
        }

        res.status(200).json(eventPage);

    } catch (error: any) {
        console.error('Error fetching event page:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
