import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import Settings from '../../../models/Settings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    await connectDB();

    // Allow GET requests to be public (for the frontend to read settings)
    if (method === 'GET') {
        let settings = await (Settings as any).findOne({ key: 'global' });
        if (!settings) {
            // Create default if not exists
            settings = await (Settings as any).create({ key: 'global' });
        }
        return res.json(settings);
    }

    // For PUT/POST, require admin
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (method === 'PUT') {
        const { topBar } = req.body;
        const settings = await (Settings as any).findOneAndUpdate(
            { key: 'global' },
            { topBar },
            { new: true, upsert: true }
        );
        return res.json(settings);
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
