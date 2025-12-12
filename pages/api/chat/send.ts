import type { NextApiRequest, NextApiResponse } from 'next';
import { generateContentSmart } from '../../../lib/gemini-client';
import { buildSystemPrompt } from '../../../lib/chat-context';
import connectDB from '../../../lib/mongoose';
import { ChatConversation } from '../../../models/ChatConversation';


import { findSimilarProducts } from '../../../lib/vector-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { message, history, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // 1. RAG: Buscar productos relevantes por significado
    console.log("🔍 Buscando productos relevantes para:", message);
    let relevantProducts = [];
    try {
      const searchResults = await findSimilarProducts(message, 5); // Top 5

      // Mapear resultados al formato que espera buildSystemPrompt (mismo que getAllProductsForContext)
      relevantProducts = searchResults.map(r => ({
        name: r.product.nombre,
        price: r.product.basePrice,
        category: r.product.categoria || 'General',
        description: r.product.descripcion || '',
        longDescription: r.product.descripcionExtensa || '',
        keyPoints: r.product.puntosClave || [],
        slug: r.product.slug
      }));

      console.log(`✅ Encontrados ${relevantProducts.length} productos relevantes.`);
    } catch (err) {
      console.error("⚠️ Error en búsqueda vectorial (fallback a catálogo completo):", err);
    }

    // 2. Construir System Prompt con contexto actualizado (Productos Filtrados + Políticas)
    const systemPrompt = await buildSystemPrompt(relevantProducts);

    // [DEBUG] Log para verificar contexto
    console.log("--- CHATBOT CONTEXT DEBUG ---");
    console.log("System Prompt Length:", systemPrompt.length);
    console.log("Snippet:", systemPrompt.substring(0, 500));
    console.log("-----------------------------");

    // 2. Formatear historial para Gemini
    // Si hay conversationId, intentamos recuperar historial real de la BD (opcional, por ahora confiamos en el cliente para latencia)

    // LOGGING START: Buscar o Crear Conversación
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await ChatConversation.create({
        messages: [],
        deviceInfo: req.headers['user-agent'] || 'unknown'
      });
    }

    // Guardar mensaje del USUARIO
    conversation.messages.push({
      role: 'user',
      content: message
    });
    // Guardamos estado intermedio por si falla Gemini
    await conversation.save();


    let fullPrompt = systemPrompt + "\n\n---\nHistorial de conversación:\n";


    if (history && Array.isArray(history)) {
      history.slice(-5).forEach((msg: any) => { // Últimos 5 mensajes para contexto
        const role = msg.role === 'user' ? 'Cliente' : 'Kamaluso Bot';
        fullPrompt += role + ": " + msg.content + "\n";
      });
    }

    fullPrompt += "\nCliente: " + message + "\nKamaluso Bot:";

    // 3. Generar respuesta
    const response = await generateContentSmart(fullPrompt);

    // Guardar respuesta del MODELO
    conversation.messages.push({
      role: 'model',
      content: response
    });
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(200).json({ response, conversationId: conversation._id });


  } catch (error: any) {
    console.error('Error en Chat API:', error);
    return res.status(500).json({ message: 'Error procesando tu mensaje.', error: error.message });
  }
}
