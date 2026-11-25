import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuilderSettings, isBuilderSettings } from '@ngx-formly/builder';
import saveAs from 'file-saver';
import { from, Observable, switchMap } from 'rxjs';
import { CORE_EDITOR_CONFIG } from '../../config/types';
import { CoreFormService } from '../../editor/core-form.service';

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
  imports: [FormsModule],
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
      aria-label="Autosave settings"
      (input)="clearSaved()"
      (ngSubmit)="save()"
    >
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          name="autoSave"
          class="size-4 accent-primary"
          [disabled]="state() === 'saving'"
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
          [disabled]="state() === 'saving' || !autoSave()"
          [(ngModel)]="autoSaveDelay"
        />
      </label>
      @if (state() === 'failed' || state() === 'invalid-file') {
        <p
          role="alert"
          class="text-red-700 dark:text-red-300"
        >
          {{
            state() === 'failed'
              ? 'Settings could not be saved.'
              : 'The file is not valid builder settings.'
          }}
        </p>
      }
      <div class="flex flex-wrap gap-2">
        <button
          coreButton
          type="submit"
          [disabled]="state() === 'saving'"
        >
          Save settings
        </button>
        <button
          coreButton
          severity="secondary"
          type="button"
          [disabled]="state() === 'saving'"
          (click)="reset()"
        >
          Reset to host defaults
        </button>
        <button
          coreButton
          severity="secondary"
          type="button"
          (click)="exportSettings()"
        >
          Export settings
        </button>
        <button
          coreButton
          severity="secondary"
          type="button"
          [disabled]="state() === 'saving'"
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
      <p role="status">{{ state() === 'saved' ? 'Settings updated.' : '' }}</p>
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
  protected readonly state = signal<'idle' | 'saving' | 'saved' | 'failed' | 'invalid-file'>(
    'idle',
  );

  protected save(): void {
    const autoSave = this.autoSave();
    // Without autosave the delay input is disabled and skips native validation.
    const delay = autoSave ? this.autoSaveDelay() : null;

    this.run(
      this.forms.updateSettings$({
        autoSave,
        autoSaveDelay: delay ?? this.forms.settings().autoSaveDelay,
      }),
    );
  }

  protected reset(): void {
    this.run(this.forms.resetSettings$());
  }

  protected exportSettings(): void {
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
      from(readSettings(file)).pipe(switchMap((settings) => this.forms.updateSettings$(settings))),
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
    if (this.state() === 'saving') {
      return;
    }

    this.state.set('saving');

    $operation.subscribe({
      next: () => this.state.set('saved'),
      error: (error) => this.state.set(error === INVALID_FILE ? 'invalid-file' : 'failed'),
    });
  }
}
