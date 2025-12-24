import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/mongoose';
import Product from '../../../../models/Product';
import SocialPostModel from '../../../../models/SocialPost';
import { SocialContentGenerator } from '../../../../lib/social-media/generators/base-generator';
import { generateSocialPrompt } from '../../../../lib/social-media/prompts/social-prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        await dbConnect();

        const { productId, platforms } = req.body;

        console.log('📦 Request recibido:', { productId, platforms });

        if (!productId) {
            return res.status(400).json({ error: 'productId es requerido' });
        }

        if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
            return res.status(400).json({ error: 'Debe especificar al menos una plataforma (facebook o instagram)' });
        }

        // Obtener producto de la base de datos
        console.log('🔍 Buscando producto con ID:', productId);
        const product = await Product.findById(productId).lean();

        if (!product) {
            console.error('❌ Producto no encontrado en DB con ID:', productId);
            return res.status(404).json({
                error: 'Producto no encontrado',
                details: `No se encontró producto con ID ${productId}`
            });
        }

        console.log('✅ Producto encontrado:', product.nombre);

        // Inicializar generador (ahora usa el sistema de rotación de API keys automáticamente)
        const generator = new SocialContentGenerator();

        // Generar contenido para cada plataforma solicitada
        const results: any = {};

        for (const platform of platforms) {
            if (platform !== 'facebook' && platform !== 'instagram') {
                continue; // Ignorar plataformas no soportadas
            }

            console.log(`Generando contenido para ${platform}...`);

            const content = await generator.generateForPlatform(product, platform);
            const prompt = generateSocialPrompt({ platform, product });

            // Guardar en base de datos como borrador
            const socialPost = await (SocialPostModel as any).create({
                productId: product._id,
                productName: product.nombre,
                platform,
                caption: content.caption,
                hashtags: content.hashtags,
                imageUrl: content.imageUrl,
                status: 'draft',
                prompt,
                generatedWith: 'gemini-rotativo'
            });

            results[platform] = {
                _id: socialPost._id,
                caption: content.caption,
                hashtags: content.hashtags,
                imageUrl: content.imageUrl,
                cta: platform === 'facebook' ? content.cta : undefined
            };
        }

        return res.status(200).json({
            success: true,
            productName: product.nombre,
            content: results
        });

    } catch (error: any) {
        console.error('Error generando contenido social:', error);
        return res.status(500).json({
            error: 'Error generando contenido',
            details: error.message
        });
    }
}
