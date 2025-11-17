import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../../../../lib/mongoose'; // Import connectDB
import Product from '../../../../models/Product'; // Import Product model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { theme } = req.body;

  if (!theme) {
    return res.status(400).json({ message: 'El "theme" es requerido en el cuerpo de la solicitud.' });
  }

  try {
    await connectDB(); // Connect to the database

    // Fetch product names and categories
    const products = await Product.find({ status: 'activo' }, 'nombre categoria').lean();
    const productList = products.map(p => {
      let categoryName: string | null = null;
      const category = p.categoria;

      if (category) {
        // Brute-force check for 'nombre' property to bypass stubborn type checker
        if (typeof category === 'object' && category !== null && (category as any).nombre) {
          categoryName = (category as any).nombre;
        } 
        else if (typeof category === 'string') {
          categoryName = category;
        }
      }
      return `- ${p.nombre} (Categoría: ${categoryName || 'N/A'})`;
    }).join('\n');

    // --- Call internal generate-keywords API ---
    const keywordsRes = await fetch('http://localhost:3000/api/admin/seo/generate-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seedKeyword: theme }),
    });

    if (!keywordsRes.ok) {
      const errorData = await keywordsRes.json();
      throw new Error(errorData.message || 'Error al generar palabras clave expandidas.');
    }
    const expandedKeywords = await keywordsRes.json();
    const { relatedKeywords, longTailKeywords, questions, userIntent } = expandedKeywords;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('Falta la variable GEMINI_API_KEY en el servidor.');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const storeName = "Papelería Personalizada Kamaluso";

    const prompt = `
      Eres un estratega de marketing de contenidos y experto en SEO para "${storeName}", un e-commerce en Uruguay.
      Tu misión es generar ideas para artículos de blog que atraigan tráfico cualificado y posicionen la marca como líder de opinión.

      El tema general para el brainstorming es: "${theme}"

      **Análisis de Palabras Clave Expandidas (generado por IA):**
      - Palabras Clave Relacionadas: ${relatedKeywords.join(', ')}
      - Palabras Clave Long-Tail: ${longTailKeywords.join(', ')}
      - Preguntas Frecuentes: ${questions.join(', ')}
      - Intención de Usuario Principal: ${userIntent}

      **Lista de Productos Disponibles en la Tienda (para inspiración):**
      ${productList}

      **Instrucciones Clave:**
      1.  Genera una lista de 10 ideas de artículos de blog.
      2.  **Las ideas DEBEN estar directamente relacionadas o inspiradas en los productos de la lista proporcionada.**
      3.  **Las ideas DEBEN incorporar las palabras clave expandidas y las preguntas frecuentes** para asegurar la relevancia SEO.
      4.  Para cada idea, proporciona:
          - "title": Un título atractivo y que genere curiosidad.
          - "targetKeyword": La palabra clave principal que el artículo debería atacar para posicionar en Google Uruguay (elegida de las expandidas).
          - "audience": El público objetivo específico para ese artículo (ej: 'Gerentes de Marketing', 'Estudiantes', 'Personas buscando regalos').
          - "angle": Un breve ángulo o enfoque único para el artículo que lo diferencie de la competencia.

      Devuelve el resultado como un array de objetos JSON dentro de un objeto JSON principal con la clave "ideas".
      Ejemplo de formato de salida:
      {
        "ideas": [
          {
            "title": "5 Ideas de Regalos Corporativos que tus Clientes Recordarán Todo el Año",
            "targetKeyword": "regalos corporativos originales Uruguay",
            "audience": "Gerentes de Marketing y Ventas",
            "angle": "Enfocarse en el impacto a largo plazo y la recordación de marca, más allá del típico regalo de fin de año."
          }
        ]
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

    if (!generatedResult.ideas || generatedResult.ideas.length === 0) {
      return res.status(200).json({ ideas: [] });
    }

    res.status(200).json(generatedResult);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error generando las ideas para el blog:');
    console.error(error.message);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
