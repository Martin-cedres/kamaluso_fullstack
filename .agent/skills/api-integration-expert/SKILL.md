---
description: Experto en integración y gestión de servicios externos (Mercado Pago, AWS S3, Email, etc.)
---

# Skill: API Integration Expert

## Propósito
Esta habilidad guía al agente en la integración, mantenimiento y debugging de servicios externos en Kamaluso, asegurando patrones consistentes de manejo de errores, reintentos y seguridad.

## Servicios Integrados en Kamaluso

### 1. Mercado Pago (Procesamiento de Pagos)

**SDK**: `mercadopago` v2.9.0
**Documentación**: https://www.mercadopago.com.uy/developers

#### Configuración
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx  # Producción
# MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx   # Sandbox
```

#### Inicialización
```typescript
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});
```

#### Crear Preferencia de Pago
```typescript
const preference = new Preference(client);
const response = await preference.create({
  body: {
    items: [{
      id: productId,
      title: "Agenda Personalizada 2026",
      quantity: 1,
      unit_price: 1500,
      currency_id: "UYU"
    }],
    back_urls: {
      success: `${baseUrl}/order-success`,
      failure: `${baseUrl}/checkout?error=payment`,
      pending: `${baseUrl}/order-pending`
    },
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    external_reference: orderId, // Tu ID interno
    auto_return: "approved"
  }
});

// Redirigir al usuario
return response.init_point; // URL de checkout de MP
```

#### Webhook de Notificaciones
**Endpoint**: `POST /api/webhooks/mercadopago`
**Seguridad**: Validar firma `x-signature` (ver docs de MP)

```typescript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { type, data } = req.body;
  
  if (type === 'payment') {
    const paymentId = data.id;
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });
    
    const status = paymentData.status; // approved, pending, rejected
    const orderId = paymentData.external_reference;
    
    // Actualizar pedido en DB
    await Order.updateOne(
      { _id: orderId },
      { paymentStatus: status }
    );
    
    if (status === 'approved') {
      // Enviar email de confirmación
      await sendOrderConfirmation(orderId);
    }
  }
  
  res.status(200).send('OK');
}
```

**Manejo de Errores Comunes**:
- `400`: Items inválidos → Verificar estructura
- `401`: Token inválido → Revisar `.env.local`
- `404`: Pago no encontrado → Verificar ID

---

### 2. AWS S3 (Almacenamiento de Imágenes)

**SDK**: `@aws-sdk/client-s3`

#### Configuración
```env
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=kamaluso-images
```

#### Inicialización
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
```

#### Subida de Imagen
```typescript
import { nanoid } from 'nanoid';
import mime from 'mime-types';

async function uploadToS3(file: File, folder: string = 'products') {
  const buffer = await file.arrayBuffer();
  const fileExtension = mime.extension(file.type) || 'jpg';
  const fileName = `${folder}/${nanoid()}.${fileExtension}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: Buffer.from(buffer),
    ContentType: file.type,
    ACL: 'public-read' // O usar CloudFront para servir
  });
  
  await s3Client.send(command);
  
  const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  return publicUrl;
}
```

#### Eliminar Imagen
```typescript
async function deleteFromS3(imageUrl: string) {
  const key = imageUrl.split('.amazonaws.com/')[1];
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key
  });
  
  await s3Client.send(command);
}
```

**Mejores Prácticas**:
- Siempre eliminar imágenes viejas al actualizar productos
- Usar carpetas lógicas: `products/`, `blog/`, `reviews/`
- Optimizar imágenes antes de subir (resize, compress)
- Considerar CloudFront para CDN

---

### 3. Nodemailer → Resend (Email Transaccional)

#### Sistema Actual: Nodemailer + Gmail
**Archivo**: `lib/nodemailer.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App Password de Google
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `Kamaluso <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}
```

#### Sistema Futuro: Resend (Recomendado)
**Ventajas**: Mejor deliverability, analytics, no usa contraseñas

**Instalación**:
```bash
npm install resend
```

**Configuración**:
```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=pedidos@papeleriapersonalizada.uy
```

**Implementación**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html
  });
}
```

**Templates de Email**:
- **Confirmación de Pedido**: `lib/email-templates/order-confirmation.ts`
- **Actualización de Estado**: `lib/email-templates/status-update.ts`
- **Cotización Enviada**: Existe en `pages/api/admin/quotes/[id]/send.ts`

---

### 4. Google Gemini (Inteligencia Artificial)

Ver [AI Prompt Engineer Skill](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ai-prompt-engineer/SKILL.md) para detalles completos.

**Resumen Rápido**:
```typescript
import { generateWithFallback } from '../lib/gemini-agent';

const result = await generateWithFallback(prompt);
```

---

## Patrones de Integración

### 1. Manejo Robusto de Errores

**Patrón Try-Catch-Retry**:
```typescript
async function callExternalAPI(params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await externalService.call(params);
      return result;
    } catch (error) {
      console.error(`Intento ${i + 1} falló:`, error);
      
      if (i === retries - 1) {
        // Último intento, lanzar error
        throw new Error(`Fallo tras ${retries} intentos: ${error.message}`);
      }
      
      // Espera exponencial: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 2. Validación de Credenciales al Inicio

**Script de Verificación**:
```typescript
// scripts/test-integrations.ts
async function testMercadoPago() {
  try {
    const payment = new Payment(client);
    await payment.search({ limit: 1 });
    console.log('✅ Mercado Pago conectado');
  } catch (error) {
    console.error('❌ Error en Mercado Pago:', error.message);
  }
}

async function testS3() {
  try {
    const command = new ListObjectsV2Command({ 
      Bucket: process.env.AWS_S3_BUCKET_NAME, 
      MaxKeys: 1 
    });
    await s3Client.send(command);
    console.log('✅ AWS S3 conectado');
  } catch (error) {
    console.error('❌ Error en S3:', error.message);
  }
}
```

### 3. Logging Estructurado

```typescript
const logAPICall = (service: string, action: string, status: 'success' | 'error', details?: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service,
    action,
    status,
    details
  }));
};

// Uso
logAPICall('MercadoPago', 'CreatePreference', 'success', { orderId });
```

### 4. Secrets Management

**NUNCA** commitear:
- API Keys
- Access Tokens
- Passwords
- Private Keys

**Verificar con `.gitignore`**:
```
.env.local
.env.*.local
*.pem
```

**Uso en Vercel**:
- Configurar en "Settings → Environment Variables"
- Separar por ambiente (Development, Preview, Production)

---

## Webhooks: Mejores Prácticas

### 1. Idempotencia
Los webhooks pueden duplicarse. Proteger contra procesamiento doble:

```typescript
const processedWebhooks = new Set(); // En producción: usar Redis

export default async function handler(req, res) {
  const webhookId = req.headers['x-request-id'];
  
  if (processedWebhooks.has(webhookId)) {
    return res.status(200).send('Already processed');
  }
  
  // Procesar...
  processedWebhooks.add(webhookId);
  res.status(200).send('OK');
}
```

### 2. Validación de Firma
Siempre verificar que el webhook viene del servicio legítimo:

**Mercado Pago**:
```typescript
import crypto from 'crypto';

function validateMPSignature(req) {
  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  
  // Ver documentación oficial de MP para algoritmo completo
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
    .update(requestId + req.body)
    .digest('hex');
    
  return signature === expectedSignature;
}
```

### 3. Timeout Corto
Responder rápido, procesar después:

```typescript
export default async function handler(req, res) {
  // Responder inmediatamente
  res.status(200).send('OK');
  
  // Procesar de forma asíncrona
  processWebhookAsync(req.body).catch(console.error);
}
```

---

## Debugging de Integraciones

### Mercado Pago
1. **Logs en Dashboard**: https://www.mercadopago.com.uy/activities
2. **Sandbox Mode**: Usar tarjetas de prueba
3. **Webhook Tester**: Usar localtunnel o ngrok para desarrollo local

### AWS S3
1. **Permisos IAM**: Verificar que el usuario tiene `PutObject`, `DeleteObject`
2. **CORS**: Configurar si subes desde frontend
3. **CloudWatch**: Ver logs de errores

### Emails
1. **Gmail**: Verificar que "Acceso a apps menos seguras" esté habilitado
2. **Resend**: Dashboard muestra deliverability
3. **Spam**: Usar servicios como mail-tester.com

---

## Checklist para Nueva Integración

- [ ] Credenciales en `.env.local` (no en código)
- [ ] Variables agregadas en Vercel
- [ ] Script de test de conexión creado
- [ ] Manejo de errores con reintentos
- [ ] Logging de llamadas importantes
- [ ] Documentación en README o skill
- [ ] Timeouts configurados
- [ ] Validación de webhooks (si aplica)
- [ ] Modo sandbox/desarrollo disponible
- [ ] Rollback plan si falla en producción

---

## Recursos Relacionados
- [E-commerce Flow Skill](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ecommerce-flow-specialist/SKILL.md)
- [Nodemailer Config](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/lib/nodemailer.ts)
- [Gemini Client](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/lib/gemini-client.ts)
