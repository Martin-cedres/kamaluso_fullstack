import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { transporter } from '../../../lib/nodemailer'
import { ObjectId } from 'mongodb'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // Check for CRON_SECRET to prevent unauthorized execution
    // In Vercel Cron, the secret is sent as a Bearer token in the Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const client = await clientPromise
        const db = client.db()

        // Define time window: Orders created between 1 hour ago and 24 hours ago
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // Find orders that meet the criteria
        const orders = await db
            .collection('orders')
            .find({
                status: 'pendiente',
                paymentMethod: 'mercado_pago_online',
                createdAt: {
                    $lt: oneHourAgo,
                    $gt: twentyFourHoursAgo,
                },
                recoveryEmailSent: { $ne: true }, // Ensure we haven't sent it already
            })
            .toArray()

        console.log(`[CRON RECOVERY] Found ${orders.length} abandoned orders.`)

        let sentCount = 0
        let errorsCount = 0

        for (const order of orders) {
            if (!order.email) continue

            try {
                const recoveryUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papeleriapersonalizada.uy'}/pagar/${order._id}`
                const customerName = order.name ? order.name.split(' ')[0] : 'Cliente'

                // Email Html
                const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
               <h1 style="color: #db2777;">¡Ups! Olvidaste algo...</h1>
            </div>
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Notamos que dejaste tu pedido pendiente de pago en Kamaluso.</p>
            <p>¡No te preocupes! Guardamos tu carrito para ti.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Total a pagar: $U ${(order.total || 0).toFixed(2)}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${recoveryUrl}" style="background-color: #db2777; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Retomar y Pagar Compra
              </a>
            </div>

            <p style="font-size: 12px; color: #666; text-align: center;">
              Si ya realizaste el pago, por favor ignora este correo o contáctanos si tienes dudas.
            </p>
          </div>
        `

                await transporter.sendMail({
                    from: process.env.EMAIL_SERVER_USER,
                    to: order.email,
                    subject: '¡Tu pedido te espera! 🛒 - Kamaluso',
                    html: htmlContent,
                })

                // Mark as sent in DB
                await db.collection('orders').updateOne(
                    { _id: order._id },
                    { $set: { recoveryEmailSent: true } }
                )

                console.log(`[CRON RECOVERY] Email sent to ${order.email} (Order ${order._id})`)
                sentCount++
            } catch (err) {
                console.error(`[CRON RECOVERY] Error sending to ${order.email}:`, err)
                errorsCount++
            }
        }

        res.status(200).json({
            message: 'Recovery process completed',
            found: orders.length,
            sent: sentCount,
            errors: errorsCount
        })

    } catch (error) {
        console.error('[CRON RECOVERY] Critical error:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
