import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url || !url.includes('webnode')) {
        return res.status(400).json({ message: 'URL de Webnode válida requerida' });
    }

    try {
        const response = await fetch(url);
        const html = await response.text();

        // Regex simples para extraer datos comunes de Webnode
        // Nota: Esto puede variar según la plantilla de Webnode, pero intentamos heurísticas comunes.

        // 1. Intentar extraer de meta tags OpenGraph (muy confiable)
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
        const priceMatch = html.match(/<meta property="product:price:amount" content="([^"]+)"/i) ||
            html.match(/itemprop="price" content="([^"]+)"/i) ||
            html.match(/class="price-value"[^>]*>([^<]+)</i);

        let nombre = titleMatch ? titleMatch[1] : 'Producto importado';
        let precio = priceMatch ? parseFloat(priceMatch[1].replace(/[^0-9.]/g, '')) : 0;

        // Limpiar el nombre si tiene el nombre del sitio
        nombre = nombre.split('|')[0].split('-')[0].trim();

        res.status(200).json({ nombre, precio });
    } catch (error: any) {
        console.error('[IMPORT PRODUCT ERROR]', error);
        res.status(500).json({ message: 'Error al importar el producto desde la URL' });
    }
}
