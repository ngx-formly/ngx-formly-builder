import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  FormlyBuilder,
  CoreFormService,
  createLibrary,
  primengPreset,
  provideFormlyBuilder,
  tailwindConfig,
  type StylesConfig,
} from '@ngx-formly/builder';
import { withMarkdownType, withTabsType } from '@ngx-formly/builder-material-fields';
import { withTabsTypeBuilder } from '@ngx-formly/builder-material';
import {
  BuilderEngineService,
  createEmptyWorkspaceHierarchy,
  type FormStoreService,
} from '@ngx-formly/builder-state';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

export const consumerLibrary = createLibrary({
  id: 'consumer-material',
  label: 'Consumer Material',
  fieldCategoryOptions: [],
  formTemplates: [],
  configOptions: [withMarkdownType(), withTabsType()],
  builderConfigOptions: [withTabsTypeBuilder()],
});

export const consumerStyles: StylesConfig = {
  ...tailwindConfig,
  label: 'Consumer styles',
  className: [
    {
      name: 'Size',
      options: [
        {
          name: 'Width',
          value: 'w',
          variants: ['48', 'auto'],
          variantLabels: { '48': 'Comfortable · 12rem' },
          description: 'Uses the default Tailwind spacing scale.',
          hasBreakpoints: true,
        },
      ],
    },
  ],
};

export const consumerProviders = [
  providePrimeNG({
    theme: {
      preset: definePreset(Aura, primengPreset),
      options: {
        darkModeSelector: '.dark',
        cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
      },
    },
  }),
  provideFormlyBuilder({
    libraries: [consumerLibrary],
    editorType: 'consumer-form-editor',
    styles: consumerStyles,
    showSettings: !new URLSearchParams(location.search).has('hide-settings'),
    autoSaveDelay: 500,
  }),
];

export const editorComponent = FormlyBuilder;
export const emptyWorkspace = createEmptyWorkspaceHierarchy('consumer-workspace');
export type ConsumerFormStore = FormStoreService;

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyBuilder],
  template: `<formly-builder class="block h-full" />`,
})
class ConsumerApp {
  constructor() {
    if (inject(BuilderEngineService) !== inject(CoreFormService)) {
      throw new Error('The shell must share its headless engine');
    }
  }
}

bootstrapApplication(ConsumerApp, { providers: consumerProviders }).catch(console.error);
