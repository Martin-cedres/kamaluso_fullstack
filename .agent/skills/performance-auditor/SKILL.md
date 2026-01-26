# Performance & Lighthouse Auditor Skill

Esta habilidad se encarga de monitorear y optimizar la velocidad de carga (Performance) y la experiencia de usuario (UX) en la web de Kamaluso, enfocándose en los Core Web Vitals y las métricas de Lighthouse.

## Propósito
- Identificar cuellos de botella en la renderización (LCP, FID, CLS).
- Optimizar el peso de los recursos (imágenes, scripts).
- Asegurar que el SEO técnico se beneficie de una carga rápida.
- Mantener la salud del sistema de fuentes y estilos.

## Directrices Técnicas

### 1. Imágenes (LCP & CLS)
- **Formatos**: Usar siempre `.webp` para fotos y `.svg` para iconos vectoriales.
- **Priority**: Los banners principales o imágenes "above the fold" deben tener la propiedad `priority` en el componente `Image` de Next.js.
- **Dimensiones**: Definir siempre `width` y `height` (o `aspect-ratio`) para evitar saltos de diseño (CLS).

### 2. Carga de Scripts
- Usar `next/script` con estrategias adecuadas:
  - `lazyOnload` para analíticas y widgets no críticos (Chat, WhatsApp).
  - `afterInteractive` para scripts necesarios para la funcionalidad básica.

### 3. Fuentes (Fonts)
- Utilizar `next/font/google` (ya implementado con Inter y Outfit) para evitar el parpadeo de texto sin estilo (FOUT).
- Verificar que las variables CSS de fuente (`--font-inter`, etc.) se apliquen correctamente en el `globals.css`.

### 4. Skeletons & Hydration
- Para componentes dinámicos (`ssr: false`), implementar siempre un estado de carga o "Skeleton" que mantenga el espacio visual del componente para evitar CLS cuando se hidrata en el cliente.

## Instrucciones para el Agente
- **Revisión Continua**: Al crear una nueva página de admin o de usuario, verificá que las imágenes tengan dimensiones definidas.
- **Análisis de Impacto**: Si agregás una librería nueva, advertí sobre el impacto en el tamaño del bundle.
- **Sugerencias Proactivas**: Si detectás imágenes pesadas o carga de datos ineficiente, proponé el uso de `getStaticProps` o caché de SWR/React Query.
