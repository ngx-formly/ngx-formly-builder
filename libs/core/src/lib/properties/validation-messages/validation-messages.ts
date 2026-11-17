import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Panel, PanelLayout } from '../../ui/panel';
import { Empty } from '../../empty/empty';
import { ValidationMessage, ValidationMessagesPropertyConfig } from './validation-messages.config';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { Tooltip } from '../../shared/tooltip';
import { ValidationMessageItem } from './validation-message-item';

@Component({
  selector: 'core-field-validation-messages-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, ValidationMessageItem, Empty, Tooltip],
  template: `
    <core-property-panel
      toggler="header"
      [pt]="panelPT"
      [toggleable]="true"
      [(collapsed)]="isCollapsed"
    >
      <ng-template #header>
        <span
          class="core-property-panel-title"
          tooltipPosition="left"
          [coreTooltip]="property().description"
        >
          {{ property().label }}
          {{ '{' + childProperties().length + '}' }}
        </span>
      </ng-template>
      <ng-template #icons>
        <button
          class="mr-2"
          coreButton
          text
          rounded
          aria-label="Add message"
          coreTooltip="Add message"
          tooltipPosition="above"
          [style.opacity]="isCollapsed() ? '0' : '1'"
          [style.pointerEvents]="isCollapsed() ? 'none' : 'auto'"
          (click)="onAddChild($event)"
        >
          <i
            coreButtonIcon
            class="material-symbols-outlined"
            >add</i
          >
        </button>
      </ng-template>
      <ng-template #headericons>
        <i class="material-symbols-outlined">{{ isCollapsed() ? 'expand_more' : 'expand_less' }}</i>
      </ng-template>
      @for (validationMessage of childProperties(); track validationMessage.key) {
        <core-validation-message-item
          [index]="$index"
          [key]="validationMessage.key"
          [value]="validationMessage.value"
          [validationOptions]="property().validationOptions"
          (keyChange)="onChildKeyChanged(validationMessage.key, $event)"
          (valueChange)="onChildValueChanged(validationMessage.key, $event)"
          (remove)="onRemoveChild(validationMessage.key)"
        />
      } @empty {
        <core-empty
          label="No messages yet"
          description="Click the + button to add a message."
        />
      }
    </core-property-panel>
  `,
})
export class FieldValidationMessagesProperty extends BaseProperty<
  ValidationMessagesPropertyConfig,
  Record<string, string>
> {
  panelPT: PanelLayout = {
    header: {
      class: 'cursor-pointer',
    },
  };

  protected defaultValue = {};
  protected propertyType = PropertyType.VALIDATION_MESSAGES;

  readonly isCollapsed = signal(true);
  readonly childProperties = computed<ValidationMessage[]>(() =>
    Object.entries(this.currentValue()).map(([key, value]) => ({
      key,
      value,
    })),
  );

  onAddChild(event: MouseEvent): void {
    event.stopPropagation();
    this.onChildValueChanged('', '');
  }

  onRemoveChild(key: string): void {
    this._clear([...this.path(), key]);
  }

  onChildKeyChanged(currKey: string, newKey: string): void {
    this._modifyKey([...this.path(), currKey], [...this.path(), newKey]);
  }

  onChildValueChanged(key: string, value: string): void {
    this._modifyValue(value, [...this.path(), key]);
  }

  protected override _isValidProperty(x: unknown): x is ValidationMessagesPropertyConfig {
    return (
      this._isBaseProperty(x) && 'validationOptions' in x && Array.isArray(x.validationOptions)
    );
  }
}
