import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { transporter } from '../../../lib/nodemailer';

// Tipo para el cuerpo de la solicitud
type OrderRequestBody = {
  name: string;
  phone: string;
  shippingMethod: 'delivery' | 'pickup';
  address: string; 
  items: any[];
  total: number;
  paymentMethod: string;
  email?: string;
};

type ResponseData = {
  message: string;
  orderId?: string;
  order?: OrderRequestBody;
};

// Texto de métodos de pago
const paymentMethodText: Record<string, string> = {
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

// Genera el contenido HTML del correo
const generateEmailContent = (order: OrderRequestBody) => {
  const itemsList = order.items.map(item =>
    `<tr>
       <td style="padding:8px; border:1px solid #ddd;">${item.nombre}</td>
       <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
       <td style="padding:8px; border:1px solid #ddd; text-align:right;">$U ${(item.precio * item.quantity).toFixed(2)}</td>
     </tr>`
  ).join('');

  let paymentInstructions = '';
  switch (order.paymentMethod) {
    case 'brou':
      paymentInstructions = `
        <p>Para completar tu compra, realiza una transferencia a la siguiente cuenta:</p>
        <ul>
          <li><strong>Banco:</strong> BROU</li>
          <li><strong>Titular:</strong> Martín CEDRÉS</li>
          <li><strong>Cuenta Nueva:</strong> 001199848-00001</li>
          <li><strong>Cuenta Anterior:</strong> 013.0123275</li>
        </ul>
        <p>Envía el comprobante por WhatsApp al <strong>098615074</strong> o responde a este correo.</p>
      `;
      break;
    case 'qr_mercadopago':
      paymentInstructions = `<p>Nos pondremos en contacto por email o WhatsApp para coordinar el pago mediante QR de Mercado Pago.</p>`;
      break;
    case 'link_mercadopago':
      paymentInstructions = `
        <p>Nos pondremos en contacto por email o WhatsApp para enviarte el link de pago de Mercado Pago.</p>
        <p><strong>Importante:</strong> Esta opción incluye un recargo del 10% ya aplicado al total.</p>
      `;
      break;
    case 'oca_blue':
      paymentInstructions = `<p>Depósito en OCA Blue al número: <strong>0216811</strong>.</p>`;
      break;
    case 'mi_dinero':
      paymentInstructions = `<p>Transferencia por la APP Mi Dinero al número de cuenta: <strong>7537707</strong>.</p>`;
      break;
    case 'prex':
      paymentInstructions = `
        <p>Depósito a la siguiente cuenta Prex:</p>
        <ul>
          <li><strong>Titular:</strong> Katherine Silva</li>
          <li><strong>Nº de Cuenta:</strong> 1216437</li>
        </ul>
      `;
      break;
    case 'abitab':
    case 'red_pagos':
      paymentInstructions = `
        <p>Giro por ABITAB o RED PAGOS a nombre de:</p>
        <ul>
          <li><strong>Titular:</strong> Katherine SILVA</li>
          <li><strong>C.I.:</strong> 4.798.217-8</li>
        </ul>
      `;
      break;
    case 'pago_en_local':
      paymentInstructions = `<p>Puedes pagar en efectivo o transferencia bancaria al momento de retirar tu pedido en nuestro local.</p>`;
      break;
    default:
      paymentInstructions = `<p>Gracias por tu compra. Nos pondremos en contacto para coordinar el pago.</p>`;
  }

  return {
    subject: `Confirmación de tu pedido #${order.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px;">
        <h1 style="text-align:center; color:#e91e63;">¡Gracias por tu compra, ${order.name}!</h1>
        <p style="text-align:center;">Hemos recibido tu pedido y lo estamos preparando.</p>
        
        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Detalles del Cliente</h2>
        <p><strong>Nombre:</strong> ${order.name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Teléfono:</strong> ${order.phone}</p>

        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Resumen del Pedido</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
          <thead>
            <tr>
              <th style="padding:8px; border:1px solid #ddd; text-align:left;">Producto</th>
              <th style="padding:8px; border:1px solid #ddd; text-align:center;">Cantidad</th>
              <th style="padding:8px; border:1px solid #ddd; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        <p style="text-align:right; font-weight:bold;">Total: $U ${order.total.toFixed(2)}</p>

        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Método de Pago</h2>
        <p>${paymentMethodText[order.paymentMethod] || 'No especificado'}</p>
        ${paymentInstructions}

        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Detalles de Envío</h2>
        <p><strong>Método:</strong> ${order.shippingMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}</p>
        <p><strong>Dirección:</strong> ${order.address}</p>

        <p style="text-align:center; margin-top:20px;">¡Gracias por confiar en Papelería Personalizada Kamaluso!</p>
      </div>
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
        status: 'pendiente',
      };

      const result = await db.collection('orders').insertOne(newOrder);
      const orderId = result.insertedId.toHexString();

      console.log('Order inserted with ID:', orderId);

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
