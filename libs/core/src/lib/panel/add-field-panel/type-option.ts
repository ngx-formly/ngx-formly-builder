import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTypeOption } from '../../config/types';
import { Tooltip } from '../../shared';
import { TypeContainer } from './type-option-container';

@Component({
  selector: 'core-add-field-type-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeContainer, Tooltip],
  host: {
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <core-type-container
      class="justify-between"
      [fieldType]="type().name"
      [showActions]="isMouseInside()"
    >
      <span
        class="inline-flex items-center gap-2"
        tooltipPosition="right"
        tooltipEvent="both"
        [coreTooltip]="type().description"
        [attr.aria-description]="type().description"
        [attr.tabindex]="type().description ? 0 : null"
      >
        <i
          aria-hidden="true"
          class="material-symbols-outlined pointer-events-none"
          [class.opacity-30]="isMouseInside()"
          [class.opacity-0]="!isMouseInside()"
          >drag_indicator</i
        >
        <i
          aria-hidden="true"
          class="material-symbols-outlined size-7"
          >{{ type().materialSymbol }}</i
        >
        {{ type().displayName }}
      </span>
    </core-type-container>
  `,
})
export class TypeOption {
  readonly type = input.required<FieldTypeOption>();

  readonly isMouseInside = signal(false);
}
