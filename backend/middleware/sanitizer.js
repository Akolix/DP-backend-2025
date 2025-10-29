export function sanitizeNutriments(product) {
    const n = product.nutriments || {};

    const parseValue = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
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
        fiber: parseValue(n['fiber_100g'] || n['fibers_100g'])
    };
}