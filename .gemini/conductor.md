# Conductor del Proyecto Kamaluso (para Gemini CLI)

Este archivo sirve como guía principal para el agente Gemini CLI al interactuar con el proyecto Kamaluso. Su propósito es proporcionar instrucciones claras y concisas para las tareas comunes, la navegación del proyecto y las mejores prácticas específicas de este repositorio.

---

## 1. Contexto General del Proyecto

*   **Tipo de Proyecto:** Aplicación Full-Stack E-commerce y Plataforma de Contenido (Next.js, TypeScript, React).
*   **Base de Datos:** MongoDB (con Mongoose).
*   **Autenticación:** NextAuth.js.
*   **Pagos:** Mercado Pago.
*   **Almacenamiento de Archivos:** AWS S3.
*   **Inteligencia Artificial:** Google Generative AI (integrado para SEO y generación de contenido).
*   **Estilado:** Tailwind CSS.
*   **Testing:** Jest y React Testing Library.
*   **Despliegue:** Probablemente Vercel, con posibles funciones AWS Lambda.

---

## 2. Puntos Clave de la Arquitectura

*   **Monolito Next.js:** Frontend, Backend (API Routes) y SSR coexisten en la misma base de código.
*   **Capa de Modelos:** `models/` contiene los esquemas de Mongoose.
*   **Capa de Servicios/Utilidades:** `lib/` contiene funciones de utilidad, clientes para servicios externos (MongoDB, Gemini, S3), y lógica de negocio.
*   **Rutas API:** `pages/api/` maneja los endpoints del backend.
*   **Panel de Administración:** `pages/admin/` contiene la interfaz para la gestión del contenido y configuraciones.
*   **Scripts:** `scripts/` alberga una colección extensa de scripts de mantenimiento, migración, análisis y generación de contenido.

---

## 3. Flujos de Trabajo Recomendados para el Agente

### 3.1. Entendimiento Inicial y Profundo

*   **Al iniciar:** Siempre revisa `package.json`, `next.config.js`, `tsconfig.json` y `jest.config.js` para el contexto más actualizado.
*   **Exploración de Código:** Para nuevas tareas o análisis de bugs, prioriza el uso de `codebase_investigator` o `search_file_content` para localizar código relevante.
*   **No Asumir:** Nunca asumas el contenido de un archivo sin leerlo primero con `read_file`.

### 3.2. Desarrollo y Modificación de Código

*   **Conformidad de Estilo:** Adhiérete estrictamente al estilo de código existente (indentación, nombrado, etc.). El proyecto usa Prettier (`.prettierrc`) y ESLint (`.eslintrc.json`).
*   **Tipado:** Utiliza TypeScript siempre que sea posible, siguiendo los tipos existentes o definiéndolos cuando sea necesario.
*   **Localización:** El proyecto utiliza español en muchas partes del código (nombres de variables, comentarios, rutas de API). Mantén la coherencia.
*   **Testing:** Al añadir nuevas características o corregir bugs, es fundamental añadir o actualizar tests (`.test.ts`, `.test.tsx`). Ejecuta `npm test` para verificar.
*   **Verificación:** Después de cualquier cambio de código, ejecuta `npm run lint` y `npm run build` para asegurar la calidad y la ausencia de errores.

### 3.3. Interacción con la Base de Datos

*   **Modelos:** Los modelos de Mongoose se encuentran en `models/`. Utilízalos para cualquier interacción con la base de datos.
*   **Conexión:** La conexión a MongoDB se gestiona a través de `lib/mongodb.ts`. Asegúrate de usar la conexión existente o establecerla correctamente.

### 3.4. Uso de IA (Google Generative AI)

*   **Cliente:** El cliente de Gemini se inicializa en `lib/gemini-client.ts`. Utilízalo para todas las interacciones con el modelo de IA.
*   **Contexto:** Cuando generes contenido o estrategias, asegúrate de utilizar el contexto adecuado del producto/categoría/blog, que a menudo se almacena en la base de datos.

### 3.5. Scripts de Mantenimiento

*   **Ejecución:** Para ejecutar scripts en la carpeta `scripts/`, utiliza `ts-node` o `node` según el tipo de archivo (`.ts` o `.js`). Por ejemplo: `ts-node scripts/analyze-content-gaps.ts`.

---

## 4. Consideraciones Específicas

*   **Entornos:** El proyecto utiliza variables de entorno para diferentes configuraciones (`.env.martin`, `.env.companero`). Sé consciente de esto si se solicita trabajar en un entorno específico.
*   **Imágenes:** Las imágenes se manejan a través de S3 y un loader personalizado. Al manipular rutas de imagen, considera esta configuración.
*   **Redirecciones:** Las redirecciones se gestionan dinámicamente a través de `redirects-map.json`. Tenlo en cuenta al modificar estructuras de URL.

---

Este `conductor.md` tiene como objetivo optimizar tu rendimiento como agente en este proyecto, proporcionándote la información esencial de forma accesible. Siempre consulta este archivo para orientarte.
