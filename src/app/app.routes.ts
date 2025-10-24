import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/loading/loading').then(m => m.LoadingComponent)
  },
  {
    path: 'intro',
    loadComponent: () => import('./components/intro/intro').then(m => m.IntroComponent)
  },
  {
    path: 'main',
    loadComponent: () => import('./components/main/main').then(m => m.MainComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
