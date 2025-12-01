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

        // Prompt optimizado para SEO y conversión
        const contentPrompt = `
TAREA: Generar contenido SEO para landing page de evento comercial.

DATOS:
- Evento: "${eventType}"
- País: Uruguay
- Productos disponibles:
${productsContext}

ESTRUCTURA HTML (OBLIGATORIA):
<h2>Por Qué Elegir Regalos Personalizados para ${eventType}</h2>
<p>Introducción emocional (2-3 párrafos explicando la importancia de regalar bien en esta ocasión)</p>

<h2>Perfiles y Personalidades</h2>
<p>Breve intro</p>
<h3>[Perfil 1: ej "Mamá Creativa"]</h3>
<p>Descripción del perfil y por qué estos regalos son perfectos</p>
<p>{{PRODUCT_CARD:slug-producto-1}}</p>

<h3>[Perfil 2]</h3>
<p>Descripción...</p>
<p>{{PRODUCT_CARD:slug-producto-2}}</p>

<h2>Ideas de Regalos Únicos</h2>
<ul>
  <li><strong>Idea 1:</strong> Descripción con mención de producto {{PRODUCT_CARD:slug}}</li>
  <li><strong>Idea 2:</strong> ...</li>
</ul>

<h2>Cómo Personalizar Tu Regalo</h2>
<p>Tips prácticos para agregar valor (nombres, fechas, mensajes especiales)</p>

<h2>Por Qué Comprar en Papelería Personalizada</h2>
<ul>
  <li>Calidad uruguaya</li>
  <li>Envíos a todo el país</li>
  <li>Personalización profesional</li>
</ul>

REGLAS CRÍTICAS:
1. HTML limpio (no usar <html>, <body>)
2. NUNCA mencionar años (2025, 2026)
3. Usar frases evergreen: "cada año", "en esta época"
4. Insertar TODOS los productos con {{PRODUCT_CARD:slug}}
5. Tono uruguayo, cercano, sin tuteo
6. Mínimo 800 palabras
7. NO escribir intro conversacional ("Aquí tienes", "Claro")
8. Keywords naturales: "${eventType} uruguay", "regalos personalizados", etc.
9. Incluir CTAs sutiles ("Descubrí", "Explorá")

SALIDA: Solo HTML. Comienza con <h2>, termina con última etiqueta.
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
