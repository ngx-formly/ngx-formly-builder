import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldDropPosition } from '../editor/types';

@Component({
  selector: 'core-formly-field-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'absolute inset-0 pointer-events-none touch-none z-20',
    'aria-hidden': 'true',
    '[attr.data-drop-position]': 'canDrop() ? hoverPosition() : null',
  },
  template: `
    @if (canDrop()) {
      @if (showSides() && hoverPosition() !== 'center') {
        <div
          class="absolute rounded-full bg-primary"
          [class]="positionClasses[hoverPosition() ?? 'center']"
        ></div>
      }
      @if (showCenter() && hoverPosition() === 'center') {
        <div
          class="absolute inset-0 flex items-center justify-center rounded-sm border-2 border-dashed border-primary bg-primary/10"
        >
          <span class="rounded bg-primary px-2 py-1 text-sm text-primary-contrast"
            >Drop inside</span
          >
        </div>
      }
    }
  `,
})
export class FormlyFieldOverlay {
  readonly positionClasses: Record<FieldDropPosition, string> = {
    top: 'inset-x-0 -top-1 h-1',
    bottom: 'inset-x-0 -bottom-1 h-1',
    left: 'inset-y-0 -left-1 w-1',
    right: 'inset-y-0 -right-1 w-1',
    center: '',
  };
  readonly canDrop = input.required({ transform: booleanAttribute });
  readonly hoverPosition = input.required<FieldDropPosition | null>();
  readonly showCenter = input(false, { transform: booleanAttribute });
  readonly showSides = input(false, { transform: booleanAttribute });
}
