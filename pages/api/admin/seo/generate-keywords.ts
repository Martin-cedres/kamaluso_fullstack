
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getKeywordSuggestions } from '../../../../lib/keyword-research';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { seedKeyword } = req.body;

  if (!seedKeyword) {
    return res.status(400).json({ message: 'La "seedKeyword" es requerida en el cuerpo de la solicitud.' });
  }

  try {
    // 1. Obtener sugerencias de búsqueda reales de Google
    const googleKeywords = await getKeywordSuggestions(seedKeyword);

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('Falta la variable GEMINI_API_KEY en el servidor.');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const storeName = "Papelería Personalizada Kamaluso";

    // 2. Inyectar las sugerencias de Google en el prompt de la IA
    const prompt = `
      Eres un experto en SEO y marketing digital para "${storeName}", un e-commerce de papelería personalizada en Uruguay.
      Tu misión es expandir una palabra clave inicial en un conjunto de términos de búsqueda relevantes para posicionar productos y artículos de blog.

      La palabra clave semilla es: "${seedKeyword}"

      Para darte un contexto del mundo real, aquí tienes una lista de sugerencias de búsqueda que los usuarios realmente escriben en Google sobre este tema:
      [${googleKeywords.join(', ')}]
      Usa esta lista como inspiración principal para tu análisis.

      Genera una lista estructurada de palabras clave que incluyan:
      - "relatedKeywords": Un array de 5 a 7 palabras clave directamente relacionadas con la semilla, inspiradas en la lista de Google.
      - "longTailKeywords": Un array de 5 a 7 variaciones de cola larga (más específicas y con 3 o más palabras), inspiradas en la lista de Google.
      - "questions": Un array de 3 a 5 preguntas que los usuarios podrían hacer, inspiradas en la lista de Google.
      - "userIntent": La intención principal del usuario al buscar esta palabra clave (ej: 'comercial', 'informacional', 'transaccional', 'navegacional').

      Devuelve el resultado como un objeto JSON con estas claves.
      Ejemplo de formato de salida:
      {
        "relatedKeywords": ["agendas personalizadas", "agendas 2026", "planners Uruguay"],
        "longTailKeywords": ["comprar agendas personalizadas con nombre", "agendas semanales personalizadas Uruguay"],
        "questions": ["¿Dónde comprar agendas personalizadas?", "¿Qué tipo de agenda es mejor para estudiantes?"],
        "userIntent": "comercial"
      }
    `;

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
    console.error('\n❌ Ocurrió un error generando palabras clave:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
