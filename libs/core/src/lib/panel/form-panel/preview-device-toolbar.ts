import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Tooltip } from '../../shared';
import { PreviewDevicePreset, PreviewViewportService } from './preview-viewport.service';

@Component({
  selector: 'core-preview-device-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Tooltip],
  host: {
    class:
      'flex flex-wrap items-center justify-center min-h-(--sub-panel-header-height) shrink-0 gap-2',
  },
  template: `
    <div
      class="core-segmented max-xl:hidden @max-[49rem]/form-toolbar:hidden"
      role="group"
      aria-label="Preview device width"
    >
      @for (option of presetOptions; track option.value) {
        <button
          coreButton
          text
          type="button"
          [attr.aria-pressed]="viewport.preset() === option.value"
          (click)="selectPreset(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
    <select
      coreInput
      class="cursor-pointer xl:@min-[49rem]/form-toolbar:hidden pointer-coarse:min-h-11"
      aria-label="Preview device width"
      [ngModel]="viewport.preset()"
      (ngModelChange)="selectPreset($event)"
    >
      @for (option of presetOptions; track option.value) {
        <option [value]="option.value">{{ option.label }}</option>
      }
    </select>
    @if (viewport.preset() === 'custom') {
      <span class="inline-flex items-center gap-1">
        <input
          coreInput
          type="number"
          aria-label="Custom width"
          id="preview-custom-width"
          class="w-24"
          [min]="240"
          [max]="3840"
          [ngModel]="customWidthDraft()"
          (ngModelChange)="customWidthDraft.set($event)"
          (keydown.enter)="confirmCustomWidth()"
        />
        <button
          coreButton
          text
          rounded
          aria-label="Confirm width"
          coreTooltip="Confirm width"
          tooltipPosition="above"
          [disabled]="!isCustomWidthValid()"
          (click)="confirmCustomWidth()"
        >
          <i
            coreButtonIcon
            class="material-symbols-outlined"
          >
            check
          </i>
        </button>
      </span>
    }
    <span
      class="text-sm whitespace-nowrap text-muted-color"
      aria-live="polite"
    >
      @if (viewport.targetWidth(); as width) {
        {{ width }}px ·
      }
      {{ scalePercent() }}%
    </span>
  `,
})
export class PreviewDeviceToolbar {
  readonly scale = input.required<number>();

  protected readonly viewport = inject(PreviewViewportService);
  protected readonly scalePercent = computed(() => Math.round(this.scale() * 100));
  protected readonly customWidthDraft = signal<number | null>(this.viewport.customWidth());
  protected readonly isCustomWidthValid = computed(() => {
    const width = this.customWidthDraft();
    return width !== null && Number.isFinite(width) && width >= 240 && width <= 3840;
  });
  protected readonly presetOptions: { label: string; value: PreviewDevicePreset }[] = [
    { label: 'Auto', value: 'auto' },
    { label: 'SM', value: 'sm' },
    { label: 'MD', value: 'md' },
    { label: 'LG', value: 'lg' },
    { label: 'XL', value: 'xl' },
    { label: 'Custom', value: 'custom' },
  ];

  protected selectPreset(preset: PreviewDevicePreset): void {
    this.viewport.selectPreset(preset);
    if (preset === 'custom') {
      this.resetCustomWidthDraft();
    }
  }

  protected resetCustomWidthDraft(): void {
    this.customWidthDraft.set(this.viewport.customWidth());
  }

  protected confirmCustomWidth(): void {
    const width = this.customWidthDraft();
    if (width !== null && this.isCustomWidthValid()) {
      this.viewport.setCustomWidth(width);
    }
  }
}
