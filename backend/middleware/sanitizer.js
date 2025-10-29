export function sanitizeNutriments(product) {
    const n = product.nutriments || {};

    const parseValue = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    };

    // Get the best available image
    const getProductImage = (product) => {
        // Try to get the front image in different sizes
        if (product.image_front_url) return product.image_front_url;
        if (product.image_front_small_url) return product.image_front_small_url;
        if (product.image_url) return product.image_url;
        if (product.image_small_url) return product.image_small_url;

        // Construct image URL from code if available
        if (product.code) {
            return `https://images.openfoodfacts.org/images/products/${formatBarcodeForImage(product.code)}/front_en.jpg`;
        }

        return null;
    };

    return {
        product_name: product.product_name || 'Unknown Product',
        energy_kcal: parseValue(n['energy-kcal_100g']),
        protein: parseValue(n['proteins_100g']),
        carbohydrates: parseValue(n['carbohydrates_100g']),
        sugars: parseValue(n['sugars_100g']),
        fat: parseValue(n['fat_100g']),
        saturated_fat: parseValue(n['saturated-fat_100g']),
        salt: parseValue(n['salt_100g']),
        fiber: parseValue(n['fiber_100g'] || n['fibers_100g']),
        image_url: getProductImage(product)
    };
}

// Helper function to format barcode for OpenFoodFacts image URLs
function formatBarcodeForImage(barcode) {
    if (!barcode) return '';

    // OpenFoodFacts stores images in folders based on barcode structure
    // Example: 3017620422003 becomes 301/762/042/2003
    const code = barcode.toString().padStart(13, '0');

    if (code.length === 13) {
        return `${code.slice(0, 3)}/${code.slice(3, 6)}/${code.slice(6, 9)}/${code.slice(9)}`;
    }

    return barcode;
}