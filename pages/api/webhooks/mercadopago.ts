import type { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import clientPromise from '../../../lib/mongodb';
import { transporter } from '../../../lib/nodemailer';
import { ObjectId } from 'mongodb';

// Copiamos las funciones de generación de email desde el archivo de confirmación anterior
// En una futura refactorización, esto podría moverse a un archivo de utilidades de email.
const paymentMethodText: Record<string, string> = {
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
  const paymentInstructions = '<p><strong>Instrucciones Mercado Pago:</strong> Tu pago ha sido procesado exitosamente a través de Mercado Pago. ¡Gracias!</p>';

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
    const paymentInstructions = '<p><strong>Instrucciones Mercado Pago:</strong> El pago ha sido procesado exitosamente a través de Mercado Pago.</p>';

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

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN is not defined");
}

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const payment = new Payment(client);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  console.log("--- INICIANDO WEBHOOK MERCADO PAGO ---");

  try {
    const { query } = req;
    const topic = query.topic || query.type;
    const paymentId = query.id || query["data.id"];

    console.log("Webhook recibido:", { topic, paymentId });

    if (topic !== 'payment' && topic !== 'merchant_order') {
        console.log(`Webhook ignorado: Tópico no es 'payment' o 'merchant_order' (es '${topic}')`);
        return res.status(200).send('Webhook received but ignored');
    }

    if (!paymentId) {
      console.log("Error: Falta paymentId en la query del webhook");
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    console.log(`1. Consultando a Mercado Pago por el pago ID: ${paymentId}`);
    const mpPayment = await payment.get({ id: paymentId as string });
    console.log(`Respuesta de MP recibida. Estado: ${mpPayment.status}, External Ref: ${mpPayment.external_reference}`);

    if (!mpPayment.external_reference) {
        console.log("Error: El pago de MP no tiene una external_reference.");
        return res.status(400).json({ message: 'Payment does not have an external reference.' });
    }

    console.log("2. Conectando a la base de datos...");
    const dbClient = await clientPromise;
    const db = dbClient.db();
    console.log("Conexión a DB exitosa.");

    const orderId = mpPayment.external_reference;
    const orderObjectId = new ObjectId(orderId);

    console.log(`3. Buscando la orden con ID: ${orderId}`);
    const order = await db.collection('orders').findOne({ _id: orderObjectId });

    if (!order) {
        console.log(`Error: No se encontró ninguna orden con el ID ${orderId}`);
        return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'pagado') {
        console.log(`Advertencia: La orden ${orderId} ya fue marcada como pagada.`);
        return res.status(200).json({ message: 'Order already processed' });
    }

    if (mpPayment.status === 'approved') {
        console.log(`4. El pago fue aprobado. Actualizando la orden ${orderId} a 'pagado'.`);
        
        const updateResult = await db.collection('orders').updateOne(
            { _id: orderObjectId },
            {
                $set: {
                    status: 'pagado',
                    paymentDetails: {
                        paymentId: paymentId,
                        status: mpPayment.status,
                        method: mpPayment.payment_method_id,
                        type: mpPayment.payment_type_id,
                    },
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            console.log(`Advertencia: No se modificó la orden ${orderId}. Puede que ya estuviera actualizada.`);
            return res.status(200).json({ message: 'Order status was not modified.' });
        }

        // Volvemos a cargar la orden para tener los datos actualizados para los correos
        const updatedOrder = await db.collection('orders').findOne({ _id: orderObjectId });

        console.log("5. Enviando correos de confirmación...");
        if (updatedOrder && updatedOrder.email) {
            const emailContent = generateEmailContent(updatedOrder);
            await transporter.sendMail({ from: process.env.EMAIL_SERVER_USER, to: updatedOrder.email, subject: emailContent.subject, html: emailContent.html });
            console.log(`Correo enviado al cliente: ${updatedOrder.email}`);
        }
        if (updatedOrder) {
            const adminEmailContent = generateAdminEmailContent(updatedOrder, orderId);
            await transporter.sendMail({ from: process.env.EMAIL_SERVER_USER, to: 'kamalusosanjose@gmail.com', subject: adminEmailContent.subject, html: adminEmailContent.html });
            console.log("Correo enviado al admin.");
        }

        console.log(`--- WEBHOOK MERCADO PAGO COMPLETADO PARA ORDEN ${orderId} ---`);
    } else {
        console.log(`El estado del pago es '${mpPayment.status}'. No se actualiza la orden.`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error: any) {
    console.error("--- ERROR EN WEBHOOK MERCADO PAGO ---", error);
    const errorMessage = error.cause?.message || error.message || 'Internal Server Error';
    res.status(500).json({ message: errorMessage });
  }
}
