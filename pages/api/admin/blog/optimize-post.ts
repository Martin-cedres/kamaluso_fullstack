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

    const prompt: string = "Eres un \"Direct-Response Copywriter\" y \"Closer de Ventas\" de élite. Tu especialidad es tomar un borrador de contenido y transformarlo en una máquina de conversión optimizada para SEO. Trabajas para el blog de \"Papelería Personalizada Kamaluso\".\n\n" +
      "**Misión Crítica:**\n" +
      "Transformar el siguiente borrador de artículo en HTML en una pieza de contenido final, altamente persuasiva y perfectamente optimizada, que cumpla con los siguientes objetivos estratégicos.\n\n" +
      "**Objetivos Estratégicos:**\n" +
      "- **Keyword Principal a Rankear:** \"" + (targetKeyword || 'No especificada') + "\"\n" +
      "- **Ángulo de Venta a Ejecutar:** \"" + (salesAngle || 'Venta general del producto') + "\"\n\n" +
      "**Tus Tareas de Optimización:**\n" +
      "1.  **Transformar CTAs (Llamados a la Acción):** El borrador contiene placeholders como \"[ENLACE INTERNO SUAVE: ...]\" y \"[ENLACE INTERNO FUERTE: ...]\". Tu tarea principal es reemplazar estos placeholders por frases de copywriting completas y naturales que inciten al clic. Debes usar la lista de productos para encontrar la URL correcta.\n" +
      "    *   **Ejemplo de Transformación:**\n" +
      "        - **Placeholder:** \"[ENLACE INTERNO FUERTE: /productos/agendas-2026, con el texto '¡Compra ahora tu agenda!']\"\n" +
      "        - **Resultado Final:** \"No esperes más para conquistar tus metas. <a href=\"" + siteUrl + "/productos/detail/agendas-2026\" target=\"_blank\" rel=\"noopener noreferrer\"><b>Explora nuestra colección de agendas 2026 y elige la tuya hoy mismo.</b></a>\"\n" +
      "2.  **Aumentar la Persuasión:** Revisa todo el texto. Refina las frases para que sean más claras, directas y emocionalmente resonantes. Donde veas una característica, tradúcela a un beneficio claro para el cliente. Asegúrate de que el tono general sea de un experto que ofrece una solución valiosa.\n" +
      "3.  **Optimización SEO Final:** Realiza una revisión final de SEO. Asegúrate de que la \"Keyword Principal\" aparezca de forma natural en:\n" +
      "    - El primer párrafo (si es posible).\n" +
      "    - Al menos un subtítulo (`<h2>` o `<h3>`).\n" +
      "    - El párrafo de conclusión.\n" +
      "    No añadas keywords de forma forzada. La naturalidad es clave.\n" +
      "4.  **Mantener Estructura:** No alteres la estructura de encabezados (H2/H3) del borrador. Tu trabajo es mejorar el contenido DENTRO de esa estructura.\n\n" +
      "**Recursos Disponibles:**\n" +
      "- **Lista de Productos Enlazables (JSON):** " + JSON.stringify(linkableProducts) + "\n" +
      "- **Borrador del Artículo (HTML):** " + content + "\n\n" +
      "Devuelve el resultado como un objeto JSON con una única clave \"optimizedContent\" que contenga la cadena HTML final, 100% pulida y lista para publicar.\n";

    const geminiResponseText = await generateWithFallback(prompt);

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedResult = JSON.parse(cleanedText);

    res.status(200).json(generatedResult);

  } catch (error: any) {
    console.error('\n❌ Ocurrió un error optimizando el artículo:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
