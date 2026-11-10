import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Panel } from 'primeng/panel';
import { CORE_EDITOR_CONFIG, CORE_FORM_TEMPLATES, CORE_LIBRARY_CONFIGS } from '../../config/types';
import { LocalFormStoreService } from '../../persistence/local-form-store.service';
import { CORE_FORM_STORE } from '../../persistence/types';
import { PanelHeader } from '../../shared/panel-header';
import { CORE_STYLES_CONFIG } from '../styling-panel/types';

@Component({
  selector: 'core-settings-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelHeader, Panel],
  template: `
    <core-panel-header
      header="Builder settings"
      subHeader="Configured by the application that hosts this builder"
    />
    <div class="panel-content flex flex-col gap-6 text-sm wrap-anywhere">
      <section aria-label="General settings">
        <h3 class="mb-2 font-medium">General</h3>
        <dl class="flex flex-col gap-3">
          <div>
            <dt class="text-muted-color">Storage namespace</dt>
            <dd>{{ editor.editorType }}</dd>
          </div>
          <div>
            <dt class="text-muted-color">Autosave</dt>
            <dd>{{ editor.autoSave === false ? 'Disabled' : 'Enabled' }}</dd>
          </div>
          <div>
            <dt class="text-muted-color">Autosave delay</dt>
            <dd>
              {{ editor.autoSaveDelay ?? 3000 }} ms{{
                editor.autoSave === false ? ' (inactive)' : ''
              }}
            </dd>
          </div>
          <div>
            <dt class="text-muted-color">Storage</dt>
            <dd>{{ storageLabel }}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Registered libraries">
        <h3 class="mb-2 font-medium">UI libraries</h3>
        <ul class="flex flex-col gap-2">
          @for (library of libraries; track library.id) {
            <li>
              {{ library.label }} <span class="text-muted-color">({{ library.id }})</span>
              @if (library.hidden) {
                <p class="text-muted-color">Available for saved forms only</p>
              }
            </li>
          }
        </ul>
      </section>

      <section aria-label="Configured templates">
        <h3 class="mb-2 font-medium">Templates</h3>
        <p class="mb-2 text-muted-color">
          {{ sharedTemplates !== null ? 'Shared across UI libraries' : 'Provided by UI libraries' }}
        </p>
        <ul class="flex flex-col gap-1">
          @for (template of templates; track $index) {
            <li>{{ template.name }}</li>
          } @empty {
            <li>No templates configured.</li>
          }
        </ul>
      </section>

      <section aria-label="Styling configuration">
        <h3 class="mb-2 font-medium">Styling · {{ styles.label ?? 'Custom styles' }}</h3>
        <p class="mb-3 text-muted-color">
          These choices add CSS classes. The host application's styles determine their appearance
          and dimensions. Labels describe the configured scale; pixel sizes also depend on the root
          font size.
        </p>
        <h4 class="mb-2 font-medium">Breakpoints</h4>
        <dl class="mb-4 flex flex-col gap-2">
          @for (breakpoint of styles.breakpoints; track breakpoint.value) {
            <div>
              <dt>{{ breakpoint.name }}{{ breakpoint.value ? ' · ' + breakpoint.value : '' }}</dt>
              <dd class="text-muted-color">{{ breakpoint.description }}</dd>
            </div>
          } @empty {
            <p>No breakpoints configured.</p>
          }
        </dl>
        @for (group of styleGroups; track group.label) {
          <h4 class="mt-4 mb-2 font-medium">{{ group.label }}</h4>
          @for (category of group.categories; track $index) {
            <p-panel
              [header]="category.name"
              [toggleable]="true"
              [collapsed]="true"
            >
              @for (option of category.options; track $index) {
                <div class="mb-3">
                  <h5 class="font-medium">{{ option.name }}</h5>
                  @if (option.description) {
                    <p class="mb-1 text-muted-color">{{ option.description }}</p>
                  }
                  <p class="text-muted-color">
                    Class prefix: {{ option.value ?? '(none)' }} ·
                    {{ option.hasBreakpoints ? 'Responsive' : 'All devices' }}
                  </p>
                  <ul class="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    @for (variant of option.variants; track variant) {
                      <li>
                        {{ option.variantLabels?.[variant] ?? variant }}
                        @if (
                          option.variantLabels?.[variant] &&
                          option.variantLabels[variant] !== variant
                        ) {
                          <span class="text-muted-color">[{{ variant }}]</span>
                        }
                      </li>
                    } @empty {
                      <li>No choices configured.</li>
                    }
                  </ul>
                </div>
              } @empty {
                <p>No options configured.</p>
              }
            </p-panel>
          } @empty {
            <p class="text-muted-color">No styling categories configured.</p>
          }
        }
      </section>

      <section
        aria-label="Builder integration documentation"
        class="pb-4"
      >
        <h3 class="mb-2 font-medium">Configure your builder</h3>
        <p class="mb-3 text-muted-color">
          Settings are supplied at initialization. Changes belong in your application's builder
          configuration.
        </p>
        <ul class="flex flex-col gap-2">
          <li>
            <a
              class="text-primary underline underline-offset-4"
              href="https://docs.formlystudio.com/developers/builder-configuration/"
              target="_blank"
              rel="noopener noreferrer"
              >Builder configuration</a
            >
          </li>
          <li>
            <a
              class="text-primary underline underline-offset-4"
              href="https://docs.formlystudio.com/developers/embed-in-angular/"
              target="_blank"
              rel="noopener noreferrer"
              >Embed in Angular</a
            >
          </li>
        </ul>
      </section>
    </div>
  `,
})
export class SettingsPanel {
  protected readonly editor = inject(CORE_EDITOR_CONFIG);
  protected readonly libraries = inject(CORE_LIBRARY_CONFIGS);
  protected readonly styles = inject(CORE_STYLES_CONFIG);
  protected readonly sharedTemplates = inject(CORE_FORM_TEMPLATES, { optional: true });
  protected readonly templates =
    this.sharedTemplates ??
    this.libraries
      .filter((library) => !library.hidden)
      .flatMap((library) => library.formTemplates ?? []);
  protected readonly storageLabel =
    inject(CORE_FORM_STORE) instanceof LocalFormStoreService
      ? 'Browser local storage'
      : 'Custom storage';
  protected readonly styleGroups = [
    { label: 'Self', categories: this.styles.className },
    { label: 'Children', categories: this.styles.fieldGroupClassName },
  ];
}
