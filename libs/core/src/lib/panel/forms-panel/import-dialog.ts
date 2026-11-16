import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { CoreFormService } from '../../editor/core-form.service';
import { CoreLibraryService } from '../../config/core-library.service';
import { VANILLA_LIBRARY_ID } from '../../config/vanilla/vanilla.library';
import { ImportDialogService } from './import-dialog.service';
import { JSONContentDialog } from '../../json-content/json-content-dialog';

@Component({
  selector: 'core-import-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JSONContentDialog, FormsModule, MatSelect, MatOption],
  template: `
    <core-json-content-dialog
      class="text-base"
      header="Import Form"
      saveButtonLabel="Import Form"
      saveButtonIcon="upload"
      [isArrayRoot]="true"
      [schema]="schema()"
      [isOpen]="isOpen()"
      [(formFieldsJson)]="formFieldsJSON"
      (isOpenChange)="updateVisibility($event)"
      (save)="importForm()"
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
              id="import-dialog-name-input"
              [(ngModel)]="formName"
            />
            <label for="import-dialog-name-input">Name</label>
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
        <div>
          <div class="core-labeled-control">
            <mat-select
              class="w-full"
              name="formlyUI"
              aria-label="UI Library"
              [id]="selectedLibraryInputId"
              [attr.aria-describedby]="'import-form-library-help'"
              [(ngModel)]="selectedLibraryId"
              ><mat-option [value]="null">None (Vanilla)</mat-option>
              @for (option of libraryOptions; track $index) {
                <mat-option [value]="option.id">{{ option.label }}</mat-option>
              }
            </mat-select>
            <label [for]="selectedLibraryInputId">UI Library</label>
          </div>
          <small
            class="mt-1 block text-muted-color"
            id="import-form-library-help"
          >
            Leave empty for Vanilla (native HTML controls).
          </small>
        </div>
      </ng-container>
      <ng-container lhsActions>
        <span>
          <button
            coreButton
            text
            (click)="fileSelect.click()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              file_open
            </i>
            <span coreButtonLabel>Choose File</span>
          </button>
          <input
            #fileSelect
            class="hidden"
            type="file"
            accept=".json, .txt"
            (input)="loadFromFile()"
          />
        </span>
      </ng-container>
    </core-json-content-dialog>
  `,
})
export class ImportDialog {
  readonly fileSelectElement = viewChild.required<ElementRef<HTMLInputElement>>('fileSelect');

  dialogService = inject(ImportDialogService);
  formService = inject(CoreFormService);
  protected libraryService = inject(CoreLibraryService);

  isOpen = this.dialogService.isOpen;
  selectedLibraryInputId = 'import-form-selected-library';
  libraryOptions = this.libraryService.libraryOptions;
  readonly schema = computed(() => {
    const selectedLibrary = this.libraryService.getLibrary(
      this.selectedLibraryId() ?? VANILLA_LIBRARY_ID,
    );
    return selectedLibrary?.enableFormUploadSchema ? selectedLibrary.schema : undefined;
  });

  readonly formName = signal('');
  readonly formFieldsJSON = signal('');
  readonly selectedLibraryId = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.formName.set('New Form');
        this.formFieldsJSON.set('[]');
        this.selectedLibraryId.set(null);
      }
    });
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }

  loadFromFile(): void {
    const file: File | null = this.fileSelectElement().nativeElement.files?.item(0) ?? null;
    if (!file) return;

    const reader: FileReader = new FileReader();
    reader.onload = (readerEvent) => {
      const content: string = readerEvent.target?.result as string;
      if (content) {
        this.formFieldsJSON.set(content);
      }
    };

    reader.readAsText(file);
  }

  importForm() {
    let formFields: unknown;
    try {
      formFields = JSON.parse(this.formFieldsJSON());
    } catch {
      return;
    }
    if (!Array.isArray(formFields)) {
      return;
    }

    this.formService
      .addForm$(
        this.formName(),
        formFields,
        {},
        this.selectedLibraryId() ?? VANILLA_LIBRARY_ID,
        true,
        null,
      )
      .subscribe({
        next: () => {
          const activeFormId = this.formService.activeFormId();
          if (activeFormId) {
            this.dialogService.notifyImported(activeFormId);
          }
          this.dialogService.close();
        },
        error: () => undefined,
      });
  }
}
