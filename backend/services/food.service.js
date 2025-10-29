import { supabase } from '../config/database.js';
import { fetchProductByBarcode } from './openfoodfacts.service.js';

export async function getFoodByBarcode(barcode) {
    // Check if exists in database
    const { data: existing } = await supabase
        .from('foods')
        .select('*')
        .eq('barcode', barcode)
        .single();

    if (existing) {
        return existing;
    }

    // Fetch from OpenFoodFacts
    const product = await fetchProductByBarcode(barcode);

    if (!product) {
        return null;
    }

    // Save to database
    const { data: saved } = await supabase
        .from('foods')
        .insert([{ barcode, ...product }])
        .select()
        .single();

    return saved || { barcode, ...product };
}

export async function getAllFoods(limit = 100, offset = 0) {
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
}

export async function searchFoodsByName(query) {
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('product_name', `%${query}%`)
        .limit(50);

    if (error) throw error;
    return data;
}