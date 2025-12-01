import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import EventPage from '../../../../models/EventPage';
import '../../../../models/Product'; // Ensure Product model is registered

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID inválido.' });
    }

    try {
        await connectDB();

        if (req.method === 'GET') {
            const eventPage = await EventPage.findById(id).populate('selectedProducts', 'nombre slug imageUrl basePrice');
            if (!eventPage) {
                return res.status(404).json({ message: 'Event Page no encontrada.' });
            }
            return res.status(200).json(eventPage);
        }

        if (req.method === 'PUT') {
            const updates = req.body;
            const eventPage = await EventPage.findByIdAndUpdate(id, updates, { new: true });
            if (!eventPage) {
                return res.status(404).json({ message: 'Event Page no encontrada.' });
            }
            return res.status(200).json({ message: 'Event Page actualizada', eventPage });
        }

        if (req.method === 'DELETE') {
            const eventPage = await EventPage.findByIdAndDelete(id);
            if (!eventPage) {
                return res.status(404).json({ message: 'Event Page no encontrada.' });
            }
            return res.status(200).json({ message: 'Event Page eliminada' });
        }

        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });

    } catch (error: any) {
        console.error('Error in event page operation:', error);
        res.status(500).json({ message: `Error interno: ${error.message}`, error: error.message });
    }
}
