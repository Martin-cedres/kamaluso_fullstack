import type { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Valida que el Access Token exista
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables");
}

// Inicializa el cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const items = req.body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    // Mapea los items del carrito al formato que Mercado Pago requiere
    const preferenceItems = items.map(item => ({
      id: item._id,
      title: item.nombre,
      description: item.finish ? `Acabado: ${item.finish}` : '',
      quantity: Number(item.quantity),
      unit_price: Number(item.precio),
      currency_id: 'UYU', // Asumiendo Pesos Uruguayos
    }));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceData = {
      items: preferenceItems,
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      // auto_return: 'approved' as 'approved', // Desactivado temporalmente para depurar
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    // Devuelve el punto de inicio (la URL de redirección)
    res.status(201).json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    const errorMessage = error.cause?.message || error.message || 'Internal Server Error creating preference';
    res.status(500).json({ message: errorMessage });
  }
}