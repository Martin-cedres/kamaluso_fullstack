import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

/**
 * Convierte una URL de imagen a un objeto Part de Google Generative AI,
 * descargando la imagen y convirtiéndola a base64.
 * @param url La URL pública de la imagen.
 * @returns Una promesa que resuelve a un objeto Part.
 */
async function urlToGoogleGenerativeAIPart(url: string): Promise<Part> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al descargar la imagen de ${url}. Estado: ${response.status}`);
  }
  const contentType = response.headers.get('content-type');
  if (!contentType || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(contentType)) {
    throw new Error(`Tipo de contenido no soportado: ${contentType}`);
  }

  const buffer = await response.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');

  return {
    inlineData: {
      data: base64Data,
      mimeType: contentType,
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { imageUrl, contextName, context = 'producto' } = req.body; // context puede ser 'producto' o 'blog'

  if (!imageUrl || !contextName) {
    return res.status(400).json({ message: 'Se requieren `imageUrl` y `contextName`.' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ message: 'Falta la variable GEMINI_API_KEY en el servidor.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Usamos el modelo con capacidades de visión, como se documentó en el CHANGELOG.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }); // Usamos el modelo más reciente y eficiente

    const imagePart = await urlToGoogleGenerativeAIPart(imageUrl);

    const contextText = context === 'blog'
      ? `para un artículo de blog sobre papelería titulado "${contextName}"`
      : `para un producto de papelería personalizada llamado "${contextName}"`;

    const prompt = `
      Eres un especialista en SEO y accesibilidad para "Kamaluso", un e-commerce en Uruguay que vende papelería personalizada como agendas, libretas, cuadernos con tapa dura o flexible, y otros productos similares.
      Analiza la siguiente imagen, que es ${contextText}.
      Tu tarea es generar un texto alternativo (alt-text) que cumpla con estos requisitos:
      1.  **Descriptivo y Contextual:** Describe la imagen, pero siempre en el contexto de que es un producto de papelería. En lugar de "un perrito", debe ser "Agenda personalizada con diseño de un perrito sonriendo".
      2.  **SEO-friendly:** Incluye el tipo de producto (agenda, libreta) y palabras clave relevantes como "personalizado", "diseño de [lo que sea que aparezca]", "regalo original", "Kamaluso".
      3.  **Específico:** Si la imagen muestra detalles importantes (ej: un tipo de encuadernado, un diseño específico), menciónalos.
      4.  **Natural:** El texto debe sonar natural, no como una lista de palabras clave.
      5.  **Longitud:** No más de 125 caracteres.

      Genera únicamente el texto del alt-text, sin comillas ni texto adicional.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const altText = response.text().trim();

    res.status(200).json({ altText });
  } catch (error: any) {
    console.error('Error generando alt-text con IA:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno al generar el alt-text', error: message });
  }
}