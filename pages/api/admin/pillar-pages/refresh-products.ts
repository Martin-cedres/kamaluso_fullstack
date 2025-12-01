import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import Product from '../../../../models/Product';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID de la página pilar.' });
    }

    try {
        await connectDB();

        const pillarPage = await PillarPage.findById(id);
        if (!pillarPage) {
            return res.status(404).json({ message: 'Página Pilar no encontrada.' });
        }

        // 1. Buscar productos nuevos relacionados con el tema
        // Usamos una búsqueda de texto simple en nombre y descripción
        const topicKeywords = pillarPage.topic.split(' ').filter(w => w.length > 3);
        const regex = new RegExp(topicKeywords.join('|'), 'i');

        const newProducts = await Product.find({
            $or: [
                { nombre: { $regex: regex } },
                { descripcion: { $regex: regex } },
                { categoria: { $regex: regex } }
            ]
        })
            .sort({ createdAt: -1 }) // Los más nuevos primero
            .limit(8); // Tomamos los top 8

        if (newProducts.length === 0) {
            return res.status(200).json({ message: 'No se encontraron productos nuevos para este tema.', updated: false });
        }

        // 2. Actualizar la lista de clusterProducts (Sidebar)
        pillarPage.clusterProducts = newProducts.map(p => p._id as unknown as mongoose.Types.ObjectId);

        // 3. Actualizar los shortcodes en el contenido (Content)
        let content = pillarPage.content;
        const shortcodeRegex = /{{PRODUCT_CARD:([a-zA-Z0-9-]+)}}/g;

        // Encontramos todos los matches actuales
        const matches = [...content.matchAll(shortcodeRegex)];

        // Reemplazamos secuencialmente
        let newContent = content;
        let productIndex = 0;

        // Estrategia: Reconstruir el contenido reemplazando los shortcodes
        // Es más seguro hacer un split y join o replace con función que mantiene estado
        newContent = content.replace(shortcodeRegex, (match) => {
            // Si tenemos productos nuevos disponibles, usamos el siguiente
            if (productIndex < newProducts.length) {
                const newSlug = newProducts[productIndex].slug;
                productIndex++;
                return `{{PRODUCT_CARD:${newSlug}}}`;
            }
            // Si nos quedamos sin productos nuevos (raro si limitamos a 8 y hay pocos shortcodes),
            // podríamos dejar el viejo o eliminarlo. Por ahora, eliminamos el shortcode para no mostrar repetidos o viejos.
            return '';
        });

        pillarPage.content = newContent;

        await pillarPage.save();

        res.status(200).json({
            message: 'Productos actualizados con éxito.',
            updated: true,
            productsCount: newProducts.length
        });

    } catch (error: any) {
        console.error('Error refreshing products:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
