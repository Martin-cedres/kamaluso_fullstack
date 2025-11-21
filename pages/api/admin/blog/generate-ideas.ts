import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose'; // Import connectDB
import Product from '../../../../models/Product'; // Import Product model
import { generateWithFallback } from '../../../../lib/gemini-agent';

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
    // Note: This internal call is assumed to work as is.
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

    const storeName = "Papelería Personalizada Kamaluso";

    const prompt = `
      Eres un Director de Estrategia de Contenidos para E-commerce de clase mundial, trabajando para "${storeName}", una tienda online en Uruguay. Tu única obsesión es el ROI (Retorno de Inversión).
      Tu misión es generar ideas de artículos de blog que no solo atraigan tráfico masivo y cualificado, sino que lo conviertan en ventas. Cada idea debe ser una máquina de generar interés y demanda para los productos de la tienda.

      El tema general para el brainstorming es: "${theme}"

      **Inteligencia de Mercado (Análisis de Keywords por IA):**
      - Palabras Clave Relacionadas: ${relatedKeywords.join(', ')}
      - Palabras Clave Long-Tail (Alta Intención): ${longTailKeywords.join(', ')}
      - Preguntas que hacen los Clientes: ${questions.join(', ')}
      - Intención de Usuario Principal: ${userIntent}

      **Catálogo de Productos (Nuestras Armas de Venta):**
      ${productList}

      **Instrucciones de Estrategia de Contenidos:**
      1.  **Genera 10 ideas de artículos.** Deben ser irresistibles para el público objetivo.
      2.  **Piensa en el Embudo de Ventas Completo:** Distribuye las ideas para cubrir las 3 etapas del cliente:
          - **TOFU (Top of Funnel):** 3-4 ideas. Atrae a un público amplio que tiene un problema pero no sabe la solución. (Ej: "Cómo organizar tu vida y reducir el estrés: 5 métodos probados").
          - **MOFU (Middle of Funnel):** 3-4 ideas. Dirigido a gente que ya busca soluciones y compara. (Ej: "Bullet Journal vs. Agenda Tradicional: ¿Cuál es mejor para ti en 2026?").
          - **BOFU (Bottom of Funnel):** 2-3 ideas. Para gente casi lista para comprar. Debe empujarlos a la conversión. (Ej: "Las 5 agendas personalizadas más originales de Uruguay para regalar en fin de año").
      3.  **Conexión Producto-Contenido:** Cada idea DEBE resolver un problema que uno o más productos del catálogo solucionan brillantemente.
      4.  **Formato de Salida:** Para cada idea, proporciona un objeto JSON con estos campos:
          - "title": Un titular magnético, optimizado para clics y SEO.
          - "targetKeyword": La palabra clave con mayor intención de compra o volumen de búsqueda (elegida de la inteligencia de mercado).
          - "audience": El perfil de cliente exacto al que le hablamos.
          - "salesAngle": **(El más importante)** Explica en una frase CÓMO este artículo generará una venta. ¿Qué producto se promocionará y cómo? (Ej: "El post posicionará nuestras agendas semanales como la herramienta ideal para profesionales ocupados, con un llamado a la acción directo a la categoría de agendas.").

      Devuelve el resultado como un array de objetos JSON dentro de un objeto JSON principal con la clave "ideas".
      Ejemplo de formato de salida:
      {
        "ideas": [
          {
            "title": "5 Ideas de Regalos Corporativos en Uruguay que tus Clientes No Olvidarán",
            "targetKeyword": "regalos corporativos originales Uruguay",
            "audience": "Gerentes de Marketing, dueños de PyMEs",
            "salesAngle": "Presentar las libretas personalizadas con logo como la opción premium, enlazando directamente al producto personalizable para empresas."
          }
        ]
      }
    `;

    const geminiResponseText = await generateWithFallback(prompt);

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
