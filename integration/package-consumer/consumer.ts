import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  FormlyBuilder,
  CoreFormService,
  createLibrary,
  provideFormlyBuilder,
  tailwindConfig,
  type StylesConfig,
  BuilderEngineService,
  createEmptyWorkspaceHierarchy,
  type FormStoreService,
} from '@ngx-formly/builder';

// A future extension library supplies custom fields; the barebones package must not export them.
// @ts-expect-error Extra runtime fields are outside the builder's public API.
type ExtraMaterialField = typeof import('@ngx-formly/builder').withTabsType;
// @ts-expect-error Extra editor integrations are outside the builder's public API.
type ExtraMaterialEditor = typeof import('@ngx-formly/builder').withTabsTypeBuilder;

export const consumerLibrary = createLibrary({
  id: 'consumer-extension',
  label: 'Consumer extension',
  fieldCategoryOptions: [],
  formTemplates: [],
  configOptions: [],
  builderConfigOptions: [],
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
