import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import Product from '../../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectDB();

        // 1. Obtener todos los slugs de productos válidos
        const products = await Product.find({}, 'slug');
        const validProductSlugs = new Set(products.map(p => p.slug));

        // 2. Obtener todas las páginas pilares
        const pillarPages = await PillarPage.find({}, 'title slug content');

        const issues: any[] = [];

        // 3. Analizar el contenido de cada página pilar
        pillarPages.forEach(page => {
            const content = page.content || '';
            // Regex para encontrar {{PRODUCT_CARD:slug}}
            const regex = /{{PRODUCT_CARD:([a-zA-Z0-9-]+)}}/g;
            let match;

            while ((match = regex.exec(content)) !== null) {
                const productSlug = match[1];

                if (!validProductSlugs.has(productSlug)) {
                    issues.push({
                        pillarTitle: page.title,
                        pillarSlug: page.slug,
                        brokenProductSlug: productSlug,
                        type: 'broken_product_link'
                    });
                }
            }
        });

        res.status(200).json({
            status: issues.length === 0 ? 'healthy' : 'issues_found',
            issues
        });

    } catch (error: any) {
        console.error('Error in health check:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
