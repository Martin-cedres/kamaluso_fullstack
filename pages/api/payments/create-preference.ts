
import type { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import connectDB from '@/lib/mongoose';
import { validateAndCalculateDiscount } from '@/lib/couponValidator';

// Validate Access Token
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables");
}

// Init Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectDB();
    const { items, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    // 1. Calculate subtotal on the server
    const subtotal = items.reduce((acc, item) => acc + (Number(item.precio) * Number(item.quantity)), 0);

    let finalTotal = subtotal;

    // 2. If coupon is provided, validate it and get the final total
    if (couponCode) {
      const couponResult = await validateAndCalculateDiscount(couponCode, items, subtotal);
      if (couponResult.success && couponResult.newCartTotal) {
        finalTotal = couponResult.newCartTotal;
      }
      // If coupon is invalid, we proceed with the subtotal
    }

    // 3. Create a single preference item with the final total
    const preferenceItem = {
      id: 'order-total',
      title: 'Total de tu compra en Kamaluso Papelería',
      description: 'Resumen de tu pedido completo',
      quantity: 1,
      unit_price: finalTotal,
      currency_id: 'UYU',
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceData = {
      items: [preferenceItem],
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      },
      // auto_return: 'approved', // Keep disabled for debugging if needed
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
