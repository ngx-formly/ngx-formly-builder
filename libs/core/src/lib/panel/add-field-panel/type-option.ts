import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTypeOption } from '../../config/types';
import { TypeContainer } from './type-option-container';

@Component({
  selector: 'core-add-field-type-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeContainer],
  host: {
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <core-type-container
      [fieldType]="type().name"
      [showActions]="isMouseInside()"
    >
      <span class="flex min-w-0 flex-1 items-center gap-3">
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-surface bg-emphasis"
        >
          <i
            aria-hidden="true"
            class="material-symbols-outlined pointer-events-none"
            [class.opacity-30]="isMouseInside()"
            >{{ isMouseInside() ? 'drag_indicator' : type().materialSymbol }}</i
          >
        </span>
        <span class="min-w-0 [overflow-wrap:anywhere]">
          <span class="block leading-snug font-semibold">{{ type().displayName }}</span>
          @if (type().description) {
            <span class="mt-1 block text-sm leading-snug text-muted-color">
              {{ type().description }}
            </span>
          }
        </span>
      </span>
    </core-type-container>
  `,
})
export class TypeOption {
  readonly type = input.required<FieldTypeOption>();

  readonly isMouseInside = signal(false);
}
