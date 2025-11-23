import { generateContentSmart } from './gemini-client';
import { getGoogleSuggestions } from './keyword-research';

/**
 * Realiza un análisis rápido de la competencia para un producto específico.
 * 1. Busca marcas/términos relacionados en Google Suggest.
 * 2. Pide a la IA que simule un análisis de mercado basado en su conocimiento.
 */
export async function analyzeCompetitors(productName: string, category: string): Promise<string> {
    try {
        console.log(`🕵️ Iniciando espionaje de competencia para: ${productName}`);

        // 1. Obtener "pistas" de la competencia desde Google Suggest
        // Buscamos cosas como "agenda 2026 [marca]" o "mejores agendas uruguay"
        const searchQueries = [
            `mejores ${category} uruguay`,
            `${category} personalizada uruguay`,
            `${productName} vs`,
        ];

        let competitorHints: string[] = [];
        for (const query of searchQueries) {
            const suggestions = await getGoogleSuggestions(query);
            competitorHints = [...competitorHints, ...suggestions];
        }

        // Limpiar y limitar pistas
        const uniqueHints = [...new Set(competitorHints)].slice(0, 10).join(', ');

        // 2. Preguntar a la IA (Gemini tiene conocimiento del mundo real hasta su fecha de corte)
        const prompt = `
      Eres un consultor de estrategia de mercado experto en Uruguay.
      
      PRODUCTO: "${productName}"
      CATEGORÍA: "${category}"
      PISTAS DE BÚSQUEDA REALES: ${uniqueHints}

      Tu tarea es identificar las DEBILIDADES comunes de la competencia en este nicho en Uruguay (ej: precios altos, diseños anticuados, mala calidad de papel, demoras en entrega, falta de personalización real).

      Responde con un breve párrafo (máx 3 líneas) que resuma:
      1. Qué están haciendo mal los competidores.
      2. Qué oportunidad tiene "Kamaluso" para destacar (ej: "Mientras otros ofrecen X, Kamaluso puede ganar ofreciendo Y").

      No menciones marcas específicas de la competencia por nombre para evitar problemas legales, habla de "la competencia" en general.
    `;

        const analysis = await generateContentSmart(prompt);
        return analysis || "La competencia se enfoca en productos estándar; la oportunidad está en la personalización extrema y la calidad premium.";

    } catch (error) {
        console.error("Error en análisis de competencia:", error);
        return "Enfócate en la calidad premium y la atención al detalle, que suelen ser puntos débiles en el mercado masivo.";
    }
}
