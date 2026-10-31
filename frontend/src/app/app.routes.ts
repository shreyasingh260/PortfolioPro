import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup.component').then(m => m.SignupComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tradelab',
        loadComponent: () => import('./features/tradelab/tradelab.component').then(m => m.TradelabComponent)
      },
      {
        path: 'portfolio-health',
        loadComponent: () => import('./features/portfolio-health/portfolio-health.component').then(m => m.PortfolioHealthComponent)
      },
      {
        path: 'market-shock-lab',
        loadComponent: () => import('./features/market-shock-lab/market-shock-lab.component').then(m => m.MarketShockLabComponent)
      },
      {
        path: 'tradelens',
        loadComponent: () => import('./features/tradelens/tradelens.component').then(m => m.TradelensComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
