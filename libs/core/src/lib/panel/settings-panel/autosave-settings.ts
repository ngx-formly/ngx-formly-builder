import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuilderSettings, isBuilderSettings, StyleValueList } from '@ngx-formly/builder';
import saveAs from 'file-saver';
import { defer, Observable, switchMap } from 'rxjs';
import { CORE_EDITOR_CONFIG } from '../../config/types';
import { CoreFormService } from '../../editor/core-form.service';
import { cleanStyleValues, defaultStyleValues } from '../styling-panel/style-values';
import { StyleValuesSettings } from './style-values-settings';

const INVALID_FILE = new Error('Invalid builder settings file.');

async function readSettings(file: File): Promise<BuilderSettings> {
  let value: unknown;
  try {
    value = JSON.parse(await file.text());
  } catch {
    throw INVALID_FILE;
  }

  if (!isBuilderSettings(value)) {
    throw INVALID_FILE;
  }

  return value;
}

@Component({
  selector: 'core-autosave-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, StyleValuesSettings],
  template: `
    @if (forms.settingsLoadError()) {
      <div
        role="alert"
        class="mb-3"
      >
        <p>{{ forms.settingsLoadError() }}</p>
        <button
          coreButton
          text
          type="button"
          [disabled]="busy()"
          (click)="forms.loadSettings()"
        >
          Try again
        </button>
      </div>
    }
    @if (!forms.settingsStorageAvailable) {
      <p class="mb-3 text-muted-color">
        Changes apply to this session only; the configured storage does not save settings.
      </p>
    }
    <form
      ngNativeValidate
      class="flex flex-col gap-3"
      aria-label="Editable settings"
      (input)="clearSaved()"
      (ngSubmit)="save()"
    >
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          name="autoSave"
          class="size-4 accent-primary"
          [disabled]="busy()"
          [(ngModel)]="autoSave"
        />
        Autosave
      </label>
      <label class="flex flex-col gap-1">
        Autosave delay (ms)
        <input
          coreInput
          type="number"
          name="autoSaveDelay"
          required
          min="0"
          max="2147483647"
          [disabled]="busy() || !autoSave()"
          [(ngModel)]="autoSaveDelay"
        />
      </label>
      <core-style-values-settings
        [disabled]="busy()"
        [(values)]="styleValues"
        (valuesChange)="clearSaved()"
      />
      @if (state() === 'failed' || state() === 'invalid-file' || state() === 'invalid-values') {
        <p
          role="alert"
          class="text-red-700 dark:text-red-300"
        >
          @switch (state()) {
            @case ('failed') {
              Settings could not be saved.
            }
            @case ('invalid-file') {
              The file is not valid builder settings.
            }
            @default {
              {{ valuesProblem() }}
            }
          }
        </p>
      }
      <div class="flex flex-wrap gap-2">
        <button
          coreButton
          type="submit"
          [disabled]="busy()"
        >
          Save settings
        </button>
        <button
          coreButton
          severity="secondary"
          type="button"
          [disabled]="busy()"
          (click)="reset()"
        >
          Reset to host defaults
        </button>
        <button
          coreButton
          severity="secondary"
          type="button"
          [disabled]="forms.settingsLoading()"
          (click)="exportSettings()"
        >
          Export settings
        </button>
        <button
          coreButton
          severity="secondary"
          type="button"
          [disabled]="busy()"
          (click)="fileSelect.click()"
        >
          Import settings
        </button>
        <input
          #fileSelect
          class="hidden"
          type="file"
          accept="application/json,.json"
          (change)="importSettings(fileSelect)"
        />
      </div>
      <p role="status">
        @if (forms.settingsLoading()) {
          Loading saved settings…
        } @else if (state() === 'saved') {
          Settings updated.
        }
      </p>
    </form>
  `,
})
export class AutosaveSettings {
  protected readonly forms = inject(CoreFormService);
  private readonly editorConfig = inject(CORE_EDITOR_CONFIG);
  protected readonly autoSave = linkedSignal(() => this.forms.settings().autoSave);
  protected readonly autoSaveDelay = linkedSignal<number | null>(
    () => this.forms.settings().autoSaveDelay,
  );
  private readonly effectiveStyleValues = computed(() => defaultStyleValues(this.forms.styles()));
  protected readonly styleValues = linkedSignal(() => this.effectiveStyleValues());
  protected readonly valuesProblem = signal('');
  protected readonly state = signal<
    'idle' | 'saving' | 'saved' | 'failed' | 'invalid-file' | 'invalid-values'
  >('idle');
  protected readonly busy = computed(
    () => this.forms.settingsLoading() || this.state() === 'saving',
  );

  protected save(): void {
    if (this.busy()) {
      return;
    }

    // Lists users did not change keep following the styles config, so only edited ones are checked.
    const edited = Object.fromEntries(
      Object.entries(this.styleValues()).filter(
        ([list, entries]) =>
          JSON.stringify(entries) !==
          JSON.stringify(this.effectiveStyleValues()[list as StyleValueList]),
      ),
    );
    const changed = cleanStyleValues(edited);
    if (typeof changed === 'string') {
      this.valuesProblem.set(changed);
      this.state.set('invalid-values');
      return;
    }

    const autoSave = this.autoSave();
    // Without autosave the delay input is disabled and skips native validation.
    const delay = autoSave ? this.autoSaveDelay() : null;
    const { styleValues, ...settings } = this.forms.settings();
    const saved = { ...styleValues, ...changed };

    this.run(
      this.forms.updateSettings$({
        ...settings,
        ...(Object.keys(saved).length ? { styleValues: saved } : {}),
        autoSave,
        autoSaveDelay: delay ?? settings.autoSaveDelay,
      }),
    );
  }

  protected reset(): void {
    this.run(this.forms.resetSettings$());
  }

  protected exportSettings(): void {
    if (this.forms.settingsLoading()) {
      return;
    }

    const settings = JSON.stringify(this.forms.settings(), null, 2);

    saveAs(
      new Blob([settings], { type: 'application/json' }),
      `formly-builder-settings-${this.editorConfig.editorType}.json`,
    );
  }

  protected importSettings(input: HTMLInputElement): void {
    const file = input.files?.[0];
    // Choosing the same file again must trigger another change event.
    input.value = '';
    if (!file) {
      return;
    }

    this.run(
      defer(() => readSettings(file)).pipe(
        switchMap((settings) => this.forms.updateSettings$(settings)),
      ),
    );
  }

  // A failure stays visible while editing; only the success message is cleared.
  protected clearSaved(): void {
    if (this.state() === 'saved') {
      this.state.set('idle');
    }
  }

  // Not tied to the panel's lifetime: closing it must not cancel a queued save.
  private run($operation: Observable<void>): void {
    if (this.busy()) {
      return;
    }

    this.state.set('saving');

    $operation.subscribe({
      next: () => this.state.set('saved'),
      error: (error) => this.state.set(error === INVALID_FILE ? 'invalid-file' : 'failed'),
    });
  }
}
