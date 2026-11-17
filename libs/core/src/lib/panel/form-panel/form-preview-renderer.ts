import { CoreFormService } from '../../editor/core-form.service';
import {
  FormlyFieldConfig,
  FormlyForm,
  FormlyFormOptions,
  provideFormlyCore,
} from '@ngx-formly/core';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyConfigService } from '../../formly/formly-config.service';
import { CORE_BUILDER_FORM } from '../../formly/types';

@Component({
  selector: 'core-form-preview-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideFormlyCore(),
    FormlyConfigService,
    { provide: CORE_BUILDER_FORM, useValue: false },
  ],
  imports: [FormlyForm],
  template: `
    <formly-form
      [fields]="clonedFormFields()"
      [model]="model()"
      [form]="formGroup"
      [options]="options"
      (modelChange)="onFormModelChanged($event)"
    />
  `,
})
export class FormPreviewRenderer {
  readonly formFields = input<FormlyFieldConfig[]>([]);

  protected readonly formService = inject(CoreFormService);
  protected readonly formlyConfig = inject(FormlyConfigService);
  private readonly fieldClones = new WeakMap<FormlyFieldConfig, FormlyFieldConfig>();
  protected readonly clonedFormFields = computed(() =>
    this.formFields().map((field) => this.cloneField(field)),
  );
  protected readonly model = computed(() => structuredClone(this.formService.activeModel()));

  formGroup = new FormGroup({});
  options: FormlyFormOptions = {};

  constructor() {
    effect(() => {
      this.formService.activeFormId();
      this.formService.activeLibraryId();
      this.formlyConfig.loadLibraryConfigOptions();
      this.formGroup = new FormGroup({});
      this.options = {};
    });
  }

  private cloneField(source: FormlyFieldConfig): FormlyFieldConfig {
    const children = source.fieldGroup?.map((child) => this.cloneField(child));
    const existing = this.fieldClones.get(source);
    if (existing) {
      if (
        children &&
        !source.fieldArray &&
        (children.length !== existing.fieldGroup?.length ||
          children.some((child, index) => child !== existing.fieldGroup?.[index]))
      ) {
        existing.fieldGroup = children;
      }
      return existing;
    }
    const { fieldGroup, fieldArray, ...config } = source;
    const field: FormlyFieldConfig = structuredClone(config);
    if (fieldGroup) field.fieldGroup = children;
    if (fieldArray)
      field.fieldArray =
        typeof fieldArray === 'function' ? fieldArray : this.cloneField(fieldArray);
    this.fieldClones.set(source, field);
    return field;
  }

  protected onFormModelChanged(model: Record<string, unknown>): void {
    this.formService.setActiveModel(model);
  }
}
