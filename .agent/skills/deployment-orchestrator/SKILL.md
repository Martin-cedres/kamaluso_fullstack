---
description: Guía de estrategias de deployment en Vercel y gestión de ambientes
---

# Skill: Deployment & Vercel Orchestrator

## Propósito
Esta habilidad guía al agente en la gestión de deployments en Vercel, configuración de ambientes, validaciones pre-deploy y estrategias de rollback para el proyecto Kamaluso.

## Arquitectura de Deployment

**Plataforma**: Vercel
**Framework**: Next.js 16.0.10 (App optimizada para Pages Router)
**Dominio**: www.papeleriapersonalizada.uy

## Ambientes

### 1. Development (Local)
```bash
npm run dev  # Puerto 3000
```
- Usa `.env.local`
- Hot reload habilitado
- Modo debug de Next.js

### 2. Preview (Vercel)
- Cada push a branch que no sea main
- URL: `kamaluso-[branch]-[hash].vercel.app`
- Variables de entorno: "Preview"
- Ideal para testing de features

### 3. Production (Vercel)
- Deployments desde branch `main`
- URL: www.papeleriapersonalizada.uy
- Variables de entorno: "Production"
- ISR habilitado para páginas estáticas

## Configuración de Vercel

### Variables de Entorno
**Ubicación en Vercel**: Settings → Environment Variables

#### Producción:
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://www.papeleriapersonalizada.uy

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...  # Token PRODUCCIÓN

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=kamaluso-images

# Google Gemini
GEMINI_PRO_API_KEYS=key1,key2,key3
GEMINI_FLASH_API_KEYS=key1,key2

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=pedidos@papeleriapersonalizada.uy

# Otros
NEXT_PUBLIC_BASE_URL=https://www.papeleriapersonalizada.uy
```

#### Preview:
- Usar **sandbox** de Mercado Pago: `TEST-...`
- Usar BD de staging si existe
- Deshabilitar emails reales (usar servicio de test)

### Build Settings
**Framework Preset**: Next.js
**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

### Configuración Avanzada (vercel.json)
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "rewrites": [],
  "redirects": []
}
```

## Flujo de Deployment

### 1. Pre-Deploy Checklist
```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build local para detectar errores
npm run build

# Tests (si existen)
npm test
```

### 2. Deployment Automático
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad  # Preview deployment
```

**Vercel automáticamente**:
1. Detecta el push
2. Ejecuta `npm install`
3. Ejecuta `npm run build`
4. Despliega a preview URL
5. Comenta en el PR con el link

### 3. Deployment a Producción
```bash
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
```

**Production Deploy**:
- Vercel despliega automáticamente
- Ejecuta `postbuild` script (genera sitemap)
- Asigna dominio custom

## Estrategias de Rendering

### Static Generation (SSG)
Páginas con `getStaticProps`:
- `/productos/[slug]`
- `/blog/[slug]`
- `/categorias/[slug]`

**Ventaja**: Carga instantánea, SEO perfecto
**Desventaja**: Datos pueden quedar desactualizados

### Incremental Static Regeneration (ISR)
```typescript
export async function getStaticProps({ params }) {
  return {
    props: { product },
    revalidate: 3600 // Regenerar cada 1 hora
  };
}
```

**On-Demand Revalidation** (recomendado):
```typescript
// En API de actualización de producto
res.revalidate(`/productos/${product.slug}`);
res.revalidate(`/categorias/${category.slug}`);
```

### Server-Side Rendering (SSR)
Páginas con `getServerSideProps`:
- `/admin/*` (datos en tiempo real)
- `/checkout` (estado de carrito)

### Client-Side Rendering (CSR)
Componentes con `ssr: false`:
```typescript
const DynamicComponent = dynamic(
  () => import('../components/HeavyComponent'),
  { ssr: false }
);
```

## Revalidación On-Demand

### Ejemplo: Al Actualizar Producto
```typescript
// pages/api/admin/products/[id].ts
export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const product = await Product.findByIdAndUpdate(req.query.id, req.body);
    
    // Revalidar páginas afectadas
    try {
      await res.revalidate(`/productos/${product.slug}`);
      await res.revalidate(`/categorias/${product.category.slug}`);
      await res.revalidate('/productos'); // Listado general
      
      console.log('✅ Páginas revalidadas');
    } catch (err) {
      console.error('❌ Error en revalidación:', err);
    }
    
    res.json({ success: true, product });
  }
}
```

### Páginas a Revalidar en Diferentes Escenarios:

**Al crear/editar Producto**:
- `/productos/[slug]`
- `/categorias/[categorySlug]`
- `/productos` (listado)
- Homepage (si es destacado)

**Al crear/editar Post**:
- `/blog/[slug]`
- `/blog` (listado)

**Al actualizar Pillar Page**:
- `/blog/[pillarSlug]`
- Todos los posts del cluster

## Manejo de Errores en Build

### Error: "Module not found"
**Causa**: Import de módulo que solo existe en dev dependencies

**Solución**:
```bash
npm install [paquete] --save  # No --save-dev
```

### Error: "API resolved without sending a response"
**Causa**: API route no termina con `res.send()` o `res.json()`

**Solución**:
```typescript
export default async function handler(req, res) {
  try {
    const data = await fetchData();
    res.status(200).json(data);  // ✅ Siempre responder
  } catch (error) {
    res.status(500).json({ error: error.message });  // ✅ También en catch
  }
}
```

### Error: "Exceeded serverless function size"
**Causa**: Bundle muy grande (límite: 50MB)

**Solución**:
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns']
  }
};
```

## Monitoring y Logs

### Vercel Dashboard
**Ubicación**: https://vercel.com/[usuario]/kamaluso/logs

**Filtros útiles**:
- `status:500` - Errores del servidor
- `path:/api/checkout` - Logs de checkout
- `duration:>1000` - Requests lentos

### Real User Monitoring (RUM)
```typescript
// pages/_app.tsx (ya implementado)
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

**Métricas disponibles**:
- Core Web Vitals (LCP, FID, CLS)
- Visitas por página
- Tasa de rebote
- Tiempo de carga

## Rollback Strategy

### Opción 1: Revertir desde Vercel Dashboard
1. Ir a "Deployments"
2. Seleccionar deployment anterior estable
3. Click en "..." → "Promote to Production"

### Opción 2: Git Revert
```bash
git revert HEAD
git push origin main  # Despliega automáticamente
```

### Opción 3: Rollback Manual
```bash
git checkout [commit-hash-estable]
git push -f origin main  # ⚠️ Usar con cuidado
```

## Troubleshooting

### Deployment atascado en "Building"
1. Revisar logs de build en Vercel
2. Verificar que no hay errores de TypeScript
3. Cancelar y re-deploy

### Variables de entorno no se aplican
1. Verificar que están en el ambiente correcto (Production/Preview)
2. Re-deploy (cambios en env vars no reconstruyen automáticamente)

### 404 en rutas después de deploy
**Causa**: Páginas dinámicas sin `getStaticPaths` completo

**Solución**:
```typescript
export async function getStaticPaths() {
  return {
    paths: [...], // Paths preconstruidos
    fallback: 'blocking' // Generar on-demand si no existe
  };
}
```

## Scripts Útiles

### Pre-Deploy Validation
```javascript
// scripts/pre-deploy-check.js
const { execSync } = require('child_process');

const checks = [
  { name: 'TypeScript', cmd: 'tsc --noEmit' },
  { name: 'Lint', cmd: 'npm run lint' },
  { name: 'Build', cmd: 'npm run build' }
];

for (const check of checks) {
  console.log(`🔍 Running ${check.name}...`);
  try {
    execSync(check.cmd, { stdio: 'inherit' });
    console.log(`✅ ${check.name} passed`);
  } catch (error) {
    console.error(`❌ ${check.name} failed`);
    process.exit(1);
  }
}

console.log('🚀 All checks passed! Ready to deploy.');
```

### Revalidate All Products
```typescript
// scripts/revalidate-all.ts
const products = await Product.find({ status: 'published' });

for (const product of products) {
  await fetch(`${baseUrl}/api/revalidate?path=/productos/${product.slug}`, {
    method: 'POST',
    headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET }
  });
  
  console.log(`✅ Revalidated: ${product.slug}`);
}
```

## Recursos Relacionados
- [Vercel Deployment Docs](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/VERCEL_DEPLOYMENT.md)
- [Next.js ISR Docs](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Vercel Project Settings](https://vercel.com/docs/concepts/projects/overview)

## Checklist para Deploy a Producción

- [ ] Tests pasando (si existen)
- [ ] Build local exitoso
- [ ] No hay errores de TypeScript
- [ ] Variables de entorno configuradas
- [ ] Sitemap regenerado (`npm run postbuild`)
- [ ] Imágenes optimizadas
- [ ] Secrets sensibles no en código
- [ ] CHANGELOG.md actualizado
- [ ] Branch actualizado con main
- [ ] Preview deployment verificado
- [ ] Plan de rollback definido
