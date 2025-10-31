import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Food } from '../models/food.model';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class FoodApiService {
  private apiUrl = `${environment.apiUrl}/foods`;

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  getFoodByBarcode(barcode: string): Observable<Food> {
    const cacheKey = `food_barcode_${barcode}`;
    const cached = this.cache.get<Food>(cacheKey);

    if (cached) {
      console.log('Cache hit:', cacheKey);
      return of(cached);
    }

    console.log('Cache miss, fetching:', cacheKey);
    return this.http.get<Food>(`${this.apiUrl}/${barcode}`).pipe(
      tap(food => this.cache.set(cacheKey, food, 10 * 60 * 1000)) // 10 min cache
    );
  }

  getAllFoods(limit: number = 100, offset: number = 0): Observable<Food[]> {
    const cacheKey = `foods_${limit}_${offset}`;
    const cached = this.cache.get<Food[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Food[]>(`${this.apiUrl}?limit=${limit}&offset=${offset}`).pipe(
      tap(foods => this.cache.set(cacheKey, foods, 5 * 60 * 1000)) // 5 min cache
    );
  }

  searchFoods(query: string): Observable<any> {
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    const cached = this.cache.get<any>(cacheKey);

    if (cached) {
      console.log('Search cache hit:', query);
      return of(cached);
    }

    console.log('Search cache miss:', query);
    return this.http.get<any>(`${this.apiUrl}/search?q=${query}`).pipe(
      tap(results => this.cache.set(cacheKey, results, 3 * 60 * 1000)) // 3 min cache
    );
  }

  clearCache(): void {
    this.cache.clear();
  }
}
