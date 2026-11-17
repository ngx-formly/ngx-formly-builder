import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format, parse } from 'date-fns';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DateProperty } from './date.directive';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-date-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [FormsModule, FieldPropertyWrapper, MatDatepickerModule],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="inputId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <span class="flex min-w-0 items-center"
        ><input
          coreInput
          class="field-property-control"
          [matDatepicker]="calendar"
          [id]="inputId"
          [ngModel]="currentDateValue()"
          (ngModelChange)="onDateValueChange($event)" /><mat-datepicker-toggle
          [for]="calendar" /><mat-datepicker #calendar
      /></span>
    </core-field-property-wrapper>
  `,
})
export class FieldDateProperty extends DateProperty {
  inputId = `date-property-input-${Math.random().toString(36).substring(2, 15)}`;

  readonly currentDateValue = computed(() => {
    const stringValue = this.currentValue();
    if (stringValue instanceof Date) {
      throw new Error('Field date property value must be a string');
    }

    return stringValue ? parse(stringValue, 'yyyy-MM-dd', new Date()) : null;
  });

  onDateValueChange(value: Date | null) {
    if (!value) {
      return;
    }
    const stringValue = format(value, 'yyyy-MM-dd');
    this.onValueChange(stringValue);
  }
}
