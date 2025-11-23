import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { generateContentSmart } from '../../../../lib/gemini-client';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Protección de ruta
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { url, myProductId } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'Se requiere una URL para analizar.' });
    }

    try {
        // 2. Obtener datos de MI producto (si se seleccionó)
        let myProductData = null;
        if (myProductId) {
            await connectDB();
            const product = await Product.findById(myProductId);
            if (product) {
                myProductData = {
                    name: product.nombre,
                    price: product.basePrice,
                    description: product.descripcionExtensa || product.descripcion,
                    features: product.puntosClave || []
                };
            }
        }

        // 3. Obtener el HTML de la página competidora
        console.log(`🕵️ Espiando URL: ${url} ${myProductData ? `vs ${myProductData.name}` : ''}`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`No se pudo acceder a la URL. Status: ${response.status}`);
        }

        const html = await response.text();
        const cleanHtml = html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .substring(0, 20000);

        // 4. Análisis con Gemini (Prompt Dinámico)
        let prompt = '';

        if (myProductData) {
            // MODO COMPARACIÓN (Versus)
            prompt = `
        Eres un Consultor de Estrategia Competitiva despiadado.
        Estamos haciendo un "Head-to-Head" (Cara a Cara) entre MI producto y el de la COMPETENCIA.

        MI PRODUCTO (Kamaluso):
        - Nombre: ${myProductData.name}
        - Precio: $${myProductData.price}
        - Descripción: ${myProductData.description}

        PRODUCTO COMPETENCIA (URL: ${url}):
        - Contenido extraído: "${cleanHtml}..."

        TAREA:
        Compara ambos productos y dime cómo ganar. Sé brutalmente honesto.

        FORMATO DE RESPUESTA (JSON):
        {
          "keywords": ["keyword1", "keyword2"],
          "offerDetails": "Resumen de su oferta...",
          "weaknesses": ["Su debilidad 1", "Su debilidad 2"],
          "comparison": {
            "winner": "Kamaluso" o "Competencia",
            "reason": "Por qué ganó quien ganó (ej: precio, percepción de valor, copy).",
            "priceGap": "Diferencia de precio y si está justificada."
          },
          "counterStrategy": [
            "Acción 1 para aplastarlos...",
            "Acción 2...",
            "Acción 3..."
          ]
        }
      `;
        } else {
            // MODO ESPÍA SIMPLE (Solo análisis)
            prompt = `
        Eres un Consultor de Espionaje Corporativo. Analiza esta página de competidor.

        URL DEL OBJETIVO: ${url}
        CONTENIDO: "${cleanHtml}..."

        TAREA:
        Extrae inteligencia clave.

        FORMATO DE RESPUESTA (JSON):
        {
          "keywords": ["keyword1", "keyword2"],
          "offerDetails": "Resumen de su oferta...",
          "weaknesses": ["debilidad 1", "debilidad 2"],
          "counterStrategy": [
            "Acción 1...",
            "Acción 2...",
            "Acción 3..."
          ]
        }
      `;
        }

        const aiResponse = await generateContentSmart(prompt);
        const cleanedJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysisData = JSON.parse(cleanedJson);

        res.status(200).json({ success: true, data: analysisData });

    } catch (error: any) {
        console.error('Error en Spy Mode:', error);
        res.status(500).json({ message: 'Error al analizar la URL.', error: error.message });
    }
}
