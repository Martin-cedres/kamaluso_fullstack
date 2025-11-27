import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/mongoose';
import { Quote } from '../../../../models/Quote';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const { status, search } = req.query;
            const query: any = {};

            if (status && status !== 'all') {
                query.status = status;
            }

            if (search) {
                query.$or = [
                    { quoteNumber: { $regex: search, $options: 'i' } },
                    { 'customer.name': { $regex: search, $options: 'i' } },
                    { 'customer.email': { $regex: search, $options: 'i' } },
                    { 'customer.company': { $regex: search, $options: 'i' } },
                ];
            }

            const quotes = await Quote.find(query).sort({ createdAt: -1 });
            res.status(200).json(quotes);
        } catch (error) {
            console.error('Error fetching quotes:', error);
            res.status(500).json({ message: 'Error al obtener presupuestos' });
        }
    } else if (req.method === 'POST') {
        try {
            // Generate quote number (e.g., PRE-2024-001)
            const year = new Date().getFullYear();
            const count = await Quote.countDocuments({
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lt: new Date(`${year + 1}-01-01`),
                },
            });
            const quoteNumber = `PRE-${year}-${String(count + 1).padStart(3, '0')}`;

            const newQuote = await Quote.create({
                ...req.body,
                quoteNumber,
                createdBy: session.user.email,
                status: 'draft',
            });

            res.status(201).json(newQuote);
        } catch (error) {
            console.error('Error creating quote:', error);
            res.status(500).json({ message: 'Error al crear presupuesto' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
