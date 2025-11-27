import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongoose';
import Product from '../../../models/Product';
import { generateWithFallback } from '../../../lib/gemini-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  await connectDB();

  const { topic, outline } = req.body; // Aceptamos 'topic' por retrocompatibilidad y 'outline' para el nuevo flujo

  if (!topic && !outline) {
    return res.status(400).json({ message: 'Se requiere un "topic" o un "outline".' });
  }

  try {
    // Fetch product names and slugs from the database
    const products = await Product.find({}, 'nombre slug').lean();
    const productLinks = products.map(p => `{"nombre": "${p.nombre}", "url": "/productos/detail/${p.slug}"}`);
    const productContext = `[${productLinks.join(', ')}]`;

    const storeName = "Papelería Personalizada Kamaluso";

    // PREPARACIÓN: Si solo se recibe un 'topic', se convierte en un 'outline' básico.
    const finalOutline = outline || `Título del Artículo: ${topic}`;

    const prompt: string = "Eres un redactor de contenidos senior y experto en SEO para \"" + storeName + "\", un e-commerce de papelería personalizada en Uruguay.\n" +
      "Tu misión es tomar un esquema detallado (outline) y convertirlo en un artículo de blog completo, atractivo y optimizado para SEO.\n\n" +
      "**Instrucciones Estratégicas Clave:**\n" +
      "1. **Sigue el Esquema:** El 'outline' es tu guía principal. Desarrolla cada punto del esquema en párrafos bien escritos.\n" +
      "2. **Enlazado Interno Natural:** Tienes una lista de nuestros productos. Cuando el contenido lo permita, enlaza a 1-2 productos de forma natural. El texto del enlace debe ser persuasivo, no solo el nombre del producto.\n" +
      "3. **Sugerencias Visuales:** El contenido visual es clave. Donde creas que una imagen enriquecería el texto, inserta un placeholder descriptivo, por ejemplo: \"[IMAGEN: Collage de agendas 2026 con diseños personalizados]\".\n" +
      "4. **Tono y Estilo:** Mantén un tono cercano, inspirador y profesional, relevante para personas en Uruguay.\n" +
      "5. **CERO META-COMENTARIOS:** NO incluyas textos como \"(justificación)\", \"(escasez)\", etc. El output debe ser TEXTO FINAL para el lector.\n\n" +
      "Aquí tienes la lista de productos para el enlazado interno:\n" +
      productContext + "\n\n" +
      "Aquí está el esquema que debes desarrollar:\n" +
      "---\n" +
      finalOutline + "\n" +
      "---\n\n" +
      "Genera un JSON válido (sin texto adicional antes ni después) con la siguiente estructura:\n" +
      "{\n" +
      "  \"title\": \"Un título principal para el artículo, basado en el esquema.\",\n" +
      "  \"seoTitle\": \"Un título corto y directo para el SEO (máx. 60 caracteres).\",\n" +
      "  \"seoDescription\": \"Una meta descripción atractiva (máx. 155 caracteres) que invite a hacer clic desde Google.\",\n" +
      "  \"content\": \"El contenido completo del artículo en formato HTML. Usa etiquetas <p>, <h3>, <ul>, <li> y <strong>. Incluye los placeholders de [IMAGEN: ...].\",\n" +
      "  \"tags\": \"Una cadena de 5 a 7 etiquetas o palabras clave relevantes, separadas por comas.\"\n" +
      "}\n";

    const geminiResponseText = await generateWithFallback(prompt);

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
