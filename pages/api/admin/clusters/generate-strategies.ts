import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import { generateContentSmart } from '../../../../lib/gemini-client';
import Product from '../../../../models/Product';
import Post from '../../../../models/Post';

// Interfaz para la respuesta esperada de la IA
interface AIStrategyResponse {
  strategies: {
    pillarTitle: string;
    pillarSeoDescription: string;
    clusterProducts: string[]; // Array de IDs de producto
    clusterPosts: string[];    // Array de IDs de post
    missingContent: string[];  // Array de títulos para nuevo contenido
    rationale: string;         // Explicación breve de por qué esta estrategia es buena
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Proteger la ruta
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { topic, description } = req.body;

  if (!topic || !description) {
    return res.status(400).json({ message: 'El tema (topic) y la descripción son obligatorios.' });
  }

  try {
    // 2. Conectar a la BD y obtener el contexto actual
    await connectDB();
    // Optimizamos la query para no traer campos innecesarios
    // Optimizamos la query para no traer campos innecesarios y limitamos para no saturar el contexto
    const allProducts = await Product.find({ status: 'activo' }, 'nombre descripcion _id').limit(50);
    const allPosts = await Post.find({ status: 'published' }, 'title excerpt _id').limit(50);

    const productContext = allProducts.map(p => `- ID: ${p._id}, Nombre: ${p.nombre}`).join('\n');
    const postContext = allPosts.map(p => `- ID: ${p._id}, Título: ${p.title}`).join('\n');

    // 3. Construir el prompt para la IA
    const prompt = `
      Eres un estratega experto en SEO y marketing de contenidos para una tienda online de papelería personalizada en Uruguay.
      Tu objetivo es proponer 3 ESTRATEGIAS DIFERENTES de "Topic Clusters" (Páginas Pilar) para dominar un tema específico.

      TEMA CENTRAL OBJETIVO: "${topic}"
      DESCRIPCIÓN/INTENCIÓN: "${description}"

      CONTEXTO DE CONTENIDO EXISTENTE (Úsalo para enlazar contenido real):
      ---
      PRODUCTOS DISPONIBLES:
      ${productContext}
      ---
      ARTÍCULOS DE BLOG DISPONIBLES:
      ${postContext}
      ---

      TAREA:
      Genera 3 enfoques o ángulos distintos para abordar este tema con una Página Pilar.
      Por ejemplo, si el tema es "Agendas", una estrategia podría ser "Guía de Organización 2024", otra "Agendas para Estudiantes vs Profesionales", y otra "Cómo decorar tu agenda (Bullet Journal)".

      Para CADA estrategia, define:
      1. Un Título SEO atractivo para la Página Pilar.
      2. Una Meta Descripción persuasiva.
      3. Los Productos del inventario que deberían enlazarse (IDs).
      4. Los Artículos del blog existentes que deberían enlazarse (IDs).
      5. 2-3 Ideas de NUEVOS artículos para llenar huecos semánticos.
      6. Una breve justificación (rationale) de por qué este enfoque funcionará.

      RESPUESTA:
      Tu respuesta DEBE SER EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura:
      {
        "strategies": [
          {
            "pillarTitle": "...",
            "pillarSeoDescription": "...",
            "clusterProducts": ["ID_1", "ID_2"],
            "clusterPosts": ["ID_1", "ID_2"],
            "missingContent": ["Idea 1", "Idea 2"],
            "rationale": "..."
          },
          ...
        ]
      }
    `;

    // 4. Llamar a la IA
    console.log('Enviando prompt a la IA para generar estrategias...');
    const aiResponseText = await generateContentSmart(prompt);

    // Limpiar y parsear la respuesta
    const cleanedJsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedResponse: AIStrategyResponse;

    try {
      parsedResponse = JSON.parse(cleanedJsonString);
    } catch (e) {
      console.error("Error parsing JSON from AI:", e);
      console.error("Raw AI response:", aiResponseText);
      throw new Error("La IA devolvió un formato inválido.");
    }

    // 5. Enriquecer la respuesta con datos completos para el frontend
    const enrichedStrategies = await Promise.all(parsedResponse.strategies.map(async (strat, index) => {
      const [foundProducts, foundPosts] = await Promise.all([
        Product.find({ '_id': { $in: strat.clusterProducts } }, 'nombre slug imageUrl'),
        Post.find({ '_id': { $in: strat.clusterPosts } }, 'title slug coverImage'),
      ]);

      return {
        id: index + 1, // ID temporal para el frontend
        pillarTitle: strat.pillarTitle,
        pillarSeoDescription: strat.pillarSeoDescription,
        rationale: strat.rationale,
        clusterProducts: foundProducts.map(p => ({ id: p._id.toString(), nombre: p.nombre })),
        clusterPosts: foundPosts.map(p => ({ id: p._id.toString(), title: p.title })),
        missingContent: strat.missingContent,
        originalIds: {
          products: strat.clusterProducts,
          posts: strat.clusterPosts,
        }
      };
    }));

    res.status(200).json({ strategies: enrichedStrategies });

  } catch (error: any) {
    console.error('Error generando estrategias de cluster:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
