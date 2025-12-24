import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { generateWithFallback } from '../../../../lib/gemini-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        const prompt = `
Actuás como un redactor SEO profesional especializado en e-commerce.

OBJETIVO PRINCIPAL:
Sugerir ideas de Landing Pages estacionales que:
1) Posicionen en buscadores tradicionales (Google Search)
2) Sean fácilmente interpretadas por buscadores con IA (AI Overviews, SGE)
3) Tengan un alto potencial de conversión de visitas en ventas

CONTEXTO:
- E-commerce de papelería personalizada
- Marca: Kamaluso
- País objetivo: Uruguay
- Público: personas que buscan regalos personalizados con intención de compra

PRINCIPIOS OBLIGATORIOS:
- Claridad > creatividad
- Información concreta > metáforas
- Lenguaje natural y directo
- Propuestas escaneables y bien estructuradas

TAREA:
Genera una lista de 10 ideas de Event Pages (páginas de aterrizaje estacionales) recomendadas para este negocio, basadas en el calendario comercial anual de Uruguay.

FORMATO DE SALIDA (JSON VÁLIDO - SIN MARKDOWN):
[
  {
    "eventType": "Nombre del Evento",
    "month": "Número del mes (1-12)",
    "day": "Número del día",
    "suggestedTitle": "Título SEO optimizado (Máx. 60 caracteres, keyword principal al inicio)",
    "suggestedSlug": "url-amigable-sin-tildes-ni-año",
    "reason": "Justificación concisa de por qué esta fecha es una oportunidad comercial clave en Uruguay."
  }
]

REGLAS Y OPTIMIZACIÓN:
1. Incluir fechas clave de Uruguay: Día de la Madre, Día del Padre, Día del Niño, Día del Maestro, Navidad, Reyes, San Valentín, Vuelta a Clases, Black Friday, Cyber Lunes.
2. Los títulos deben ser declarativos, precisos y enfocados en la intención de compra.
3. Los slugs deben estar en minúsculas, sin acentos y usar guiones.
4. NUNCA incluyas años en títulos o slugs (contenido evergreen).
5. Ordena la lista por fecha cronológica (mes y día).
6. Solo devuelve el array JSON, sin explicaciones ni texto adicional.

EJEMPLO DE UN ELEMENTO DEL ARRAY:
{
  "eventType": "San Valentín",
  "month": "2",
  "day": "14",
  "suggestedTitle": "Regalos de San Valentín en Uruguay - Sorpresas Personalizadas",
  "suggestedSlug": "regalos-san-valentin-uruguay",
  "reason": "Alta demanda de regalos románticos y únicos. Pico de búsquedas transaccionales."
}

GENERAR RESPUESTA ÚNICAMENTE EN FORMATO JSON.
`;

        const aiResponse = await generateWithFallback(prompt);

        // Limpiar respuesta
        let cleanedResponse = aiResponse.trim();
        cleanedResponse = cleanedResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Intentar parsear
        const suggestions = JSON.parse(cleanedResponse);

        if (!Array.isArray(suggestions)) {
            throw new Error('La respuesta de la IA no es un array válido');
        }

        res.status(200).json({ suggestions });

    } catch (error: any) {
        console.error('Error generando sugerencias:', error);
        res.status(500).json({ message: 'Error al generar sugerencias', error: error.message });
    }
}
