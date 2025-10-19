# Kamaluso - Tienda E-commerce Full-Stack

![Demostración de Kamaluso](URL_DEL_GIF_O_SCREENSHOT_PRINCIPAL)

¡Hola! Soy Martín Cedrés. Construí **Papeleria Personalizada Kamaluso**, una plataforma de e-commerce completa y funcional para una tienda de papelería personalizada. Este proyecto abarca desde la visualización de productos y un flujo de compra completo para el cliente, hasta un panel de administración para la gestión de contenido, pedidos y cupones.

**[Ver Demo en Vivo](www.papeleriapersonalizada.uy)**

---

## ✨ Características Principales

- **Flujo de E-commerce Completo:**
  - Catálogo de productos con categorías y subcategorías dinámicas.
  - Búsqueda de productos.
  - Carrito de compras persistente.
  - Proceso de checkout con múltiples métodos de envío y pago.
  - **Integración con Mercado Pago** para procesamiento de pagos con tarjeta.
  - Aplicación de cupones de descuento.

- **Panel de Administración Seguro:**
  - Autenticación de administrador con NextAuth.
  - **Gestión de Contenido (CMS):** Crear, leer, actualizar y eliminar (CRUD) para Productos, Categorías, Posts del Blog y Cupones.
  - Panel para visualizar y gestionar pedidos de clientes.
  - Moderación de reseñas de productos.

- **Optimización y SEO:**
  - **Renderizado Híbrido de Next.js:** Uso de `getStaticProps` con Revalidación Estática Incremental (ISR) para un rendimiento óptimo.
  - **Optimización de Imágenes** con `next/image`.
  - Generación automática de `sitemap.xml` y `robots.txt`.
  - **Datos Estructurados (Schema.org)** para Productos, Artículos y Breadcrumbs para mejorar los resultados en Google.

---

## 🚀 Stack Tecnológico

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Base de Datos:** MongoDB con Mongoose
- **Autenticación:** NextAuth.js
- **Procesamiento de Pagos:** Mercado Pago SDK
- **Despliegue:** Vercel
- **Otros:** Nodemailer, S3, Jest & React Testing Library.

---

## 🔧 Instalación y Uso Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno en un archivo `.env.local`.
   ```env
   MONGODB_URI=...
   NEXTAUTH_SECRET=...
   MERCADOPAGO_ACCESS_TOKEN=...
   # ... y otras variables
   ```
4. Ejecuta la aplicación en modo de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 💡 Mis Decisiones Arquitectónicas

**Elección de Renderizado Híbrido:**
> Decidí usar una estrategia de renderizado híbrida en Next.js para maximizar el rendimiento. Las páginas de productos y categorías se generan estáticamente con ISR (`revalidate`), lo que proporciona tiempos de carga casi instantáneos. Para el panel de administración, donde los datos deben estar siempre actualizados, utilicé renderizado del lado del cliente y rutas de API seguras.

**Modelo de Datos Flexible para Personalizaciones:**
> Diseñé los esquemas de Mongoose para las personalizaciones de productos de una manera flexible, utilizando grupos y opciones anidadas. Esto permite al administrador de la tienda añadir nuevos tipos de personalización (como 'Tipo de Tapa' o 'Color de Elástico') directamente desde el panel de administración sin necesidad de cambiar el código, lo que hace que la aplicación sea muy escalable.

---

## ✍️ Sobre Mí y Contacto

Soy **Martín Cedrés**, un desarrollador web apasionado por crear aplicaciones robustas, eficientes y visualmente atractivas. Este proyecto es una muestra de mi trabajo y de lo que puedo construir.

**Estoy buscando activamente nuevas oportunidades para colaborar en proyectos desafiantes.** Si mi trabajo te ha gustado, no dudes en contactarme.

**Email:** martinfernandocedres@gmail.com
