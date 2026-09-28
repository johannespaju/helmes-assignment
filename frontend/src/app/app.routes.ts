import { Routes } from '@angular/router';
import { SubmissionForm } from './submission-form/submission-form';

export const routes: Routes = [
  { path: '', component: SubmissionForm },
  {
    path: 'admin',
    loadComponent: () => import('./admin-page/admin-page').then((m) => m.AdminPage),
  },
];
