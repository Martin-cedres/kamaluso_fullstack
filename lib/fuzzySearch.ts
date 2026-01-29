/**
 * Fuzzy Search Utilities
 * Provides fuzzy matching capabilities for product search with typo tolerance
 */

/**
 * Calculates the Levenshtein distance between two strings
 * (minimum number of single-character edits needed to change one word into the other)
 */
export function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create a 2D array for dynamic programming
    const matrix: number[][] = Array(len1 + 1)
        .fill(null)
        .map(() => Array(len2 + 1).fill(0));

    // Initialize first column and row
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Normalizes text for fuzzy matching:
 * - Converts to lowercase
 * - Removes accents
 * - Trims whitespace
 */
export function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .trim();
}

/**
 * Checks if query fuzzy matches target string
 * @param query - Search query
 * @param target - String to match against
 * @param maxDistance - Maximum allowed Levenshtein distance (default: auto-calculated)
 * @returns true if strings are similar enough
 */
export function fuzzyMatch(
    query: string,
    target: string,
    maxDistance?: number
): boolean {
    const normalizedQuery = normalizeText(query);
    const normalizedTarget = normalizeText(target);

    // Exact match after normalization
    if (normalizedTarget.includes(normalizedQuery)) {
        return true;
    }

    // Calculate max distance based on query length if not provided
    const distance = maxDistance ?? Math.floor(normalizedQuery.length / 3);

    // For very short queries, be more strict
    const threshold = normalizedQuery.length <= 3 ? 1 : distance;

    const levenshtein = levenshteinDistance(normalizedQuery, normalizedTarget);
    return levenshtein <= threshold;
}

/**
 * Calculates a fuzzy match score between 0 and 1
 * Higher score = better match
 * @param query - Search query
 * @param target - String to score against
 * @returns Match score from 0 to 1
 */
export function fuzzyScore(query: string, target: string): number {
    const normalizedQuery = normalizeText(query);
    const normalizedTarget = normalizeText(target);

    // Exact substring match gets highest score
    if (normalizedTarget.includes(normalizedQuery)) {
        const position = normalizedTarget.indexOf(normalizedQuery);
        // Bonus if match is at the beginning
        return position === 0 ? 1.0 : 0.95;
    }

    // Split into words for better matching
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    const targetWords = normalizedTarget.split(/\s+/).filter(w => w.length > 0);

    let bestWordScore = 0;
    let matchedWords = 0;

    // For each query word, find best match in target words
    for (const qWord of queryWords) {
        let bestMatch = 0;

        for (const tWord of targetWords) {
            // Direct substring match (word contains query)
            if (tWord.includes(qWord)) {
                bestMatch = Math.max(bestMatch, 0.9);
                continue;
            }

            // Only apply fuzzy if query word is 4+ chars (avoid matching "lib" with "agenda")
            if (qWord.length >= 4) {
                // Check if they share a common prefix
                if (tWord.startsWith(qWord.substring(0, 3)) || qWord.startsWith(tWord.substring(0, 3))) {
                    const distance = levenshteinDistance(qWord, tWord);
                    const maxLen = Math.max(qWord.length, tWord.length);
                    const similarity = 1 - (distance / maxLen);

                    // Only consider if similarity is high enough
                    if (similarity > 0.7) {
                        bestMatch = Math.max(bestMatch, similarity * 0.8);
                    }
                }
            }
        }

        if (bestMatch > 0.5) {
            matchedWords++;
            bestWordScore += bestMatch;
        }
    }

    // At least one word must match decently
    if (matchedWords === 0) {
        return 0;
    }

    // Average score of matched words, weighted by coverage
    const coverage = matchedWords / queryWords.length;
    const avgScore = bestWordScore / matchedWords;

    return avgScore * coverage;
}

/**
 * Fuzzy searches an array of strings and returns matches with scores
 * @param query - Search query
 * @param items - Array of strings to search
 * @param minScore - Minimum score threshold (default: 0.6)
 * @returns Array of {item, score} sorted by score descending
 */
export function fuzzySearch<T extends { [key: string]: any }>(
    query: string,
    items: T[],
    searchKey: keyof T,
    minScore: number = 0.6
): Array<T & { fuzzyScore: number }> {
    const results = items
        .map(item => ({
            ...item,
            fuzzyScore: fuzzyScore(query, String(item[searchKey]))
        }))
        .filter(item => item.fuzzyScore >= minScore)
        .sort((a, b) => b.fuzzyScore - a.fuzzyScore);

    return results;
}
