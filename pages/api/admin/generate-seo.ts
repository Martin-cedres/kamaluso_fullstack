import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '../../../lib/mongoose';
import Product from '../../../models/Product';
import Category from '../../../models/Category'; // Asegurarse de importar Category
import { getSearchTrends } from '../../../lib/keyword-research';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { productId, nombre: bodyNombre, descripcion: bodyDescripcion, categoria: bodyCategoria } = req.body;

  if (!productId && (!bodyNombre || !bodyDescripcion)) {
    return res.status(400).json({ message: 'Se requiere "productId" o "nombre" y "descripcion".' });
  }

  try {
    await connectDB();

    let nombre, descripcion, categoriaNombre;

    if (productId) {
      const product = await Product.findById(productId).populate('categoria');
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      nombre = product.nombre;
      descripcion = product.descripcion;
      categoriaNombre = product.categoria ? (product.categoria as any).nombre : 'General';
    } else {
      nombre = bodyNombre;
      descripcion = bodyDescripcion;
      categoriaNombre = bodyCategoria || 'General';
    }

    // ¡NUEVO PASO! Se realiza la investigación de tendencias.
    const trends = await getSearchTrends(nombre, categoriaNombre);

    // ¡NUEVO PASO! Análisis de Competencia
    const { analyzeCompetitors } = await import('../../../lib/competitor-research');
    const competitorAnalysis = await analyzeCompetitors(nombre, categoriaNombre);

    // Usar el agente inteligente de Gemini que gestiona la rotación de claves y el fallback de modelos.
    const { generateWithFallback } = await import('../../../lib/gemini-agent');

    const storeName = "Papelería Personalizada Kamaluso";

    // 4. Generación del Prompt Centralizado (Híbrido / Vendedor Experto)
    const { generateKamalusoPrompt } = await import('../../../lib/prompts');

    let specializedInstructions = '';
    const lowerNombre = nombre.toLowerCase();
    const lowerCategoria = (categoriaNombre || '').toLowerCase();

    if (lowerNombre.includes('agenda') && lowerNombre.includes('2026')) {
      specializedInstructions = `
      **Instrucción Priority para Agendas 2026:**
      - Foco absoluto en "Organización y Éxito".
      - Usa keywords como "planners 2026 Uruguay", "agendas personalizadas".
      `;
    } else if (lowerNombre.includes('libreta') || lowerNombre.includes('cuaderno')) {
      specializedInstructions = `
      **Instrucción Priority para Libretas:**
      - Foco en "Versatilidad y Creatividad".
      - Resalta "Regalos corporativos" y "Calidad de papel".
      `;
    }

    // 3.5 Obtener Enlaces Válidos (Sitemap)
    // Para evitar alucinaciones, le damos a la IA la lista real de categorías
    const categories = await Category.find({}, 'nombre slug');
    const validLinksList = categories.map(c => `- ${c.nombre}: /productos/${c.slug}`).join('\n');
    const validLinksString = `\nLISTA MAESTRA DE LINKS VÁLIDOS:\n${validLinksList}\n(Home: /)`;

    // 3.6 Detectar Search Intent (TRANSACCIONAL vs INFORMATIVA)
    const transactionalKeywords = ['comprar', 'precio', 'envío', 'costo', 'barato', 'oferta', 'venta', 'pedido'];
    const isTransactional = trends.keywords.some(kw =>
      transactionalKeywords.some(trigger => kw.toLowerCase().includes(trigger))
    );
    const searchIntent = isTransactional ? 'TRANSACCIONAL' : 'INFORMATIVA';
    console.log(`🎯 Search Intent detectado: ${searchIntent}`);

    const prompt = generateKamalusoPrompt({
      type: 'PRODUCT',
      contextData: {
        name: nombre,
        description: descripcion,
        category: categoriaNombre
      },
      marketData: {
        trendsSummary: trends.trendsSummary,
        topKeywords: trends.keywords,
        competitorAnalysis: competitorAnalysis
      },
      specialInstructions: specializedInstructions,
      validLinks: validLinksString,
      searchIntent: searchIntent
    });


    const geminiResponseText = await generateWithFallback(prompt);

    const cleanedText = geminiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let generatedContent;
    try {
      generatedContent = JSON.parse(cleanedText);
    } catch (jsonParseError) {
      console.error('Error al parsear la respuesta JSON de Gemini. Respuesta cruda:', cleanedText);
      throw new Error('La respuesta de Gemini no es un JSON válido.');
    }

    const responsePayload = {
      generatedContent,
      trends, // Devolvemos las tendencias para el frontend.
    };

    // Si se proveyó un productId, actualizamos el producto en la BD
    if (productId) {
      console.log('Guardando contenido generado en BD:', Object.keys(generatedContent));

      const updatedProduct = await Product.findByIdAndUpdate(productId, {
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        descripcionBreve: generatedContent.descripcionBreve,
        puntosClave: generatedContent.puntosClave,
        descripcionExtensa: generatedContent.descripcionExtensa,
        seoKeywords: generatedContent.seoKeywords,
        faqs: generatedContent.faqs,
        useCases: generatedContent.useCases,
      }, { new: true }); // { new: true } devuelve el documento actualizado

      // Revalidar la página del producto para que los cambios se reflejen de inmediato
      if (updatedProduct && updatedProduct.slug) {
        try {
          await res.revalidate(`/productos/detail/${updatedProduct.slug}`);
          console.log(`Página revalidada: /productos/detail/${updatedProduct.slug}`);
        } catch (revalError) {
          console.error('Error al revalidar la página:', revalError);
          // No fallamos la request si la revalidación falla, pero lo logueamos
        }
      }
      // Devolvemos solo un mensaje de éxito pero podríamos devolver el payload si el front lo necesitara
      return res.status(200).json({ message: `Producto "${nombre}" actualizado con éxito.`, trends });
    }

    // Si no, devolvemos el contenido y las tendencias para que el script externo/frontend lo maneje
    res.status(200).json(responsePayload);

  } catch (error: any) {
    console.error('Error generando contenido SEO:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ message: 'Error interno al generar el contenido', error: message });
  }
}