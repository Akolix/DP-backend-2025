import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../services/tracker.service';
import { DailySummary } from '../../models/food.model';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Calorie Tracker Dashboard</h1>

      <div *ngIf="summary" class="summary-cards">
        <div class="card calories">
          <h3>Calories</h3>
          <div class="value">{{summary.summary.totalCalories | number:'1.0-0'}}</div>
          <div class="goal">/ {{summary.goals.daily_goal}}</div>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="summary.progress.calories"></div>
          </div>
        </div>

        <div class="card protein">
          <h3>Protein</h3>
          <div class="value">{{summary.summary.totalProtein | number:'1.0-1'}}g</div>
          <div class="goal">/ {{summary.goals.protein_goal}}g</div>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="summary.progress.protein"></div>
          </div>
        </div>

        <div class="card carbs">
          <h3>Carbs</h3>
          <div class="value">{{summary.summary.totalCarbs | number:'1.0-1'}}g</div>
          <div class="goal">/ {{summary.goals.carbs_goal}}g</div>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="summary.progress.carbs"></div>
          </div>
        </div>

        <div class="card fat">
          <h3>Fat</h3>
          <div class="value">{{summary.summary.totalFat | number:'1.0-1'}}g</div>
          <div class="goal">/ {{summary.goals.fat_goal}}g</div>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="summary.progress.fat"></div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/search" class="btn btn-primary">Search Food</a>
        <a routerLink="/tracker" class="btn btn-secondary">View Today's Log</a>
        <a routerLink="/foods" class="btn btn-secondary">Browse Foods</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      color: #666;
    }

    .card .value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .card .goal {
      color: #999;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #45a049);
      transition: width 0.3s ease;
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
    }

    .btn-primary:hover {
      background: #45a049;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DailySummary | null = null;

  constructor(private trackerService: TrackerService) {}

  ngOnInit() {
    this.loadSummary();
    this.trackerService.summary$.subscribe(summary => {
      this.summary = summary;
    });
  }

  loadSummary() {
    this.trackerService.getDailySummary().subscribe();
  }
}
