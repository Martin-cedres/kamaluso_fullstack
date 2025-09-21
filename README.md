# Kamaluso - Papelería Personalizada

E-commerce de papelería personalizada especializada en agendas, libretas y cuadernos únicos.

## 🚀 Deploy en Vercel

### 1. Preparación del Proyecto

El proyecto ya está configurado y listo para deploy. Se han corregido todos los errores y el build es exitoso.

### 2. Variables de Entorno en Vercel

Configura las siguientes variables de entorno en tu dashboard de Vercel:

#### Base de Datos
- `MONGODB_URI`: URI de conexión a MongoDB Atlas

#### Autenticación
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth.js
- `NEXTAUTH_URL`: URL de tu aplicación (ej: https://tu-dominio.vercel.app)

#### Pagos
- `MERCADOPAGO_ACCESS_TOKEN`: Token de acceso de Mercado Pago

#### AWS S3 (Imágenes)
- `AWS_ACCESS_KEY_ID`: Clave de acceso AWS
- `AWS_SECRET_ACCESS_KEY`: Clave secreta AWS
- `AWS_REGION`: Región AWS (sa-east-1)
- `AWS_S3_BUCKET`: Nombre del bucket S3

#### Email
- `NODEMAILER_EMAIL`: Email para envío de notificaciones
- `NODEMAILER_PASSWORD`: Contraseña de aplicación

#### URL Base
- `NEXT_PUBLIC_BASE_URL`: URL de tu aplicación en producción

### 3. Deploy

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Next.js
3. Configura las variables de entorno
4. Haz clic en "Deploy"

### 4. Funcionalidades

✅ **E-commerce completo**
- Catálogo de productos
- Carrito de compras
- Checkout con múltiples métodos de pago
- Sistema de cupones

✅ **Panel de administración**
- CRUD de productos
- Gestión de pedidos
- Blog integrado
- Gestión de cupones

✅ **Optimizaciones**
- SEO optimizado
- Sitemap automático
- Imágenes optimizadas
- Responsive design

### 5. Estructura del Proyecto

```
├── components/          # Componentes reutilizables
├── context/            # Context API (Cart, Categories)
├── lib/                # Utilidades y configuraciones
├── models/             # Modelos de MongoDB
├── pages/              # Páginas y API routes
├── public/             # Assets estáticos
├── scripts/            # Scripts de migración
└── styles/             # Estilos globales
```

### 6. Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Autenticación**: NextAuth.js
- **Pagos**: Mercado Pago
- **Storage**: AWS S3
- **Email**: Nodemailer

### 7. Scripts Disponibles

- `npm run dev`: Desarrollo local
- `npm run build`: Build de producción
- `npm run start`: Servidor de producción
- `npm run analyze`: Análisis del bundle

---

**¡El proyecto está listo para deploy!** 🎉
