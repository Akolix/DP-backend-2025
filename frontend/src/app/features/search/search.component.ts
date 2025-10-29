import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodApiService } from '../../services/food-api.service';
import { TrackerService } from '../../services/tracker.service';
import { Food } from '../../models/food.model';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <h1>Search Food</h1>

      <div class="search-box">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          placeholder="Enter barcode or search by name..."
          class="search-input">
        <button (click)="searchByBarcode()" class="btn btn-primary">
          Search by Barcode
        </button>
      </div>

      <div *ngIf="loading" class="loading">Searching...</div>

      <div *ngIf="error" class="error">{{error}}</div>

      <div *ngIf="currentFood" class="food-detail">
        <h2>{{currentFood.product_name}}</h2>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <span class="label">Calories:</span>
            <span class="value">{{currentFood.energy_kcal}} kcal</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Protein:</span>
            <span class="value">{{currentFood.protein}}g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Carbs:</span>
            <span class="value">{{currentFood.carbohydrates}}g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Fat:</span>
            <span class="value">{{currentFood.fat}}g</span>
          </div>
        </div>

        <div class="log-section">
          <h3>Add to Log</h3>
          <div class="form-group">
            <label>Serving Size (g):</label>
            <input type="number" [(ngModel)]="servingSize" min="1" class="input">
          </div>
          <div class="form-group">
            <label>Meal Type:</label>
            <select [(ngModel)]="mealType" class="input">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <button (click)="logFood()" class="btn btn-success">Add to Log</button>
        </div>
      </div>

      <div *ngIf="searchResults.length > 0" class="search-results">
        <h3>Search Results</h3>
        <div class="results-grid">
          <div *ngFor="let food of searchResults"
               class="food-card"
               (click)="selectFood(food)">
            <h4>{{food.product_name}}</h4>
            <p>{{food.energy_kcal}} kcal | {{food.protein}}g protein</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .search-box {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #2196F3;
      color: white;
    }

    .btn-success {
      background: #4CAF50;
      color: white;
    }

    .food-detail {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .nutrition-item {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .nutrition-item .label {
      display: block;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .nutrition-item .value {
      display: block;
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
    }

    .log-section {
      border-top: 1px solid #eee;
      padding-top: 1.5rem;
      margin-top: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .input {
      width: 100%;
      max-width: 300px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .food-card {
      padding: 1rem;
      background: white;
      border-radius: 6px;
      border: 2px solid #eee;
      cursor: pointer;
      transition: all 0.2s;
    }

    .food-card:hover {
      border-color: #4CAF50;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .loading, .error {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .loading {
      background: #E3F2FD;
      color: #1976D2;
    }

    .error {
      background: #FFEBEE;
      color: #C62828;
    }
  `]
})
export class FoodSearchComponent {
  searchQuery = '';
  currentFood: Food | null = null;
  searchResults: Food[] = [];
  loading = false;
  error = '';
  servingSize = 100;
  mealType = 'lunch';

  constructor(
    private foodApi: FoodApiService,
    private tracker: TrackerService
  ) {}

  searchByBarcode() {
    if (!this.searchQuery.trim()) return;

    this.loading = true;
    this.error = '';
    this.currentFood = null;

    this.foodApi.getFoodByBarcode(this.searchQuery).subscribe({
      next: (food) => {
        this.currentFood = food;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Product not found';
        this.loading = false;
      }
    });
  }

  onSearchInput() {
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }

    this.foodApi.searchFoods(this.searchQuery).subscribe({
      next: (results) => {
        if (results.source === 'local') {
          this.searchResults = results.results;
        } else {
          this.searchResults = [...results.local, ...results.external];
        }
      },
      error: () => {
        this.searchResults = [];
      }
    });
  }

  selectFood(food: Food) {
    this.currentFood = food;
    this.searchResults = [];
  }

  logFood() {
    if (!this.currentFood) return;

    const logData = {
      barcode: this.currentFood.barcode,
      product_name: this.currentFood.product_name,
      serving_size: this.servingSize,
      energy_kcal: this.currentFood.energy_kcal,
      protein: this.currentFood.protein,
      carbohydrates: this.currentFood.carbohydrates || 0,
      fat: this.currentFood.fat || 0,
    };

    this.tracker.logFood(logData).subscribe({
      next: () => {
        alert('Food added to log!');
        this.currentFood = null;
        this.searchQuery = '';
      },
      error: () => {
        alert('Failed to add food to log');
      }
    });
  }
}
