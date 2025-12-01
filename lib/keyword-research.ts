import { generateWithFallback } from './gemini-agent';

/**
 * Fetches search suggestions from Google's unofficial suggest API.
 * This is a free, non-official endpoint and may be unstable.
 * @param query The search term to get suggestions for.
 * @param lang The language to get suggestions in (e.g., 'en', 'es').
 * @returns A promise that resolves to an array of suggestion strings.
 */
export async function getGoogleSuggestions(query: string, lang: string = 'es'): Promise<string[]> {
  if (!query) {
    return [];
  }

  // Using URLSearchParams to safely construct the query string
  const params = new URLSearchParams({
    client: 'firefox',
    q: query,
    hl: lang,
  });
  const url = `http://suggestqueries.google.com/complete/search?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // The response is a JSON array where the second element is an array of suggestions.
    if (data && Array.isArray(data) && data.length > 1) {
      const suggestions = data[1];
      if (Array.isArray(suggestions)) {
        return suggestions.filter(s => typeof s === 'string');
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching or parsing Google suggestions:', error);
    return [];
  }
}

/**
 * Fetches keyword suggestions from various search engines.
 * Currently, only Google is supported.
 * The results are combined and deduplicated.
 * @param seedKeyword The base keyword to get suggestions for.
 * @returns A promise that resolves to a deduplicated array of keyword suggestions.
 */
export async function getKeywordSuggestions(seedKeyword: string): Promise<string[]> {
  if (!seedKeyword) {
    return [];
  }

  try {
    const googleSuggestions = await getGoogleSuggestions(seedKeyword, 'es');

    // In the future, other sources like Bing could be added here.
    // const bingSuggestions = await getBingSuggestions(seedKeyword);
    // const allSuggestions = [...googleSuggestions, ...bingSuggestions];

    const allSuggestions = [...googleSuggestions];

    // Deduplicate the suggestions
    const uniqueSuggestions = [...new Set(allSuggestions)];

    return uniqueSuggestions;
  } catch (error) {
    console.error('Error fetching keyword suggestions:', error);
    return [];
  }
}

/**
 * Performs a deep search for SEO trends and keywords using various methods.
 * @param productName The name of the product (e.g., "Agenda Personalizada 2026").
 * @param categoryName The name of the category (e.g., "Agendas").
 * @returns A promise that resolves to an object containing a trends summary and a list of keywords.
 */
export async function getSearchTrends(
  productName: string,
  categoryName: string
): Promise<{ trendsSummary: string; keywords: string[] }> {
  console.log(`Iniciando investigación de tendencias REALES para: ${productName}`);

  // 1. Obtener sugerencias "crudas" de Google Suggest (Datos Reales del Mercado)
  const longTailKeywords = await getKeywordSuggestions(productName);
  const categoryKeywords = await getKeywordSuggestions(categoryName);

  // 2. Definir keywords semilla para ampliar la búsqueda
  const primaryKeywords = [
    `comprar ${productName}`,
    `${productName} Uruguay`,
    `${categoryName} 2026 Uruguay`,
    `regalos empresariales ${new Date().getFullYear()}`,
    `mejores planners Uruguay`,
    `ideas ${productName}`,
    `${productName} Montevideo`,
  ];

  // 3. Combinar y limpiar keywords
  const allKeywords = [...primaryKeywords, ...longTailKeywords, ...categoryKeywords];
  const uniqueKeywords = [...new Set(allKeywords)]
    .filter(k => k.length > 4) // Filtro de ruido
    .slice(0, 25); // Tomamos una muestra representativa

  console.log(`Keywords encontradas: ${uniqueKeywords.length}. Analizando patrones con IA...`);

  // 4. Generar Resumen de Tendencias Dinámico con IA
  // En lugar de un texto fijo, le damos los datos a la IA para que interprete el mercado actual.
  try {
    const analysisPrompt = `
      Actúa como un Analista de Datos de Mercado Senior.
      He extraído las siguientes TENDENCIAS DE BÚSQUEDA (Keywords) de Google Uruguay para el producto "${productName}" (${categoryName}):

      LISTA DE KEYWORDS DETECTADAS:
      ${uniqueKeywords.join(', ')}

      Tu tarea:
      Analiza esta lista y genera un "Resumen de Inteligencia de Mercado" (máx 5 puntos).
      Identifica:
      1. ¿Qué busca exactamente la gente? (Barato, calidad, personalizado, urgente?)
      2. ¿Hay términos estacionales o años específicos (ej: 2026)?
      3. ¿Qué intención de compra predomina?

      Responde SOLO con el resumen en formato lista (bullet points). Sé directo y estratégico.
    `;

    const dynamicTrendsSummary = await generateWithFallback(analysisPrompt);

    return {
      trendsSummary: dynamicTrendsSummary,
      keywords: uniqueKeywords,
    };

  } catch (error) {
    console.error("Error generando análisis de tendencias dinámico:", error);
    // Fallback seguro si falla la IA de análisis, pero aún devolvemos las keywords reales
    return {
      trendsSummary: "No se pudo generar el análisis detallado, pero las keywords adjuntas reflejan la demanda actual del mercado.",
      keywords: uniqueKeywords,
    };
  }
}
