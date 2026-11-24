import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

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
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, Tooltip, FormTitle],
  host: {
    class: '@container/form-toolbar flex min-h-(--panel-header-height) items-center px-4 py-2',
  },
  template: `
    <div class="flex min-w-0 grow flex-wrap items-center gap-x-3 gap-y-2">
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
      <div class="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
        <div
          class="core-segmented"
          role="group"
          aria-label="Form view"
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
        <div class="hidden items-center gap-1 @min-[49rem]/form-toolbar:flex">
          @for (action of actions; track action.icon) {
            <button
              coreButton
              type="button"
              tooltipPosition="above"
              [attr.aria-label]="action.label"
              [coreTooltip]="action.label"
              [disabled]="action.hasSaveStatus && saveStatus() === 'saving'"
              [attr.severity]="
                action.hasSaveStatus && saveStatus() !== 'saved' ? 'primary' : 'secondary'
              "
              (click)="action.run()"
            >
              <i
                coreButtonIcon
                class="material-symbols-outlined"
                aria-hidden="true"
                >{{ action.icon }}</i
              >
              @if (action.hasSaveStatus) {
                <span coreButtonLabel>{{ saveButtonLabel() }}</span>
              }
            </button>
          }
        </div>
        <button
          coreButton
          type="button"
          class="@min-[49rem]/form-toolbar:hidden"
          severity="secondary"
          aria-label="More form actions"
          [cdkMenuTriggerFor]="formActions"
        >
          <i
            coreButtonIcon
            class="material-symbols-outlined"
            aria-hidden="true"
            >more_vert</i
          >
        </button>
        <ng-template #formActions>
          <div
            cdkMenu
            class="core-root core-menu"
            aria-label="Form actions"
          >
            @for (action of actions; track action.icon) {
              <button
                cdkMenuItem
                type="button"
                [attr.aria-label]="action.label"
                [cdkMenuItemDisabled]="!!action.hasSaveStatus && saveStatus() === 'saving'"
                (cdkMenuItemTriggered)="action.run()"
              >
                <i
                  class="material-symbols-outlined"
                  aria-hidden="true"
                  >{{ action.icon }}</i
                >
                {{
                  action.hasSaveStatus && saveStatus() !== 'saved'
                    ? saveButtonLabel()
                    : action.label
                }}
              </button>
            }
          </div>
        </ng-template>
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

  protected readonly actions = [
    { label: 'Open preview', icon: 'fullscreen', run: () => this.openPreviewDialog() },
    { label: 'Clear Model', icon: 'restart_alt', run: () => this.clearModel() },
    { label: 'Export Form', icon: 'download', run: () => this.openExportDialog() },
    { label: 'Save Form', icon: 'save', run: () => this.saveActiveForm(), hasSaveStatus: true },
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
