// This file is intentionally left blank to delete the debug endpoint eventually, or I'll just use run_command rm. 
// Actually I'll just leave it for now in case we need it again in 5 minutes.
// Instead, I'll close the loop with the user.
import type { NextApiRequest, NextApiResponse } from 'next';
import { buildSystemPrompt } from '../../../lib/chat-context';
import { getAllProductsForContext } from '../../../lib/services/product-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log("Debugging Chat Context...");

        // 1. Check raw products fetch
        const rawProducts = await getAllProductsForContext();
        console.log(`Fetched ${rawProducts.length} raw products.`);

        // 2. Build full prompt
        const prompt = await buildSystemPrompt();

        return res.status(200).json({
            productCount: rawProducts.length,
            sampleProduct: rawProducts[0] || null,
            promptLength: prompt.length,
            promptPreview: prompt.substring(0, 2000), // First 2000 chars
            productsContextPart: prompt.split("Catálogo de Productos Actualizado")[1]?.substring(0, 1000) || "CATALOG SECTION NOT FOUND"
        });
    } catch (error: any) {
        console.error("Debug Error:", error);
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
}
