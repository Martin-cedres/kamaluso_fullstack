import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getParseOrderPrompt } from '../../../../lib/assistant-prompts';
import clientPromise from '../../../../lib/mongodb';

// Usar el modelo prioritario según las reglas del usuario
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-pro";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = getParseOrderPrompt(text);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonString = response.text();

        // Limpiar posibles bloques de código de markdown
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        const orderData = JSON.parse(jsonString);

        // --- DEFENSA Y ESTRUCTURA BASE ---
        // Garantizar que siempre exista shippingDetails y items para evitar crashes en el frontend
        if (!orderData.shippingDetails) {
            orderData.shippingDetails = { method: 'Retiro en Local', address: '', notes: '' };
        } else {
            if (!orderData.shippingDetails.method) orderData.shippingDetails.method = 'Retiro en Local';
            if (!orderData.shippingDetails.address) orderData.shippingDetails.address = '';
        }

        if (!orderData.items || !Array.isArray(orderData.items)) {
            orderData.items = [];
        }

        // 1. Sincronizar precios con la Base de Datos local
        if (orderData.items && Array.isArray(orderData.items)) {
            const client = await clientPromise;
            const db = client.db();

            for (let i = 0; i < orderData.items.length; i++) {
                const item = orderData.items[i];

                // Si la fuente no es webnode (donde ya intentamos scraper), buscamos en catálogo local
                if (orderData.source !== 'webnode') {
                    // Intento de búsqueda por coincidencia parcial en nombre
                    const dbProduct = await db.collection('products').findOne({
                        nombre: { $regex: item.nombre.split(' ')[0], $options: 'i' }
                    }) || await db.collection('products').findOne({
                        nombre: { $regex: item.nombre, $options: 'i' }
                    });

                    if (dbProduct) {
                        orderData.items[i].precio = dbProduct.precio;
                        orderData.items[i]._id = dbProduct._id; // Vincular ID real
                        console.log(`[IA ASSISTANT SYNC] Precio asignado para ${item.nombre}: $U ${dbProduct.precio}`);
                    }
                }
            }

            // 2. Recalcular el total final con los precios encontrados
            orderData.total = orderData.items.reduce((acc: number, item: any) => {
                return acc + (Number(item.precio) || 0) * (Number(item.quantity) || 1);
            }, 0);
        }

        res.status(200).json(orderData);
    } catch (error: any) {
        console.error('[PARSE ORDER ERROR]', error);
        res.status(500).json({
            message: 'Error al procesar el pedido con IA',
            error: error.message
        });
    }
}
