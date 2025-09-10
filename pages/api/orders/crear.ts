import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { transporter } from '../../../lib/nodemailer';

// Define un tipo para el cuerpo de la solicitud esperado para una mejor seguridad de tipos
type OrderRequestBody = {
  name: string;
  phone: string;
  shippingMethod: 'delivery' | 'pickup';
  address: string; // Puede ser una dirección real o 'Retiro en Local'
  items: any[]; // You might want to define a stronger type for items
  total: number;
  paymentMethod: string;
  email?: string; // Optional: Add email to the type
};

type ResponseData = {
  message: string;
  orderId?: string;
  order?: OrderRequestBody;
};

const paymentMethodText = {
  brou: "Transferencia Bancaria BROU",
  qr_mercadopago: "QR Mercado Pago",
  link_mercadopago: "Link Mercado Pago",
  oca_blue: "Depósito OCA Blue",
  mi_dinero: "Mi Dinero",
  prex: "Prex",
  abitab: "Giro ABITAB",
  red_pagos: "Giro RED PAGOS",
  pago_en_local: "Pago en Local",
};

// Helper to generate email content
const generateEmailContent = (order: OrderRequestBody) => {
  const itemsList = order.items.map(item => 
    `<li>${item.nombre} (x${item.quantity}) - $U ${(item.precio * item.quantity).toFixed(2)}</li>`
  ).join('');

  let paymentInstructions = '';
  switch (order.paymentMethod) {
    case 'brou':
      paymentInstructions = `
        <p>Para completar tu compra, por favor realiza una transferencia a la siguiente cuenta:</p>
        <ul>
          <li><strong>Banco:</strong> BROU</li>
          <li><strong>Titular:</strong> Martín CEDRÉS</li>
          <li><strong>Cuenta Nueva:</strong> 001199848-00001</li>
          <li><strong>Cuenta Anterior:</strong> 013.0123275</li>
        </ul>
        <p>Una vez realizada la transferencia, por favor envía el comprobante a este mismo correo.</p>
      `;
      break;
    case 'qr_mercadopago':
      paymentInstructions = `<p>Nos pondremos en contacto contigo por email o WhatsApp para coordinar el pago mediante QR de Mercado Pago.</p>`;
      break;
    case 'link_mercadopago':
      paymentInstructions = `
        <p>Nos pondremos en contacto contigo por email o WhatsApp para enviarte el link de pago de Mercado Pago.</p>
        <p><strong>Importante:</strong> Recuerda que esta opción incluye un recargo del 10% que ya ha sido aplicado al total de tu compra.</p>
      `;
      break;
    case 'oca_blue':
      paymentInstructions = `<p>Puedes realizar un depósito en OCA Blue al número: <strong>0216811</strong>.</p>`;
      break;
    case 'mi_dinero':
      paymentInstructions = `<p>Puedes realizar una transferencia por la APP de Mi Dinero al número de cuenta: <strong>7537707</strong>.</p>`;
      break;
    case 'prex':
      paymentInstructions = `
        <p>Puedes realizar un depósito a la siguiente cuenta Prex:</p>
        <ul>
          <li><strong>Titular:</strong> Katherine Silva</li>
          <li><strong>Nº de Cuenta:</strong> 1216437</li>
        </ul>
      `;
      break;
    case 'abitab':
    case 'red_pagos':
      paymentInstructions = `
        <p>Puedes realizar un giro por ABITAB o RED PAGOS a nombre de:</p>
        <ul>
          <li><strong>Titular:</strong> Katherine SILVA</li>
          <li><strong>C.I.:</strong> 4.798.217-8</li>
        </ul>
      `;
      break;
    case 'pago_en_local':
      paymentInstructions = `<p>Puedes pagar tu pedido en efectivo o con tarjeta al momento de retirarlo en nuestro local.</p>`;
      break;
    default:
      paymentInstructions = `<p>Gracias por tu compra. Nos pondremos en contacto para coordinar el pago.</p>`;
  }

  return {
    subject: `Confirmación de tu pedido #${order.name}`,
    html: `
      <h1>¡Gracias por tu compra, ${order.name}!</h1>
      <p>Hemos recibido tu pedido y lo estamos preparando.</p>
      <h2>Detalles del Cliente</h2>
      <p><strong>Nombre:</strong> ${order.name}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Teléfono:</strong> ${order.phone}</p>
      <h2>Resumen del Pedido</h2>
      <ul>${itemsList}</ul>
      <p><strong>Total: $U ${order.total.toFixed(2)}</strong></p>
      <h2>Método de Pago: ${paymentMethodText[order.paymentMethod] || 'No especificado'}</h2>
      ${paymentInstructions}
      <h2>Detalles de Envío</h2>
      <p><strong>Método:</strong> ${order.shippingMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}</p>
      <p><strong>Dirección:</strong> ${order.address}</p>
      <p>¡Gracias por confiar en nosotros!</p>
    `,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    try {
      const orderDetails: OrderRequestBody = req.body;

      const client = await clientPromise;
      const db = client.db();

      const newOrder = {
        ...orderDetails,
        createdAt: new Date(),
        status: 'pendiente', // Add a status for the order
      };

      const result = await db.collection('orders').insertOne(newOrder);
      const orderId = result.insertedId.toHexString();

      console.log('Order inserted with ID:', orderId);

      // Send confirmation email if customer email is provided
      if (orderDetails.email) {
        const emailContent = generateEmailContent(orderDetails);
        await transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER,
          to: orderDetails.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        console.log(`Confirmation email sent to ${orderDetails.email}`);
      }

      res.status(200).json({ 
        message: 'Order created successfully!', 
        orderId,
      });

    } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
