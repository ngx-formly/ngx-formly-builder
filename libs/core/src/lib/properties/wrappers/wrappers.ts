import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { FieldPropertyWrapper } from '../property-wrapper';
import { WrappersPropertyConfig, WrappersPropertyOption } from './wrappers.config';

@Component({
  selector: 'core-field-wrappers-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatSelectModule, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="isClearable()"
      (clear)="onClear()"
    >
      <input
        coreInput
        class="mb-1 w-full"
        aria-label="Filter wrappers"
        placeholder="Filter wrappers"
        [ngModel]="filter()"
        (ngModelChange)="filter.set($event)"
      />
      <mat-select
        class="field-property-control"
        multiple
        [id]="inputId"
        [aria-label]="property().label || 'Wrappers'"
        [placeholder]="property().placeholder || 'Select Wrappers'"
        [ngModel]="orderedValue()"
        (ngModelChange)="onValueChange($event)"
      >
        @for (option of property().options; track option.value) {
          <mat-option
            [value]="option.value"
            [hidden]="!option.label.toLowerCase().includes(filter().toLowerCase())"
            >{{ option.label }}</mat-option
          >
        }
      </mat-select>
    </core-field-property-wrapper>
  `,
})
export class FieldWrappersProperty extends BaseProperty<WrappersPropertyConfig, string[] | null> {
  readonly isClearable = input(true, { transform: booleanAttribute });
  readonly filter = signal('');
  readonly orderedValue = computed(() =>
    orderValues(this.currentValue() ?? [], this.property().options),
  );

  readonly inputId = `wrappers-property-select-${Math.random().toString(36).substring(2, 15)}`;

  protected defaultValue = null;
  protected propertyType = PropertyType.WRAPPERS;

  onClear(): void {
    this._clear();
  }

  onValueChange(value: string[] | null): void {
    if ((!value || value.length === 0) && this.property().clearOnEmpty !== false) {
      this._clear();
    } else {
      this._modifyValue(orderValues(value ?? [], this.property().options));
    }
  }

  protected override _isValidProperty(x: unknown): x is WrappersPropertyConfig {
    return (
      this._isBaseProperty(x) &&
      'options' in x &&
      Array.isArray(x.options) &&
      x.options.every(isValidOption)
    );
  }
}

function orderValues(selectedValues: string[], options: WrappersPropertyOption[]): string[] {
  const optionOrder = new Map(options.map(({ value: optionValue }, index) => [optionValue, index]));

  return selectedValues
    .map((selectedValue, index) => ({ selectedValue, index }))
    .sort((a, b) => {
      const aOrder = optionOrder.get(a.selectedValue) ?? options.length + a.index;
      const bOrder = optionOrder.get(b.selectedValue) ?? options.length + b.index;
      return aOrder - bOrder;
    })
    .map(({ selectedValue }) => selectedValue);
}

function isValidOption(x: unknown): x is { label: string; value: string } {
  return (
    typeof x === 'object' &&
    x !== null &&
    'label' in x &&
    typeof x.label === 'string' &&
    'value' in x &&
    typeof x.value === 'string'
  );
}
