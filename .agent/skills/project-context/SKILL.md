---
name: project-context
description: Contexto rápido del proyecto Kamaluso para iniciar sesiones de trabajo
---

# Project Context - Kamaluso Fullstack

## 🎯 Resumen Ejecutivo

**Kamaluso** es una plataforma e-commerce full-stack de **papelería personalizada** ubicada en **San José de Mayo, Uruguay**. El proyecto sirve a dos públicos distintos:
- **B2C**: Consumidores finales que buscan regalos personalizados (agendas, libretas, calendarios)
- **B2B**: Artesanos y emprendedores que buscan material de sublimación

**Sitio en producción**: [www.papeleriapersonalizada.uy](https://www.papeleriapersonalizada.uy)

---

## 🛠️ Stack Tecnológico

### Core
- **Framework**: Next.js 16.0.10 + React 19.2.3 + TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4 + Framer Motion 12.23
- **Database**: MongoDB 6.18 + Mongoose 8.18
- **Auth**: NextAuth.js 4.24
- **Payments**: Mercado Pago SDK 2.9
- **AI**: Google Generative AI 0.24.1 (Gemini)
- **Deployment**: Vercel

### Herramientas Clave
- **Email**: Nodemailer 6.10 (migración futura a Resend)
- **Storage**: AWS S3 (`@aws-sdk/client-s3`)
- **Testing**: Jest 29 + React Testing Library
- **Image Optimization**: Sharp 0.34 + `next/image`
- **Rich Text**: React Quill New 3.6
- **Diff Viewer**: react-diff-viewer-continued 3.4

---

## 📂 Estructura del Proyecto

```
kamaluso_fullstack/
├── .agent/
│   ├── skills/              # 14 skills especializadas
│   └── workflows/           # Flujos de trabajo automatizados
├── components/              # 51 componentes React
├── lib/                     # 61 utilidades y helpers
│   ├── gemini-client.ts     # ⭐ Cliente IA centralizado
│   ├── gemini-agent.ts      # Wrapper generateWithFallback()
│   ├── prompts.ts           # Plantillas de prompts base
│   └── mongodb.ts           # Conexión a base de datos
├── models/                  # 30 modelos Mongoose
│   ├── Product.ts           # Productos con personalizaciones
│   ├── Order.ts             # Pedidos y estados
│   ├── Coupon.ts            # Cupones de descuento
│   └── BlogPost.ts          # Contenido del blog
├── pages/
│   ├── api/                 # API Routes
│   │   ├── admin/           # 65 endpoints admin
│   │   │   ├── generate-seo.ts
│   │   │   ├── generate-alt-text.ts
│   │   │   └── clusters/    # Topic Clusters
│   │   ├── products/
│   │   ├── orders/
│   │   ├── coupons/
│   │   └── webhooks/        # Mercado Pago
│   ├── admin/               # Panel de administración
│   ├── productos/           # Páginas de productos
│   └── blog/                # Blog SEO
├── scripts/                 # 60 scripts de utilidad
│   ├── enrich-keywords.ts   # Enriquecimiento SEO con IA
│   └── test-gemini-keys.js  # Test de claves Gemini
├── public/
│   ├── images/
│   └── uploads/
├── AI_README.md             # ⭐ Documentación de integración IA
├── CHANGELOG.md             # Historial de cambios (29KB)
└── VERCEL_DEPLOYMENT.md     # Guía de deployment
```

---

## 🧠 Skills Disponibles (14)

### Críticas para el flujo
1. **ai-prompt-engineer** ⭐ - Gestión de Gemini AI, rotación de claves, voseo uruguayo
2. **seo-expert** ⭐ - Diferenciación B2B/B2C, keywords, restricciones de contenido
3. **ecommerce-flow-specialist** ⭐ - Carrito, checkout, Mercado Pago, cupones
4. **ux-optimizer** - CRO, mobile-first, micro-interacciones

### Administración y desarrollo
5. **admin-generator** - Interfaces CRUD
6. **api-integration-expert** - APIs externas, webhooks
7. **database-guard** - Seguridad de esquemas Mongoose
8. **data-migration-expert** - Scripts de migración

### Optimización y testing
9. **performance-auditor** - Lighthouse, ISR
10. **seo-auditor** - Sitemap, Schema.org
11. **testing-strategy-guide** - Jest, estrategias de testing

### Contenido y deployment
12. **social-orchestrator** - Open Graph, redes sociales
13. **deployment-orchestrator** - Vercel, CI/CD
14. **skill-creator** - Crear nuevas skills

---

## 🔑 Sistema de IA Inteligente (Gemini)

### Arquitectura
- **Cliente**: `lib/gemini-client.ts` → `generateContentSmart()`
- **Wrapper**: `lib/gemini-agent.ts` → `generateWithFallback()`
- **Modelo Principal**: `gemini-2.5-flash` (PRIORIDAD 1)
- **Fallback**: `gemini-2.5-pro` (emergencia, actualmente no funcional)

### Configuración de Claves (rotación automática)
```env
GEMINI_FLASH_API_KEYS=clave1,clave2,clave3  # Prioridad
GEMINI_PRO_API_KEYS=clave1,clave2           # Fallback
```

### Flujo de Resiliencia
1. Intenta con `gemini-2.5-flash` + primera clave FLASH
2. Si falla por cuota → Rota a siguiente clave FLASH
3. Si todas las FLASH fallan → Cambia a `gemini-2.5-pro`
4. Rota entre claves PRO
5. Error solo si todas fallan

### Casos de Uso Activos
- **SEO de productos**: `/api/admin/generate-seo.ts`
- **Alt-text (multimodal)**: `/api/admin/generate-alt-text.ts`
- **Topic Clusters**: `/api/admin/clusters/` (con revisión humana)
- **Blog pipeline**: generate-ideas → generate-outline → optimize-post

---

## 🛒 E-commerce - Flujo de Compra

### Carrito
- **Storage**: `localStorage` (persistencia)
- **Componente**: `components/Cart.tsx`
- **Personalización dinámica**: Grupos + opciones anidadas

### Checkout
```
[Carrito] → [Datos Cliente] → [Envío] → [Cupón] → [Pago] → [Confirmación]
```

### Métodos de Envío
- DAC: $250 (San José)
- Correo Uruguayo: $350 (Todo Uruguay)
- COTMI: $300 (Montevideo/Canelones)
- Retiro en local: $0

### Estados del Pedido
```
pending → confirmed → in_production → shipped → delivered
                  ↘                                  
                    cancelled
```

### Mercado Pago
- **API**: `POST /api/checkout/create-preference`
- **Webhook**: `/api/webhooks/mercadopago`
- **Eventos**: `payment.created`, `payment.updated`
- **Estados**: `approved`, `pending`, `rejected`

---

## 🎨 Reglas de Marca y Contenido

### Lenguaje OBLIGATORIO
✅ **Voseo uruguayo**: "tenés", "buscás", "pedí", "encontrá"  
❌ **PROHIBIDO**: "tienes", "buscas", "puedes", "encuentra"

### Diferenciación de Público

| Aspecto | B2C (Regalos/Agendas) | B2B (Sublimación) |
|---------|----------------------|-------------------|
| **Tono** | Emocional, cercano, "vendedor experto" | Profesional, técnico, facilitador |
| **Keywords** | "Personalizado", "Con nombre", "Regalo ideal", "Uruguay" | "Para sublimar", "Insumo", "Mayorista", "Uruguay" |
| **Mención sublimación** | ❌ **PROHIBIDO** (cliente final no necesita saber técnica) | ✅ **Recomendado** (es el diferencial) |
| **CTA** | "Asegurá el tuyo", "Pedilo hoy" | "Potenciá tus ventas", "Pedilo para tu taller" |
| **Diferencial** | Tapas duras, laminado resistente, personalización | Calidad de superficie, durabilidad, disponibilidad mayorista |

### USPs (Unique Selling Points)
- Tapa dura
- Papel 80g
- Laminado resistente al agua
- Espiral metálico
- Producción local (San José de Mayo, Uruguay)
- Personalización con nombre/logo

---

## 🔐 Variables de Entorno Críticas

```env
# Base de datos
MONGODB_URI=mongodb+srv://...

# Autenticación
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://www.papeleriapersonalizada.uy

# Gemini AI (Sistema nuevo - listas separadas por comas)
GEMINI_FLASH_API_KEYS=key1,key2,key3
GEMINI_PRO_API_KEYS=key1,key2

# ⚠️ DEPRECADAS (NO USAR):
# GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_MODEL

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=...
NEXT_PUBLIC_BASE_URL=https://www.papeleriapersonalizada.uy

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=...
AWS_REGION=us-east-1

# Email
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=info@papeleriapersonalizada.uy
```

---

## 🚀 Comandos Útiles

### Desarrollo
```bash
npm run dev                    # Puerto 3000
npm run dev:martin             # Con .env.martin
npm run dev:martin2            # Con .env.martin2
npm run dev:com                # Con .env.companero
```

### Testing
```bash
npm test                       # Jest
npm run lint                   # ESLint
```

### Scripts de Utilidad
```bash
# Enriquecer keywords con IA
npx ts-node scripts/enrich-keywords.ts

# Probar claves de Gemini
node scripts/test-gemini-keys.js

# Listar categorías
node scripts/list-categories.js
```

### Build y Deploy
```bash
npm run build                  # Build + next-sitemap
npm start                      # Servidor producción
npm run analyze                # Bundle analyzer
```

---

## 📖 Documentación Clave

### Archivos de Referencia
- **[AI_README.md](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/AI_README.md)**: Sistema de IA y Topic Clusters
- **[VERCEL_DEPLOYMENT.md](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/VERCEL_DEPLOYMENT.md)**: Guía de deployment
- **[CHANGELOG.md](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/CHANGELOG.md)**: Historial completo de cambios

### Componentes Principales
- **[gemini-client.ts](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/lib/gemini-client.ts)**: Cliente IA con resiliencia
- **[Cart.tsx](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/components/Cart.tsx)**: Carrito de compras
- **[PriceLock.tsx](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/components/PriceLock.tsx)**: Componente de precio bloqueado (referencia B2B)

### Modelos Mongoose Clave
- [Product.ts](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/models/Product.ts)
- [Order.ts](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/models/Order.ts)
- [Coupon.ts](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/models/Coupon.ts)
- [BlogPost.ts](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/models/BlogPost.ts)

---

## 🔄 Topic Clusters (Flujo Especial)

Sistema de optimización de enlazado interno con **revisión humana obligatoria**.

### Flujo Completo
```
1. Usuario en /admin/clusters hace clic en "Generar Sugerencias"
2. API genera contenido con IA → Guarda en proposedContent
3. Estado cambia a pending_review
4. Admin ve botón "Revisar Cambios"
5. Página /admin/clusters/review/[id] muestra Diff Viewer
6. Admin compara original vs sugerido
7. Aprueba → Copia a campo público + res.revalidate()
8. Cambios visibles inmediatamente en sitio
```

**Principio**: Ningún contenido IA se publica sin aprobación humana.

---

## ⚠️ Puntos Críticos a Recordar

### 1. Validación de Precios
```typescript
// ❌ MAL - Nunca confiar en frontend
const total = req.body.total;

// ✅ BIEN - Calcular en backend
const products = await Product.find({ _id: { $in: itemIds } });
const total = calculateTotalSafely(products, items);
```

### 2. Voseo Uruguayo
Siempre validar que la IA use voseo:
```typescript
if (seoTitle.includes("tienes") || seoTitle.includes("buscas")) {
  console.warn("⚠️ La IA no usó voseo uruguayo");
}
```

### 3. Restricción de Sublimación
En productos B2C, **NUNCA** mencionar "sublimación" o técnicas de producción.

### 4. Atomicidad de Transacciones
Usar sesiones de MongoDB para operaciones críticas (pedidos + cupones):
```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Order.create([orderData], { session });
  await Coupon.updateOne({ code }, { $inc: { usageCount: 1 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

---

## 🎯 Workflow Típico de Nueva Sesión

Al iniciar una nueva sesión, sigue este flujo:

1. **Leer esta skill** para refrescar contexto
2. **Identificar el tipo de tarea**:
   - ¿Es relacionado con IA? → Lee [ai-prompt-engineer](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ai-prompt-engineer/SKILL.md)
   - ¿Es SEO/contenido? → Lee [seo-expert](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/seo-expert/SKILL.md)
   - ¿Es e-commerce/pagos? → Lee [ecommerce-flow-specialist](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ecommerce-flow-specialist/SKILL.md)
   - ¿Es UX/diseño? → Lee [ux-optimizer](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ux-optimizer/SKILL.md)
3. **Revisar archivos relevantes** en `lib/`, `models/`, `pages/api/`
4. **Verificar que las claves de Gemini funcionen** (si trabajarás con IA)
5. **Confirmar el público objetivo** (B2B vs B2C) para ajustar tono

---

## 📞 Contacto del Owner

- **Desarrollador**: Martín Cedrés
- **Email**: martinfernandocedres@gmail.com
- **Ubicación**: San José de Mayo, Uruguay

---

## ✅ Checklist de Inicio de Sesión

- [ ] Leí `project-context` skill
- [ ] Identifiqué el tipo de tarea
- [ ] Leí la(s) skill(s) relevante(s)
- [ ] Revisé las variables de entorno necesarias
- [ ] Confirmé el público objetivo (B2B/B2C)
- [ ] Verifiqué las reglas de voseo uruguayo
- [ ] Entiendo las restricciones de contenido

**¡Listo para trabajar en Kamaluso!** 🚀
