import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../../../lib/mongoose';
import Product from '../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  await connectDB();

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'El tema del blog es requerido' });
  }

  try {
    // Fetch product names and slugs from the database
    const products = await Product.find({}, 'nombre slug').lean();
    const productLinks = products.map(p => `{"nombre": "${p.nombre}", "url": "/productos/detail/${p.slug}"}`);
    const productContext = `[${productLinks.join(', ')}]`;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('Falta la variable GEMINI_API_KEY en el servidor.');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const storeName = "Papelería Personalizada Kamaluso";

    const prompt = `
      Eres un experto en SEO y redactor de contenidos para un e-commerce de papelería personalizada en Uruguay llamado "${storeName}". Tu taller se encuentra en San José y realizas envíos a todo el país.
      Tu misión es escribir un artículo de blog atractivo, bien estructurado y optimizado para SEO sobre un tema específico.

      **Instrucciones Estratégicas Clave:**
      1. **Identifica la Keyword Principal:** Del "Tema del artículo", extrae la palabra clave más importante (ej: "agendas 2026", "regalos corporativos"). Debes usar esta keyword en el 'title', 'seoTitle', y de forma natural en el primer párrafo y algún subtítulo del 'content'.
      2. **Piensa en el Lector:** Antes de escribir, define a quién le hablas (¿un estudiante, un gerente de marketing, alguien buscando un regalo?). Adapta el tono y el contenido a esa persona.
      3. **Enlazado Interno Inteligente:** Cuando menciones un producto de la lista JSON, DEBES crear un enlace HTML. Intenta incluir de 2 a 3 enlaces a productos de forma natural. El texto del enlace debe ser atractivo y relevante al contexto, no solo el nombre del producto. Por ejemplo: "una <a href='/productos/detail/mi-agenda'>agenda diseñada para organizar tus metas</a> es la herramienta perfecta para empezar".

      El tono debe ser cercano, inspirador y profesional.
      El contenido debe ser 100% original y relevante para personas en Uruguay interesadas en papelería, regalos, organización y creatividad.

      Aquí tienes una lista de nuestros productos en formato JSON. Úsalos como base para tus recomendaciones:
      ${productContext}

      Cuando menciones un producto de la lista, DEBES crear un enlace a su URL usando una etiqueta <a> de HTML. Por ejemplo: <a href=\"/productos/detail/slug-del-producto\">Nombre del Producto</a>.

      Tema del artículo: "${topic}"

      Genera un JSON válido (sin texto adicional antes ni después) con la siguiente estructura:
      {
        "title": "Un título principal para el artículo, creativo y que enganche.",
        "seoTitle": "Un título corto y directo para el SEO (máx. 60 caracteres).",
        "seoDescription": "Una meta descripción atractiva (máx. 155 caracteres) que invite a hacer clic desde Google.",
        "content": "El contenido completo del artículo en formato HTML. Usa etiquetas como <p>, <h3>, <ul>, <li> y <strong> para estructurarlo. La respuesta debe ser un string HTML válido.",
        "tags": "Una cadena de 5 a 7 etiquetas o palabras clave relevantes, separadas por comas."
      }
    `;

    const MAX_RETRIES = 3;
    let attempts = 0;
    let geminiResponseText = '';

    while (attempts < MAX_RETRIES) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        geminiResponseText = response.text();
        break; // Success, exit loop
      } catch (retryError: any) {
        attempts++;
        console.warn(`Intento ${attempts} fallido al llamar a Gemini para el blog. Reintentando...`, retryError.message);
        if (attempts >= MAX_RETRIES) {
          throw new Error(`Fallo al generar contenido con Gemini después de ${MAX_RETRIES} intentos: ${retryError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))); // 1s, 2s, 4s...
      }
    }

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido.');
    }

    res.status(200).json(generatedContent);

  } catch (error) {
    console.error('Error generando contenido del blog:', JSON.stringify(error, null, 2));
    let errorMessage = 'Error desconocido al procesar la solicitud.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      message: `Error interno al generar el contenido. Causa: ${errorMessage}`,
      error: error 
    });
  }
}
