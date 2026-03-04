import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { id } = req.query

    if (req.method === 'GET') {
        try {
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ message: 'Order ID is required' })
            }

            const client = await clientPromise
            const db = client.db()
            const ordersCollection = db.collection('orders')

            const order = await ordersCollection.findOne({ _id: new ObjectId(id) })

            if (!order) {
                return res.status(404).json({ message: 'Order not found' })
            }

            // Devolver solo lo necesario para Google Customer Reviews por seguridad
            res.status(200).json({
                orderId: order._id.toString(),
                email: order.email,
                createdAt: order.createdAt,
                items: order.items?.map((item: any) => ({
                    gtin: item.gtin || '', // Si hay GTIN, mejor
                    nombre: item.nombre
                })) || []
            })
        } catch (error) {
            console.error('Error fetching order details:', error)
            res.status(500).json({ message: 'Internal Server Error' })
        }
    } else {
        res.setHeader('Allow', ['GET'])
        res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }
}
