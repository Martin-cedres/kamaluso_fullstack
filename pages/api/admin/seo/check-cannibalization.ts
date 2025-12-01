import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import SeoStrategy from '../../../../models/SeoStrategy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ message: 'Se requiere un tema (topic) para verificar.' });
    }

    try {
        await connectDB();

        const conflicts: string[] = [];
        const normalizedTopic = topic.toLowerCase().trim();

        // 1. Verificar contra Páginas Pilares publicadas
        const existingPillars = await PillarPage.find({ status: 'published' }, 'topic title slug');

        existingPillars.forEach(p => {
            const pTopic = p.topic.toLowerCase();
            const pTitle = p.title.toLowerCase();

            // Coincidencia exacta o parcial fuerte
            if (pTopic === normalizedTopic || pTopic.includes(normalizedTopic) || normalizedTopic.includes(pTopic)) {
                conflicts.push(`Página Pilar existente: "${p.title}" (${p.slug})`);
            }
            // Coincidencia en título
            else if (pTitle.includes(normalizedTopic)) {
                conflicts.push(`Página Pilar existente (por título): "${p.title}"`);
            }
        });

        // 2. Verificar contra otras Estrategias Aprobadas/Generadas (pero no la misma si se pasara ID)
        // Por simplicidad, verificamos todas las 'generated' o 'approved'
        const existingStrategies = await SeoStrategy.find({
            status: { $in: ['approved', 'generated'] }
        }, 'topic');

        existingStrategies.forEach(s => {
            const sTopic = s.topic.toLowerCase();
            if (sTopic === normalizedTopic || sTopic.includes(normalizedTopic) || normalizedTopic.includes(sTopic)) {
                conflicts.push(`Estrategia ya aprobada: "${s.topic}"`);
            }
        });

        res.status(200).json({
            hasConflict: conflicts.length > 0,
            conflicts
        });

    } catch (error: any) {
        console.error('Error checking cannibalization:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
