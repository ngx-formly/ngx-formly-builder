import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'ngx-formly Builder | Visual Angular Form Builder',
    loadComponent: () => import('./home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'workspaces',
    loadChildren: () =>
      import('./form-editor/form-editor.routes').then((module) => module.formEditorRoutes),
  },
  {
    path: 'form-editor',
    pathMatch: 'full',
    redirectTo: ({ queryParams, fragment }) =>
      inject(Router).createUrlTree(['/workspaces/forms'], {
        queryParams,
        fragment: fragment ?? undefined,
      }),
  },
  {
    path: '**',
    redirectTo: ({ queryParams, fragment }) =>
      inject(Router).createUrlTree(['/workspaces/forms'], {
        queryParams,
        fragment: fragment ?? undefined,
      }),
  },
];
