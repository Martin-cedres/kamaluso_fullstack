import { NextApiRequest, NextApiResponse } from 'next';
import { generateWithFallback } from '../../../../lib/gemini-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { title, targetKeyword, audience, angle } = req.body;

  if (!title || !targetKeyword) {
    return res.status(400).json({ message: 'El título y la palabra clave son requeridos para generar el esquema.' });
  }

  try {
    const storeName = "Papelería Personalizada Kamaluso";

    const prompt: string = "Eres un Arquitecto de Contenidos para E-commerce de clase mundial y experto en SEO, trabajando para \"" + storeName + "\".\n" +
      "Tu misión es diseñar un esquema (outline) en HTML para un artículo de blog que no solo eduque, sino que guíe al lector a través de un viaje de compra, culminando en la adquisición de un producto.\n\n" +
      "**Detalles Estratégicos de la Idea (Input):**\n" +
      "- Título Propuesto: \"" + title + "\"\n" +
      "- Keyword Principal (Objetivo SEO): \"" + targetKeyword + "\"\n" +
      "- Público Objetivo: \"" + (audience || 'General') + "\"\n" +
      "- Ángulo de Venta (Objetivo Comercial): \"" + (angle || 'No especificado') + "\"\n\n" +
      "**Instrucciones para el Esquema Persuasivo:**\n" +
      "1.  **Estructura HTML Detallada:** Genera el esquema en formato HTML.\n" +
      "2.  **Framework AIDA Obligatorio:** El esqueleto del artículo DEBE seguir el framework AIDA (Atención, Interés, Deseo, Acción). Asigna cada sección principal (<h2>) a una de estas etapas.\n" +
      "    - **Atención (Introducción):** Un <h3> para la introducción. Debe presentar un problema o una idea que capture la atención del lector inmediatamente.\n" +
      "    - **Interés (Desarrollo):** Uno o más <h2>. Explora el tema, da información valiosa y presenta soluciones de forma general, despertando el interés.\n" +
      "    - **Deseo (Solución Específica):** Un <h2> clave. Aquí es donde conectas el problema con la solución específica: los productos de Kamaluso. Describe cómo los productos resuelven el problema de una manera única.\n" +
      "    - **Acción (Conclusión):** Un <h3> para la conclusión. Debe resumir el valor y hacer un llamado a la acción (Call to Action) claro y potente.\n" +
      "3.  **Integración de Keywords:** La \"Keyword Principal\" debe estar presente en al menos un `<h2>` y de forma natural en los `<h3>` o `<ul>` donde tenga sentido.\n" +
      "4.  **Planificación de CTAs y Enlaces:**\n" +
      "    - **Soft CTA:** En la sección 'Deseo', incluye un enlace contextual. Formato: \"[ENLACE INTERNO SUAVE: /productos/slug-del-producto, con el texto 'descubre nuestra colección de...']\".\n" +
      "    - **Hard CTA:** En la sección 'Acción', incluye un llamado a la acción directo y claro. Formato: \"[ENLACE INTERNO FUERTE: /productos/slug-del-producto, con el texto '¡Compra ahora y soluciona tu problema!']\".\n" +
      "5.  **Planificación de Visuales Persuasivos:** Sugiere imágenes que generen deseo. En lugar de imágenes genéricas, pide fotos de producto en uso o que muestren el resultado final del beneficio. Formato: \"[IMAGEN PERSUASIVA: descripción de una imagen que muestre el producto en un entorno aspiracional]\".\n\n" +
      "Devuelve el resultado como un objeto JSON con una única clave \"outlineHtml\" que contenga la cadena HTML generada.\n" +
      "Ejemplo de formato de salida:\n" +
      "{\n" +
      "  \"outlineHtml\": \"<h3>Atención: ¿Cansado de regalos de empresa aburridos?</h3><p>Breve gancho sobre el problema...</p><h2>Interés: El impacto de un regalo memorable</h2><h3>¿Por qué importa la personalización?</h3><ul><li>Punto 1</li></ul><h2>Deseo: Libretas personalizadas que elevan tu marca</h2><p>Aquí hablas de cómo las libretas de Kamaluso son la solución perfecta...</p><p>[IMAGEN PERSUASIVA: Foto de un cliente feliz recibiendo una libreta con el logo de su empresa impreso con alta calidad]</p><p>[ENLACE INTERNO SUAVE: /productos/libretas-personalizadas, con el texto 'descubre todas las opciones de personalización para tu empresa']</p><h3>Acción: Transforma tu estrategia de regalos hoy</h3><p>Resumen final y llamado a la acción...</p><p>[ENLACE INTERNO FUERTE: /productos/libretas-personalizadas, con el texto '¡Cotiza tus libretas personalizadas ahora!']</p>\"\n" +
      "}\n";

    const geminiResponseText = await generateWithFallback(prompt);

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedResult = JSON.parse(cleanedText);

    res.status(200).json(generatedResult);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error generando el esquema para el blog:');
    console.error(error.message);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
