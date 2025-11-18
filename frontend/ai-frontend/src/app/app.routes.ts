import { Routes } from '@angular/router';
import { SalesDashboardComponent } from './features/sales-dashboard';
import { AiChatComponent } from './features/ai-chat/ai-chat';

export const routes: Routes = [
  { path: 'dashboard', component: SalesDashboardComponent },
  { path: 'sales', component: SalesDashboardComponent },
  { path: 'ai', component: AiChatComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
