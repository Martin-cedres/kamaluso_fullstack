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
