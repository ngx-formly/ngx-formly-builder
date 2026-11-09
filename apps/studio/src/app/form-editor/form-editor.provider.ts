import { EnvironmentProviders } from '@angular/core';
import { provideFormlyBuilder } from '@ngx-formly/builder';
import { bootstrapFormEditorConfig } from './bootstrap/bootstrap.library';
import { ngZorroFormEditorConfig } from './ng-zorro/ng-zorro.library';
import { materialFormEditorConfig } from './material/material.library';
import { formTemplates } from './form-templates';

export function provideFormEditor(): EnvironmentProviders {
  return provideFormlyBuilder({
    formTemplates,
    libraries: [
      materialFormEditorConfig,
      // Preserve the Studio Material storage ID for existing forms and presets.
      {
        ...materialFormEditorConfig,
        id: 'form-studio-material',
        hidden: true,
      },
      ngZorroFormEditorConfig,
      bootstrapFormEditorConfig,
    ],
  });
}
