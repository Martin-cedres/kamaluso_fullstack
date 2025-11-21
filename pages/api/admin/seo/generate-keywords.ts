import { NextApiRequest, NextApiResponse } from 'next';
import { getKeywordSuggestions } from '../../../../lib/keyword-research';
import { getGeminiClient, rotateGeminiKey, getCurrentGeminiKeyIndex } from '../../../../lib/gemini-client'; // Nueva importación

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

    const storeName = "Papelería Personalizada Kamaluso";
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

    const generateWithGeminiRotation = async (modelName: string, promptText: string, maxRetries: number = 5) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const client = getGeminiClient();
          if (!client) {
            throw new Error('No Gemini API client available. Check your .env.local configuration.');
          }
          const model = client.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(promptText);
          return (await result.response).text();
        } catch (error: any) {
          const msg = error.message || "";
          const currentKeyIdx = getCurrentGeminiKeyIndex();
          console.error(
            `⚠️ Intento ${attempts + 1}/${maxRetries} fallido para la API de Gemini con la clave en el índice ${currentKeyIdx}:`,
            msg
          );

          const shouldRotate = msg.includes("quota") || msg.includes("limit") || msg.includes("exceeded") || msg.includes("Unauthorized") || msg.includes("Authentication") || msg.includes("Key invalid");

          if (shouldRotate && attempts < maxRetries - 1) {
            rotateGeminiKey();
            console.warn(`⚡ Rotando a la siguiente API Key de Gemini (índice actual: ${getCurrentGeminiKeyIndex()}). Reintentando...`);
            attempts++;
          } else {
            throw new Error(`Error fatal en la llamada a la API de Gemini después de ${attempts + 1} intentos: ${msg}`);
          }
        }
      }
      throw new Error('Unexpected error: generateWithGeminiRotation logic failed without proper error handling.');
    };

    let geminiResponseText = '';
    // Intenta con "gemini-2.5-pro", si falla, el reintento de la función ya rotará y lo intentará con la misma u otra clave
    geminiResponseText = await generateWithGeminiRotation("gemini-2.5-pro", prompt);
    
    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedResult;
    try {
      generatedResult = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido.');
    }

    res.status(200).json(generatedResult);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error generando palabras clave:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno del servidor', error: message });
  }
}