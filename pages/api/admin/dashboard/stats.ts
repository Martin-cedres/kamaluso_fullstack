import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../../lib/mongoose';
import PillarPage from '../../../../models/PillarPage';
import Post from '../../../../models/Post';
import Product from '../../../../models/Product';
import SeoStrategy from '../../../../models/SeoStrategy';
import CoverDesign from '../../../../models/CoverDesign';

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

        // Parallel queries for efficiency
        const [
            pillarPages,
            posts,
            products,
            strategies,
            coverDesigns,
        ] = await Promise.all([
            PillarPage.find({}).select('status content clusterProducts'),
            Post.countDocuments({}),
            Product.find({}).select('status destacado'),
            SeoStrategy.find({}).select('status'),
            CoverDesign.find({}).select('groups'),
        ]);

        // SEO Health: Check for broken product links
        const productSlugs = await Product.find({}).distinct('slug');
        let brokenLinksCount = 0;

        pillarPages.forEach(page => {
            const regex = /{{PRODUCT_CARD:([a-zA-Z0-9-]+)}}/g;
            const matches = [...page.content.matchAll(regex)];
            matches.forEach(match => {
                const slug = match[1];
                if (!productSlugs.includes(slug)) {
                    brokenLinksCount++;
                }
            });
        });

        // Calculate metrics
        const pillarPublished = pillarPages.filter(p => p.status === 'published').length;
        const pillarPending = pillarPages.filter(p => p.status === 'pending_review').length;

        const strategiesApproved = strategies.filter(s => s.status === 'approved').length;
        const strategiesGenerated = strategies.filter(s => s.status === 'generated').length;

        const productsActive = products.filter(p => p.status === 'activo').length;
        const productsHighlighted = products.filter(p => p.destacado === true).length;

        // Get unique cover design groups
        const uniqueGroups = new Set<string>();
        coverDesigns.forEach(design => {
            if (design.groups && Array.isArray(design.groups)) {
                design.groups.forEach(group => uniqueGroups.add(group));
            }
        });

        const stats = {
            seoHealth: {
                brokenLinks: brokenLinksCount,
                status: brokenLinksCount === 0 ? 'healthy' : 'warning',
            },
            content: {
                pillarPages: {
                    published: pillarPublished,
                    pending: pillarPending,
                    total: pillarPages.length,
                },
                blogPosts: posts,
                strategies: {
                    approved: strategiesApproved,
                    generated: strategiesGenerated,
                    total: strategies.length,
                },
            },
            products: {
                active: productsActive,
                highlighted: productsHighlighted,
                total: products.length,
            },
            coverDesigns: {
                groups: uniqueGroups.size,
                total: coverDesigns.length,
            },
        };

        res.status(200).json(stats);

    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error interno', error: error.message });
    }
}
