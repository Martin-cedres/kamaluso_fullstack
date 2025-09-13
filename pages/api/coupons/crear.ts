import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongoose';
import Coupon from '@/models/Coupon';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const { code, discountType, value, expirationDate, maxUses, applicableTo, applicableItems, minPurchaseAmount } = req.body;

      const newCoupon = new Coupon({
        code,
        discountType,
        value,
        expirationDate,
        maxUses,
        applicableTo,
        applicableItems: applicableItems || [],
        minPurchaseAmount: minPurchaseAmount || 0,
      });

      await newCoupon.save();
      res.status(201).json({ message: 'Cupón creado con éxito', coupon: newCoupon });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'El código de cupón ya existe.' });
      } else {
        res.status(500).json({ message: 'Error al crear el cupón', error: error.message });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
