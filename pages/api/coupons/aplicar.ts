import { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/mongoose'
import { validateAndCalculateDiscount } from '@/lib/couponValidator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await connectDB()

  if (req.method === 'POST') {
    try {
      const { code, cartItems, cartTotal } = req.body

      if (
        !code ||
        !cartItems ||
        !Array.isArray(cartItems) ||
        typeof cartTotal !== 'number'
      ) {
        return res.status(400).json({ message: 'Datos de entrada inválidos.' })
      }

      const result = await validateAndCalculateDiscount(
        code,
        cartItems,
        cartTotal,
      )

      if (!result.success) {
        return res.status(400).json({ message: result.message })
      }

      res.status(200).json(result)
    } catch (error: any) {
      console.error('Error al aplicar cupón:', error)
      res
        .status(500)
        .json({
          message: 'Error interno al aplicar el cupón',
          error: error.message,
        })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
