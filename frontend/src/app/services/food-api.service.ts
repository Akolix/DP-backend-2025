import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
import { Food } from '../models/food.model';

@Injectable({
  providedIn: 'root'
})
export class FoodApiService {
  private apiUrl = `${environment.apiUrl}/foods`;

  constructor(private http: HttpClient) {}

  getFoodByBarcode(barcode: string): Observable<Food> {
    return this.http.get<Food>(`${this.apiUrl}/${barcode}`);
  }

  getAllFoods(limit: number = 100, offset: number = 0): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  searchFoods(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search?q=${query}`);
  }
}
