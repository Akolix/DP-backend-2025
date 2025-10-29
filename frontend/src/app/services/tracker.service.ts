import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
    return this.http.post<FoodLog>(`${this.apiUrl}/log`, foodData).pipe(
      tap(() => this.refreshSummary())
    );
  }

  getDailyLog(date?: string): Observable<FoodLog[]> {
    const url = date ? `${this.apiUrl}/daily/${date}` : `${this.apiUrl}/daily`;
    return this.http.get<FoodLog[]>(url);
  }

  deleteLoggedFood(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/log/${id}`).pipe(
      tap(() => this.refreshSummary())
    );
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
