import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../services/tracker.service';
import { DailySummary } from '../../models/food.model';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
