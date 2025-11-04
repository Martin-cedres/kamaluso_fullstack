
import { NextApiRequest, NextApiResponse } from 'next';

// En el futuro, aquí se importaría el cliente de la API de Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nombre, descripcion, categoria } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ message: 'Nombre y descripción son requeridos' });
  }

  try {
    // --- Llamada real a la API de Gemini ---
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY no está configurada en el servidor.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const storeName = "Papeleria Personalizada Kamaluso";
    
    const prompt = `
      Eres un experto en SEO y marketing para e-commerce, especializado en papelería y regalos personalizados.
      Basado en el siguiente producto, genera contenido optimizado para la tienda "${storeName}".

      Producto:
      - Nombre: ${nombre}
      - Descripción actual: ${descripcion}
      - Categoría: ${categoria || 'General'}

      Genera la siguiente estructura en formato JSON, sin texto adicional antes o después del JSON:
      {
        "seoTitle": "Un título SEO de máximo 60 caracteres. Fórmula: [Nombre del Producto] | [Categoría] | ${storeName}",
        "seoDescription": "Una meta descripción atractiva de máximo 155 caracteres, terminando con un llamado a la acción.",
        "descripcionBreve": "Un resumen comercial de 1 a 2 frases.",
        "puntosClave": ["3 a 5 beneficios o características clave en un array de strings."],
        "descripcionExtensa": "Una descripción detallada y persuasiva en formato HTML. Usa etiquetas <p> para los párrafos y <strong> para resaltar texto importante.",
        "seoKeywords": "Una lista de 5 a 7 palabras clave relevantes para SEO, separadas por comas."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar el texto para asegurarse de que sea un JSON válido
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedContent = JSON.parse(cleanedText);
    // --- Fin de la llamada a la API de Gemini ---

    res.status(200).json(generatedContent);

  } catch (error) {
    console.error('Error generando contenido con IA:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno del servidor al generar contenido', error: errorMessage });
  }
}
