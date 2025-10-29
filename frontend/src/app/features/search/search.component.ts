import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodApiService } from '../../services/food-api.service';
import { TrackerService } from '../../services/tracker.service';
import { Food } from '../../models/food.model';
import { debounceTime, Subject } from 'rxjs';

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
        (keyup.enter)="handleSearch()"
        placeholder="Enter barcode or search by name..."
        class="search-input"
        autocomplete="off">
      <button (click)="handleSearch()" class="btn btn-primary" [disabled]="!searchQuery.trim()">
        🔍 Search
      </button>
    </div>

    <div *ngIf="loading" class="loading">⏳ Searching...</div>
    <div *ngIf="error" class="error">{{error}}</div>

    <!-- Live Search Suggestions with Images -->
    <div *ngIf="searchResults.length > 0 && !currentFood && !showingBarcodeResult" class="suggestions-dropdown">
      <div class="suggestions-header">
        <h3>{{searchResults.length}} Suggestions</h3>
        <span class="hint">Click to view details</span>
      </div>
      <div class="suggestions-list">
        <div *ngFor="let food of searchResults; let i = index"
             class="suggestion-item"
             (click)="viewFoodDetails(food)">
          <div class="suggestion-number">{{i + 1}}</div>

          <!-- Product Image -->
          <div class="suggestion-image">
            <img
              *ngIf="food.image_url"
              [src]="food.image_url"
              [alt]="food.product_name"
              (error)="onImageError($event)"
              loading="lazy">
            <div *ngIf="!food.image_url" class="no-image">
              🍽️
            </div>
          </div>

          <div class="suggestion-content">
            <h4>{{food.product_name}}</h4>
            <p class="suggestion-meta">
              <span class="badge">{{food.energy_kcal || 0}} kcal</span>
              <span class="badge">{{food.protein || 0}}g protein</span>
              <span class="badge" *ngIf="food.carbohydrates">{{food.carbohydrates}}g carbs</span>
              <span class="badge" *ngIf="food.fat">{{food.fat}}g fat</span>
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 7l3 3 3-3" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Selected Food Detail with Image -->
    <div *ngIf="currentFood" class="food-detail">
      <div class="food-detail-header">
        <div class="header-content">
          <!-- Large Product Image -->
          <div class="product-image-large">
            <img
              *ngIf="currentFood.image_url"
              [src]="currentFood.image_url"
              [alt]="currentFood.product_name"
              (error)="onImageError($event)">
            <div *ngIf="!currentFood.image_url" class="no-image-large">
              🍽️
            </div>
          </div>

          <div class="header-text">
            <h2>{{currentFood.product_name}}</h2>
            <p class="barcode-info">Barcode: {{currentFood.barcode || 'N/A'}}</p>
          </div>
        </div>
        <button (click)="clearSelection()" class="btn-close" title="Close">✕</button>
      </div>

      <div class="nutrition-section">
        <h3>Nutritional Information (per 100g)</h3>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <span class="label">Calories</span>
            <span class="value">{{currentFood.energy_kcal || 0}}</span>
            <span class="unit">kcal</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Protein</span>
            <span class="value">{{currentFood.protein || 0}}</span>
            <span class="unit">g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Carbs</span>
            <span class="value">{{currentFood.carbohydrates || 0}}</span>
            <span class="unit">g</span>
          </div>
          <div class="nutrition-item">
            <span class="label">Fat</span>
            <span class="value">{{currentFood.fat || 0}}</span>
            <span class="unit">g</span>
          </div>
          <div class="nutrition-item" *ngIf="currentFood.sugars">
            <span class="label">Sugars</span>
            <span class="value">{{currentFood.sugars}}</span>
            <span class="unit">g</span>
          </div>
          <div class="nutrition-item" *ngIf="currentFood.fiber">
            <span class="label">Fiber</span>
            <span class="value">{{currentFood.fiber}}</span>
            <span class="unit">g</span>
          </div>
          <div class="nutrition-item" *ngIf="currentFood.salt">
            <span class="label">Salt</span>
            <span class="value">{{currentFood.salt}}</span>
            <span class="unit">g</span>
          </div>
        </div>
      </div>

      <!-- Add to Log Section (keep as before) -->
      <div class="log-section">
        <h3>📝 Add to Daily Log</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Serving Size (g):</label>
            <input type="number" [(ngModel)]="servingSize" min="1" class="input" placeholder="100">
            <small class="helper-text">
              = {{calculateCalories()}} kcal, {{calculateProtein()}}g protein
            </small>
          </div>
          <div class="form-group">
            <label>Meal Type:</label>
            <select [(ngModel)]="mealType" class="input">
              <option value="breakfast">🍳 Breakfast</option>
              <option value="lunch">🍽️ Lunch</option>
              <option value="dinner">🍴 Dinner</option>
              <option value="snack">🍪 Snack</option>
            </select>
          </div>
        </div>
        <button (click)="logFood()" class="btn btn-success">
          ➕ Add to My Daily Log
        </button>
      </div>
    </div>

    <!-- No results message -->
    <div *ngIf="searchAttempted && searchResults.length === 0 && !currentFood && !loading" class="no-results">
      <p>😕 No results found for "{{lastSearchQuery}}"</p>
      <p class="hint">Try searching with a barcode or different product name</p>
    </div>
  </div>
`,
  styles: [`
    .search-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    .search-box {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      position: relative;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #2196F3;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2196F3;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1976D2;
    }

    .btn-success {
      background: #4CAF50;
      color: white;
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
    }

    .btn-success:hover {
      background: #45a049;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    /* Suggestions Dropdown */
    .suggestions-dropdown {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      margin-bottom: 2rem;
      overflow: hidden;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .suggestions-header {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .suggestions-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .suggestions-header .hint {
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .suggestions-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 1px solid #f0f0f0;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item:hover {
      background: linear-gradient(90deg, #f8f9fa 0%, #e3f2fd 100%);
      padding-left: 1.75rem;
    }

    .suggestion-number {
      width: 28px;
      height: 28px;
      background: #e3f2fd;
      color: #1976D2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .suggestion-content {
      flex: 1;
    }

    .suggestion-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
    }

    .suggestion-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin: 0;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: #e3f2fd;
      color: #1976D2;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    /* Food Detail */
    .food-detail {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .food-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .food-detail-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .btn-close {
      background: #f5f5f5;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.3rem;
      color: #666;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-close:hover {
      background: #e0e0e0;
      color: #333;
      transform: rotate(90deg);
    }

    .barcode-info {
      color: #999;
      font-size: 0.9rem;
      margin: 0;
    }

    .nutrition-section h3 {
      margin: 0 0 1rem 0;
      color: #555;
      font-size: 1.1rem;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .nutrition-item {
      padding: 1.25rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      text-align: center;
      transition: all 0.2s;
    }

    .nutrition-item:hover {
      border-color: #2196F3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
    }

    .nutrition-item .label {
      display: block;
      color: #666;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .nutrition-item .value {
      display: block;
      font-size: 1.75rem;
      font-weight: bold;
      color: #333;
      line-height: 1;
    }

    .nutrition-item .unit {
      display: block;
      color: #999;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .log-section {
      background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
      padding: 1.5rem;
      border-radius: 10px;
      margin-top: 2rem;
    }

    .log-section h3 {
      margin: 0 0 1rem 0;
      color: #1976D2;
      font-size: 1.1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .input {
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
      background: white;
    }

    .input:focus {
      outline: none;
      border-color: #2196F3;
    }

    .helper-text {
      margin-top: 0.25rem;
      color: #666;
      font-size: 0.8rem;
    }

    .loading, .error, .no-results {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .loading {
      background: #E3F2FD;
      color: #1976D2;
    }

    .error {
      background: #FFEBEE;
      color: #C62828;
    }

    .no-results {
      background: #f8f9fa;
      color: #666;
      padding: 2rem;
    }

    .no-results p {
      margin: 0.5rem 0;
    }

    .no-results .hint {
      color: #999;
      font-size: 0.9rem;
    }

    /* Suggestion Images */
    .suggestion-image {
      width: 50px;
      height: 50px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .suggestion-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      font-size: 1.5rem;
      color: #ccc;
    }

    /* Large Product Image */
    .header-content {
      display: flex;
      gap: 1.5rem;
      align-items: start;
      flex: 1;
    }

    .product-image-large {
      width: 150px;
      height: 150px;
      flex-shrink: 0;
      border-radius: 12px;
      overflow: hidden;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e0e0e0;
    }

    .product-image-large img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.5rem;
    }

    .no-image-large {
      font-size: 4rem;
      color: #ccc;
    }

    .header-text {
      flex: 1;
    }

    @media (max-width: 600px) {
      .header-content {
        flex-direction: column;
      }

      .product-image-large {
        width: 100%;
        height: 200px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .nutrition-grid {
        grid-template-columns: repeat(2, 1fr);
      }
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
  searchAttempted = false;
  lastSearchQuery = '';
  showingBarcodeResult = false;

  private searchSubject = new Subject<string>();

  constructor(
    private foodApi: FoodApiService,
    private tracker: TrackerService
  ) {
    // Debounce search input for live suggestions
    this.searchSubject.pipe(
      debounceTime(600)
    ).subscribe(query => {
      this.showLiveSuggestions(query);
    });
  }

  handleSearch() {
    if (!this.searchQuery.trim()) return;

    this.searchAttempted = true;
    this.lastSearchQuery = this.searchQuery;

    // Check if it looks like a barcode
    const isBarcode = /^\d+$/.test(this.searchQuery);

    if (isBarcode && this.searchQuery.length >= 8) {
      this.searchByBarcode();
    } else {
      this.searchByName();
    }
  }

  searchByBarcode() {
    this.loading = true;
    this.error = '';
    this.currentFood = null;
    this.searchResults = [];
    this.showingBarcodeResult = true;

    this.foodApi.getFoodByBarcode(this.searchQuery).subscribe({
      next: (food) => {
        this.currentFood = food;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Product not found with that barcode';
        this.loading = false;
        this.showingBarcodeResult = false;
      }
    });
  }

  searchByName() {
    this.loading = true;
    this.error = '';
    this.currentFood = null;
    this.showingBarcodeResult = false;

    this.foodApi.searchFoods(this.searchQuery).subscribe({
      next: (results) => {
        // Handle both old and new response formats
        if (results.results) {
          this.searchResults = results.results;
        } else if (results.source === 'local') {
          this.searchResults = results.results || [];
        } else {
          this.searchResults = [...(results.local || []), ...(results.external || [])].slice(0, 30);
        }
        this.loading = false;
      },
      error: () => {
        this.searchResults = [];
        this.error = 'Error searching for products';
        this.loading = false;
      }
    });
  }

  onSearchInput() {
    // Clear previous results when typing
    if (this.searchQuery.length < 3) {
      this.searchResults = [];
      this.currentFood = null;
      this.showingBarcodeResult = false;
      return;
    }

    this.loading = true;

    // Only show live suggestions for text searches (not barcodes)
    const isBarcode = /^\d+$/.test(this.searchQuery);
    if (!isBarcode) {
      this.searchSubject.next(this.searchQuery);
    }
  }

  private showLiveSuggestions(query: string) {
    this.foodApi.searchFoods(query).subscribe({
      next: (results) => {
        // Handle the response
        if (results.results) {
          this.searchResults = results.results.slice(0, 15); // Limit to 15 suggestions
        } else if (results.source === 'local') {
          this.searchResults = results.results || [];
        } else {
          this.searchResults = [...(results.local || []), ...(results.external || [])].slice(0, 15);
        }
        this.loading = false;
      },
      error: () => {
        this.searchResults = [];
        this.loading = false;
      }
    });
  }

  viewFoodDetails(food: Food) {
    this.currentFood = food;
    this.searchResults = [];
    this.searchQuery = food.product_name;
    this.showingBarcodeResult = false;
  }

  clearSelection() {
    this.currentFood = null;
    this.searchQuery = '';
    this.searchResults = [];
    this.showingBarcodeResult = false;
  }

  calculateCalories(): number {
    if (!this.currentFood) return 0;
    return Math.round((this.currentFood.energy_kcal * this.servingSize) / 100);
  }

  onImageError(event: any) {
    // Hide broken images
    event.target.style.display = 'none';
  }

  calculateProtein(): number {
    if (!this.currentFood) return 0;
    return Math.round(((this.currentFood.protein || 0) * this.servingSize) / 100 * 10) / 10;
  }

  logFood() {
    if (!this.currentFood) return;

    const logData = {
      barcode: this.currentFood.barcode || 'unknown',
      product_name: this.currentFood.product_name,
      serving_size: this.servingSize,
      energy_kcal: this.currentFood.energy_kcal,
      protein: this.currentFood.protein,
      carbohydrates: this.currentFood.carbohydrates || 0,
      fat: this.currentFood.fat || 0,
      meal_type: this.mealType
    };

    this.loading = true;
    this.tracker.logFood(logData).subscribe({
      next: () => {
        alert(`✅ ${this.currentFood!.product_name} (${this.servingSize}g) added to ${this.mealType}!`);
        this.currentFood = null;
        this.searchQuery = '';
        this.loading = false;
      },
      error: () => {
        alert('❌ Failed to add food to log');
        this.loading = false;
      }
    });
  }
}
