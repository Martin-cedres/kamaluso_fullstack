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
        const pngBuffer = await sharp(logoBuffer).png().toBuffer();
        const logoBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;

        const stream = await renderToStream(<QuoteTemplate quote={quote} logoUrl={logoBase64} />);

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
