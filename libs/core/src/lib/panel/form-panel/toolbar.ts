import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';
import { SelectButton } from 'primeng/selectbutton';
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
  imports: [
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    FormsModule,
    Tooltip,
    FormTitle,
    SelectButton,
    ButtonGroup,
  ],
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
        <p-selectbutton
          optionLabel="label"
          optionValue="value"
          allowEmpty="false"
          [options]="displayModeOptions"
          [ngModel]="activeFormDisplayMode()"
          (ngModelChange)="setActiveFormDisplayMode($event)"
        />
        <div class="flex items-center gap-2 lg:gap-4">
          <div>
            <p-buttongroup>
              <button
                pButton
                severity="secondary"
                aria-label="Open preview"
                coreTooltip="Open preview"
                tooltipPosition="top"
                (click)="openPreviewDialog()"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  fullscreen
                </i>
              </button>
              <button
                pButton
                severity="secondary"
                aria-label="Clear Model"
                coreTooltip="Clear Model"
                tooltipPosition="top"
                (click)="clearModel()"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  restart_alt
                </i>
              </button>
            </p-buttongroup>
          </div>
          <div>
            <p-buttongroup>
              <button
                pButton
                severity="secondary"
                aria-label="Export Form"
                coreTooltip="Export Form"
                tooltipPosition="top"
                (click)="openExportDialog()"
              >
                <i
                  pButtonIcon
                  class="material-symbols-outlined"
                >
                  download
                </i>
              </button>
              <button
                pButton
                aria-label="Save Form"
                coreTooltip="Save Form"
                tooltipPosition="top"
                [disabled]="saveStatus() === 'saving'"
                [severity]="saveStatus() !== 'saved' ? 'primary' : 'secondary'"
                (click)="saveActiveForm()"
              >
                <i class="material-symbols-outlined"> save </i>
                <span pButtonLabel>{{ saveButtonLabel() }}</span>
              </button>
            </p-buttongroup>
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
  displayModeOptions = [
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
