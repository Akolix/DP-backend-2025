export interface Food {
  id?: number;
  barcode: string;
  product_name: string;
  energy_kcal: number;
  protein: number;
  carbohydrates?: number;
  sugars?: number;
  fat?: number;
  saturated_fat?: number;
  salt?: number;
  fiber?: number;
  image_url?: string;
  created_at?: string;
}

export interface FoodLog {
  id: number;
  user_id: string;
  food_id?: number;
  barcode: string;
  product_name: string;
  serving_size: number;
  energy_kcal: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  logged_at: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailySummary {
  date: string;
  summary: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: {
      [key: string]: FoodLog[];
    };
  };
  goals: CalorieGoals;
  progress: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

export interface CalorieGoals {
  id?: number;
  user_id?: string;
  daily_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  updated_at?: string;
}
