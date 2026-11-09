import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FieldType,
  FieldTypeConfig,
  FieldWrapper,
  FormlyAttributes,
  FormlyValidationMessage,
} from '@ngx-formly/core';
import { FormlySelectOptionsPipe } from '@ngx-formly/core/select';

@Component({
  selector: 'core-vanilla-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormlyAttributes, FormlySelectOptionsPipe, AsyncPipe],
  styles: `
    input:not([type='checkbox']),
    textarea,
    select {
      display: block;
      box-sizing: border-box;
      width: 100%;
      padding: 0.5rem;
      border: 1px solid currentColor;
      border-radius: 0.25rem;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    input[type='checkbox'],
    select {
      appearance: auto;
    }
  `,
  template: `
    @switch (field.type) {
      @case ('checkbox') {
        <input
          type="checkbox"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [attr.aria-describedby]="id + '-description ' + id + '-error'"
          [attr.aria-invalid]="showError"
        />
      }
      @case ('textarea') {
        <textarea
          [formControl]="formControl"
          [formlyAttributes]="field"
          [rows]="props.rows ?? 3"
          [attr.aria-describedby]="id + '-description ' + id + '-error'"
          [attr.aria-invalid]="showError"
        ></textarea>
      }
      @case ('select') {
        <select
          [formControl]="formControl"
          [formlyAttributes]="field"
          [attr.aria-describedby]="id + '-description ' + id + '-error'"
          [attr.aria-invalid]="showError"
        >
          <option [ngValue]="undefined">{{ props.placeholder ?? 'Select an option' }}</option>
          @for (option of props.options | formlySelectOptions: field | async; track $index) {
            @if (option.group) {
              <optgroup [label]="option.label">
                @for (child of option.group; track $index) {
                  <option
                    [ngValue]="child.value"
                    [disabled]="child.disabled"
                  >
                    {{ child.label }}
                  </option>
                }
              </optgroup>
            } @else {
              <option
                [ngValue]="option.value"
                [disabled]="option.disabled"
              >
                {{ option.label }}
              </option>
            }
          }
        </select>
      }
      @default {
        @if (props.type === 'number') {
          <input
            type="number"
            [formControl]="formControl"
            [formlyAttributes]="field"
            [attr.aria-describedby]="id + '-description ' + id + '-error'"
            [attr.aria-invalid]="showError"
          />
        } @else {
          <input
            [type]="props.type ?? 'text'"
            [formControl]="formControl"
            [formlyAttributes]="field"
            [attr.aria-describedby]="id + '-description ' + id + '-error'"
            [attr.aria-invalid]="showError"
          />
        }
      }
    }
  `,
})
export class VanillaField extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'core-vanilla-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyValidationMessage],
  styles: `
    :host {
      display: block;
      margin-block: 0.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
    }
    small {
      display: block;
    }
  `,
  template: `
    <label [for]="id"
      >{{ props.label }}
      @if (props.required) {
        <span aria-hidden="true">*</span>
      }
    </label>
    <ng-template #fieldComponent />
    <small [id]="id + '-description'">{{ props.description }}</small>
    <small
      aria-live="polite"
      [id]="id + '-error'"
    >
      @if (showError) {
        <formly-validation-message [field]="field" />
      }
    </small>
  `,
})
export class VanillaFormField extends FieldWrapper {}
