# Historial de Cambios (CHANGELOG) - Kamaluso Fullstack

Este documento registra las actualizaciones y nuevas funcionalidades implementadas en el proyecto Kamaluso Fullstack, con un enfoque en cómo afectan al usuario del panel de administración.
---

## 📅 Sesión: 18 de noviembre de 2025

### 🗑️ Eliminación del Dashboard de Métricas

*   **Descripción:** Se ha eliminado la página del **Dashboard de Métricas** (`/admin/dashboard`) debido a que su implementación completa no es una prioridad inmediata.
*   **Detalles:** La página contenía datos de marcador de posición y su backend aún no había sido desarrollado. Se ha decidido posponer su implementación para enfocarse en otras funcionalidades más críticas.
*   **Estado:** La página y sus componentes asociados han sido removidos del proyecto.

### 🚀 Tarea Pendiente: Agente de Google Shopping con IA

*   **Descripción:** Se ha identificado la necesidad de desarrollar un "Agente de Google Shopping" que utilice la IA de Gemini.
*   **Objetivo:** Este agente clasificará automáticamente los productos según la taxonomía de Google y optimizará los títulos y descripciones para el feed de Google Shopping, generando un archivo `google-shopping-feed.xml` enriquecido.
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