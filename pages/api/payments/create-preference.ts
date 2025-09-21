
import type { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Preference } from 'mercadopago';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables");
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { orderId, total } = req.body;

    if (!orderId || typeof total === 'undefined') {
      return res.status(400).json({ message: 'Order ID and total are required' });
    }

    const preferenceItem = {
      id: orderId,
      title: 'Total de tu compra en Kamaluso Papelería',
      description: 'Resumen de tu pedido completo',
      quantity: 1,
      unit_price: total,
      currency_id: 'UYU',
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceData = {
      items: [preferenceItem],
      external_reference: orderId,
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${baseUrl}/checkout/success?orderId=${orderId}`,
        failure: `${baseUrl}/checkout/failure?orderId=${orderId}`,
        pending: `${baseUrl}/checkout/pending?orderId=${orderId}`,
      },
      auto_return: 'approved',
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    res.status(201).json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    const errorMessage = error.cause?.message || error.message || 'Internal Server Error creating preference';
    res.status(500).json({ message: errorMessage });
  }
}
