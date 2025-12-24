import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { generateWithFallback } from '../../../../lib/gemini-agent';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';
// Nuevos imports para inteligencia de mercado
import { getSearchTrends } from '../../../../lib/keyword-research';
import { generateKamalusoPrompt } from '../../../../lib/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { mainKeyword, selectedProducts, eventType } = req.body;

    // Si mainKeyword existe y no es "Otro", lo usamos. Si no, usamos eventType.
    let rawKeyword = mainKeyword || eventType;
    if (rawKeyword?.toLowerCase() === 'otro') {
        rawKeyword = ''; // Forzamos que esté vacío para activar la deducción
    }

    const isGenericKeyword = !rawKeyword || rawKeyword.toLowerCase() === 'otro';

    console.log('📦 [AI Content Generation] Request Body:', JSON.stringify(req.body, null, 2));

    // Validamos: si no hay keyword y NO vamos a deducir (isGenericKeyword), y tampoco hay productos -> Error.
    // La lógica original era un poco confusa.
    // Nuevo enfoque: Siempre intentamos.

    if ((!rawKeyword && !isGenericKeyword) || !selectedProducts || selectedProducts.length === 0) {
        return res.status(400).json({
            message: 'Se requiere un título o al menos elegir productos para deducir un tema.',
            details: { hasKeyword: !!rawKeyword, productsCount: selectedProducts?.length || 0 }
        });
    }

    try {
        await connectDB();

        // 1. Obtener detalles de productos (Contexto Interno)
        const products = await Product.find({ _id: { $in: selectedProducts } }, 'nombre descripcion slug basePrice');
        const productsContext = products.map(p => `
      - ${p.nombre} (${p.slug})
        Precio: $${p.basePrice}
        Desc: ${(p.descripcion || '').substring(0, 150)}...
    `).join('\n');

        // 2. Investigación de Mercado en Tiempo Real (Contexto Externo) - ¡NUEVO!
        // Usamos la keyword o el tipo de evento para buscar tendencias
        const searchTerm = rawKeyword || eventType || 'regalos personalizados uruguay';
        console.log(`🔎 Iniciando investigación de mercado para: "${searchTerm}"`);

        const trends = await getSearchTrends(searchTerm, 'Eventos');

        // Análisis de Competencia (Dynamic Import para optimizar)
        const { analyzeCompetitors } = await import('../../../../lib/competitor-research');
        const competitorAnalysis = await analyzeCompetitors(searchTerm, 'Eventos');

        console.log('✅ Investigación completada. Generando prompt centralizado...');

        // 3. Generar Prompt con el Cerebro Central
        const prompt = generateKamalusoPrompt({
            type: 'EVENT',
            contextData: {
                name: rawKeyword || eventType || 'Evento Estacional',
                description: `Productos Seleccionados para este evento:\n${productsContext}`,
                // No hay categoría ni precio base único para un evento
            },
            marketData: {
                trendsSummary: trends.trendsSummary,
                topKeywords: trends.keywords,
                competitorAnalysis: competitorAnalysis
            },
            specialInstructions: isGenericKeyword
                ? "DEDUCE el tema del evento basándote en los productos seleccionados. NO uses 'Otro' ni 'Desconocido'."
                : undefined
        });

        console.log(`Generando contenido con Gemini...`);

        const generatedResponse = await generateWithFallback(prompt);
        const cleanResponse = generatedResponse
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
        const parsedResponse = JSON.parse(cleanResponse);

        // Mapeamos o devolvemos tal cual según lo que espera el frontend
        // El frontend espera: content, seoTitle, seoDescription, seoKeywords

        // REVISAR: generateKamalusoPrompt para EVENT devuelve: html_content, meta_title, meta_description, seo_keywords

        res.status(200).json({
            content: parsedResponse.html_content.trim(),
            seoTitle: parsedResponse.meta_title.trim(),
            seoDescription: parsedResponse.meta_description.trim(),
            seoKeywords: parsedResponse.seo_keywords, // Ahora viene del centralizado
            trends // Devolvemos tendencias para visualización si se requiere
        });

    } catch (error: any) {
        console.error('Error generando contenido para Event Page:', error);
        res.status(500).json({ message: 'Error al generar contenido', error: error.message });
    }
}
