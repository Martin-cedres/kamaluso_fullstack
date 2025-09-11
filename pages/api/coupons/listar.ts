import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Coupon from '../../../lib/coupon';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

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
