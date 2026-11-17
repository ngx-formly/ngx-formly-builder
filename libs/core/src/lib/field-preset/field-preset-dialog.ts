import { CoreFieldService } from '../config/core-field.service';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldPresetDialogService } from './field-preset-dialog.service';
import { JSONContentDialog } from '../json-content/json-content-dialog';

@Component({
  selector: 'core-field-preset-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, JSONContentDialog],
  template: `
    <core-json-content-dialog
      header="Save Field as Preset"
      saveButtonLabel="Save"
      saveButtonIcon="save"
      [isOpen]="isOpen()"
      [(formFieldsJson)]="formFieldsJSON"
      (isOpenChange)="updateVisibility($event)"
      (save)="save()"
    >
      <ng-container formFields>
        <div>
          <div class="core-labeled-control">
            <input
              #nameModel="ngModel"
              class="w-full"
              name="name"
              coreInput
              required
              autocomplete="off"
              data-bwignore
              id="preset-dialog-name-input"
              [(ngModel)]="formName"
            />
            <label for="preset-dialog-name-input">Name</label>
          </div>
          @if (!nameModel.valid && nameModel.touched) {
            <div
              role="alert"
              class="core-message"
              class="mt-1 inline-block"
              severity="error"
              size="small"
              variant="simple"
            >
              Name is required.
            </div>
          }
        </div>
      </ng-container>
    </core-json-content-dialog>
  `,
})
export class FieldPresetDialog {
  dialogService = inject(FieldPresetDialogService);
  fieldService = inject(CoreFieldService);

  isOpen = this.dialogService.isOpen;
  data = this.dialogService.data;

  readonly formName = signal('');
  readonly formFieldsJSON = signal('');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const data = this.data();
        if (!data) {
          throw new Error('FieldPresetDialog: No data available when dialog is open');
        }

        this.formName.set(data.name);
        this.formFieldsJSON.set(data.json);
      }
    });
  }

  save() {
    const data = this.data();
    if (!data) {
      throw new Error('Unable to save dialog form without data');
    }

    const field = JSON.parse(this.formFieldsJSON());
    this.fieldService.savePreset(this.formName(), field);
    this.dialogService.close();
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }
}
