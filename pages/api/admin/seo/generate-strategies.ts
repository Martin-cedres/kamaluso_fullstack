import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';
import SeoStrategy from '../../../../models/SeoStrategy';
import { generateContentSmart } from '../../../../lib/gemini-client';
import { getSearchTrends } from '../../../../lib/keyword-research';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        await connectDB();

        // 1. Obtener una muestra representativa de productos para analizar
        // Limitamos a 50 para no saturar el contexto, priorizando los más recientes
        const products = await Product.find({}, 'nombre descripcion categoria slug').sort({ createdAt: -1 }).limit(50);

        if (products.length === 0) {
            return res.status(400).json({ message: 'No hay productos para analizar.' });
        }

        // 2. Extraer categorías únicas para investigar tendencias
        const categories = [...new Set(products.map(p => (p.categoria as any)?.nombre || 'General'))];

        // 3. Obtener tendencias REALES para cada categoría principal
        // (Limitamos a las primeras 3 categorías para no hacer demasiadas requests en paralelo)
        const trendsReport = [];
        for (const cat of categories.slice(0, 3)) {
            const trends = await getSearchTrends(cat, cat); // Usamos la categoría como "producto" y "categoría" para la búsqueda
            trendsReport.push({ category: cat, ...trends });
        }

        // 4. Preparar el contexto para la IA
        const productsContext = products.map(p => `- ${p.nombre} (${(p.categoria as any)?.nombre || 'Sin cat'})`).join('\n');
        const trendsContext = trendsReport.map(t => `
      CATEGORÍA: ${t.category}
      RESUMEN MERCADO: ${t.trendsSummary}
      KEYWORDS TOP: ${t.keywords.join(', ')}
    `).join('\n\n');

        // 5. Prompt para el "Estratega SEO"
        const prompt = `
      Eres el Director de Estrategia SEO de "Kamaluso" (Papelería Personalizada).
      
      TU OBJETIVO:
      Analizar nuestro catálogo y las tendencias de búsqueda REALES para proponer 3 "Estrategias de Contenido" (Clusters) de alto impacto.
      
      CATÁLOGO DE PRODUCTOS (Muestra):
      ${productsContext}

      INTELIGENCIA DE MERCADO (TENDENCIAS REALES):
      ${trendsContext}

      INSTRUCCIONES:
      1. Cruza los productos con las tendencias. ¿Qué busca la gente que nosotros vendemos?
      2. Propón 3 temas para "Pillar Pages" (Páginas Pilar) que agrupen varios productos.
      3. Cada tema debe atacar una intención de búsqueda clara (ej: "Regalos para Maestras", "Organización 2026").
      4. Para cada estrategia, sugiere también 4 artículos de blog de apoyo (Cluster Posts) que refuercen la autoridad del tema (ej: Tutoriales, Comparativas, Listas).
      
      ⚠️ REGLAS CRÍTICAS - CONTENIDO LISTO PARA PUBLICAR:
      - Los títulos deben ser COMPLETOS y ESPECÍFICOS. Nunca uses placeholders tipo "(nombre empresa)", "(año)", "[inserta aquí]".
      - Si necesitas un ejemplo concreto, usa casos genéricos pero reales: "Cómo una PyME uruguaya aumentó ventas 40% con agendas personalizadas".
      - Los títulos de artículos deben ser accionables y completos: "7 Formas de Usar Agendas Personalizadas para Fidelizar Clientes" en lugar de "Formas de usar (producto) para (objetivo)".
      
      FORMATO DE SALIDA (JSON ARRAY PURO):
      [
        {
          "topic": "Título del Tema (ej: La Guía Definitiva de Agendas 2026)",
          "targetKeywords": ["agenda 2026", "comprar agenda uruguay", ...],
          "suggestedTitle": "Título SEO Optimizado y Persuasivo",
          "rationale": "Explicación breve de por qué funcionará esta estrategia basada en los datos.",
          "relatedProductNames": ["Nombre exacto producto 1", "Nombre exacto producto 2"],
          "suggestedPosts": ["Título Artículo 1", "Título Artículo 2", "Título Artículo 3", "Título Artículo 4"]
        }
      ]
    `;

        const aiResponse = await generateContentSmart(prompt);
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const strategiesData = JSON.parse(cleanJson);

        // 6. Guardar las estrategias en la base de datos
        const savedStrategies = [];
        for (const strategy of strategiesData) {
            // Buscar los IDs de los productos relacionados
            const relatedProducts = await Product.find({
                nombre: { $in: strategy.relatedProductNames.map((n: string) => new RegExp(n, 'i')) }
            }, '_id');

            const newStrategy = await SeoStrategy.create({
                topic: strategy.topic,
                targetKeywords: strategy.targetKeywords,
                suggestedTitle: strategy.suggestedTitle,
                rationale: strategy.rationale,
                relatedProducts: relatedProducts.map(p => p._id),
                suggestedPosts: strategy.suggestedPosts || [], // Guardar los posts sugeridos
                status: 'proposed'
            });
            savedStrategies.push(newStrategy);
        }

        res.status(200).json({
            message: 'Estrategias generadas con éxito',
            count: savedStrategies.length,
            strategies: savedStrategies
        });

    } catch (error: any) {
        console.error('Error generando estrategias:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
