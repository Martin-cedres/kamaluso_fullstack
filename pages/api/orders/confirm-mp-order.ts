import type { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import clientPromise from '../../../lib/mongodb';
import { transporter } from '../../../lib/nodemailer';

// --- Lógica de Email (Copiada de /api/orders/crear.ts) ---
const paymentMethodText: Record<string, string> = {
  brou: "Transferencia Bancaria BROU",
  qr_mercadopago: "QR Mercado Pago",
  oca_blue: "Depósito OCA Blue",
  mi_dinero: "Mi Dinero",
  prex: "Prex",
  abitab: "Giro ABITAB",
  red_pagos: "Giro RED PAGOS",
  pago_en_local: "Pago en Local",
  mercado_pago_online: "Pagado con Tarjeta (Mercado Pago)",
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

const generateEmailContent = (order: any) => {
  const itemsList = generateItemsHTML(order.items);
  return {
    subject: `Gracias por tu compra en Papeleria Personalizada Kamaluso`,
    html: `
      <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; padding:20px; background:#f9f9f9;">
        <h1 style="text-align:center; color:#e91e63;">¡Gracias por tu compra, ${order.name}!</h1>
        <p style="text-align:center;">Tu pedido ha sido confirmado y pagado. ¡Ya estamos preparándolo!</p>
        <h2 style="color:#555;">Detalles del Cliente</h2>
        <p><strong>Nombre:</strong> ${order.name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Teléfono:</strong> ${order.phone}</p>
        <h2 style="color:#555;">Resumen del Pedido</h2>
        <table style="width:100%; border-collapse:collapse;"><tbody>${itemsList}</tbody></table>
        <p style="text-align:right; font-weight:bold;">Total Pagado: $U ${order.total.toFixed(2)}</p>
        <h2 style="color:#555;">Método de Pago</h2>
        <p>${paymentMethodText[order.paymentMethod] || 'No especificado'}</p>
        <h2 style="color:#555;">Detalles de Envío</h2>
        <p><strong>Método:</strong> ${order.shippingMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'}</p>
        <p><strong>Dirección:</strong> ${order.address}</p>
      </div>
    `,
  };
};

const generateAdminEmailContent = (order: any, orderId: string) => {
    const itemsList = generateItemsHTML(order.items);
    return {
      subject: `¡Nuevo Pedido Pagado con Mercado Pago!`,
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; padding:20px; background:#f0fff0;">
          <h1 style="text-align:center; color:#2e7d32;">¡Venta Confirmada por Mercado Pago!</h1>
          <p><strong>ID del Pedido:</strong> ${orderId}</p>
          <p><strong>Cliente:</strong> ${order.name} (${order.email})</p>
          <h2 style="color:#555;">Detalles</h2>
          <table style="width:100%; border-collapse:collapse;"><tbody>${itemsList}</tbody></table>
          <p style="text-align:right; font-weight:bold;">Total Pagado: $U ${order.total.toFixed(2)}</p>
        </div>
      `,
    };
  };
// --- Fin de la Lógica de Email ---

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined");
}

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const payment = new Payment(client);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  console.log("--- INICIANDO CONFIRMACIÓN DE ORDEN MP ---");

  try {
    const { paymentId, ...formData } = req.body;
    console.log("Request Body recibido:", { paymentId, hasFormData: !!formData });

    if (!paymentId) {
      console.log("Error: Falta paymentId en el body");
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    console.log(`1. Consultando a Mercado Pago por el pago ID: ${paymentId}`);
    const mpPayment = await payment.get({ id: paymentId });
    console.log(`Respuesta de MP recibida. Estado: ${mpPayment.status}`);

    if (mpPayment.status !== 'approved') {
      console.log(`Error: El pago no fue aprobado. Estado actual: ${mpPayment.status}`);
      return res.status(400).json({ message: `Payment not approved. Status: ${mpPayment.status}` });
    }

    console.log("2. Conectando a la base de datos...");
    const dbClient = await clientPromise;
    const db = dbClient.db();
    console.log("Conexión a DB exitosa.");

    console.log(`3. Verificando si el pago ${paymentId} ya fue procesado...`);
    const existingOrder = await db.collection('orders').findOne({ 'paymentDetails.paymentId': paymentId });
    if (existingOrder) {
      console.log("Advertencia: Este pago ya fue procesado. ID de orden existente:", existingOrder._id);
      return res.status(200).json({ message: 'Order already processed', orderId: existingOrder._id });
    }
    console.log("El pago es nuevo.");

    console.log("4. Creando el documento de la nueva orden...");
    const newOrder = {
      ...formData,
      createdAt: new Date(),
      status: 'pagado', // Marcado como pagado
      paymentDetails: {
        paymentId: paymentId,
        status: mpPayment.status,
        method: mpPayment.payment_method_id,
        type: mpPayment.payment_type_id,
      },
    };
    console.log("Documento de la orden a insertar:", newOrder);

    const result = await db.collection('orders').insertOne(newOrder);
    const orderId = result.insertedId.toHexString();
    console.log(`5. Orden insertada en DB con éxito. Nuevo ID: ${orderId}`);

    console.log("6. Enviando correos de confirmación...");
    if (formData.email) {
      const emailContent = generateEmailContent(newOrder);
      await transporter.sendMail({ from: process.env.EMAIL_SERVER_USER, to: formData.email, subject: emailContent.subject, html: emailContent.html });
      console.log(`Correo enviado al cliente: ${formData.email}`);
    }
    const adminEmailContent = generateAdminEmailContent(newOrder, orderId);
    await transporter.sendMail({ from: process.env.EMAIL_SERVER_USER, to: 'kamalusosanjose@gmail.com', subject: adminEmailContent.subject, html: adminEmailContent.html });
    console.log("Correo enviado al admin.");

    console.log("--- CONFIRMACIÓN DE ORDEN MP COMPLETADA ---");
    res.status(201).json({ message: 'Order confirmed and created successfully', orderId });

  } catch (error: any) {
    console.error("--- ERROR EN CONFIRMACIÓN DE ORDEN MP ---", error);
    const errorMessage = error.cause?.message || error.message || 'Internal Server Error';
    res.status(500).json({ message: errorMessage });
  }
}