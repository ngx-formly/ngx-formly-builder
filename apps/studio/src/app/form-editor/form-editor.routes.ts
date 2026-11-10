import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { provideFormEditor } from './form-editor.provider';

export const formEditorRoutes: Routes = [
  {
    path: '',
    providers: [provideFormEditor()],
    title: 'Form Editor | ngx-formly Builder',
    loadComponent: () => import('./form-editor').then((m) => m.FormEditorApp),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ({ queryParams, fragment }) =>
          inject(Router).createUrlTree(['/workspaces/forms'], {
            queryParams,
            fragment: fragment ?? undefined,
          }),
      },
      { path: 'forms', data: { panel: 'forms', workspaceTab: 'forms' }, children: [] },
      { path: 'validations', data: { panel: 'forms', workspaceTab: 'validations' }, children: [] },
      { path: 'forms/:formId/fields', data: { panel: 'fields' }, children: [] },
      {
        path: 'forms/:formId/field',
        data: { panel: 'add-field', addFieldTab: 'fields' },
        children: [],
      },
      {
        path: 'forms/:formId/preset',
        data: { panel: 'add-field', addFieldTab: 'presets' },
        children: [],
      },
      ...['fields', 'field', 'preset'].map((panel): Routes[number] => ({
        path: `:workspaceId/${panel}`,
        pathMatch: 'full',
        redirectTo: ({ params, queryParams, fragment }) =>
          inject(Router).createUrlTree(['/workspaces', 'forms', params['workspaceId'], panel], {
            queryParams,
            fragment: fragment ?? undefined,
          }),
      })),
    ],
  },
];
