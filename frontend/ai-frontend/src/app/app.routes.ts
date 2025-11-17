import { Routes } from '@angular/router';
import { SalesDashboardComponent } from './features/sales-dashboard';

export const routes: Routes = [
  { path: 'dashboard', component: SalesDashboardComponent },
  { path: 'sales', component: SalesDashboardComponent },
  { path: 'ai', component: SalesDashboardComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];