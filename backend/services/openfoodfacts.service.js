import axios from 'axios';
import {sanitizeNutriments} from "../middleware/sanitizer.js";

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org';

export async function fetchProductByBarcode(barcode) {
    const url = `${OPENFOODFACTS_API}/api/v0/product/${barcode}.json`;

    try {
        const { data } = await axios.get(url, { timeout: 30000 });

        if (!data || data.status === 0) {
            return null;
        }

        return sanitizeNutriments(data.product);
    } catch (error) {
        console.error('Barcode lookup error:', error.message);
        return null;
    }
}

export async function searchProducts(query, page = 1, pageSize = 10) {
    try {
        const url = `${OPENFOODFACTS_API}/cgi/search.pl`;

        const { data } = await axios.get(url, {
            params: {
                search_terms: query,
                search_simple: 1,
                action: 'process',
                page,
                page_size: pageSize,
                json: 1
            },
            timeout: 30000
        });

        if (!data || !data.products || data.products.length === 0) {
            console.log('No products found for:', query);
            return [];
        }

        console.log(`Found ${data.products.length} products for: ${query}`);

        // Process and filter results
        const results = data.products
            .filter(p => {
                // Must have a name
                if (!p.product_name || p.product_name.trim().length === 0) return false;

                // Must have some nutritional data
                const n = p.nutriments || {};
                if (!n['energy-kcal_100g'] && !n['energy_100g']) return false;

                return true;
            })
            .map(p => {
                const sanitized = sanitizeNutriments(p);
                const relevance = calculateRelevance(query, p.product_name);

                return {
                    barcode: p.code,
                    ...sanitized,
                    _relevance: relevance,
                    _name_lower: p.product_name.toLowerCase()
                };
            })
            // Sort by relevance
            .sort((a, b) => b._relevance - a._relevance)
            // Remove metadata
            .map(({ _relevance, _name_lower, ...product }) => product)
            // Take top results
            .slice(0, pageSize);

        return results;
    } catch (error) {
        console.error('OpenFoodFacts search error:', error.message);
        return [];
    }
}

// Improved relevance calculation
function calculateRelevance(query, productName) {
    if (!productName) return 0;

    const queryLower = query.toLowerCase().trim();
    const nameLower = productName.toLowerCase().trim();

    // Exact match
    if (nameLower === queryLower) return 1000;

    // Starts with query
    if (nameLower.startsWith(queryLower)) return 900;

    // Query is at start of a word
    if (nameLower.startsWith(queryLower + ' ')) return 850;

    // Contains query as separate word
    const queryWords = queryLower.split(/\s+/);
    const nameWords = nameLower.split(/\s+/);

    // All query words match name words
    const allWordsMatch = queryWords.every(qWord =>
        nameWords.some(nWord => nWord.startsWith(qWord) || nWord === qWord)
    );

    if (allWordsMatch) return 800;

    // Contains query anywhere
    if (nameLower.includes(queryLower)) return 700;

    // Partial word matching
    let matchedWords = 0;
    queryWords.forEach(qWord => {
        if (nameWords.some(nWord => nWord.includes(qWord))) {
            matchedWords++;
        }
    });

    const matchRatio = matchedWords / queryWords.length;
    return matchRatio * 500;
}