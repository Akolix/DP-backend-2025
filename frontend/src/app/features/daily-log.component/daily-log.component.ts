import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../services/tracker.service';
import { FoodLog, DailySummary } from '../../models/food.model';

@Component({
  selector: 'app-daily-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './daily-log.component.html',
  styleUrls: ['./daily-log.component.css']
})
export class DailyLogComponent implements OnInit {
  summary: DailySummary | null = null;
  currentDate = new Date();

  constructor(private trackerService: TrackerService) {}

  ngOnInit() {
    this.loadDailyLog();

    // Subscribe to updates
    this.trackerService.summary$.subscribe(summary => {
      this.summary = summary;
    });
  }

  loadDailyLog() {
    this.trackerService.getDailySummary().subscribe();
  }

  getMealItems(mealType: string): FoodLog[] {
    if (!this.summary || !this.summary.summary.meals) return [];
    return this.summary.summary.meals[mealType] || [];
  }

  getMealTotals(mealType: string): { calories: number; protein: number } | null {
    const items = this.getMealItems(mealType);
    if (items.length === 0) return null;

    const totals = items.reduce((acc, item) => ({
      calories: acc.calories + (item.energy_kcal || 0),
      protein: acc.protein + (item.protein || 0)
    }), { calories: 0, protein: 0 });

    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10
    };
  }

  getProgressColor(progress: string): string {
    const value = parseFloat(progress);
    if (value < 50) return '#4CAF50';
    if (value < 80) return '#FFC107';
    if (value < 100) return '#FF9800';
    return '#F44336';
  }

  deleteItem(item: FoodLog) {
    if (!confirm(`Remove "${item.product_name}" from your log?`)) return;

    this.trackerService.deleteLoggedFood(item.id).subscribe({
      next: () => {
        console.log('Item deleted successfully');
      },
      error: (err) => {
        alert('Failed to delete item');
        console.error(err);
      }
    });
  }
}
