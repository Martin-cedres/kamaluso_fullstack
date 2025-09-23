require('dotenv').config({ path: './.env.local' })
const { MongoClient, ObjectId } = require('mongodb')
const nodemailer = require('nodemailer')

// --- Configuración de la Prueba ---

// 1. Datos del pedido de ejemplo
const sampleOrder = {
  name: 'Cliente de Prueba',
  email: 'comprador.prueba@example.com', // Correo a donde llegará la confirmación
  shippingMethod: 'delivery',
  address: 'Calle Falsa 123',
  items: [
    { _id: '123', nombre: 'Producto de Prueba', precio: 100, quantity: 2 },
  ],
  total: 200,
  paymentMethod: 'transferencia',
  createdAt: new Date(),
  status: 'pendiente',
}

// 2. Configuración de Nodemailer (copiada de tu código)
const emailUser = process.env.EMAIL_SERVER_USER
const emailPass = process.env.EMAIL_SERVER_PASSWORD

if (!process.env.MONGODB_URI || !emailUser || !emailPass) {
  console.error(
    'Error: Asegúrate de que MONGODB_URI, EMAIL_SERVER_USER, y EMAIL_SERVER_PASSWORD estén definidos en tu archivo .env.local',
  )
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
})

// 3. Lógica para generar el email (copiada de tu API)
const generateEmailContent = (order) => {
  const itemsList = order.items
    .map(
      (item) =>
        `<li>${item.nombre} (x${item.quantity}) - $U ${(item.precio * item.quantity).toFixed(2)}</li>`,
    )
    .join('')

  let paymentInstructions = ''
  if (order.paymentMethod === 'transferencia') {
    paymentInstructions =
      '\n      <p>Para completar tu compra, por favor realiza una transferencia bancaria a la siguiente cuenta:</p>\n      <ul>\n        <li><strong>Banco:</strong> [Nombre de tu Banco]</li>\n        <li><strong>Titular:</strong> [Nombre del Titular]</li>\n        <li><strong>Nº de Cuenta:</strong> [Tu Número de Cuenta]</li>\n        <li><strong>Alias:</strong> [Tu Alias]</li>\n      </ul>\n      <p>Una vez realizada la transferencia, por favor envía el comprobante a este mismo correo.</p>'
  }

  return {
    subject: `Confirmación de tu pedido de prueba`,
    html:
      '\n      <h1>¡Gracias por tu compra, ' +
      order.name +
      '!</h1>\n      <p>Este es un correo de prueba para verificar la funcionalidad.</p>\n      <h2>Resumen del Pedido</h2>\n      <ul>' +
      itemsList +
      '</ul>\n      <p><strong>Total: $U ' +
      order.total.toFixed(2) +
      '</strong></p>\n      <h2>Método de Pago</h2>\n      <p>' +
      (order.paymentMethod === 'transferencia'
        ? 'Transferencia Bancaria'
        : order.paymentMethod) +
      '</p>\n      ' +
      paymentInstructions +
      '\n      <h2>Detalles de Envío</h2>\n      <p><strong>Método:</strong> ' +
      (order.shippingMethod === 'delivery'
        ? 'Envío a Domicilio'
        : 'Retiro en Local') +
      '</p>\n      <p><strong>Dirección:</strong> ' +
      order.address +
      '</p>\n    ',
  }
}

// --- Ejecución de la Prueba ---
async function runTest() {
  const client = new MongoClient(process.env.MONGODB_URI)
  let orderId

  try {
    await client.connect()
    const db = client.db()
    console.log('Conectado a MongoDB.')

    // --- 1. Prueba de Base de Datos ---
    console.log('\n--- Verificando la Base de Datos ---')
    const insertResult = await db.collection('orders').insertOne(sampleOrder)
    orderId = insertResult.insertedId

    if (!orderId) {
      throw new Error('La inserción en la base de datos falló.')
    }
    console.log(`Pedido de prueba insertado con ID: ${orderId}`)

    const retrievedOrder = await db
      .collection('orders')
      .findOne({ _id: orderId })
    console.log(
      'Pedido recuperado de la BD:',
      JSON.stringify(retrievedOrder, null, 2),
    )

    // Verificación de campos
    const missingFields = []
    if (!retrievedOrder.items) missingFields.push('items (productos)')
    if (!retrievedOrder.name) missingFields.push('name (cliente)')
    if (!retrievedOrder.email) missingFields.push('email (cliente)')
    if (!retrievedOrder.paymentMethod)
      missingFields.push('paymentMethod (metodoPago)')
    if (!retrievedOrder.status) missingFields.push('status (estado)')
    if (!retrievedOrder.createdAt) missingFields.push('createdAt (fecha)')

    if (missingFields.length > 0) {
      console.error(
        `\nResultado: ¡FALLÓ! Faltan los siguientes campos en la base de datos: ${missingFields.join(', ')}`,
      )
    } else {
      console.log(
        '\nResultado: ¡ÉXITO! Todos los campos requeridos están presentes en la base de datos.',
      )
    }

    // --- 2. Prueba de Envío de Correo ---
    console.log('\n--- Verificando el Envío de Correo ---')
    const emailContent = generateEmailContent(retrievedOrder)

    const info = await transporter.sendMail({
      from: `Kamaluso Test <${emailUser}>`,
      to: retrievedOrder.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    console.log(
      `Correo de prueba enviado a ${retrievedOrder.email}. Message ID: ${info.messageId}`,
    )
    console.log(
      '\nResultado: ¡ÉXITO! Nodemailer se configuró correctamente y el correo fue enviado.',
    )
    console.log(
      "Por favor, revisa la bandeja de entrada de 'comprador.prueba@example.com' para confirmar la recepción.",
    )
  } catch (error) {
    console.error('\n--- ¡La prueba falló! ---')
    console.error(error)
  } finally {
    // Limpieza: elimina el pedido de prueba
    if (orderId) {
      await client.db().collection('orders').deleteOne({ _id: orderId })
      console.log(
        '\nLimpieza: El pedido de prueba ha sido eliminado de la base de datos.',
      )
    }
    await client.close()
    console.log('Desconectado de MongoDB.')
  }
}

runTest()
