import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import SeoStrategy from '../../../../models/SeoStrategy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        await connectDB();
        const strategies = await SeoStrategy.find().sort({ createdAt: -1 });
        res.status(200).json(strategies);
    } catch (error: any) {
        console.error('Error listando estrategias:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
