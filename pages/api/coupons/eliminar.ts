import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Coupon from '../../../lib/coupon';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'DELETE') {
    try {
      const { code } = req.query; // Expect code in query for DELETE

      if (!code) {
        return res.status(400).json({ message: 'El código del cupón es requerido para la eliminación.' });
      }

      const deletedCoupon = await Coupon.findOneAndDelete({ code: code });

      if (!deletedCoupon) {
        return res.status(404).json({ message: 'Cupón no encontrado.' });
      }

      res.status(200).json({ message: 'Cupón eliminado con éxito', coupon: deletedCoupon });
    } catch (error: any) {
      res.status(500).json({ message: 'Error al eliminar el cupón', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
