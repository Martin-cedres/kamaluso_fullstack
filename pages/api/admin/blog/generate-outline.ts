
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { title, targetKeyword, audience, angle } = req.body;

  if (!title || !targetKeyword) {
    return res.status(400).json({ message: 'El título y la palabra clave son requeridos para generar el esquema.' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('Falta la variable GEMINI_API_KEY en el servidor.');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const storeName = "Papelería Personalizada Kamaluso";

    const prompt = "Eres un arquitecto de contenidos SEO y experto en estructura de artículos para blogs de e-commerce. Tu misión es crear un esquema detallado y optimizado para SEO para un artículo de blog de \"" + storeName + "\". El esquema debe ser fácil de seguir, lógico y diseñado para posicionar bien en Google Uruguay. **Detalles de la Idea del Artículo:** - Título Propuesto: \"" + title + "\" - Keyword Principal: \"" + targetKeyword + "\" - Público Objetivo: \"" + (audience || 'General') + "\" - Ángulo Único: \"" + (angle || 'No especificado') + "\". **Instrucciones para el Esquema (Outline):** 1. Genera el esquema en formato HTML. 2. Debe incluir: * Un encabezado `<h3>` para la introducción. * Múltiples encabezados `<h2>` para las secciones principales del artículo. * Encabezados `<h3>` para subsecciones dentro de los `<h2>` cuando sea apropiado. * Listas `<ul>` o `<li>` para los puntos clave a cubrir en cada sección. * Un encabezado `<h3>` para la conclusión. 3. Asegúrate de que la \"Keyword Principal\" se integre de forma natural en los títulos y subtítulos del esquema. 4. Sugiere dónde se pueden colocar enlaces internos a productos relevantes de Kamaluso. Usa el formato \"[ENLACE INTERNO: /productos/slug-del-producto]\". 5. Sugiere dónde se pueden colocar imágenes relevantes. Usa el formato \"[IMAGEN: Descripción de la imagen]\". Devuelve el resultado como un objeto JSON con una única clave \"outlineHtml\" que contenga la cadena HTML generada. Ejemplo de formato de salida: { \"outlineHtml\": \"<h3>Introducción</h3><p>Breve gancho...</p><h2>Sección Principal 1: [Keyword]</h2><h3>Subsección 1.1</h3><ul><li>Punto clave 1</li><li>Punto clave 2</li></ul>[ENLACE INTERNO: /productos/agendas]<h2>Conclusión</h2><p>Resumen y llamada a la acción...</p>\" }";

    const generateWithModelAndRetries = async (modelInstance: any, promptText: string, maxRetries = 3) => {
      let attempts = 0;
      let lastError: any = null;
      while (attempts < maxRetries) {
        try {
          const result = await modelInstance.generateContent(promptText);
          return (await result.response).text();
        } catch (err: any) {
          attempts++;
          lastError = err;
          console.warn(`Intento ${attempts} fallido para modelo. Mensaje:`, err?.message || err);
          if (attempts >= maxRetries) break;
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
        }
      }
      throw lastError;
    };

    let geminiResponseText = '';
    try {
      geminiResponseText = await generateWithModelAndRetries(modelPro, prompt, 3);
    } catch (errPro: any) {
      console.warn('gemini-2.5-pro falló, intentando con flash:', errPro?.message || errPro);
      try {
        geminiResponseText = await generateWithModelAndRetries(modelFlash, prompt, 3);
      } catch (errFlash: any) {
        console.error('gemini-2.5-flash también falló:', errFlash?.message || errFlash);
        throw new Error(`Fallaron PRO y FLASH: ${errFlash?.message || errFlash}`);
      }
    }

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedResult = JSON.parse(cleanedText);

    res.status(200).json(generatedResult);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error generando el esquema para el blog:');
    console.error(error.message);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
