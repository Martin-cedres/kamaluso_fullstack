import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/mongoose';
import { Quote } from '../../../../models/Quote';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const quote = await Quote.findById(id);
            if (!quote) {
                return res.status(404).json({ message: 'Presupuesto no encontrado' });
            }
            res.status(200).json(quote);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener presupuesto' });
        }
    } else if (req.method === 'PUT') {
        try {
            const updatedQuote = await Quote.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!updatedQuote) {
                return res.status(404).json({ message: 'Presupuesto no encontrado' });
            }
            res.status(200).json(updatedQuote);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar presupuesto' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const deletedQuote = await Quote.findByIdAndDelete(id);
            if (!deletedQuote) {
                return res.status(404).json({ message: 'Presupuesto no encontrado' });
            }
            res.status(200).json({ message: 'Presupuesto eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar presupuesto' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
