import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { transporter } from '../../../lib/nodemailer'
import { validateAndCalculateDiscount } from '../../../lib/couponValidator'
import Coupon from '../../../models/Coupon'

// --- TYPES ---
type ShippingDetails = {
  method: string
  address: string
  notes?: string
}

type OrderRequestBody = {
  name: string
  phone: string
  shippingDetails: ShippingDetails
  items: any[]
  total: number // This will be the final total
  paymentMethod: string
  email?: string
  notes?: string
  couponCode?: string // Added coupon code
  paymentDetails?: any // Added for Mercado Pago details
}

// This will be the shape of the object stored in the DB
type OrderForDB = OrderRequestBody & {
  subtotal: number
  discountAmount?: number
  createdAt: Date
  status: string
  externalReference?: string
}

// --- EMAIL GENERATION ---

const generateItemsHTML = (items: any[]) => {
  return items
    .map(
      (item) =>
        `<tr>
       <td style="padding:8px; border:1px solid #ddd;">
         ${item.nombre}
         ${item.finish ? `<br><small>Acabado: ${item.finish}</small>` : ''}
       </td>
       <td style="padding:8px; border:1px solid #ddd; text-align:center;">${item.quantity}</td>
       <td style="padding:8px; border:1px solid #ddd; text-align:right;">$U ${(item.precio * item.quantity).toFixed(2)}</td>
     </tr>`,
    )
    .join('')
}

const generateShippingHTML = (shippingDetails: ShippingDetails) => {
  let html = `<p><strong>Método:</strong> ${shippingDetails.method}</p>`
  if (
    shippingDetails.address &&
    shippingDetails.address !== 'Retiro en Local'
  ) {
    html += `<p><strong>Dirección:</strong> ${shippingDetails.address}</p>`
  }
  if (shippingDetails.notes) {
    html += `<p><strong>Notas de Envío:</strong> ${shippingDetails.notes}</p>`
  }
  html += `<p style="font-size:0.8em; color:#555;">El costo del envío es a cargo del comprador y se abona al recibir/retirar el paquete.</p>`
  return html
}

const generatePriceSummaryHTML = (order: OrderForDB) => {
  let html = `<p style="text-align:right;">Subtotal: $U ${order.subtotal.toFixed(2)}</p>`
  if (order.discountAmount && order.discountAmount > 0) {
    html += `<p style="text-align:right; color: #2ecc71;">Descuento (${order.couponCode}): -$U ${order.discountAmount.toFixed(2)}</p>`
  }
  html += `<p style="text-align:right; font-weight:bold; font-size:1.2em;">Total: $U ${order.total.toFixed(2)}</p>`
  return html
}

const generateEmailContent = (order: OrderForDB) => {
  const itemsList = generateItemsHTML(order.items)
  const shippingInfo = generateShippingHTML(order.shippingDetails)
  const priceSummary = generatePriceSummaryHTML(order)

  let paymentInstructions = ''
  switch (order.paymentMethod) {
    case 'brou':
      paymentInstructions =
        '<p><strong>Instrucciones BROU:</strong> Realiza una transferencia o depósito al BROU, caja de ahorro en pesos Nro. 001199848-00001 (Cuenta anterior 013.0123275, Titular Martín CEDRÉS). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'oca_blue':
      paymentInstructions =
        '<p><strong>Instrucciones OCA Blue:</strong> Deposita en OCA Blue (Nro. 0216811). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'mi_dinero':
      paymentInstructions =
        '<p><strong>Instrucciones Mi Dinero:</strong> Transferencia por APP Mi Dinero (Nro. Cuenta 7537707). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'prex':
      paymentInstructions =
        '<p><strong>Instrucciones Prex:</strong> Depósito Prex (Nro. Cuenta 1216437, Nombre Katherine Silva). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'abitab':
      paymentInstructions =
        '<p><strong>Instrucciones ABITAB:</strong> GIROS a nombre de Katherine SILVA C.I 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'red_pagos':
      paymentInstructions =
        '<p><strong>Instrucciones RED PAGOS:</strong> GIROS a nombre de Katherine SILVA C.I 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'pago_en_local':
      paymentInstructions =
        '<p><strong>Pago en Local:</strong> Puedes pagar en nuestro local al retirar tu pedido, por el medio que elijas en ese momento.</p>'
      break
    case 'pago_efectivo_local':
      paymentInstructions =
        '<p><strong>Efectivo en Local:</strong> Puedes pagar en efectivo en nuestro local al retirar tu pedido.</p>'
      break
    case 'mercado_pago_online':
      paymentInstructions =
        '<p><strong>Mercado Pago:</strong> Tu pago será procesado por Mercado Pago. Te notificaremos cuando esté aprobado.</p>'
      break
    default:
      paymentInstructions =
        '<p>No se encontraron instrucciones de pago específicas para el método seleccionado.</p>'
  }

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
        ${priceSummary}

        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Método de Pago</h2>
        <p><strong>Método:</strong> ${paymentMethodText[order.paymentMethod] || 'No especificado'}</p>
        ${paymentInstructions}

        <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Detalles de Envío</h2>
        ${shippingInfo}
      </div>
    `,
  }
}

const paymentMethodText: Record<string, string> = {
  brou: 'Transferencia Bancaria BROU',
  oca_blue: 'Depósito OCA Blue',
  mi_dinero: 'Mi Dinero',
  prex: 'Prex',
  abitab: 'Giro ABITAB',
  red_pagos: 'Giro RED PAGOS',
  pago_en_local: 'Pago en Local',
  pago_efectivo_local: 'Pago en Efectivo en Local',
  mercado_pago_online: 'Pagado con Tarjeta (Mercado Pago)',
}

const generateAdminEmailContent = (order: OrderForDB, orderId: string) => {
  const itemsList = generateItemsHTML(order.items)
  const shippingInfo = generateShippingHTML(order.shippingDetails)
  const priceSummary = generatePriceSummaryHTML(order)
  let paymentInstructions = ''

  switch (order.paymentMethod) {
    case 'brou':
      paymentInstructions =
        '<p><strong>Instrucciones BROU:</strong> Realiza una transferencia o depósito al BROU, caja de ahorro en pesos Nro. 001199848-00001 Nro. Cuenta anterior 013.0123275 Titular Martín CEDRÉS). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'oca_blue':
      paymentInstructions =
        '<p><strong>Instrucciones OCA Blue:</strong> Deposita en OCA Blue (Nro. 0216811). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'mi_dinero':
      paymentInstructions =
        '<p><strong>Instrucciones Mi Dinero:</strong> Deposito Mi Dinero (Transferencia por APP Nro. Cuenta 7537707). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'prex':
      paymentInstructions =
        '<p><strong>Instrucciones Prex:</strong> Deposito Prex (Nro. Cuenta 1216437 Nombre Katherine Silva). Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'abitab':
      paymentInstructions =
        '<p><strong>Instrucciones ABITAB:</strong> GIROS por ABITAB a nombre de Katherine SILVA C.I 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'red_pagos':
      paymentInstructions =
        '<p><strong>Instrucciones RED PAGOS:</strong> GIROS por RED PAGOS a nombre de Katherine SILVA C.I 4.798.217-8. Envía el comprobante a nuestro WhatsApp.</p>'
      break
    case 'pago_en_local':
      paymentInstructions =
        '<p><strong>Instrucciones Pago en Local:</strong> Puedes pagar  en nuestro local al retirar tu pedido, por el medio que elija en ese momento.</p>'
      break
    case 'pago_efectivo_local':
      paymentInstructions =
        '<p><strong>Instrucciones Pago en Efectivo en Local:</strong> Puedes pagar en efectivo en nuestro local al retirar tu pedido.</p>'
      break
    default:
      paymentInstructions =
        '<p>No se encontraron instrucciones de pago específicas para el método seleccionado.</p>'
  }

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
            ${priceSummary}

            <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Método de Pago</h2>
            <p><strong>Método:</strong> ${paymentMethodText[order.paymentMethod] || 'No especificado'}</p>
            ${paymentInstructions}

            <h2 style="color:#555; border-bottom:1px solid #ddd; padding-bottom:5px;">Detalles de Envío</h2>
            ${shippingInfo}

            <p style="text-align:center; margin-top:20px;">ID del Pedido: ${orderId}</p>
        </div>
        `,
  }
}

// --- API HANDLER ---

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const orderDetails: OrderRequestBody = req.body

      // 1. Calculate subtotal on the server for security
      const subtotal = orderDetails.items.reduce(
        (acc, item) => acc + item.precio * item.quantity,
        0,
      )

      let finalTotal = subtotal
      let discountAmount = 0

      // 2. If coupon is provided, validate it and recalculate total
      if (orderDetails.couponCode) {
        const couponResult = await validateAndCalculateDiscount(
          orderDetails.couponCode,
          orderDetails.items,
          subtotal,
        )

        if (couponResult.success && couponResult.discountAmount) {
          discountAmount = couponResult.discountAmount
          finalTotal = subtotal - discountAmount
        }
        // If coupon is not valid, we simply ignore it and proceed with the subtotal
      }

      const client = await clientPromise
      const db = client.db()

      // 3. Create the order object for the database
      const newOrder: OrderForDB = {
        ...orderDetails,
        subtotal,
        discountAmount,
        total: finalTotal, // Use the final, server-calculated total
        createdAt: new Date(),
        status: 'pendiente',
        ...(orderDetails.paymentMethod === 'mercado_pago_online' &&
          orderDetails.paymentDetails && {
            externalReference: orderDetails.paymentDetails.tempOrderId,
          }),
      }

      const result = await db.collection('orders').insertOne(newOrder)
      const orderId = result.insertedId.toHexString()

      // 4. Increment coupon usage count if applicable
      if (orderDetails.couponCode && discountAmount > 0) {
        await Coupon.updateOne(
          { code: orderDetails.couponCode.toUpperCase() },
          { $inc: { usedCount: 1 } },
        )
      }

      // 5. Handle response and emails based on payment method
      if (newOrder.paymentMethod === 'mercado_pago_online') {
        // For Mercado Pago, just return the ID and total. Emails will be sent via webhook.
        res.status(200).json({
          message: 'Order created pending payment',
          orderId,
          total: newOrder.total,
        })
      } else {
        // For other payment methods, send emails immediately
        if (newOrder.email) {
          const emailContent = generateEmailContent(newOrder)
          await transporter.sendMail({
            from: process.env.EMAIL_SERVER_USER,
            to: newOrder.email,
            subject: emailContent.subject,
            html: emailContent.html,
          })
        }
        const adminEmailContent = generateAdminEmailContent(newOrder, orderId)
        await transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER,
          to: 'kamalusosanjose@gmail.com',
          subject: adminEmailContent.subject,
          html: adminEmailContent.html,
        })

        res.status(200).json({
          message: 'Order created successfully!',
          orderId,
        })
      }
    } catch (error) {
      console.error('Error processing order:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}