
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'El "content" del artículo es requerido.' });
  }

  try {
    // 1. Conectar a la BD y obtener los productos
    await connectDB();
    const products = await Product.find({ status: 'activo' }, 'nombre slug').lean();
    
    // 2. Construir la lista de productos enlazables con URLs completas
    const siteUrl = 'https://www.papeleriapersonalizada.uy';
    const linkableProducts = products.map(p => ({
      name: p.nombre,
      url: `${siteUrl}/productos/detail/${p.slug}`
    }));

    // Verificar API Key
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('Falta la variable GEMINI_API_KEY en el servidor.');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Eres un 'Especialista SEO' y editor final para el blog de "Papelería Personalizada Kamaluso".
      Tu misión es optimizar un borrador de artículo para maximizar su valor de SEO y su potencial de venta.

      Te proporcionaré un borrador de artículo en HTML y una lista de productos de la tienda con sus URLs.

      **Tus Tareas:**
      1.  **Enlazado Interno Inteligente (Tarea Principal):** Lee cuidadosamente el artículo. Identifica entre 2 y 4 oportunidades donde el texto mencione un concepto o producto que se relacione directamente con uno de los productos de la lista. Convierte ese texto en un enlace HTML (<a href="...">) apuntando a la URL del producto correspondiente.
          *   **Regla de Oro:** Los enlaces deben ser 100% naturales y aportar valor. Si en el texto se lee "una agenda para organizar tus metas", es un lugar perfecto para enlazar a un producto de agenda. No fuerces enlaces donde no correspondan. El texto del enlace debe ser el texto original que ya existe en el artículo.
          *   **Ejemplo:** Si el texto dice "...una buena libreta es esencial..." y tienes un producto "Libreta de Notas Premium", el resultado debería ser "...una buena <a href="${siteUrl}/productos/detail/libreta-de-notas-premium">libreta</a> es esencial...".
      2.  **Pulido Final:** Realiza una revisión final del texto para mejorar la claridad y el 'engagement'. Corrige cualquier error gramatical o de tipeo que encuentres. No alteres la estructura de H2/H3, solo el texto.

      **Lista de Productos Enlazables (JSON):**
      ${JSON.stringify(linkableProducts)}

      **Borrador del Artículo (HTML):**
      ${content}

      Devuelve el resultado como un objeto JSON con una única clave "optimizedContent" que contenga la cadena HTML final con las mejoras aplicadas.
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
    console.error('\n❌ Ocurrió un error optimizando el artículo:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
