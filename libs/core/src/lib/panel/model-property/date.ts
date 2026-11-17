import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DateProperty } from '../../properties/date/date.directive';
import { Tooltip } from '../../shared/tooltip';
import { ModelPropertyKey } from './property-key';
import { ModelPropertyWrapper } from './property-wrapper';

@Component({
  selector: 'core-model-date-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [ModelPropertyKey, FormsModule, ModelPropertyWrapper, Tooltip, MatDatepickerModule],
  template: `
    <core-model-property-wrapper [level]="level()">
      <span class="inline-flex min-w-0 grow items-center gap-2">
        <span class="invisible size-8 shrink-0"> </span>
        <span class="inline-flex items-center gap-0.5">
          <core-model-property-key
            [property]="property()"
            (keyChange)="onKeyChanged($event)"
          />
          <span>:</span>
        </span>
        <span class="flex min-w-0 items-center"
          ><input
            coreInput
            class="h-9 min-w-0 grow truncate"
            [matDatepicker]="calendar"
            [id]="inputId"
            [ngModel]="currentValue()"
            (ngModelChange)="onValueChange($event)" /><mat-datepicker-toggle
            [for]="calendar" /><mat-datepicker #calendar
        /></span>
      </span>
      <ng-container actions>
        @if (property().isRemovable) {
          <button
            coreButton
            text
            class="size-8"
            rounded
            severity="danger"
            aria-label="Remove"
            coreTooltip="Remove"
            tooltipPosition="above"
            (click)="remove.emit()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              delete
            </i>
          </button>
        }
      </ng-container>
    </core-model-property-wrapper>
  `,
})
export class ModelDateProperty extends DateProperty {
  readonly level = input(0, { transform: numberAttribute });

  inputId = `input-property-input-${Math.random().toString(36).substring(2, 15)}`;
  inputStyle = { minWidth: '0' };

  readonly stringValue = computed(() => {
    const currValue = this.currentValue();
    if (currValue instanceof Date) {
      if (!isNaN(currValue.getTime())) {
        return currValue.toISOString();
      }
      return null;
    }
    return currValue;
  });
}
