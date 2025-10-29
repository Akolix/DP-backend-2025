import axios from 'axios';
import { sanitizeNutriments } from '../utils/sanitizer.js';

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v0';

export async function fetchProductByBarcode(barcode) {
    const url = `${OPENFOODFACTS_API}/product/${barcode}.json`;
    const { data } = await axios.get(url);

    if (!data || data.status === 0) {
        return null;
    }

    return sanitizeNutriments(data.product);
}

export async function searchProducts(query, page = 1, pageSize = 20) {
    const url = `${OPENFOODFACTS_API}/cgi/search.pl`;
    const { data } = await axios.get(url, {
        params: {
            search_terms: query,
            page,
            page_size: pageSize,
            json: true
        }
    });

    if (!data || !data.products) {
        return [];
    }

    return data.products.map(sanitizeNutriments);
}