import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongoose';
import RealResult from '../../../../models/RealResult';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const results = await RealResult.find({}).sort({ date: -1 });
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los resultados' });
        }
    } else if (req.method === 'POST') {
        try {
            const newResult = await RealResult.create(req.body);
            res.status(201).json(newResult);
        } catch (error) {
            res.status(400).json({ message: 'Error al crear el resultado', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
