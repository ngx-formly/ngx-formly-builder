import { CoreFormService } from '../../editor/core-form.service';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Dialog, DialogLayout } from '../../ui/dialog';
import { PreviewDialogService } from './preview-dialog.service';
import { FormPreviewContent } from './form-preview-content';
import { PreviewDeviceToolbar } from './preview-device-toolbar';

@Component({
  selector: 'core-form-preview-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, FormPreviewContent, PreviewDeviceToolbar],
  template: `
    <core-dialog
      header="Form Preview"
      [style]="{ width: 'calc(100vw - 32px)', height: 'calc(100dvh - 32px)' }"
      [pt]="pt"
      [visible]="isOpen()"
      (visibleChange)="updateVisibility($event)"
    >
      <ng-template
        #header
        let-titleId="ariaLabelledBy"
      >
        <span
          class="core-dialog-title"
          [id]="titleId"
          >Form Preview</span
        >
        <core-preview-device-toolbar
          class="col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1"
          [scale]="previewContent()?.scale() ?? 1"
        />
      </ng-template>
      @if (isOpen()) {
        <core-form-preview-content [formFields]="activePreviewFormFields()" />
      }
    </core-dialog>
  `,
})
export class FormPreviewDialog {
  protected readonly previewContent = viewChild(FormPreviewContent);

  dialogService = inject(PreviewDialogService);
  protected formService = inject(CoreFormService);

  isOpen = this.dialogService.isOpen;
  activePreviewFormFields = this.formService.activePreviewFormFields;

  pt: DialogLayout = {
    header: {
      class: 'grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 lg:grid-cols-[1fr_auto_1fr]',
    },
  };

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }
}
