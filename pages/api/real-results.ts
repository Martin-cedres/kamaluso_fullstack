import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongoose';
import RealResult from '../../models/RealResult';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            // Only return active results
            const results = await RealResult.find({ active: true }).sort({ date: -1 });
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los resultados' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
