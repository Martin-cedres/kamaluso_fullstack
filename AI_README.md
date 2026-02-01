# Documentación de Integración de IA (Gemini)

Este documento detalla la arquitectura del cliente de IA de Google Gemini en el proyecto Kamaluso Fullstack. El sistema está diseñado para ser robusto, resiliente y fácil de usar, con gestión automática de claves y modelos.

## 1. Arquitectura del Cliente Inteligente

Toda la lógica de comunicación con la API de Gemini está centralizada en `lib/gemini-client.ts`. Este cliente inteligente gestiona automáticamente:

- **Priorización de Modelos:** Utiliza el modelo `gemini-2.5-flash` como modelo principal y primera opción (las claves PRO actualmente no están funcionando).
- **Fallback Automático:** Si todos los intentos con las claves "Flash" fallan, el sistema automáticamente intenta usar los modelos "Pro" (`gemini-2.5-pro`) como último recurso de emergencia.
- **Rotación de Claves:** El sistema rota automáticamente entre las claves de API disponibles para cada nivel (Flash y Pro) cuando detecta un error de cuota, maximizando el uso y la disponibilidad.

El acceso a esta lógica se realiza a través de una única función wrapper en `lib/gemini-agent.ts`.

## 2. Configuración de Claves de API

El sistema utiliza dos grupos de claves de API que deben ser definidas en tu archivo `.env.local` como **listas separadas por comas**.

- **Claves para Modelos FLASH (PRIORIDAD):**
  ```
  GEMINI_FLASH_API_KEYS=TU_CLAVE_FLASH_1,TU_CLAVE_FLASH_2,TU_CLAVE_FLASH_3
  ```
  Estas son las claves para los modelos rápidos. Se usarán como **primera opción** y rotarán entre sí. Este es el modelo principal del sistema.

- **Claves para Modelos PRO (Fallback de Emergencia):**
  ```
  GEMINI_PRO_API_KEYS=TU_CLAVE_PRO_1,TU_CLAVE_PRO_2
  ```
  Estas claves se usarán automáticamente **solo si todas las claves Flash fallan**. También rotan entre sí. Actualmente las claves PRO no están funcionando, pero se mantienen como respaldo de emergencia.

**Importante:** El sistema antiguo de claves indexadas (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.) y la variable `GEMINI_MODEL` ya **no se utilizan** y deben ser eliminados de tu configuración.

## 3. Cómo Usar el Agente de IA (Uso General)

Para cualquier nueva funcionalidad que requiera generar contenido con Gemini, el proceso es simple y consistente.

1.  **Importa el agente:**
    En tu archivo de API (ej. `pages/api/admin/my-new-feature.ts`), importa la función `generateWithFallback`.
    ```typescript
    import { generateWithFallback } from "../../../../lib/gemini-agent";
    ```

2.  **Construye tu prompt:**
    Prepara el prompt que necesitas enviar a la IA. Puede ser un simple string de texto o, para modelos de visión, un array multimodal.
    ```typescript
    // Para texto
    const prompt = "Resume el siguiente texto...";

    // Para visión (multimodal)
    const imagePart = await urlToGoogleGenerativeAIPart(imageUrl);
    const prompt = ["Describe esta imagen en el contexto de nuestro producto", imagePart];
    ```

3.  **Llama a la función:**
    Realiza la llamada a `generateWithFallback`. No necesitas especificar un modelo ni manejar la rotación de claves; el agente se encarga de todo.
    ```typescript
    try {
      const resultText = await generateWithFallback(prompt);
      // Procesa el resultado de la IA...
      res.status(200).json({ result: resultText });
    } catch (error: any) {
      // El error se lanza solo si TODOS los modelos y TODAS las claves fallan.
      console.error("Fallo total en la generación de contenido de IA:", error);
      res.status(500).json({ message: "Error al comunicarse con la IA", error: error.message });
    }
    ```

## 4. Flujos de IA Específicos del Proyecto

### Sistema de Topic Clusters (Revisión y Aprobación)

Para garantizar la calidad y el control sobre el contenido SEO, el sistema de optimización de enlazado interno no publica cambios automáticamente. En su lugar, utiliza un flujo de "Revisión y Aprobación" que combina la potencia de la IA con la supervisión humana.

**El Flujo Funciona de la Siguiente Manera:**

1.  **Generación de Sugerencias:**
    *   En la página `/admin/clusters`, el usuario hace clic en el botón **"Generar Sugerencias"**.
    *   Esto llama a la API `POST /api/admin/clusters/generate-links`.
    *   El backend ejecuta la IA, pero **no modifica el contenido público**. En su lugar, guarda el texto sugerido en un campo `proposedContent` y establece el `status` del documento a `pending_review`.

2.  **Notificación y Revisión:**
    *   La interfaz de `/admin/clusters` detecta los documentos con estado `pending_review` y muestra un botón de **"Revisar Cambios"**.
    *   Este botón lleva al usuario a una página de revisión dinámica: `/admin/clusters/review/[pillarPageId]`.

3.  **Visualización de Cambios:**
    *   La página de revisión llama a la API `GET /api/admin/clusters/review-data` para obtener todos los contenidos pendientes.
    *   Muestra una comparativa visual (Diff Viewer) del `contenido original` vs. el `contenido sugerido por IA` para cada documento afectado.

4.  **Aprobación y Publicación:**
    *   El usuario revisa los cambios. Si está de acuerdo, hace clic en el botón **"Aprobar y Publicar Cambios"**.
    *   Esto llama a la API `POST /api/admin/clusters/approve-changes`.
    *   El backend realiza la acción final: copia el `proposedContent` al campo público (`content` o `descripcionExtensa`), limpia el campo de propuesta, revierte el `status` a `published` y **dispara la revalidación On-Demand (`res.revalidate`)** de las páginas afectadas para que los cambios se reflejen inmediatamente en el sitio web público.

Este flujo asegura que ningún contenido generado por IA se publique sin la aprobación explícita del administrador, proporcionando un balance perfecto entre automatización y control de calidad.
