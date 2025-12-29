import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const products = await db.collection('products')
            .find({
                nombre: { $regex: q, $options: 'i' }
            })
            .limit(10)
            .project({ nombre: 1, precio: 1, _id: 1 })
            .toArray();

        res.status(200).json(products);
    } catch (error: any) {
        console.error('[SEARCH PRODUCTS ERROR]', error);
        res.status(500).json({ message: 'Error searching products' });
    }
}
