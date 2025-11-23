import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import Post from '../../../../models/Post';
import Product from '../../../../models/Product';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { pillarPageId } = req.body;

  if (!pillarPageId) {
    return res.status(400).json({ message: 'Se requiere "pillarPageId".' });
  }

  try {
    await connectDB();

    // 1. Cargar la página pilar y todo su contenido de cluster asociado
    const pillarPage = await PillarPage.findById(pillarPageId)
      .populate({ path: 'clusterPosts', model: Post })
      .populate({ path: 'clusterProducts', model: Product });

    if (!pillarPage) {
      return res.status(404).json({ message: 'Página Pilar no encontrada.' });
    }

    const siteUrl = 'https://www.papeleriapersonalizada.uy';

    // 2. Preparar el contexto para la IA
    const pillarContext = {
      id: pillarPage._id.toString(),
      type: 'PillarPage',
      title: pillarPage.title,
      url: `${siteUrl}/pillar/${pillarPage.slug}`, // Asumiendo que esta será la URL
      content: pillarPage.content,
    };

    const clusterContent = [
      ...pillarPage.clusterPosts.map((p: any) => ({ id: p._id.toString(), type: 'Post', title: p.title, url: `${siteUrl}/blog/${p.slug}`, content: p.content })),
      ...pillarPage.clusterProducts.map((p: any) => ({ id: p._id.toString(), type: 'Product', title: p.nombre, url: `${siteUrl}/productos/detail/${p.slug}`, content: p.descripcionExtensa || p.descripcion }))
    ];

    // Usar el agente inteligente de Gemini que gestiona claves y fallbacks
    const { generateWithFallback } = await import('../../../../lib/gemini-agent');

    const prompt: string = "Eres un Arquitecto de SEO Técnico de Google, especializado en \"Topic Clusters\" y arquitectura de enlazado interno. Tu misión es analizar un conjunto de contenidos (una Página Pilar y su contenido de soporte o \"cluster\") y tejer una red de enlaces internos perfecta para señalar autoridad temática a los motores de búsqueda.\n\n" +
      "**Contexto Estratégico:**\n" +
      "- **Página Pilar:** Es el contenido principal, extenso y autoritativo sobre un tema amplio. Debe recibir enlaces.\n" +
      "- **Contenido Cluster:** Son artículos o productos que tratan subtemas específicos. Deben enlazar hacia la página pilar para transferirle autoridad.\n" +
      "- **Objetivo:** Fortalecer el ranking de la Página Pilar para su tema principal.\n\n" +
      "**Input (JSON con todo el contenido):**\n\n" +
      "**Página Pilar (El centro de la estrategia):**\n" +
      JSON.stringify(pillarContext, null, 2) + "\n\n" +
      "**Contenido del Cluster (Contenido de soporte):**\n" +
      JSON.stringify(clusterContent, null, 2) + "\n\n" +
      "**Instrucciones Precisas:**\n" +
      "1.  **Analiza TODO el contenido.** Entiende la relación semántica entre la página pilar y cada pieza del cluster.\n" +
      "2.  **Crea Enlaces desde el Cluster hacia el Pilar (Bottom-Up):**\n" +
      "    - Para CADA pieza de contenido en el \"Contenido del Cluster\", encuentra UNA SOLA frase o término que sea el lugar más natural y contextualmente relevante para enlazar hacia la \"Página Pilar\".\n" +
      "    - El texto del enlace (anchor text) debe ser la frase que ya existe, no la URL.\n" +
      "3.  **Crea Enlaces desde el Pilar hacia el Cluster (Top-Down):**\n" +
      "    - En el contenido de la \"Página Pilar\", encuentra lugares naturales para enlazar a ALGUNAS (no necesariamente todas) de las páginas del cluster. Esto enriquece el contenido pilar con recursos específicos. Prioriza enlazar a los contenidos de cluster más importantes.\n" +
      "4.  **Genera el Output:** Tu respuesta DEBE ser un objeto JSON válido con una única clave \"updates\". \"updates\" será un array de objetos. Cada objeto representará un documento que necesita ser actualizado y tendrá la siguiente estructura:\n" +
      "    - **id**: El ID del documento a actualizar.\n" +
      "    - **type**: El tipo de documento ('PillarPage', 'Post', 'Product').\n" +
      "    - **newContent**: El contenido HTML COMPLETO del documento, con las nuevas etiquetas 'a' insertadas. Los enlaces deben tener el formato '<a href=\"URL\" title=\"Anchor Text\" target=\"_blank\" rel=\"noopener noreferrer\">Anchor Text</a>'.\n\n" +
      "**Reglas de Oro:**\n" +
      "- **Naturalidad ante todo:** Si no encuentras un lugar 100% natural para un enlace, no lo fuerces. Es mejor menos enlaces de alta calidad que muchos forzados.\n" +
      "- **No alteres el contenido, solo añade enlaces:** Tu única tarea es insertar la etiqueta `<a>`. No reescribas frases ni corrijas gramática.\n\n" +
      "**Ejemplo de formato de salida JSON:**\n" +
      "{\n" +
      "  \"updates\": [\n" +
      "    {\n" +
      "      \"id\": \"60d...a1\",\n" +
      "      \"type\": \"Post\",\n" +
      "      \"newContent\": \"<h3>...</h3><p>...nuestra <a href='URL_PILAR' ...>guía completa de agendas</a> te ayudará...</p>\"\n" +
      "    },\n" +
      "    {\n" +
      "      \"id\": \"60d...b2\",\n" +
      "      \"type\": \"PillarPage\",\n" +
      "      \"newContent\": \"<h2>...</h2><p>...para más detalles, consulta nuestro artículo sobre <a href='URL_CLUSTER' ...>cómo decorar tu agenda</a>.</p>\"\n" +
      "    }\n" +
      "  ]\n" +
      "}\n";

    const rawText = await generateWithFallback(prompt);
    const text = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(text);

    // --- INICIO DE LA LÓGICA DE GUARDADO DE SUGERENCIAS ---
    if (!parsedResult.updates || !Array.isArray(parsedResult.updates)) {
      throw new Error("La respuesta de la IA no contiene un array 'updates' válido.");
    }

    let updatedCount = 0;
    const updateErrors: any[] = [];

    // Usamos Promise.all para ejecutar todas las actualizaciones en paralelo
    await Promise.all(parsedResult.updates.map(async (update: { id: string, type: string, newContent: string }) => {
      try {
        let updatedDoc;

        switch (update.type) {
          case 'PillarPage':
            updatedDoc = await PillarPage.findByIdAndUpdate(update.id, { 
              proposedContent: update.newContent, 
              status: 'pending_review' 
            }, { new: true });
            break;
          case 'Post':
            updatedDoc = await Post.findByIdAndUpdate(update.id, { 
              proposedContent: update.newContent, 
              status: 'pending_review' 
            }, { new: true });
            break;
          case 'Product':
            // Recordar que para Product usamos 'contentStatus' para no colisionar con el status del producto
            updatedDoc = await Product.findByIdAndUpdate(update.id, { 
              proposedContent: update.newContent, 
              contentStatus: 'pending_review' 
            }, { new: true });
            break;
          default:
            console.warn(`Tipo de documento desconocido en la actualización: ${update.type}`);
            return; // Saltar esta actualización
        }

        if (updatedDoc) {
          updatedCount++;
        }
      } catch (dbError: any) {
        console.error(`Error al guardar sugerencia para el documento ${update.id}:`, dbError);
        updateErrors.push({ id: update.id, error: dbError.message });
      }
    }));

    const finalMessage = `Análisis completado. Se generaron ${updatedCount} sugerencias de enlazado y están listas para tu revisión.`;
    
    console.log(finalMessage);

    res.status(200).json({ 
      message: finalMessage, 
      data: {
        totalUpdatesAttempted: parsedResult.updates.length,
        successfulUpdates: updatedCount,
        updateErrors,
      } 
    });
    // --- FIN DE LA LÓGICA DE GUARDADO DE SUGERENCIAS ---

  } catch (error: any) {
    console.error('Error al generar la optimización de enlaces:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}