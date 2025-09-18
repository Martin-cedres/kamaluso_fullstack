import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { transporter } from '../../../lib/nodemailer';

// Tipo para el cuerpo de la solicitud
type ShippingDetails = {
  method: string;
  address: string;
  notes?: string;
}

type OrderRequestBody = {
  name: string;
  phone: string;
  shippingDetails: ShippingDetails;
  items: any[];
  total: number;
  paymentMethod: string;
  email?: string;
  notes?: string; // This is the general order notes, separate from shipping notes
};

type ResponseData = {
  message: string;
  orderId?: string;
  order?: OrderRequestBody;
};

// Texto de métodos de pago
const paymentMethodText: Record<string, string> = {
  brou: "Transferencia Bancaria BROU",
  oca_blue: "Depósito OCA Blue",
  mi_dinero: "Mi Dinero",
  prex: "Prex",
  abitab: "Giro ABITAB",
  red_pagos: "Giro RED PAGOS",
  pago_en_local: "Pago en Local (con seña)",
  pago_efectivo_local: "Pago en Efectivo en Local",
};

const generateItemsHTML = (items: any[]) => {
  return items.map(item =>
    `<tr>
       <td style="padding:8px; border:1px solid #ddd;">
         ${item.nombre}
         ${item.finish ? `<br><small>Acabado: ${item.finish}</small>` : ''}
       </td>
       <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
       <td style="padding:8px; border:1px solid #ddd; text-align:right;">$U ${(item.precio * item.quantity).toFixed(2)}</td>
     </tr>`
  ).join('');
};

const generateShippingHTML = (shippingDetails: ShippingDetails) => {
  let html = `<p><strong>Método:</strong> ${shippingDetails.method}</p>`;
  if (shippingDetails.address && shippingDetails.address !== 'Retiro en Local') {
    html += `<p><strong>Dirección:</strong> ${shippingDetails.address}</p>`;
  }
  if (shippingDetails.notes) {
    html += `<p><strong>Notas de Envío:</strong> ${shippingDetails.notes}</p>`;
  }
  html += `<p style="font-size:0.8em; color:#555;">El costo del envío es a cargo del comprador y se abona al recibir/retirar el paquete.</p>`;
  return html;
};

// Genera el contenido HTML del correo para el comprador
const generateEmailContent = (order: OrderRequestBody) => {
  const itemsList = generateItemsHTML(order.items);
  const shippingInfo = generateShippingHTML(order.shippingDetails);
  let paymentInstructions = '';
  // ... (resto del switch de paymentInstructions)

  return {
    subject: `Gracias por tu compra en Papeleria Personalizada Kamaluso`,
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
        ${shippingInfo}

        ${order.notes ? `
        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Notas Generales del Pedido</h2>
        <p>${order.notes}</p>
        ` : ''}

        <p style="text-align:center; margin-top:20px;">¡Gracias por confiar en Papelería Personalizada Kamaluso!</p>
      </div>
    `,
  };
};

// Genera el contenido del correo para el admin
const generateAdminEmailContent = (order: OrderRequestBody, orderId: string) => {
  const itemsList = generateItemsHTML(order.items);
  const shippingInfo = generateShippingHTML(order.shippingDetails);

  return {
    subject: `¡Tienes un nuevo Pedido!`,
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; line-height:1.5; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px;">
        <h1 style="text-align:center; color:#4CAF50;">¡Haz vendido!</h1>
        <p style="text-align:center;">Aquí tienes el detalle de la compra:</p>
        
        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Detalles del Cliente</h2>
        <p><strong>Nombre:</strong> ${order.name}</p>
        <p><strong>Email:</strong> ${order.email || 'No proporcionado'}</p>
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

        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Detalles de Envío</h2>
        ${shippingInfo}

        ${order.notes ? `
        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Notas Generales del Pedido</h2>
        <p>${order.notes}</p>
        ` : ''}

        <p style="text-align:center; margin-top:20px;">ID del Pedido: ${orderId}</p>
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

      // Asegurar que el total se calcula en el servidor
      const calculatedTotal = orderDetails.items.reduce((acc, item) => acc + (item.precio * item.quantity), 0);
      orderDetails.total = calculatedTotal;

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

      // Enviar correo de confirmación al cliente
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

      // Enviar correo de notificación al admin
      const adminEmailContent = generateAdminEmailContent(orderDetails, orderId);
      await transporter.sendMail({
        from: process.env.EMAIL_SERVER_USER,
        to: 'kamalusosanjose@gmail.com',
        subject: adminEmailContent.subject,
        html: adminEmailContent.html,
      });
      console.log(`Admin notification email sent to kamalusosanjose@gmail.com`);

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
