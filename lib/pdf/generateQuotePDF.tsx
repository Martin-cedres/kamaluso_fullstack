import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import QuoteTemplate from './quoteTemplate';

export async function generateQuotePDF(quote: any): Promise<Buffer> {
    try {
        const path = require('path');
        const fs = require('fs');
        const sharp = require('sharp');

        const logoPath = path.join(process.cwd(), 'public', 'logo.webp');

        // Leer el archivo y convertir a PNG (compatible con react-pdf)
        const logoBuffer = fs.readFileSync(logoPath);
        const pngLogoBuffer = await sharp(logoBuffer).png().toBuffer();
        const logoBase64 = `data:image/png;base64,${pngLogoBuffer.toString('base64')}`;

        // Clonar el quote para no mutar el original
        const processedQuote = JSON.parse(JSON.stringify(quote));

        // Procesar imágenes de los ítems
        for (const item of processedQuote.items) {
            if (item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'))) {
                try {
                    let imageUrl = item.imageUrl;

                    // Si es URL relativa, convertir a absoluta (necesario para descargar)
                    if (imageUrl.startsWith('/')) {
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.papeleriapersonalizada.uy';
                        imageUrl = `${baseUrl}${imageUrl}`;
                    }

                    // Descargar la imagen usando fetch nativo
                    const response = await fetch(imageUrl);
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

                    const arrayBuffer = await response.arrayBuffer();
                    const imageBuffer = Buffer.from(arrayBuffer);

                    // Convertir a PNG (esto soluciona el problema de WebP y asegura compatibilidad)
                    const processedBuffer = await sharp(imageBuffer).png().toBuffer();
                    item.imageUrl = `data:image/png;base64,${processedBuffer.toString('base64')}`;
                } catch (imgError) {
                    console.error(`Error processing image ${item.imageUrl}:`, imgError);
                    // Si falla, dejamos la URL original y react-pdf intentará cargarla (o fallará silenciosamente)
                }
            }
        }

        const stream = await renderToStream(<QuoteTemplate quote={processedQuote} logoUrl={logoBase64} />);

        return new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', (err) => reject(err));
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
}
