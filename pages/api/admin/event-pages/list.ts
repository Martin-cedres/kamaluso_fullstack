import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import EventPage from '../../../../models/EventPage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectDB();

        const eventPages = await EventPage.find({})
            .populate('selectedProducts', 'nombre slug imageUrl basePrice')
            .sort({ createdAt: -1 });

        res.status(200).json(eventPages);

    } catch (error: any) {
        console.error('Error fetching event pages:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
