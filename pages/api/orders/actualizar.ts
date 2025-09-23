import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { orderId, status } = req.body

      if (!orderId || !status) {
        return res
          .status(400)
          .json({ message: 'orderId and status are required' })
      }

      if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid orderId' })
      }

      const client = await clientPromise
      const db = client.db()

      const result = await db
        .collection('orders')
        .updateOne({ _id: new ObjectId(orderId) }, { $set: { status: status } })

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: 'Order not found or status not changed' })
      }

      res.status(200).json({ message: 'Order status updated successfully' })
    } catch (error) {
      console.error('Error updating order status:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}
