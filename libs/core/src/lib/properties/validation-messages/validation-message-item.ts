import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from '../../ui/panel';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { ValidationOption } from './validation-messages.config';
import { Tooltip } from '../../shared/tooltip';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-validation-message-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, MatSelect, MatOption, FormsModule, Tooltip, FieldPropertyWrapper],
  template: `
    <core-property-panel [header]="'Message ' + (index() + 1)">
      <ng-template #icons>
        <button
          coreButton
          text
          rounded
          severity="danger"
          aria-label="Remove message"
          coreTooltip="Remove message"
          tooltipPosition="above"
          (click)="remove.emit()"
        >
          <i
            coreButtonIcon
            class="material-symbols-outlined"
            >remove</i
          >
        </button>
      </ng-template>

      <div class="flex flex-col gap-1">
        <core-field-property-wrapper
          label="Validation"
          description="Validator (e.g., required, minLength)"
          [labelForId]="keyInputId"
        >
          <mat-select
            class="field-property-control"
            placeholder="Select validation"
            aria-label="Validation"
            [id]="keyInputId"
            [ngModel]="key()"
            (ngModelChange)="keyChange.emit($event)"
          >
            @for (option of validationOptions(); track $index) {
              <mat-option [value]="option.value">{{ option.label }}</mat-option>
            }
          </mat-select>
        </core-field-property-wrapper>
        <core-field-property-wrapper
          label="Message"
          description="Error message shown when validation fails"
          [labelForId]="valueInputId"
        >
          <input
            class="field-property-control"
            coreInput
            type="text"
            placeholder="e.g., Invalid field!"
            [id]="valueInputId"
            [ngModel]="value()"
            (ngModelChange)="valueChange.emit($event)"
          />
        </core-field-property-wrapper>
      </div>
    </core-property-panel>
  `,
})
export class ValidationMessageItem {
  readonly index = input.required<number>();
  readonly key = input<string>();
  readonly value = input<string>();
  readonly validationOptions = input.required<ValidationOption[]>();

  keyChange = output<string>();
  valueChange = output<string>();
  remove = output<void>();

  keyInputId = `validation-message-item-key-input-${Math.random().toString(36).substring(2, 15)}`;
  valueInputId = `validation-message-item-value-input-${Math.random().toString(36).substring(2, 15)}`;
}
