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
Eres un experto en marketing digital y ventas en Uruguay.

TAREA: Genera una lista de 10 Event Pages recomendadas para un negocio de papelería personalizada en Uruguay, basadas en el calendario comercial anual.

CONTEXTO:
- Negocio: Papelería Personalizada Kamaluso (agendas, cuadernos, libretas personalizadas)
- País: Uruguay
- Objetivo: Captar ventas en fechas clave del año

FORMATO DE SALIDA (JSON válido):
[
  {
    "eventType": "Nombre del Evento",
    "month": número del mes (1-12),
    "day": número del día,
    "suggestedTitle": "Título SEO optimizado para la landing page",
    "suggestedSlug": "url-amigable-sin-año",
    "reason": "Por qué es importante esta fecha para ventas en Uruguay"
  }
]

REGLAS:
1. Incluir fechas clave uruguayas: Día de la Madre, Día del Padre, Día del Niño, Día del Maestro, Navidad, Reyes, San Valentín, Vuelta a Clases, Black Friday, etc.
2. Los títulos deben ser atractivos pero profesionales
3. Los slugs sin acentos, solo minúsculas y guiones
4. NO incluir años en títulos ni slugs (evergreen)
5. Ordenar por fecha (mes y día)
6. Máximo 10 eventos
7. Solo devolver el array JSON, sin texto adicional

EJEMPLO:
[
  {
    "eventType": "San Valentín",
    "month": 2,
    "day": 14,
    "suggestedTitle": "Regalos Personalizados para San Valentín - Ideas Únicas",
    "suggestedSlug": "regalos-san-valentin",
    "reason": "Fecha clave para regalos románticos. Alta demanda de productos personalizados."
  }
]

RESPUESTA SOLO JSON:
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
