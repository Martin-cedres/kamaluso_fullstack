import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const searchQuery = req.query.search as string;
      const skip = (page - 1) * limit;

      const query: any = {};
      if (status) {
        query.status = status;
      }
      if (searchQuery) {
        query.$or = [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      const client = await clientPromise;
      const db = client.db();
      const ordersCollection = db.collection('orders');

      const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
      const totalCount = await ordersCollection.countDocuments(query);

      res.status(200).json({
        orders,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
