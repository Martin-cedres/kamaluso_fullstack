# Historial de Cambios (CHANGELOG) - Kamaluso Fullstack

---

## 📅 Sesión: 22 de noviembre de 2025

### 🚀 Implementación: Sistema de Páginas Pilares (Topic Clusters) con IA

*   **Descripción:** Se ha implementado un flujo de trabajo completo para la creación automatizada de "Páginas Pilares" optimizadas para SEO, impulsadas por Inteligencia Artificial. Este sistema permite generar contenido estratégico para posicionar temas clave en Google y aumentar las ventas.
*   **Componentes Implementados:**
    1.  **APIs de Generación de Estrategias (`/api/admin/clusters/generate-strategies.ts`):**
        *   La IA analiza un tema central y una descripción proporcionados, junto con el contenido existente (productos y posts), para sugerir un título de página pilar, meta-descripción SEO, posts y productos relevantes para enlazar, y títulos para nuevo contenido que fortalezca el clúster.
    2.  **APIs de Construcción de Páginas Pilares (`/api/admin/clusters/build-cluster.ts`):**
        *   La IA escribe el contenido HTML completo de la página pilar (mínimo 1500 palabras), integrando naturalmente enlaces a los productos y posts asociados, basándose en la estrategia generada previamente.
    3.  **Actualización del Controlador de Contenido (`pages/api/blog/[slug].ts`):**
        *   Ahora es capaz de diferenciar entre una publicación de blog (`Post`) y una Página Pilar (`PillarPage`), devolviendo el contenido correcto y sus relaciones (posts y productos asociados) al frontend.
    4.  **Actualización de la Página de Visualización (`pages/blog/[slug].tsx`):**
        *   La página de contenido general ha sido adaptada para renderizar de forma nativa tanto Posts como Pillar Pages, mostrando secciones dedicadas para los posts y productos que forman parte del clúster de la Página Pilar.
    5.  **Interfaz de Administración Renovada (`pages/admin/cluster-factory.tsx`):**
        *   La "Fábrica de Topic Clusters" ha sido completamente reconstruida para conectar con las nuevas APIs de IA, permitiendo a los administradores generar estrategias y construir páginas pilares de forma intuitiva, con estados de carga y notificaciones de éxito (incluyendo un enlace directo a la página creada).

### 🐞 Corrección: Autenticación en APIs de IA

*   **Descripción:** Se corrigió el método de autenticación en las nuevas APIs relacionadas con la IA (`/api/admin/clusters/generate-strategies.ts` y `/api/admin/clusters/build-cluster.ts`). Anteriormente utilizaban `getSession`, lo que podía causar errores internos del servidor. Ahora utilizan `getToken`, alineándose con las convenciones de autenticación del proyecto y garantizando un acceso seguro y funcional.

### 🔧 Ajuste Técnico: Estabilización de Modelos Gemini

*   **Descripción:** Se ha ajustado la configuración del cliente de IA para utilizar exclusivamente **`gemini-2.5-pro`** como modelo principal.
*   **Motivo:** Se detectaron inestabilidades y errores de API al intentar utilizar `gemini-3.0-pro` con las claves actuales. Este cambio asegura la disponibilidad inmediata del servicio y elimina los errores 500 en las generaciones de IA.

---

## 📅 Sesión: 20 de noviembre de 2025

### 🚀 Funcionalidad: Sistema de "Revisión y Aprobación" para Topic Clusters

*   **Descripción:** Se ha implementado un flujo de trabajo de validación humana para la potente herramienta de enlazado interno de Topic Clusters. En lugar de que la IA publique cambios de contenido directamente, ahora genera "sugerencias" que un administrador puede revisar, aprobar y publicar, combinando la velocidad de la automatización con el control de calidad humano.
*   **Cambios Clave (Backend):**
    1.  **Modelos Actualizados:** Se añadieron los campos `proposedContent` y `status` (o `contentStatus`) a los modelos `PillarPage`, `Post` y `Product` para almacenar las sugerencias de la IA y su estado.
    2.  **API de Sugerencias (`generate-links`):** Se refactorizó la API para que, en lugar de sobreescribir el contenido, guarde las sugerencias en `proposedContent` y actualice el estado a `pending_review`.
    3.  **Nuevas APIs de Soporte:** Se crearon dos nuevos endpoints:
        *   `GET /api/admin/clusters/review-data`: Para obtener todos los documentos de un cluster con cambios pendientes.
        *   `POST /api/admin/clusters/approve-changes`: Para publicar las sugerencias, mover el contenido a la versión final y disparar la revalidación de las páginas públicas.
*   **Cambios Clave (Frontend):**
    1.  **Nueva Dependencia:** Se instaló `react-diff-viewer-continued` para mostrar comparativas visuales del contenido.
    2.  **Gestor de Clusters Mejorado (`/admin/clusters`):** La página ahora detecta si un cluster tiene cambios pendientes y muestra un botón **"Revisar Cambios"** en lugar de "Generar Sugerencias".
    3.  **Nueva Página de Revisión (`/admin/clusters/review/[id]`):** Se creó una página dinámica donde el administrador puede ver una comparativa lado a lado del contenido original y el sugerido por la IA.
    4.  **Flujo de Aprobación:** La página de revisión incluye un botón **"Aprobar y Publicar Cambios"** que, al ser presionado, ejecuta el proceso de publicación en el backend y redirige al usuario.
*   **Beneficio Inmediato:** Control total sobre el contenido SEO. Previene que la IA publique errores o enlaces no deseados, asegurando que solo los cambios de la más alta calidad lleguen al sitio en vivo, lo cual es fundamental para una estrategia SEO robusta y confiable.

###  архитектурная перестройка (Architectural Overhaul): Cliente de IA Centralizado y Resiliente

*   **Descripción:** Se ha realizado una refactorización completa de cómo el proyecto se comunica con la API de Google Gemini. Se eliminó la lógica duplicada y la gestión manual de claves de todos los endpoints de la API y se centralizó en un único "cliente inteligente" (`lib/gemini-client.ts`).
*   **Cambios Clave:**
    1.  **Nueva Configuración de Claves:** Se abandonó el sistema de claves indexadas (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.). Ahora, la configuración en `.env.local` es más semántica y potente:
        *   `GEMINI_PRO_API_KEYS`: Una **lista separada por comas** de claves para los modelos de alta gama (ej. `gemini-3.0-pro`, `gemini-2.5-pro`).
        *   `GEMINI_FLASH_API_KEYS`: Una **lista separada por comas** de claves para los modelos de respaldo (ej. `gemini-2.5-flash`).
    2.  **Lógica Centralizada:** Toda la lógica de priorización de modelos, reintentos, rotación de claves y fallback ahora reside exclusivamente en `lib/gemini-client.ts`.
    3.  **Simplificación de Endpoints:** Todos los archivos en `pages/api/admin/` que utilizan IA han sido refactorizados para usar una única función (`generateWithFallback`), haciéndolos más limpios, consistentes y fáciles de mantener.
*   **Beneficios Inmediatos:**
    *   **Mayor Resiliencia:** El sistema ahora puede soportar fallos en múltiples claves de API sin interrumpir el servicio.
    *   **Uso Optimizado:** Se prioriza el uso de los modelos más potentes (Pro) y solo se recurre a los modelos más económicos (Flash) como último recurso.
    *   **Mantenibilidad:** Añadir nuevas funcionalidades de IA es ahora mucho más sencillo, ya que no requieren lógica de cliente personalizada.
*   **Archivos Afectados:**
    *   `lib/gemini-client.ts` (reescrito)
    *   `lib/gemini-agent.ts` (simplificado)
    *   `.env.local` (nuevo formato de variables)
    *   `AI_README.md` (documentación actualizada)
    *   `pages/api/admin/clusters/generate-links.ts`
    *   `pages/api/admin/generate-seo.ts`
    *   `pages/api/admin/generate-blog-post.ts`
    *   `pages/api/admin/generate-alt-text.ts`
    *   `pages/api/admin/blog/optimize-post.ts`
    *   `pages/api/admin/blog/generate-outline.ts`
    *   `pages/api/admin/blog/generate-ideas.ts`

---

## 📅 Sesión: 19 de noviembre de 2025

### 🚀 Implementación: Sistema de Topic Clusters con IA (v1 - Simulado)

*   **Descripción:** Se ha implementado la arquitectura completa para una estrategia de "Topic Clusters". Esto permite al usuario definir un contenido principal ("Página Pilar") y agrupar ("clusterizar") contenido de soporte (artículos y productos) alrededor de él. El objetivo final es automatizar el enlazado interno para señalar una fuerte autoridad temática a Google.
*   **Componentes Implementados:**
    1.  **Gestión de Páginas Pilares:**
        *   **Backend:** Se creó un nuevo modelo de base de datos (`models/PillarPage.ts`) y una API CRUD completa (`pages/api/admin/pillar-pages/`).
        *   **Frontend:** Se desarrolló una nueva interfaz de administración en `/admin/pillar-pages` para crear, editar y eliminar estas páginas.
    2.  **Gestor de Clusters:**
        *   **Frontend:** Se desarrolló una nueva interfaz de administración en `/admin/clusters`. Esta página permite al usuario seleccionar una Página Pilar y asociarle fácilmente artículos de blog y productos mediante casillas de verificación.
        *   **Backend:** Se creó la API (`pages/api/admin/clusters/update.ts`) para guardar estas asociaciones.
    3.  **Orquestador de Enlazado con IA:**
        *   **Frontend:** Se añadió un botón "🤖 Optimizar Enlazado" en el Gestor de Clusters.
        *   **Backend:** Se creó la API de orquestación (`pages/api/admin/clusters/generate-links.ts`) que prepara todo el contenido del cluster y lo formatea en un prompt avanzado para la IA.
*   **Estado Actual:** La funcionalidad está completa en **"Modo de Simulación"**. La llamada final a la IA y el guardado del contenido modificado están desactivados por seguridad. El sistema simula el éxito de la operación para permitir la prueba del flujo completo.

### ✅ Cómo Probar la Nueva Funcionalidad (Flujo de Usuario)

Para verificar que todo el sistema funciona como se espera, sigue estos pasos en tu panel de administración:

1.  **Crea una Página Pilar:**
    *  
    
    *   Haz clic en "Crear Nueva Página Pilar".
    *   Rellena los campos, por ejemplo:
        *   **Título:** `La Guía Definitiva de Agendas Personalizadas 2026`
        *   **Tema del Cluster:** `Agendas 2026`
        *   **Contenido:** Añade un texto de ejemplo.
    *   Guarda la página. Deberías verla aparecer en la lista.

2.  **Crea un Cluster:**
    *   Ve a la nueva sección **"Gestor de Topic Clusters"**.
    *   En el desplegable "Selecciona un Tema", elige el que acabas de crear (`Agendas 2026`).

3.  **Asocia Contenido al Cluster:**
    *   Al seleccionar el tema, aparecerán a la derecha dos columnas: "Artículos del Blog" y "Productos".
    *   Marca las casillas de varios artículos y productos que quieras asociar a tu Página Pilar. Verás que el contador de "seleccionados" se actualiza.

4.  **Guarda la Asociación:**
    *   Haz clic en el botón **"Guardar Cambios en Cluster..."**.
    *   Deberías recibir una notificación de "¡Cluster guardado con éxito!". Si recargas la página y vuelves a seleccionar el mismo tema, las casillas que marcaste deberían seguir marcadas.

5.  **Prueba la Simulación de la IA:**
    *   Con el cluster todavía seleccionado, haz clic en el nuevo botón morado: **"🤖 Optimizar Enlazado"**.
    *   El botón se desactivará y mostrará "Optimizando...".
    *   Tras unos segundos, deberías recibir una notificación de "¡Simulación de optimización de enlaces completada con éxito!". Esto confirma que todo el flujo, desde el botón hasta la API de simulación, funciona correctamente.

*   **Paso Final Pendiente:** Activar la llamada real a la IA en el backend para que el paso 5 modifique el contenido real.

### 🚀 Propuesta de Nueva Funcionalidad: Sistema de Topic Clusters con IA

*   **Descripción:** Se ha propuesto una nueva funcionalidad estratégica para implementar un sistema de "Topic Clusters". Esta es una técnica de SEO avanzado que consiste en crear una "Página Pilar" (un artículo largo y completo sobre un tema general) y enlazarla desde múltiples "Artículos Cluster" (artículos de blog más específicos). El objetivo es demostrar una profunda autoridad temática a Google, mejorando drásticamente el ranking de la página pilar para keywords competitivas.
*   **Plan de Acción Propuesto:**
    1.  **Crear el Contenido "Página Pilar":** Desarrollar un nuevo tipo de contenido en el sistema para las páginas pilares, con su propia gestión en el panel de administración.
    2.  **Crear un Gestor de Clusters:** Implementar una nueva interfaz en `/admin/clusters` para crear clusters temáticos, asignarles una página pilar y asociar los artículos de blog y productos que funcionarán como contenido cluster.
    3.  **Automatizar el Enlazado Interno con IA:** Crear una nueva herramienta de IA que, una vez definido un cluster, sea capaz de analizar todo el contenido y colocar de forma automática y contextual los enlaces internos desde los artículos cluster hacia la página pilar (y viceversa), asegurando una arquitectura de enlaces perfecta para el SEO.
*   **Estado:** Pendiente de aprobación por parte del usuario para comenzar con el Paso 1.

### 🐞 Corrección Crítica: Actualización de Modelos Gemini a 2.5

*   **Descripción:** Se corrigió un error de compatibilidad con la API de Gemini que resultaba en un `404 Not Found`. Los nombres de los modelos de IA fueron actualizados de `gemini-1.5-flash` y `gemini-1.5-pro` a `gemini-2.5-flash` y `gemini-2.5-pro` respectivamente.
*   **Archivos Afectados:**
    *   `pages/api/admin/generate-seo.ts`
    *   `pages/api/admin/generate-alt-text.ts`
*   **Beneficio:** Asegura la correcta comunicación con la API de Gemini, permitiendo que todas las funcionalidades de generación de contenido con IA operen sin errores.

### ✨ Mejora: Actualización Completa de Campos SEO con IA

*   **Descripción:** La función "Generar con IA" en el formulario de edición de productos ahora rellena **todos** los campos de contenido generados por la inteligencia artificial.
*   **Archivos Afectados:** `pages/admin/index.tsx` (función `handleGenerateContent`)
*   **Campos Actualizados Adicionalmente:** `descripcionBreve`, `faqs`, y `useCases`.
*   **Beneficio:** Optimización del flujo de trabajo al garantizar que todo el contenido generado por la IA (títulos, descripciones, keywords, puntos clave, descripción breve, FAQs y casos de uso) se aplique automáticamente al formulario del producto, reduciendo la edición manual.

---

## 📅 Sesión: 19 de noviembre de 2025

### 🔍 Análisis del Sistema de Generación SEO con IA

Se realizó un análisis exhaustivo de la arquitectura actual para la generación de contenido SEO, con los siguientes hallazgos:

*   **Sistema Actual:** La implementación se divide en dos endpoints de API principales, demostrando una arquitectura limpia y modular.
    *   `pages/api/admin/generate-alt-text.ts`:
        *   **Implementación:** Excelente y robusta. Utiliza correctamente el modelo multimodal (`gemini-1.5-flash-latest`) para analizar visualmente las imágenes.
        *   **Proceso:** Descarga la imagen desde su URL, la convierte a base64 y la envía a la IA junto con un prompt de alta calidad, muy específico y contextualizado para "Kamaluso".
        *   **Calificación:** Sigue las mejores prácticas para la generación de `alt-text` con IA.
    *   `pages/api/admin/generate-seo.ts`:
        *   **Implementación:** De nivel profesional. Es resiliente y sofisticada.
        *   **Características Destacadas:**
            1.  **Prompts Dinámicos:** Adapta las instrucciones enviadas a la IA según la categoría del producto (ej. "agendas 2026" vs "libretas"), lo que resulta en un contenido mucho más específico y efectivo.
            2.  **Resiliencia (Fallback):** Intenta usar el modelo más potente (`gemini-2.5-pro`) y, si falla, recurre automáticamente a un modelo más rápido (`gemini-2.5-flash`) para garantizar que el servicio no se interrumpa. Incluye reintentos con espera exponencial.
        *   **Calificación:** Una implementación avanzada que asegura alta disponibilidad y calidad del contenido.

*   **Conclusión del Análisis:** Ambos sistemas están muy bien implementados, son funcionales y superan las expectativas. No solo generan contenido, sino que lo hacen de una manera inteligente, específica y robusta. El agente **no realiza búsquedas activas en internet**, sino que se basa en el conocimiento del modelo y la información del producto, con la excepción de la descarga de imágenes para el `alt-text`.

### 🚀 Propuesta de Mejora: SEO Basado en Tendencias en Tiempo Real

Para evolucionar el sistema y hacerlo aún más potente, se propuso un plan para que el agente investigue las tendencias de búsqueda actuales antes de generar el contenido.

*   **Objetivo:** Pasar de un modelo de conocimiento estático a uno dinámico que utilice datos de búsqueda en tiempo real para generar un SEO más efectivo y competitivo.
*   **Plan de Acción Propuesto:**
    1.  **Crear una Función de Investigación:** Desarrollar una nueva función `getSearchTrends()` que utilice herramientas de búsqueda (`google_web_search`) para encontrar keywords y temas populares en Uruguay para un producto o categoría determinada.
    2.  **Integrar en la API:** Modificar `pages/api/admin/generate-seo.ts` para que llame a esta nueva función antes de construir el prompt.
    3.  **Enriquecer el Prompt:** Inyectar las tendencias y keywords encontradas en el prompt enviado a Gemini, dándole a la IA un contexto en tiempo real para su tarea de redacción.
    4.  **Implementar Caché (Recomendado):** Añadir una capa de caché para almacenar los resultados de las tendencias durante unas horas y así evitar búsquedas repetitivas y mejorar la velocidad.
*   **Estado:** Pendiente de aprobación por parte dl usuario.

---

## 📅 Sesión: 18 de noviembre de 2025

### 🗑️ Eliminación del Dashboard de Métricas

*   **Descripción:** Se ha eliminado la página del **Dashboard de Métricas** (`/admin/dashboard`) debido a que su implementación completa no es una prioridad inmediata.
*   **Detalles:** La página contenía datos de marcador de posición y su backend aún no había sido desarrollado. Se ha decidido posponer su implementación para enfocarse en otras funcionalidades más críticas.
*   **Estado:** La página y sus componentes asociados han sido removidos del proyecto.

### 🚀 Tarea Pendiente: Agente de Google Shopping con IA

*   **Descripción:** Se ha identificado la necesidad de desarrollar un "Agente de Google Shopping" que utilice la IA de Gemini.
*   **Objetivo:** Este agente clasificará automáticamente los productos según la taxonomía de Google y optimizará los títulos y descripciones para el feed de Google Shopping, generando un un archivo `google-shopping-feed.xml` enriquecido.
*   **Estado:** Pendiente de implementación.

---

## 📅 Sesión: 17 de noviembre de 2025

### 📊 Fase 1: Creación del Dashboard de Métricas
*   **Descripción:** Se ha creado la estructura inicial y el layout para el nuevo **Dashboard de Métricas** en la ruta `/admin/dashboard`.
*   **Detalles:** La página incluye tarjetas de marcador de posición para las métricas clave que se medirán: Visitas Orgánicas, Uso de Herramientas de IA, Rendimiento del Blog y Conversiones.
*   **Estado:** Este es el primer paso para construir el sistema de medición. El siguiente paso será conectar estos componentes a fuentes de datos reales (Google Analytics, base de datos interna).

---

## 📅 Sesión: 16 de noviembre de 2025

### ✨ Nuevas Funcionalidades y Mejoras Clave

En esta sesión, hemos implementado un conjunto de herramientas de Inteligencia Artificial para potenciar tu estrategia de SEO y la creación de contenidos, directamente desde el panel de administración.

#### 1. Buscador de Productos Reparado

*   **Descripción:** El buscador de productos en la página principal de tu tienda (`/productos`) ahora funciona correctamente. Antes, no mostraba resultados si no se seleccionaba una categoría específica.
*   **Beneficio:** Tus clientes podrán encontrar productos más fácilmente, mejorando la experiencia de usuario y las ventas.

#### 2. Gestión de SEO de Productos con IA

Hemos integrado la IA para ayudarte a optimizar el SEO de tus productos de dos maneras:

*   **Botón "SEO IA" en la Tabla de Productos:**
    *   **Ubicación:** En el panel de administración, en la tabla donde listas todos tus productos (en `/admin`), verás un nuevo botón **"SEO IA"** al lado de cada producto.
    *   **¿Cómo usarlo?** Haz clic en este botón para que la IA genere y guarde automáticamente el título SEO, la meta descripción, las palabras clave, una descripción breve, puntos clave y una descripción extensa para ese producto, basándose en la información que ya tiene en la base de datos.
    *   **Beneficio:** Actualiza rápidamente el SEO de tus productos sin tener que entrar a editarlos uno por uno. Ideal para aplicar nuevas estrategias de SEO o mejorar el contenido existente de forma masiva.

*   **Botón "Generar con IA" en el Formulario de Producto:**
    *   **Ubicación:** Cuando estás **creando un producto nuevo o editando uno existente**, dentro del formulario de producto.
    *   **¿Cómo usarlo?** Rellena el nombre y una descripción básica del producto. Luego, haz clic en **"Generar con IA"**. La IA te sugerirá contenido para el título SEO, meta descripción, palabras clave, descripción breve, puntos clave y descripción extensa, rellenando los campos del formulario.
    *   **Beneficio:** Te proporciona un punto de partida rápido y optimizado para el contenido de tus productos, que puedes revisar y ajustar antes de guardar.

#### 3. Flujo Completo de Creación de Contenido para el Blog con IA

Hemos creado una "línea de ensamblaje" inteligente para ayudarte a generar artículos de blog de alta calidad y optimizados para SEO:

*   **a) Fábrica de Ideas (Generación de Temas):**
    *   **Ubicación:** En el panel de administración, en la sección de Blog (`/admin/blog`), encontrarás un nuevo módulo llamado **"💡 Fábrica de Ideas para el Blog"**.
    *   **¿Cómo usarlo?** Introduce un tema general (ej: "regalos para empresas", "agendas personalizadas") y haz clic en **"Generar Ideas"**. La IA te mostrará 10 ideas de artículos, **directamente relacionadas con tus productos**, incluyendo título, palabra clave, público y un ángulo único.
    *   **Beneficio:** Supera el bloqueo del escritor y obtén ideas de contenido relevantes que promocionen tus productos.

*   **b) Arquitecto de Contenidos (Generación de Esquemas):**
    *   **Ubicación:** Después de generar ideas, haz clic en **"Usar esta Idea"** en la tarjeta de la idea que te interese.
    *   **¿Cómo usarlo?** Serás llevado a la página de "Crear Nuevo Artículo". Verás un mensaje de **"🤖 Arquitecto de Contenidos trabajando..."**. La IA generará automáticamente un esquema SEO detallado (con introducción, secciones, subsecciones, puntos clave, sugerencias de imágenes y enlaces internos) para tu artículo.
    *   **Beneficio:** Obtén un esqueleto profesional y optimizado para cada artículo, ahorrando tiempo en la planificación y asegurando una estructura SEO sólida.

*   **c) Especialista SEO (Optimización Final del Borrador):**
    *   **Ubicación:** En el formulario de creación/edición de un artículo, justo encima del editor de contenido.
    *   **¿Cómo usarlo?** Una vez que tengas tu borrador (ya sea generado por el Arquitecto o escrito por ti), haz clic en el botón **"✨ Optimizar con IA"**. La IA revisará tu texto, **insertará automáticamente enlaces internos a tus productos relevantes** (basándose en tu catálogo publicado en `www.papeleriapersonalizada.uy`) y pulirá el contenido para mejorar la legibilidad y el SEO.
    *   **Beneficio:** Asegura que tus artículos no solo atraigan tráfico, sino que también dirijan a los usuarios hacia tus productos, maximizando el potencial de ventas.

#### 4. SEO Técnico: Datos Estructurados para Preguntas Frecuentes (FAQ)

*   **Descripción:** Se ha implementado una arquitectura de datos estructurados (Schema.org) en todo el sitio para mejorar la comprensión del contenido por parte de los motores de búsqueda.
    *   **Schema Base:** Todas las páginas ahora incluyen los schemas `Organization` y `WebSite` para identificar correctamente el negocio.
    *   **Schema Específico:**
        *   **Página de FAQs:** Utiliza el schema `FAQPage` para que las preguntas puedan aparecer como resultados enriquecidos.
        *   **Páginas de Producto:** Utilizan un schema `@graph` que combina `Product` y `FAQPage` (si aplica), para una máxima riqueza de datos y visibilidad en Google.
        *   **Artículos del Blog:** Utilizan el schema `BlogPosting` para ser identificados como contenido editorial.
*   **Beneficio:** Aumenta drásticamente la visibilidad en Google, habilita la aparición de "resultados enriquecidos" (rich snippets) y establece una base de SEO técnico de primer nivel.

#### 5. Generación Automática de Alt-Text para Imágenes con IA

*   **Descripción:** Se ha integrado un asistente de IA que se activa al subir imágenes para productos o artículos de blog. La IA analiza visualmente la imagen y genera automáticamente un texto alternativo (`alt-text`) descriptivo y optimizado.
*   **¿Cómo funciona?** Al subir una nueva imagen, el campo "Texto Alternativo" se rellenará automáticamente con una sugerencia de la IA. Podrás revisarla y ajustarla antes de guardar.
*   **Beneficios Clave:**
    *   **Mejora del SEO:** Ayuda a que tus imágenes se posicionen en los resultados de búsqueda de Google Images.
    *   **Accesibilidad Web (a11y):** Asegura que tu sitio sea accesible para personas con discapacidad visual que utilizan lectores de pantalla.
*   **Costo:** Esta funcionalidad utiliza la API de Gemini, manteniéndose dentro de la capa gratuita del servicio.

#### ✅ Conclusión de la Sesión

*   **Resumen:** Se ha completado con éxito la implementación de un conjunto integral de herramientas de IA (optimización de productos, creación de contenido, generación de alt-text) y una arquitectura avanzada de SEO técnico (Schema.org).


---

### 🛠️ Notas Técnicas Importantes

*   **Modelos de IA:** La generación de texto se basa en `gemini-2.5-pro`/`flash`, mientras que el análisis de imágenes para el alt-text utiliza el modelo `gemini-2.5-pro-vision`. El sistema gestiona la selección del modelo automáticamente.
*   **Resiliencia de la IA:** Todas las funcionalidades de IA están configuradas para usar el modelo `gemini-2.5-pro` (de mayor calidad) y, si este no está disponible (por ejemplo, por límites de cuota en la versión gratuita), automáticamente recurrirán al modelo `gemini-2.5-flash` para asegurar que el servicio no se interrumpa.
*   **Configuración:** Para que las funcionalidades de IA operen, la variable de entorno `GEMINI_API_KEY` debe estar configurada en tu archivo `.env.local`.

---