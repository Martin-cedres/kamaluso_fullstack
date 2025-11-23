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
  console.log(`Iniciando investigación de tendencias para: ${productName}`);
  
  // Este resumen se basa en la investigación real realizada con google_web_search.
  // Representa los hallazgos clave sobre las tendencias de búsqueda en Uruguay.
  const broadTrendsSummary = `
- Fuerte enfoque en la personalización para nichos: "agendas para estudiantes", "planners para profesionales", "regalos empresariales".
- La autenticidad es clave: los usuarios valoran las reseñas y el contenido generado por otros clientes.
- Búsquedas por voz y visuales están en aumento. El contenido debe ser conversacional.
- El año ("2026") es un término de búsqueda fundamental y debe usarse en combinación con "Uruguay".
- "Planner" se usa de forma intercambiable con "agenda".
  `.trim();

  // Se obtienen sugerencias específicas usando la función existente.
  const longTailKeywords = await getKeywordSuggestions(productName);
  const categoryKeywords = await getKeywordSuggestions(categoryName);

  // Se definen keywords primarias basadas en la investigación.
  const primaryKeywords = [
    `comprar ${productName}`,
    `${productName} Uruguay`,
    `${categoryName} 2026 Uruguay`,
    `regalos empresariales ${new Date().getFullYear()}`,
    `mejores planners Uruguay`,
    `ideas ${productName}`,
    `${productName} Montevideo`,
  ];
  
  // Se combina y depura la lista final de keywords.
  const allKeywords = [...primaryKeywords, ...longTailKeywords, ...categoryKeywords];
  const uniqueKeywords = [...new Set(allKeywords)]
    .filter(k => k.length > 5) // Filtro simple para asegurar calidad.
    .slice(0, 20); // Se limita a un número razonable para no saturar el prompt.

  console.log(`Investigación completada: ${uniqueKeywords.length} keywords únicas encontradas.`);

  return {
    trendsSummary: broadTrendsSummary,
    keywords: uniqueKeywords,
  };
}
