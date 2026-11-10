import { CoreFormService } from '../../editor/core-form.service';
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { defer, finalize } from 'rxjs';
import { CoreLibraryService } from '../../config/core-library.service';
import { CORE_FORM_TEMPLATES, FormTemplate as SharedFormTemplate } from '../../config/types';
import { VANILLA_LIBRARY_ID } from '../../config/vanilla/vanilla.library';
import { FormStoreRecoveryRequiredError } from '../../persistence/types';
import { Tooltip } from '../../shared/tooltip';
import { CreateFormDialogService } from './create-form-dialog.service';

const BLANK_TEMPLATE_ID = 'blank';
const STORAGE_RECOVERY_MESSAGE =
  'Recover saved data in the Workspace panel before creating a form.';

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FormlyFieldConfig[];
  model: Record<string, unknown>;
  libraryId?: string;
}

@Component({
  selector: 'core-create-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Dialog,
    FloatLabel,
    InputText,
    FormsModule,
    Message,
    Select,
    ButtonDirective,
    ButtonIcon,
    Tooltip,
  ],
  template: `
    <p-dialog
      modal
      header="Create Form"
      [style]="{
        width: '800px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100dvh - 32px)',
      }"
      [visible]="dialogService.isOpen()"
      [focusOnShow]="libraryOptions.length === 0"
      (onShow)="libraryOptions.length > 0 && librarySelect.show(true)"
      (visibleChange)="onVisibilityChange($event)"
    >
      <form
        #form="ngForm"
        class="flex flex-col gap-6"
      >
        @if (errorMessage()) {
          <p-message severity="error">{{ errorMessage() }}</p-message>
        }
        <div class="grid w-full shrink-0 grid-cols-1 items-start gap-4 py-2 sm:grid-cols-2">
          <div class="min-w-0">
            <p-floatlabel variant="on">
              <input
                class="w-full"
                name="name"
                pInputText
                autocomplete="off"
                data-bwignore
                [id]="nameInputId"
                [ngModel]="formName()"
                (ngModelChange)="formName.set($event)"
              />
              <label [for]="nameInputId">Name</label>
            </p-floatlabel>
          </div>
          <div class="min-w-0">
            <p-floatlabel variant="on">
              <p-select
                #librarySelect
                class="w-full"
                name="formlyUI"
                checkmark
                optionLabel="label"
                optionValue="id"
                ariaLabel="UI Library"
                [focusOnHover]="false"
                [showClear]="true"
                [pt]="{ label: { 'aria-describedby': 'create-form-library-help' } }"
                [inputId]="selectedLibraryInputId"
                [options]="libraryOptions"
                [ngModel]="selectedLibrary()"
                (ngModelChange)="selectedLibrary.set($event)"
              />
              <label [for]="selectedLibraryInputId">UI Library</label>
            </p-floatlabel>
            <small
              class="mt-1 block text-muted-color"
              id="create-form-library-help"
            >
              Leave empty for Vanilla (native HTML controls).
            </small>
          </div>
        </div>

        <div
          class="grid grid-cols-1 gap-4"
          role="group"
          aria-label="Starting point"
          [class.sm:grid-cols-2]="quickStartTemplates.length > 0"
        >
          <div
            class="relative"
            (dragenter)="onFileDragOver($event)"
            (dragover)="onFileDragOver($event)"
            (dragleave)="onFileDragLeave($event)"
            (drop)="onFileDrop($event)"
          >
            <button
              class="flex h-full min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 pt-16 pb-6 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary enabled:hover:border-primary enabled:hover:bg-emphasis disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-72 sm:p-6"
              type="button"
              id="template-blank"
              aria-label="Start with a blank form"
              aria-describedby="blank-form-description"
              [class.border-primary]="isDraggingFile()"
              [class.border-surface]="!isDraggingFile()"
              [disabled]="!form.valid || isCreating() || formService.hasStorageRecoveryIssues()"
              (click)="createForm()"
            >
              <i
                class="material-symbols-outlined text-4xl!"
                aria-hidden="true"
                >{{ isDraggingFile() ? 'download' : 'draft' }}</i
              >
              <span class="text-lg font-semibold">Start with a blank form</span>
              <span
                class="text-sm text-muted-color"
                id="blank-form-description"
                >Build from scratch, or drop a JSON form file here.</span
              >
            </button>
            <button
              class="absolute top-2 right-2 h-11 w-11"
              pButton
              text
              type="button"
              severity="secondary"
              aria-label="Import form file"
              coreTooltip="Import form file"
              tooltipPosition="top"
              [disabled]="!form.valid || isCreating() || formService.hasStorageRecoveryIssues()"
              (click)="fileSelect.click()"
            >
              <i
                pButtonIcon
                class="material-symbols-outlined"
                aria-hidden="true"
                >upload</i
              >
            </button>
            <input
              #fileSelect
              class="hidden"
              type="file"
              accept=".json,.txt"
              (change)="importFiles(fileSelect.files); fileSelect.value = ''"
            />
          </div>

          @if (quickStartTemplates.length > 0) {
            <section
              class="min-w-0 rounded-xl border border-surface p-5 sm:p-6"
              aria-labelledby="quick-start-heading"
            >
              <h2
                class="m-0 text-center text-lg font-semibold"
                id="quick-start-heading"
              >
                Quick Start
              </h2>
              <p class="mt-2 mb-5 text-center text-sm text-muted-color">
                Choose an example to get started quickly.
              </p>
              <div class="flex flex-col gap-3">
                @for (template of quickStartTemplates; track template.id) {
                  <button
                    class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-surface px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary enabled:hover:border-primary enabled:hover:bg-emphasis disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    [id]="'template-' + template.id"
                    [attr.aria-label]="template.name"
                    [attr.aria-describedby]="'template-description-' + $index"
                    [disabled]="
                      !form.valid || isCreating() || formService.hasStorageRecoveryIssues()
                    "
                    (click)="createForm(template.id)"
                  >
                    <i
                      class="material-symbols-outlined shrink-0 text-lg!"
                      aria-hidden="true"
                      >{{ template.icon }}</i
                    >
                    <span class="min-w-0 flex-1 text-sm font-medium">{{ template.name }}</span>
                    <span
                      class="sr-only"
                      [id]="'template-description-' + $index"
                      >{{ template.description }}</span
                    >
                    <i
                      class="material-symbols-outlined shrink-0 text-lg!"
                      aria-hidden="true"
                      >chevron_right</i
                    >
                  </button>
                }
              </div>
            </section>
          }
        </div>
      </form>
    </p-dialog>
  `,
})
export class CreateFormDialog {
  protected readonly form = viewChild.required('form', { read: NgForm });

  protected dialogService = inject(CreateFormDialogService);
  protected libraryService = inject(CoreLibraryService);
  protected formService = inject(CoreFormService);
  private readonly configuredTemplates: (SharedFormTemplate & { libraryId?: string })[] =
    inject(CORE_FORM_TEMPLATES, { optional: true }) ?? this.libraryService.formTemplates;

  nameInputId = 'create-form-name';
  selectedLibraryInputId = 'create-form-selected-library';
  libraryOptions = this.libraryService.libraryOptions;

  readonly formName = signal('');
  readonly selectedLibrary = signal<string | null>(null);
  protected readonly isCreating = signal(false);
  protected readonly isDraggingFile = signal(false);
  private fileReader: FileReader | null = null;
  private readonly creationError = signal('');
  protected readonly errorMessage = computed(() =>
    this.formService.hasStorageRecoveryIssues() ? STORAGE_RECOVERY_MESSAGE : this.creationError(),
  );

  readonly templates: FormTemplate[] = [
    {
      id: BLANK_TEMPLATE_ID,
      name: 'Blank Form',
      description: 'Start from scratch with an empty canvas and build your structure manually.',
      icon: 'note_add',
      fields: [],
      model: {},
    },
    ...this.configuredTemplates.map((template) => ({
      id:
        template.id ||
        (template.libraryId ? `${template.name}-${template.libraryId}` : template.name),
      name: template.name,
      description: template.description ?? '',
      icon: template.icon ?? 'description',
      fields: template.fields,
      model: template.model,
      libraryId: template.libraryId,
    })),
  ];
  readonly quickStartTemplates = this.templates.slice(1);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.dialogService.close());

    effect(() => {
      if (!this.dialogService.isOpen()) {
        this.reset();
      }
    });
  }

  protected reset(): void {
    if (this.fileReader) {
      this.fileReader.abort();
      this.fileReader = null;
      this.isCreating.set(false);
    }
    this.isDraggingFile.set(false);
    this.creationError.set('');
    this.formName.set('');
    this.selectedLibrary.set(null);
    this.form().resetForm({
      name: this.formName(),
      formlyUI: null,
    });
  }

  onVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.dialogService.close();
    }
  }

  protected onFileDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files') || !this.canCreate()) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.isDraggingFile.set(true);
  }

  protected onFileDragLeave(event: DragEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.isDraggingFile.set(false);
    }
  }

  protected onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile.set(false);
    this.importFiles(event.dataTransfer?.files);
  }

  protected importFiles(files: FileList | null | undefined): void {
    if (!this.canCreate()) return;

    if (!files?.length) return;
    const file = files[0];
    if (files.length !== 1 || !/\.(json|txt)$/i.test(file.name)) {
      this.creationError.set('Choose or drop one JSON or TXT form file at a time.');
      return;
    }

    const name = this.formName().trim() || file.name.replace(/\.(json|txt)$/i, '') || 'New form';
    const libraryId = this.selectedLibrary() ?? VANILLA_LIBRARY_ID;
    const library = this.libraryService.getLibrary(libraryId);
    const reader = new FileReader();
    this.fileReader = reader;
    this.creationError.set('');
    this.isCreating.set(true);
    reader.onload = () => {
      this.fileReader = null;
      this.isCreating.set(false);
      if (!this.canCreate()) return;

      let fields: unknown;
      try {
        fields = JSON.parse(reader.result as string);
      } catch {
        this.creationError.set('Could not read the form. Use a valid JSON field array.');
        return;
      }
      if (
        !Array.isArray(fields) ||
        fields.some((field) => !field || typeof field !== 'object' || Array.isArray(field))
      ) {
        this.creationError.set('The form must contain a JSON array of field objects.');
        return;
      }
      if (library?.enableFormUploadSchema && !library.schema?.safeParse(fields).success) {
        this.creationError.set(
          'The form does not match the selected UI library. Check the file or choose another library.',
        );
        return;
      }

      this.saveForm(name, fields, {}, libraryId);
    };
    reader.onerror = () => {
      this.fileReader = null;
      this.isCreating.set(false);
      this.creationError.set('Could not read the file. Please try again.');
    };
    reader.readAsText(file);
  }

  private canCreate(): boolean {
    return (
      this.dialogService.isOpen() &&
      !this.isCreating() &&
      !this.formService.hasStorageRecoveryIssues() &&
      !!this.form().valid
    );
  }

  createForm(templateId = BLANK_TEMPLATE_ID): void {
    if (
      !this.dialogService.isOpen() ||
      this.isCreating() ||
      this.formService.hasStorageRecoveryIssues()
    ) {
      return;
    }

    if (!this.form().valid) {
      this.form().form.markAllAsTouched();
      return;
    }

    const template = this.templates.find((t) => t.id === templateId);
    if (!template) {
      return;
    }

    const name =
      this.formName().trim() || (templateId === BLANK_TEMPLATE_ID ? 'New form' : template.name);
    const libraryId = template.libraryId ?? this.selectedLibrary() ?? VANILLA_LIBRARY_ID;

    this.saveForm(name, template.fields, template.model, libraryId);
  }

  private saveForm(
    name: string,
    fields: FormlyFieldConfig[],
    model: Record<string, unknown>,
    libraryId: string,
  ): void {
    this.creationError.set('');
    this.isCreating.set(true);
    defer(() =>
      this.formService.addForm$(
        name,
        fields,
        model,
        libraryId,
        true,
        this.dialogService.parentId(),
      ),
    )
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => this.dialogService.close(),
        error: (error) =>
          this.creationError.set(
            error instanceof FormStoreRecoveryRequiredError
              ? STORAGE_RECOVERY_MESSAGE
              : 'Could not create the form. Please try again.',
          ),
      });
  }

  close(): void {
    this.dialogService.close();
  }
}
