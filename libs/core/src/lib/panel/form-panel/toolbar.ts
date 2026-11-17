import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CoreFormService } from '../../editor/core-form.service';
import { CoreLibraryService } from '../../config/core-library.service';
import { ExportDialogService } from './export-dialog.service';
import { PreviewDialogService } from './preview-dialog.service';
import { FormDisplayMode } from '../../editor/types';
import { Tooltip } from '../../shared';
import { FormTitle } from './form-title';

@Component({
  selector: 'core-form-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Tooltip, FormTitle],
  host: {
    class: 'flex min-h-(--panel-header-height) items-start px-4 py-2 md:items-center',
  },
  template: `
    <div
      class="flex min-w-0 grow flex-col gap-x-4 gap-y-2 md:flex-row md:flex-wrap md:items-center md:justify-between"
    >
      <div class="min-w-0">
        @if (!hideFormTitle()) {
          <core-form-title />
        }
        <span class="flex items-center gap-1.5 text-sm text-muted-color">
          <span>{{ activeLibraryLabel() }}</span>
          <span>&bull;</span>
          <span>{{ activeFieldCount() }} Field{{ activeFieldCount() === 1 ? '' : 's' }}</span>
        </span>
      </div>
      <ng-content />
      <div class="flex min-w-0 flex-wrap items-center gap-2 md:ml-auto md:justify-end md:gap-4">
        <div
          class="core-segmented"
          role="group"
        >
          @for (option of displayModeOptions; track option.value) {
            <button
              coreButton
              text
              type="button"
              [attr.aria-pressed]="activeFormDisplayMode() === option.value"
              (click)="setActiveFormDisplayMode(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
        <div class="flex items-center gap-2 lg:gap-4">
          <div>
            <div role="group">
              <button
                coreButton
                severity="secondary"
                aria-label="Open preview"
                coreTooltip="Open preview"
                tooltipPosition="above"
                (click)="openPreviewDialog()"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  fullscreen
                </i>
              </button>
              <button
                coreButton
                severity="secondary"
                aria-label="Clear Model"
                coreTooltip="Clear Model"
                tooltipPosition="above"
                (click)="clearModel()"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  restart_alt
                </i>
              </button>
            </div>
          </div>
          <div>
            <div role="group">
              <button
                coreButton
                severity="secondary"
                aria-label="Export Form"
                coreTooltip="Export Form"
                tooltipPosition="above"
                (click)="openExportDialog()"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  download
                </i>
              </button>
              <button
                coreButton
                aria-label="Save Form"
                coreTooltip="Save Form"
                tooltipPosition="above"
                [disabled]="saveStatus() === 'saving'"
                [attr.severity]="saveStatus() !== 'saved' ? 'primary' : 'secondary'"
                (click)="saveActiveForm()"
              >
                <i class="material-symbols-outlined"> save </i>
                <span coreButtonLabel>{{ saveButtonLabel() }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FormToolbarComponent {
  protected formService = inject(CoreFormService);
  protected libraryService = inject(CoreLibraryService);
  private readonly previewDialogService = inject(PreviewDialogService);
  private readonly exportDialogService = inject(ExportDialogService);

  readonly hideFormTitle = input(false);

  activeFormDisplayMode = this.formService.activeFormDisplayMode;
  activeFieldCount = this.formService.activeFieldCount;
  saveStatus = this.formService.saveStatus;
  activeLibraryLabel = this.libraryService.activeLibraryLabel;
  displayModeOptions: { label: string; value: FormDisplayMode }[] = [
    { label: 'Builder', value: 'form' },
    { label: 'Preview', value: 'preview' },
    { label: 'JSON', value: 'json' },
  ];

  protected cachedDisplayMode: FormDisplayMode = this.formService.activeFormDisplayMode();
  private wasPreviewDialogOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.previewDialogService.isOpen();
      if (this.wasPreviewDialogOpen && !isOpen) {
        this.restoreDisplayMode();
      }
      this.wasPreviewDialogOpen = isOpen;
    });
  }

  saveButtonLabel = () => {
    switch (this.saveStatus()) {
      case 'dirty':
        return 'Save*';
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Retry save';
      default:
        return 'Save';
    }
  };

  saveActiveForm() {
    this.formService.saveActiveForm();
  }

  clearModel() {
    this.formService.setActiveModel({});
  }

  openPreviewDialog() {
    this.cachedDisplayMode = this.formService.activeFormDisplayMode();
    this.setActiveFormDisplayMode('preview');
    this.previewDialogService.open();
  }

  restoreDisplayMode() {
    this.formService.setActiveFormDisplayMode(this.cachedDisplayMode);
  }

  setActiveFormDisplayMode(mode: FormDisplayMode) {
    if (this.formService.activeFormDisplayMode() === mode) {
      return;
    }

    this.formService.setActiveFormDisplayMode(mode);
  }

  openExportDialog() {
    this.exportDialogService.open();
  }
}
