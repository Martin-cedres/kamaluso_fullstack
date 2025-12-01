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

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const {
        title,
        slug,
        eventType,
        eventDate,
        content,
        seoTitle,
        seoDescription,
        seoKeywords,
        heroImage,
        selectedProducts,
        status
    } = req.body;

    if (!title || !slug || !eventType || !eventDate || !selectedProducts) {
        return res.status(400).json({ message: 'Faltan campos requeridos: title, slug, eventType, eventDate, selectedProducts' });
    }

    try {
        await connectDB();

        // Verificar que el slug no exista
        const existing = await EventPage.findOne({ slug });
        if (existing) {
            return res.status(400).json({ message: 'El slug ya existe. Elige otro.' });
        }

        const newEventPage = await EventPage.create({
            title,
            slug,
            eventType,
            eventDate,
            content: content || '',
            seoTitle,
            seoDescription,
            seoKeywords,
            heroImage,
            selectedProducts,
            status: status || 'draft',
            autoRefresh: true,
        });

        res.status(201).json({ message: 'Event Page creada', eventPage: newEventPage });

    } catch (error: any) {
        console.error('Error creating event page:', error);
        res.status(500).json({ message: `Error interno: ${error.message}`, error: error.message });
    }
}
