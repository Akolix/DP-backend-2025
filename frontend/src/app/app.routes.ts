import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component')
      .then(m => m.FoodSearchComponent)
  },
  {
    path: 'daily-log',
    loadComponent: () => import('./features/daily-log.component/daily-log.component')
      .then(m => m.DailyLogComponent)
  }
];
