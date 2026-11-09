import { Routes } from '@angular/router';
import { provideFormEditor } from './form-editor.provider';

export const formEditorRoutes: Routes = [
  {
    path: '',
    providers: [provideFormEditor()],
    title: 'Form Editor | ngx-formly Builder',
    loadComponent: () => import('./form-editor').then((m) => m.FormEditorApp),
    children: [
      { path: '', pathMatch: 'full', data: { panel: 'forms' }, children: [] },
      { path: ':workspaceId/fields', data: { panel: 'fields' }, children: [] },
      {
        path: ':workspaceId/field',
        data: { panel: 'add-field', addFieldTab: 'fields' },
        children: [],
      },
      {
        path: ':workspaceId/preset',
        data: { panel: 'add-field', addFieldTab: 'presets' },
        children: [],
      },
    ],
  },
];
