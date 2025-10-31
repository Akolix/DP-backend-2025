import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { FoodLog, DailySummary, CalorieGoals } from '../models/food.model';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private apiUrl = `${environment.apiUrl}/tracker`;
  private summarySubject = new BehaviorSubject<DailySummary | null>(null);
  public summary$ = this.summarySubject.asObservable();

  constructor(private http: HttpClient) {}

  logFood(foodData: {
    barcode: string;
    product_name: string;
    serving_size: number;
    energy_kcal: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    meal_type: string
  }): Observable<FoodLog> {
    const currentSummary = this.summarySubject.value;
    if (currentSummary) {
      const optimisticSummary = this.calculateOptimisticUpdate(currentSummary, foodData);
      this.summarySubject.next(optimisticSummary);
    }

    return this.http.post<FoodLog>(`${this.apiUrl}/log`, foodData).pipe(
      tap(() => {
        // Refresh with real data from server
        setTimeout(() => this.refreshSummary(), 100);
      }),
      catchError(error => {
        // Revert on error
        this.summarySubject.next(currentSummary);
        throw error;
      })
    );
  }

  deleteLoggedFood(id: number): Observable<void> {
    const currentSummary = this.summarySubject.value;
    if (currentSummary) {
      const optimisticSummary = this.removeItemOptimistically(currentSummary, id);
      this.summarySubject.next(optimisticSummary);
    }

    return this.http.delete<void>(`${this.apiUrl}/log/${id}`).pipe(
      tap(() => {
        // Refresh with real data
        setTimeout(() => this.refreshSummary(), 100);
      }),
      catchError(error => {
        // Revert on error
        this.summarySubject.next(currentSummary);
        throw error;
      })
    );
  }

  private calculateOptimisticUpdate(summary: DailySummary, foodData: any): DailySummary {
    const calories = (foodData.energy_kcal * foodData.serving_size) / 100;
    const protein = (foodData.protein * foodData.serving_size) / 100;
    const carbs = ((foodData.carbohydrates || 0) * foodData.serving_size) / 100;
    const fat = ((foodData.fat || 0) * foodData.serving_size) / 100;

    return {
      ...summary,
      summary: {
        ...summary.summary,
        totalCalories: summary.summary.totalCalories + calories,
        totalProtein: summary.summary.totalProtein + protein,
        totalCarbs: summary.summary.totalCarbs + carbs,
        totalFat: summary.summary.totalFat + fat,
      },
      progress: {
        calories: ((summary.summary.totalCalories + calories) / summary.goals.daily_goal * 100).toFixed(1),
        protein: ((summary.summary.totalProtein + protein) / summary.goals.protein_goal * 100).toFixed(1),
        carbs: ((summary.summary.totalCarbs + carbs) / summary.goals.carbs_goal * 100).toFixed(1),
        fat: ((summary.summary.totalFat + fat) / summary.goals.fat_goal * 100).toFixed(1),
      }
    };
  }

  private removeItemOptimistically(summary: DailySummary, id: number): DailySummary {
    const allMeals = { ...summary.summary.meals };
    let removedItem: FoodLog | null = null;

    // Find and remove item
    for (const mealType in allMeals) {
      const itemIndex = allMeals[mealType].findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        removedItem = allMeals[mealType][itemIndex];
        allMeals[mealType] = allMeals[mealType].filter(item => item.id !== id);
        break;
      }
    }

    if (!removedItem) return summary;

    return {
      ...summary,
      summary: {
        ...summary.summary,
        totalCalories: summary.summary.totalCalories - removedItem.energy_kcal,
        totalProtein: summary.summary.totalProtein - removedItem.protein,
        totalCarbs: summary.summary.totalCarbs - removedItem.carbohydrates,
        totalFat: summary.summary.totalFat - removedItem.fat,
        meals: allMeals
      },
      progress: {
        calories: ((summary.summary.totalCalories - removedItem.energy_kcal) / summary.goals.daily_goal * 100).toFixed(1),
        protein: ((summary.summary.totalProtein - removedItem.protein) / summary.goals.protein_goal * 100).toFixed(1),
        carbs: ((summary.summary.totalCarbs - removedItem.carbohydrates) / summary.goals.carbs_goal * 100).toFixed(1),
        fat: ((summary.summary.totalFat - removedItem.fat) / summary.goals.fat_goal * 100).toFixed(1),
      }
    };
  }

  getDailySummary(date?: string): Observable<DailySummary> {
    const params = date ? `?date=${date}` : '';
    return this.http.get<DailySummary>(`${this.apiUrl}/summary${params}`).pipe(
      tap(summary => this.summarySubject.next(summary))
    );
  }

  getUserGoals(): Observable<CalorieGoals> {
    return this.http.get<CalorieGoals>(`${this.apiUrl}/goals`);
  }

  updateUserGoals(goals: Partial<CalorieGoals>): Observable<CalorieGoals> {
    return this.http.put<CalorieGoals>(`${this.apiUrl}/goals`, goals);
  }

  private refreshSummary(): void {
    this.getDailySummary().subscribe();
  }
}
