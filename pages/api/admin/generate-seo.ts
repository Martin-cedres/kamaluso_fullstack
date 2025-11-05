// /pages/api/generate-seo.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo aceptar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { nombre, descripcion, categoria } = req.body;

  // Validar datos mínimos
  if (!nombre || !descripcion) {
    return res.status(400).json({ message: 'Nombre y descripción son requeridos' });
  }

  try {
    // Verificar API Key
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ message: 'Falta la variable GEMINI_API_KEY en el servidor.' });
    }

    // Inicializar cliente de Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Nombre de la tienda
    const storeName = "Papelería Personalizada Kamaluso";

    // PROMPT SEO OPTIMIZADO para atraer tanto clientes finales como empresas
    const prompt = `
      Eres un experto en SEO, marketing digital y copywriting enfocado en e-commerce de papelería personalizada.
      Tu misión es crear descripciones optimizadas que destaquen en Google y motiven a comprar o solicitar regalos empresariales personalizados.

      El contenido debe atraer tanto a:
      - Personas que buscan agendas, libretas o productos personalizados para uso propio o para regalar.
      - Empresas, instituciones o marcas que buscan regalos corporativos, artículos de papelería y merchandising personalizado.

      Mantén un tono natural, inspirador, profesional y alegre, reflejando el estilo de "${storeName}".
      Escribe en español neutro con orientación a Uruguay (por ejemplo, menciona “envíos a todo el país” o “personalización con logo empresarial” cuando corresponda).

      Producto:
      - Nombre: ${nombre}
      - Descripción actual: ${descripcion}
      - Categoría: ${categoria || 'General'}

      Genera un JSON válido (sin texto adicional antes ni después del JSON) con esta estructura:
      {
        "seoTitle": "Título SEO (máx. 60 caracteres). Fórmula: [Nombre del Producto] | [Categoría] | ${storeName}",
        "seoDescription": "Meta descripción atractiva (máx. 155 caracteres). Incluye llamado a la acción y orientación local (Uruguay, regalos empresariales).",
        "descripcionBreve": "Resumen comercial de 1 o 2 frases que invite a comprar o regalar.",
        "puntosClave": ["3 a 5 beneficios o características clave en formato de lista corta."],
        "descripcionExtensa": "Descripción detallada en formato HTML compatible con texto enriquecido (<p>, <strong>, <ul>, <li>, <h3>). Resalta personalización, calidad y opciones para empresas (logo, regalos corporativos, etc.).",
        "seoKeywords": "Lista de 7 a 10 palabras clave relevantes para SEO, separadas por comas. Incluye términos como regalos empresariales, papelería personalizada Uruguay, agendas corporativas, branding, merchandising, San José."
      }
    `;

    // Configuración de reintentos
    const MAX_RETRIES = 3;
    let attempts = 0;
    let geminiResponseText = '';

    while (attempts < MAX_RETRIES) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        geminiResponseText = response.text();
        break; // Éxito, salir del bucle
      } catch (retryError: any) { // Usar 'any' para el tipo de error si no hay un tipo más específico
        attempts++;
        console.warn(`Intento ${attempts} fallido al llamar a Gemini. Reintentando...`, retryError.message);
        if (attempts >= MAX_RETRIES) {
          throw new Error(`Fallo al generar contenido con Gemini después de ${MAX_RETRIES} intentos: ${retryError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))); // Espera 1s, 2s, 4s...
      }
    }

    // Limpiar y parsear JSON con manejo robusto
    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido. Por favor, inténtalo de nuevo.');
    }

    // Devolver contenido generado
    res.status(200).json(generatedContent);

  } catch (error) {
    console.error('Error generando contenido SEO:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno al generar el contenido', error: message });
  }
}
