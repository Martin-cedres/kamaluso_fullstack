import { renderToStream } from '@react-pdf/renderer';
import QuoteTemplate from './quoteTemplate';
import { IQuote } from '../../models/Quote'; // Asumiendo que exportas la interfaz o la defines aquí

export async function generateQuotePDF(quote: any): Promise<Buffer> {
    try {
        const stream = await renderToStream(<QuoteTemplate quote={ quote } />);

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
