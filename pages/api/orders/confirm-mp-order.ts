import type { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import clientPromise from '../../../lib/mongodb';
import { transporter } from '../../../lib/nodemailer';

// --- Lógica de Email (Copiada de /api/orders/crear.ts) ---
const paymentMethodText: Record<string, string> = {
  brou: "Transferencia Bancaria BROU",
  oca_blue: "Depósito OCA Blue",
  mi_dinero: "Mi Dinero",
  prex: "Prex",
  abitab: "Giro ABITAB",
  red_pagos: "Giro RED PAGOS",
  pago_en_local: "Pago en Local",
  pago_efectivo_local: "Pago en Efectivo en Local",
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

const generateShippingHTML = (shippingDetails: any) => {
  if (!shippingDetails) return '<p>No se especificaron detalles de envío.</p>';
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

const generateEmailContent = (order: any) => {
  const itemsList = generateItemsHTML(order.items);
  const shippingInfo = generateShippingHTML(order.shippingDetails);
  let paymentInstructions = '';

  switch (order.paymentMethod) {
    case 'brou':
      paymentInstructions = '<p><strong>Instrucciones BROU:</strong> Realiza una transferencia o depósito al BROU, caja de ahorro en pesos Cuenta Nueva Nro. 001199848-00001 Nro. Cuenta anterior 013.0123275 Titular Martín CEDRÉS. Envía el comprobante a nuestro WhatsApp.</p>';
      break;
    case 'oca_blue':
      paymentInstructions = '<p><strong>Instrucciones OCA Blue:</strong> Deposita en OCA Blue, cuenta N° 987654321. Envía el comprobante a nuestro WhatsApp.</p>';
      break;
    case 'mi_dinero':
      paymentInstructions = '<p><strong>Instrucciones Mi Dinero:</strong> Transferencia por APP Nro. Cuenta 7537707. Envía el comprobante a nuestro WhatsApp.</p>';
      break;
    case 'prex':
      paymentInstructions = '<p><strong>Instrucciones Prex:</strong> Nro. Cuenta 1216437 Nombre Katherine Silva. Envía el comprobante a nuestro WhatsApp.</p>';
      break;
    case 'abitab':
      paymentInstructions = '<p><strong>Instrucciones ABITAB:</strong> Realiza un giro en ABITAB a nombre de Katherine Silva, CI 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>';
      break;
    case 'red_pagos':
      paymentInstructions = '<p><strong>Instrucciones RED PAGOS:</strong> Realiza un giro en RED PAGOS a nombre de Katherine Silva, CI 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>';
      break;
    case 'pago_en_local':
      paymentInstructions = '<p><strong>Instrucciones Pago en Local:</strong> Puedes pagar el resto en nuestro local al retirar tu pedido, por el medio que elijas en ese momento.</p>';
      break;
    case 'pago_efectivo_local':
      paymentInstructions = '<p><strong>Instrucciones Pago en Efectivo en Local:</strong> Puedes pagar en efectivo en nuestro local al retirar tu pedido.</p>';
      break;
    case 'mercado_pago_online':
      paymentInstructions = '<p><strong>Instrucciones Mercado Pago:</strong> Tu pago ha sido procesado exitosamente a través de Mercado Pago. ¡Gracias!</p>';
      break;
    default:
      paymentInstructions = '<p>No se encontraron instrucciones de pago específicas para el método seleccionado. Por favor, contáctanos para más detalles.</p>';
  }

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
        ${paymentInstructions}
        <h2 style="color:#555;">Detalles de Envío</h2>
        ${shippingInfo}
      </div>
    `,
  };
};

const generateAdminEmailContent = (order: any, orderId: string) => {
    const itemsList = generateItemsHTML(order.items);
    const shippingInfo = generateShippingHTML(order.shippingDetails);
    let paymentInstructions = '';

    switch (order.paymentMethod) {
      case 'brou':
        paymentInstructions = '<p><strong>Instrucciones BROU:</strong> Realiza una transferencia o depósito al BROU, caja de ahorro en pesos Nro. 001199848-00001 Nro. Cuenta anterior 013.0123275 Titular Martín CEDRÉS). Envía el comprobante a nuestro WhatsApp.</p>';
        break;
      case 'oca_blue':
        paymentInstructions = '<p><strong>Instrucciones OCA Blue:</strong> Deposita en OCA Blue (Nro. 0216811). Envía el comprobante a nuestro WhatsApp.</p>';
        break;
      case 'mi_dinero':
        paymentInstructions = '<p><strong>Instrucciones Mi Dinero:</strong> Deposito Mi Dinero (Transferencia por APP Nro. Cuenta 7537707). Envía el comprobante a nuestro WhatsApp.</p>';
        break;
      case 'prex':
        paymentInstructions = '<p><strong>Instrucciones Prex:</strong> Deposito Prex (Nro. Cuenta 1216437 Nombre Katherine Silva). Envía el comprobante a nuestro WhatsApp.</p>';
        break;
      case 'abitab':
        paymentInstructions = '<p><strong>Instrucciones ABITAB:</strong> GIROS por ABITAB a nombre de Katherine SILVA C.I 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>';
        break;
      case 'red_pagos':
        paymentInstructions = '<p><strong>Instrucciones RED PAGOS:</strong> GIROS por RED PAGOS a nombre de Katherine SILVA C.I 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>';
        break;
      case 'pago_en_local':
        paymentInstructions = '<p><strong>Instrucciones Pago en Local:</strong> Puedes pagar  en nuestro local al retirar tu pedido, por el medio que elija en ese momento.</p>';
        break;
      case 'pago_efectivo_local':
        paymentInstructions = '<p><strong>Instrucciones Pago en Efectivo en Local:</strong> Puedes pagar en efectivo en nuestro local al retirar tu pedido.</p>';
        break;
      case 'mercado_pago_online':
        paymentInstructions = '<p><strong>Instrucciones Mercado Pago:</strong> El pago ha sido procesado exitosamente a través de Mercado Pago.</p>';
        break;
      default:
        paymentInstructions = '<p>No se encontraron instrucciones de pago específicas para el método seleccionado.</p>';
    }

    return {
      subject: `¡Nuevo Pedido Pagado con Mercado Pago!`,
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; max-width:600px; margin:auto; padding:20px; background:#f0fff0;">
          <h1 style="text-align:center; color:#2e7d32;">¡Venta Confirmada por Mercado Pago!</h1>
          <p><strong>ID del Pedido:</strong> ${orderId}</p>
          
          <h2 style="color:#555;">Detalles del Cliente</h2>
          <p><strong>Nombre:</strong> ${order.name}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Teléfono:</strong> ${order.phone}</p>

          <h2 style="color:#555;">Resumen del Pedido</h2>
          <table style="width:100%; border-collapse:collapse;"><tbody>${itemsList}</tbody></table>
          <p style="text-align:right; font-weight:bold;">Total Pagado: $U ${order.total.toFixed(2)}</p>
          <h2 style="color:#555;">Método de Pago</h2>
          <p>${paymentMethodText[order.paymentMethod] || 'No especificado'}</p>
          ${paymentInstructions}
          <h2 style="color:#555;">Detalles de Envío</h2>
          ${shippingInfo}
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

    console.log("4. Calculando el total y creando el documento de la nueva orden...");

    // Calcular el total desde el array de items para asegurar consistencia
    const calculatedTotal = formData.items.reduce((acc: number, item: any) => acc + (item.precio * item.quantity), 0);
    
    const newOrder = {
      ...formData,
      total: calculatedTotal, // Usar el total calculado en el servidor
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