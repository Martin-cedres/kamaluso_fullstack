import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongoose';
import RealResult from '../../../../models/RealResult';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    if (!session) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    await dbConnect();

    if (req.method === 'GET') {
        try {
            const result = await RealResult.findById(id);
            if (!result) {
                return res.status(404).json({ message: 'Resultado no encontrado' });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el resultado', error });
        }
    } else if (req.method === 'PUT') {
        try {
            const updatedResult = await RealResult.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!updatedResult) {
                return res.status(404).json({ message: 'Resultado no encontrado' });
            }
            res.status(200).json(updatedResult);
        } catch (error) {
            res.status(400).json({ message: 'Error al actualizar el resultado', error });
        }
    } else if (req.method === 'DELETE') {
        try {
            const deletedResult = await RealResult.findByIdAndDelete(id);
            if (!deletedResult) {
                return res.status(404).json({ message: 'Resultado no encontrado' });
            }
            res.status(200).json({ message: 'Resultado eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el resultado', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
