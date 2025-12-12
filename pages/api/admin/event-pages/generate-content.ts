import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { generateWithFallback } from '../../../../lib/gemini-agent';
import connectDB from '../../../../lib/mongoose';
import Product from '../../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { eventType, selectedProducts } = req.body;

    if (!eventType || !selectedProducts || selectedProducts.length === 0) {
        return res.status(400).json({ message: 'eventType y selectedProducts son requeridos.' });
    }

    try {
        await connectDB();

        // Obtener detalles de los productos seleccionados
        const products = await Product.find({ _id: { $in: selectedProducts } }, 'nombre descripcion slug basePrice');

        const productsContext = products.map(p => `
      - ${p.nombre} (${p.slug})
        Precio: $${p.basePrice}
        Desc: ${(p.descripcion || '').substring(0, 150)}...
    `).join('\n');

        // Prompt OPTIMIZADO: Breve, enfocado en conversión y persuasión emocional
        const contentPrompt = `
TAREA: Generar contenido breve, emotivo y persuasivo para landing page de evento.

CONTEXTO:
- Evento: "${eventType}"
- País: Uruguay  
- Productos: ${products.length} opciones personalizables y únicas

ESTRUCTURA HTML REQUERIDA:
<h2>🎁 El Regalo Único que Recordarán de ${eventType}</h2>
<p>[2-3 párrafos EMOTIVOS: Conectar con el significado del evento. Por qué un regalo personalizado demuestra más amor/aprecio que algo genérico. Hablar de la emoción de recibir algo hecho especialmente para ti.]</p>

<h2>✨ Por Qué Papelería Kamaluso es Tu Mejor Elección</h2>
<ul>
  <li><strong>100% Personalizable:</strong> [Nombres, logos, diseños - tu idea hecha realidad]</li>
  <li><strong>Calidad que Se Siente:</strong> [Materiales premium, hecho en Uruguay con amor]</li>
  <li><strong>Entrega Garantizada:</strong> [Envíos a todo Uruguay en 3-5 días]</li>
  <li><strong>Regalo con Significado:</strong> [Útil + emotivo = recuerdo duradero]</li>
</ul>

<h2>💝 Cómo Personalizar Tu Regalo Perfecto</h2>
<p>[1-2 párrafos: Ideas concretas de personalización - nombres, fechas especiales, mensajes inspiradores. Hacer que visualicen el regalo terminado y la reacción de quien lo recibe.]</p>

REGLAS ESTRICTAS:
1. Máximo 300-400 palabras total
2. HTML limpio (sin <html>, <body>, <div>)
3. NUNCA mencionar años específicos (2025, 2026)
4. Usar lenguaje evergreen: "cada año", "en ${eventType}"
5. Tono uruguayo emotivo (voseo: "hacé", "elegí", "regalá")
6. NO insertar {{PRODUCT_CARD}} - productos se muestran arriba
7. Keywords naturales: "${eventType} uruguay", "regalos únicos personalizados"
8. CTAs emocionales: "Creá algo único", "Sorprendé con amor", "Hacé memorable este ${eventType}"
9. NO introducción conversacional ("Aquí tienes")
10. Comenzar directo con <h2>
11. URGENCIA SUTIL: Mencionar plazos ("pedí con tiempo", "asegurá tu regalo único")
12. BENEFICIO EMOCIONAL > característica técnica

TONO: Cálido, cercano, emotivo sin ser cursi. Como una amiga que te da un consejo valioso.

OBJETIVO: Contenido que conecte emocionalmente, genere urgencia sutil y complemente la visualización de productos arriba.

SALIDA: Solo HTML limpio. Primera línea = <h2>
    `;

        const seoTitlePrompt = `
Genera un título SEO perfecto para una landing page de "${eventType}" en Uruguay.

REQUISITOS:
- Máximo 60 caracteres
- Incluir: "${eventType}", "Uruguay", "regalos personalizados"
- Atractivo y con gancho emocional
- NO mencionar año

Solo devuelve el título, sin explicaciones.
    `;

        const seoDescriptionPrompt = `
Genera una meta descripción SEO para landing page de "${eventType}" en Uruguay.

REQUISITOS:
- Entre 150-160 caracteres
- Incluir keywords: "${eventType}", "regalos", "uruguay"
- Llamado a acción
- Beneficio claro

Solo devuelve la descripción, sin explicaciones.
    `;

        const seoKeywordsPrompt = `
Genera 8-10 keywords SEO separadas por comas para "${eventType}" en Uruguay.

FORMATO: keyword1, keyword2, keyword3, ...

Incluir variaciones:
- Con y sin "uruguay"
- Con y sin "personalizados"
- Long-tail específicas

Solo devuelve las keywords, sin explicaciones.
    `;

        console.log(`Generando contenido para evento: ${eventType}`);

        const [generatedContent, generatedSeoTitle, generatedSeoDescription, generatedKeywords] = await Promise.all([
            generateWithFallback(contentPrompt),
            generateWithFallback(seoTitlePrompt),
            generateWithFallback(seoDescriptionPrompt),
            generateWithFallback(seoKeywordsPrompt),
        ]);

        // Limpieza del contenido
        const cleanContent = generatedContent
            .replace(/```html/gi, '')
            .replace(/```/g, '')
            .replace(/^[\s\S]*?(?=<h)/i, '') // Eliminar todo antes del primer <h
            .replace(/Aquí tienes[\s\S]*?(?=<)/gi, '')
            .replace(/Claro,?[\s\S]*?(?=<)/gi, '')
            .trim();

        res.status(200).json({
            content: cleanContent,
            seoTitle: generatedSeoTitle.trim(),
            seoDescription: generatedSeoDescription.trim(),
            seoKeywords: generatedKeywords.trim(),
        });

    } catch (error: any) {
        console.error('Error generando contenido para Event Page:', error);
        res.status(500).json({ message: 'Error al generar contenido', error: error.message });
    }
}
