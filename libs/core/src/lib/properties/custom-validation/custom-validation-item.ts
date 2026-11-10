import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Panel } from 'primeng/panel';
import { createObjectProperty } from '..';
import { Tooltip } from '../../shared/tooltip';
import { FieldObjectProperty } from '../object/object';
import { ObjectPropertyConfig } from '../object/object.config';
import { PropertyChange } from '../types';
import { ValidationMessageInput } from '../validation-messages/validation-message-input';
import { CustomValidationOption } from './custom-validation.config';

@Component({
  selector: 'core-custom-validation-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    Panel,
    FieldObjectProperty,
    ValidationMessageInput,
    Tooltip,
  ],
  template: `
    <p-panel [header]="selectedOption()?.label || name() || 'Validation'">
      <ng-template #icons>
        <button
          pButton
          text
          rounded
          severity="danger"
          aria-label="Remove validation"
          coreTooltip="Remove validation"
          tooltipPosition="top"
          (click)="remove.emit()"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            >remove</i
          >
        </button>
      </ng-template>

      <div class="flex flex-col gap-2">
        @if (!selectedOption()) {
          <p
            role="status"
            class="text-sm text-muted-color"
          >
            Unavailable in the active library.
          </p>
        }
        @if (messageTarget(); as currentTarget) {
          <core-validation-message-input
            [validatorName]="name() || ''"
            [target]="currentTarget"
            (targetChanged)="targetChanged.emit($event)"
          />
        }
        @if (optionsProperty(); as property) {
          <core-field-object-property
            [isCollapsible]="false"
            [path]="optionsPath()"
            [property]="property"
            [target]="target()"
            (targetChanged)="targetChanged.emit($event)"
          />
        }
      </div>
    </p-panel>
  `,
})
export class CustomValidationItem {
  readonly path = input.required<string[]>();
  readonly target = input<Record<string, unknown> | unknown[] | undefined>(undefined);
  targetChanged = output<PropertyChange>();

  readonly name = input<string>();
  readonly validationOptions = input.required<CustomValidationOption[]>();

  remove = output<void>();
  readonly messageTarget = computed(() => {
    const target = this.target();
    return target && !Array.isArray(target) ? target : undefined;
  });
  readonly selectedOption = computed(() =>
    this.validationOptions().find(({ value }) => value === this.name()),
  );

  readonly optionsPath = computed(() => [...this.path(), 'options']);
  readonly optionsProperty = computed<ObjectPropertyConfig | null>(() => {
    const optionProperties = this.selectedOption()?.optionProperties;
    if (optionProperties?.length) {
      return createObjectProperty({
        label: 'Options',
        key: 'options',
        childProperties: optionProperties,
        description: 'Additional configuration options for the selected validator.',
      });
    }
    return null;
  });
}
