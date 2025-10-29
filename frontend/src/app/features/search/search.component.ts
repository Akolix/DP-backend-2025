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
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
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

  constructor(
    private foodApi: FoodApiService,
    private tracker: TrackerService
  ) {
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
    // Just clear results when input is too short, no automatic searching
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      this.currentFood = null;
      this.showingBarcodeResult = false;
    }
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
