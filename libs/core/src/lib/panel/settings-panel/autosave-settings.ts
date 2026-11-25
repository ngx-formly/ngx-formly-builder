import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CoreFormService } from '../../editor/core-form.service';

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
      @if (state() === 'failed') {
        <p
          role="alert"
          class="text-red-700 dark:text-red-300"
        >
          Settings could not be saved.
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
      </div>
      <p role="status">{{ state() === 'saved' ? 'Settings updated.' : '' }}</p>
    </form>
  `,
})
export class AutosaveSettings {
  protected readonly forms = inject(CoreFormService);
  protected readonly autoSave = linkedSignal(() => this.forms.settings().autoSave);
  protected readonly autoSaveDelay = linkedSignal<number | null>(
    () => this.forms.settings().autoSaveDelay,
  );
  protected readonly state = signal<'idle' | 'saving' | 'saved' | 'failed'>('idle');

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
      error: () => this.state.set('failed'),
    });
  }
}
