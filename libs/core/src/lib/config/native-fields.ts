import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { ConfigOption, FieldType, FieldTypeConfig, FormlyAttributes } from '@ngx-formly/core';
import { createBooleanProperty, createInputProperty } from '../properties';
import { FieldTypeOption } from './types';

@Component({
  selector: 'core-file-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyAttributes],
  template: `
    <label
      class="mb-2 block"
      [for]="id"
    >
      {{ props.label }}
      @if (props.required) {
        <span aria-hidden="true">*</span>
      }
    </label>
    <input
      #fileInput
      class="block w-full rounded-md border border-surface p-2 text-sm file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:px-2 file:py-1 file:bg-emphasis"
      type="file"
      [formlyAttributes]="field"
      [attr.accept]="props['accept'] || null"
      [disabled]="formControl.disabled"
      [attr.aria-describedby]="id + '-description ' + id + '-error'"
      [attr.aria-invalid]="formControl.invalid && formControl.touched"
      (change)="selectFile(fileInput)"
      (blur)="formControl.markAsTouched()"
    />
    <small
      class="mt-1 block text-muted-color"
      [id]="id + '-description'"
      >{{ props.description }}</small
    >
    @if (formControl.value?.name) {
      <div class="mt-2 flex items-center gap-2 text-sm">
        <span class="min-w-0 break-all">Saved file: {{ formControl.value.name }}</span>
        <button
          class="shrink-0 underline"
          type="button"
          [disabled]="formControl.disabled"
          (click)="clearFile(fileInput)"
        >
          Remove file
        </button>
      </div>
    }
    <small
      class="mt-1 block text-red-600 dark:text-red-400"
      role="status"
      [id]="id + '-error'"
    >
      {{
        error() ||
          (formControl.touched && formControl.hasError('required') ? 'This field is required.' : '')
      }}
    </small>
  `,
})
class FileField extends FieldType<FieldTypeConfig> implements OnDestroy {
  protected readonly error = signal('');
  private reader?: FileReader;

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    this.reader?.abort();
    this.error.set('');
    this.formControl.setValue(null);
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
    const maxSize = this.props['maxFileSize'] ?? 2 * 1024 * 1024;
    if (
      file.size > maxSize ||
      (this.props['accept'] === 'image/*' && !file.type.startsWith('image/'))
    ) {
      this.error.set(file.size > maxSize ? 'The file is too large.' : 'Choose an image file.');
      this.formControl.setErrors({ file: true });
      input.value = '';
      return;
    }
    const reader = new FileReader();
    this.reader = reader;
    this.formControl.markAsPending();
    reader.onload = () => {
      this.formControl.setValue({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.onerror = () => {
      this.error.set('Could not read this file. Please choose it again.');
      this.formControl.setErrors({ file: true });
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  clearFile(input: HTMLInputElement): void {
    this.reader?.abort();
    input.value = '';
    this.error.set('');
    this.formControl.setValue(null);
    this.formControl.markAsDirty();
  }

  ngOnDestroy(): void {
    this.reader?.abort();
  }
}

@Component({
  selector: 'core-example-submit-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="w-full cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-primary-contrast hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      [disabled]="props.disabled || form.pending"
      (click)="submit()"
    >
      {{ props.label }}
    </button>
    @if (submitted()) {
      <p
        class="mt-2 text-sm text-muted-color"
        role="status"
      >
        {{
          form.valid
            ? 'Demo complete. No data was sent.'
            : 'Please complete the required fields and fix any errors.'
        }}
      </p>
    }
  `,
})
class ExampleSubmitField extends FieldType {
  protected readonly submitted = signal(false);

  submit(): void {
    this.form.markAllAsTouched();
    this.submitted.set(true);
  }
}

const labelProperty = createInputProperty({ label: 'Label', key: 'props.label', dataType: 'text' });

/** Portable file and demo-submit controls that do not require a UI adapter. */
export const nativeFieldTypes: FieldTypeOption[] = [
  {
    name: 'file',
    displayName: 'File',
    description: 'File attachment',
    materialSymbol: 'attach_file',
    keyGenerationPrefix: 'file',
    defaultConfig: { props: { label: 'File', maxFileSize: 2 * 1024 * 1024 } },
    properties: [
      createInputProperty({ label: 'Key', key: 'key', dataType: 'text' }),
      labelProperty,
      createInputProperty({ label: 'Description', key: 'props.description', dataType: 'text' }),
      createInputProperty({ label: 'Accepted file types', key: 'props.accept', dataType: 'text' }),
      createInputProperty({
        label: 'Maximum size (bytes)',
        key: 'props.maxFileSize',
        dataType: 'number',
      }),
      createBooleanProperty({ label: 'Disabled', key: 'props.disabled' }),
    ],
    validationConfig: {
      rules: [
        {
          name: 'required',
          property: createBooleanProperty({ label: 'Required', key: 'props.required' }),
        },
      ],
    },
  },
  {
    name: 'example-submit',
    displayName: 'Demo Submit',
    description: 'Try form validation',
    materialSymbol: 'smart_button',
    disableKeyGeneration: true,
    defaultConfig: { props: { label: 'Submit' } },
    properties: [
      labelProperty,
      createBooleanProperty({ label: 'Disabled', key: 'props.disabled' }),
    ],
  },
];

export const nativeFieldConfig: ConfigOption = {
  types: [
    { name: 'file', component: FileField },
    { name: 'example-submit', component: ExampleSubmitField },
  ],
};
