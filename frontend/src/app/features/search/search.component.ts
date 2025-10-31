import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodApiService } from '../../services/food-api.service';
import { TrackerService } from '../../services/tracker.service';
import { Food } from '../../models/food.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class FoodSearchComponent implements OnInit, OnDestroy {
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
  private destroy$ = new Subject<void>();
  private lastSearchTime = 0;
  private searchCooldown = 500;

  constructor(
    private foodApi: FoodApiService,
    private tracker: TrackerService
  ) {}

  ngOnInit() {
    // Setup debounced search for auto-complete
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(query => {
      if (query.length >= 2) {
        this.performSearch(query, 'debounce');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput() {
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      this.currentFood = null;
      this.showingBarcodeResult = false;
      return;
    }

    // Only emit to debounced search - don't search immediately
    this.searchSubject.next(this.searchQuery);
  }

  handleSearch() {
    if (!this.searchQuery.trim()) return;

    this.searchAttempted = true;
    this.lastSearchQuery = this.searchQuery;

    // Perform immediate search (cancels debounced search)
    this.performSearch(this.searchQuery, 'manual');
  }

  private performSearch(query: string, source: 'manual' | 'debounce') {
    const now = Date.now();

    // Prevent duplicate searches within cooldown period
    if (now - this.lastSearchTime < this.searchCooldown) {
      console.log('Search cooldown active, skipping duplicate search');
      return;
    }

    this.lastSearchTime = now;

    // Check if it looks like a barcode
    const isBarcode = /^\d+$/.test(query);

    if (isBarcode && query.length >= 8) {
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
