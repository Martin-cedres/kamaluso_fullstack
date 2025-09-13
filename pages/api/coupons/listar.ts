import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongoose';
import Coupon from '@/models/Coupon';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const coupons = await Coupon.find({});
      res.status(200).json(coupons);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar cupones', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
