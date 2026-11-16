import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { FieldPropertyWrapper } from '../property-wrapper';
import { SelectPropertyConfig, SelectPropertyOption } from './select.config';

@Component({
  selector: 'core-field-select-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatSelect, MatOption, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="selectId"
      [isClearable]="isClearable()"
      (clear)="onClear()"
    >
      <mat-select
        class="field-property-control"
        [id]="selectId"
        [aria-label]="property().label || 'Select option'"
        [placeholder]="property().placeholder || 'Select option'"
        [ngModel]="controlValue()"
        (ngModelChange)="onValueChange($event)"
      >
        @for (option of property().options; track $index) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
    </core-field-property-wrapper>
  `,
})
export class FieldSelectProperty extends BaseProperty<
  SelectPropertyConfig,
  string | number | null
> {
  readonly isClearable = input(true, { transform: booleanAttribute });

  selectId = `select-property-select-${Math.random().toString(36).substring(2, 15)}`;

  protected defaultValue = null;
  protected propertyType = PropertyType.SELECT;

  readonly controlValue = computed(() => this.currentValue());

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string | number | null): void {
    if (value === null && this.property().clearOnEmpty !== false) {
      this._clear();
    } else {
      this._modifyValue(value);
    }
  }

  protected override _isValidProperty(x: unknown): x is SelectPropertyConfig {
    return (
      this._isBaseProperty(x) &&
      'options' in x &&
      Array.isArray(x.options) &&
      x.options.every(isValidOption)
    );
  }
}

function isValidOption(x: unknown): x is SelectPropertyOption {
  return (
    typeof x === 'object' &&
    x !== null &&
    'label' in x &&
    'value' in x &&
    ['string', 'number'].includes(typeof x.value)
  );
}
