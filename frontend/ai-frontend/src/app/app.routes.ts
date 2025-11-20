import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/guards/auth.guard';

import { SalesDashboardComponent } from './features/sales-dashboard';
import { SalesPage } from './features/sales-page/sales-page';
import { ImportCsvComponent } from './features/import-csv/import-csv';
import { AiChatComponent } from './features/ai-chat/ai-chat';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: SalesDashboardComponent },
      { path: 'sales', component: SalesPage },
      { path: 'import', component: ImportCsvComponent },
      { path: 'ai-chat', component: AiChatComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ],
  },

  { path: '**', redirectTo: 'dashboard' }
];
