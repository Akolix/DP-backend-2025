import { supabase } from '../config/database.js';

export async function logFood(userId, foodData) {
    const { data, error } = await supabase
        .from('food_log')
        .insert([{
            user_id: userId,
            food_id: foodData.food_id,
            barcode: foodData.barcode,
            product_name: foodData.product_name,
            serving_size: foodData.serving_size || 100,
            energy_kcal: (foodData.energy_kcal * (foodData.serving_size || 100)) / 100,
            protein: (foodData.protein * (foodData.serving_size || 100)) / 100,
            carbohydrates: (foodData.carbohydrates * (foodData.serving_size || 100)) / 100,
            fat: (foodData.fat * (foodData.serving_size || 100)) / 100,
            meal_type: foodData.meal_type
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getDailyLog(userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', startOfDay.toISOString())
        .lte('logged_at', endOfDay.toISOString())
        .order('logged_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function deleteLoggedFood(userId, logId) {
    const { error } = await supabase
        .from('food_log')
        .delete()
        .eq('id', logId)
        .eq('user_id', userId);

    if (error) throw error;
}

export async function getDailySummary(userId, date) {
    const logs = await getDailyLog(userId, date);

    const summary = logs.reduce((acc, log) => ({
        totalCalories: acc.totalCalories + (log.energy_kcal || 0),
        totalProtein: acc.totalProtein + (log.protein || 0),
        totalCarbs: acc.totalCarbs + (log.carbohydrates || 0),
        totalFat: acc.totalFat + (log.fat || 0),
        meals: {
            ...acc.meals,
            [log.meal_type]: [...(acc.meals[log.meal_type] || []), log]
        }
    }), {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: {}
    });

    return summary;
}

export async function getUserGoals(userId) {
    const { data, error } = await supabase
        .from('calorie_goals')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Return defaults if not found
    return data || {
        daily_goal: 2000,
        protein_goal: 150,
        carbs_goal: 250,
        fat_goal: 70
    };
}

export async function updateUserGoals(userId, goals) {
    const { data, error } = await supabase
        .from('calorie_goals')
        .upsert({
            user_id: userId,
            daily_goal: goals.daily_goal,
            protein_goal: goals.protein_goal,
            carbs_goal: goals.carbs_goal,
            fat_goal: goals.fat_goal,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}