import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { ChipsPropertyConfig } from './chips.config';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-chips-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <mat-chip-grid
        #chips
        [attr.aria-label]="property().label || 'Values'"
      >
        @for (value of controlValue(); track $index) {
          <mat-chip-row (removed)="removeChip($index)">
            {{ value }}
            <button
              matChipRemove
              type="button"
              [attr.aria-label]="'Remove ' + value"
            >
              <i
                class="material-symbols-outlined"
                aria-hidden="true"
                >close</i
              >
            </button>
          </mat-chip-row>
        }
      </mat-chip-grid>
      <input
        coreInput
        class="field-property-control"
        [id]="inputId"
        [placeholder]="property().placeholder || ''"
        [matChipInputFor]="chips"
        [matChipInputAddOnBlur]="true"
        (matChipInputTokenEnd)="addChip($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldChipsProperty extends BaseProperty<ChipsPropertyConfig, string[] | null> {
  inputId = `chips-property-input-${Math.random().toString(36).substring(2, 15)}`;

  protected defaultValue = null;
  protected propertyType = PropertyType.CHIPS;

  readonly controlValue = computed(() => {
    const outputString = this.property().outputString;
    const values =
      (outputString
        ? (this.currentValue() as string | null)?.split(outputString.separator).filter((v) => !!v)
        : (this.currentValue() as string[] | null)) ?? [];
    return values;
  });

  onClear(): void {
    this._clear();
  }

  addChip(event: MatChipInputEvent): void {
    const value = event.value.trim();
    if (value) this.onValueChange([...this.controlValue(), value]);
    event.chipInput.clear();
  }

  removeChip(index: number): void {
    this.onValueChange(this.controlValue().filter((_, itemIndex) => itemIndex !== index));
  }

  onValueChange(value: string[] | null): void {
    const outputString = this.property().outputString;
    if (outputString) {
      const strValue = value?.length ? value.join(outputString.separator) : null;
      this._modifyValue(strValue);
    } else {
      this._modifyValue(value);
    }
  }

  protected override _isValidProperty(x: unknown): x is ChipsPropertyConfig {
    return this._isBaseProperty(x);
  }
}
