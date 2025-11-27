import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import dbConnect from '../../../../../lib/mongoose';
import { Quote } from '../../../../../models/Quote';
import { generateQuotePDF } from '../../../../../lib/pdf/generateQuotePDF';

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

        // Generar PDF en memoria
        const pdfBuffer = await generateQuotePDF(quote);

        // Enviar PDF como descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Presupuesto-${quote.quoteNumber}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF preview:', error);
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
}
