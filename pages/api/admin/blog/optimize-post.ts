import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';
import { generateWithFallback } from '../../../../lib/gemini-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { content, salesAngle, targetKeyword } = req.body;

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

    const prompt = `
      Eres un "Direct-Response Copywriter" y "Closer de Ventas" de élite. Tu especialidad es tomar un borrador de contenido y transformarlo en una máquina de conversión optimizada para SEO. Trabajas para el blog de "Papelería Personalizada Kamaluso".

      **Misión Crítica:**
      Transformar el siguiente borrador de artículo en HTML en una pieza de contenido final, altamente persuasiva y perfectamente optimizada, que cumpla con los siguientes objetivos estratégicos.

      **Objetivos Estratégicos:**
      - **Keyword Principal a Rankear:** "${targetKeyword || 'No especificada'}"
      - **Ángulo de Venta a Ejecutar:** "${salesAngle || 'Venta general del producto'}"

      **Tus Tareas de Optimización:**
      1.  **Transformar CTAs (Llamados a la Acción):** El borrador contiene placeholders como "[ENLACE INTERNO SUAVE: ...]" y "[ENLACE INTERNO FUERTE: ...]". Tu tarea principal es reemplazar estos placeholders por frases de copywriting completas y naturales que inciten al clic. Debes usar la lista de productos para encontrar la URL correcta.
          *   **Ejemplo de Transformación:**
              - **Placeholder:** "[ENLACE INTERNO FUERTE: /productos/agendas-2026, con el texto '¡Compra ahora tu agenda!']"
              - **Resultado Final:** "No esperes más para conquistar tus metas. <a href="${siteUrl}/productos/detail/agendas-2026" target="_blank" rel="noopener noreferrer"><b>Explora nuestra colección de agendas 2026 y elige la tuya hoy mismo.</b></a>"
      2.  **Aumentar la Persuasión:** Revisa todo el texto. Refina las frases para que sean más claras, directas y emocionalmente resonantes. Donde veas una característica, tradúcela a un beneficio claro para el cliente. Asegúrate de que el tono general sea de un experto que ofrece una solución valiosa.
      3.  **Optimización SEO Final:** Realiza una revisión final de SEO. Asegúrate de que la "Keyword Principal" aparezca de forma natural en:
          - El primer párrafo (si es posible).
          - Al menos un subtítulo (`<h2>` o `<h3>`).
          - El párrafo de conclusión.
          No añadas keywords de forma forzada. La naturalidad es clave.
      4.  **Mantener Estructura:** No alteres la estructura de encabezados (H2/H3) del borrador. Tu trabajo es mejorar el contenido DENTRO de esa estructura.

      **Recursos Disponibles:**
      - **Lista de Productos Enlazables (JSON):** ${JSON.stringify(linkableProducts)}
      - **Borrador del Artículo (HTML):** ${content}

      Devuelve el resultado como un objeto JSON con una única clave "optimizedContent" que contenga la cadena HTML final, 100% pulida y lista para publicar.
    `;

    const geminiResponseText = await generateWithFallback(prompt);

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedResult = JSON.parse(cleanedText);

    res.status(200).json(generatedResult);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error optimizando el artículo:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
