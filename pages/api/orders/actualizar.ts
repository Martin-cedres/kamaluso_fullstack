import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const { orderId, ...updateData } = req.body

      if (!orderId) {
        return res.status(400).json({ message: 'orderId is required' })
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Nothing to update' })
      }

      if (!ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid orderId' })
      }

      const client = await clientPromise
      const db = client.db()

      const result = await db
        .collection('orders')
        .updateOne({ _id: new ObjectId(orderId) }, { $set: updateData })

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Order not found' })
      }

      res.status(200).json({ message: 'Order updated successfully' })
    } catch (error) {
      console.error('Error updating order:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}
