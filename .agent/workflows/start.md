---
description: Carga rápida de contexto del proyecto Kamaluso para iniciar sesión de trabajo
---

# Workflow: Start - Onboarding Instantáneo de Kamaluso

Este workflow te ayuda a cargar rápidamente todo el contexto del proyecto Kamaluso al iniciar una nueva sesión de trabajo.

## Pasos

### 1. Cargar contexto principal del proyecto
Lee la skill `project-context` para obtener una visión completa del proyecto:
- Stack tecnológico
- Estructura de carpetas
- Reglas de marca y contenido (voseo uruguayo, B2B vs B2C)
- Skills disponibles
- Sistema de IA con Gemini
- Flujo de e-commerce y Mercado Pago
- Variables de entorno críticas
- Comandos útiles

**Acción**: Leer [project-context SKILL.md](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/project-context/SKILL.md)

---

### 2. Identificar el tipo de tarea

Pregunta al usuario: **"¿En qué te gustaría trabajar hoy?"** 

Opciones comunes:
- 🤖 **Funcionalidad con IA/Gemini** (generación de contenido, SEO, alt-text)
- 📝 **Contenido SEO o Blog** (descripciones, posts, keywords)
- 🛒 **E-commerce** (carrito, checkout, pagos, cupones)
- 🎨 **UX/UI** (diseño, conversión, mobile)
- 🔧 **API o Integración** (webhooks, servicios externos)
- 📊 **Admin Panel** (CRUD, gestión de pedidos)
- ⚡ **Performance** (optimización, Lighthouse)
- 🧪 **Testing** (Jest, estrategias de testing)
- 🚀 **Deployment** (Vercel, CI/CD)
- 📦 **Base de datos** (modelos, migraciones)
- 🆕 **Otra tarea** (describir)

---

### 3. Cargar skills adicionales según la tarea

Basándote en la respuesta del usuario, lee las skills relevantes:

#### Si es **IA/Gemini**:
- Leer [ai-prompt-engineer](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ai-prompt-engineer/SKILL.md)
- Verificar claves de Gemini funcionando

#### Si es **SEO/Contenido**:
- Leer [seo-expert](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/seo-expert/SKILL.md)
- Confirmar público objetivo (B2B vs B2C)

#### Si es **E-commerce/Pagos**:
- Leer [ecommerce-flow-specialist](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ecommerce-flow-specialist/SKILL.md)
- Revisar modelos: Order.ts, Coupon.ts, Product.ts

#### Si es **UX/UI**:
- Leer [ux-optimizer](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/ux-optimizer/SKILL.md)
- Considerar patrones mobile-first

#### Si es **Admin Panel**:
- Leer [admin-generator](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/admin-generator/SKILL.md)

#### Si es **API/Integración**:
- Leer [api-integration-expert](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/api-integration-expert/SKILL.md)

#### Si es **Performance**:
- Leer [performance-auditor](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/performance-auditor/SKILL.md)

#### Si es **Testing**:
- Leer [testing-strategy-guide](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/testing-strategy-guide/SKILL.md)

#### Si es **Deployment**:
- Leer [deployment-orchestrator](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/deployment-orchestrator/SKILL.md)
- Revisar [VERCEL_DEPLOYMENT.md](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/VERCEL_DEPLOYMENT.md)

#### Si es **Base de datos**:
- Leer [database-guard](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/.agent/skills/database-guard/SKILL.md)
- Revisar modelos en `/models/`

---

### 4. Verificar reglas críticas

Antes de comenzar cualquier tarea, confirmar:

✅ **Voseo uruguayo**: Si es contenido, usar "tenés", "buscás", "pedí" (nunca "tienes", "buscas", "puedes")

✅ **Público objetivo**: 
- B2C (Regalos) → Tono emocional, NO mencionar "sublimación"
- B2B (Sublimación) → Tono profesional, SI mencionar "sublimación"

✅ **Validación backend**: 
- Si trabajas con precios/pagos, calcular en backend (nunca confiar en frontend)

✅ **Sistema de IA**: 
- Si usas Gemini, importar `generateWithFallback` de `lib/gemini-agent`
- El sistema rota claves automáticamente

---

### 5. Confirmar entorno

Si vas a ejecutar código, confirmar:
- [ ] Variables de entorno necesarias configuradas en `.env.local`
- [ ] Conexión a MongoDB funcional (si usas base de datos)
- [ ] Claves de Gemini activas (si usas IA)
- [ ] Token de Mercado Pago (si trabajas con pagos)

---

### 6. ¡Listo para trabajar!

Responder al usuario:

**"Contexto de Kamaluso cargado! ✅"**

Resumen rápido:
- Proyecto: E-commerce de papelería personalizada (Next.js + MongoDB + Gemini AI)
- Ubicación: San José de Mayo, Uruguay
- Públicos: B2C (regalos) + B2B (sublimación)
- Regla de oro: Voseo uruguayo obligatorio

**¿Qué hacemos primero?**

---

## Notas

- Este workflow debe ejecutarse al inicio de cada nueva sesión
- Puedes invocarlo con `/start` en futuras sesiones
- Si ya conoces el tipo de tarea, puedes saltarte el paso 2 y mencionar directamente qué skill necesitas
