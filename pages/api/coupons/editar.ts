import { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/mongoose'
import Coupon from '@/models/Coupon'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectDB()

  if (req.method === 'PUT') {
    try {
      const { code, applicableItems, ...updateData } = req.body

      if (!code) {
        return res
          .status(400)
          .json({
            message: 'El código del cupón es requerido para la edición.',
          })
      }

      const updatedCoupon = await Coupon.findOneAndUpdate(
        { code: code },
        { ...updateData, applicableItems },
        { new: true },
      )

      if (!updatedCoupon) {
        return res.status(404).json({ message: 'Cupón no encontrado.' })
      }

      res
        .status(200)
        .json({ message: 'Cupón actualizado con éxito', coupon: updatedCoupon })
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error al actualizar el cupón', error: error.message })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
