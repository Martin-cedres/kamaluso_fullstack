import type { NextApiRequest, NextApiResponse } from 'next'
import { MercadoPagoConfig, Preference } from 'mercadopago'

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error(
    'MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables',
  )
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  try {
    const { orderId, items, paymentMethod } = req.body;

    if (!orderId || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Order ID and items array are required' });
    }

    // Calculate subtotal from items securely on the backend
    const subtotal = items.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    // Map cart items to Mercado Pago preference item format
    const preferenceItems = items.map((item) => ({
      id: item._id,
      title: item.nombre,
      description: item.finish || 'Producto',
      quantity: item.quantity,
      unit_price: item.precio,
      currency_id: 'UYU',
    }));

    // Add surcharge if payment method is Mercado Pago
    if (paymentMethod === 'mercado_pago_online') {
      const surchargeAmount = subtotal * 0.10;
      preferenceItems.push({
        id: 'surcharge',
        title: 'Recargo por procesamiento',
        description: 'Comisión por uso de pasarela de pago',
        quantity: 1,
        unit_price: parseFloat(surchargeAmount.toFixed(2)),
        currency_id: 'UYU',
      });
    }


    const isProduction = process.env.NODE_ENV === 'production'
    let baseUrl
    if (isProduction) {
      baseUrl = 'https://www.papeleriapersonalizada.uy'
    } else {
      const host = req.headers.host || 'localhost:3000'
      baseUrl = `http://${host}`
    }

    const preferenceData = {
      items: preferenceItems, // Use the detailed items array
      external_reference: orderId,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${baseUrl}/checkout/success?orderId=${orderId}`,
        failure: `${baseUrl}/checkout/failure?orderId=${orderId}`,
        pending: `${baseUrl}/checkout/pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
    }

    const preference = new Preference(client)
    const result = await preference.create({ body: preferenceData })

    res.status(201).json({ init_point: result.init_point })
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error)
    const errorMessage =
      error.cause?.message ||
      error.message ||
      'Internal Server Error creating preference'
    res.status(500).json({ message: errorMessage })
  }
}
