import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { MouseInsideService } from '../editor/mouse-inside.service';

@Component({
  selector: 'core-tree-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon],
  host: {
    class: 'group/tree-item relative flex items-center rounded-lg transition-colors select-none',
    '[class.py-2]': 'iconTile()',
    '[class.py-1.5]': '!iconTile()',
    '[class.bg-primary/20]': 'isActive()',
    '[class.bg-content-hover-background]': '!isActive() && alwaysShowActions()',
    '[class.hover:bg-content-hover-background]': '!isActive() && canInteract()',
    '[class.cursor-pointer]': 'canInteract()',
    '[tabindex]': 'isTabRoot() ? 0 : -1',
    '(mouseenter)': 'isMouseInside.set(true)',
    '(mouseleave)': 'isMouseInside.set(false)',
  },
  template: `
    <span
      class="pointer-events-none absolute inline-flex h-full pl-1"
      [class.opacity-100]="isMouseInsideRoot()"
      [class.opacity-0]="!isMouseInsideRoot()"
    >
      @for (lineIndex of lines(); track $index) {
        <span
          class="inline-block h-full w-0 border-r border-primary/20"
          [style.paddingLeft]="linePaddingLeft"
        ></span>
      }
    </span>

    @if (selectionLabel()) {
      <button
        pButton
        type="button"
        text
        class="touch-actions-visible absolute inset-y-0 z-10 rounded-l-lg opacity-0 group-focus-within/tree-item:opacity-100"
        [class.w-14]="iconTile()"
        [class.w-10]="!iconTile()"
        [style.left]="'calc(var(--spacing) * 4 * ' + level() + ')'"
        [class.opacity-100]="isMouseInside() || isSelected()"
        [attr.aria-label]="selectionLabel()"
        [attr.aria-pressed]="isSelected()"
        [disabled]="selectionDisabled()"
        (click)="$event.preventDefault(); $event.stopPropagation(); selectionToggled.emit()"
      >
        <i
          pButtonIcon
          class="material-symbols-outlined"
          aria-hidden="true"
        >
          {{ isSelected() ? 'check_box' : 'check_box_outline_blank' }}
        </i>
      </button>
    }

    <div
      class="flex min-w-0 grow items-center justify-between gap-2 pr-1"
      [style.paddingLeft]="paddingLeft()"
    >
      <div
        class="flex min-w-0 items-center overflow-hidden"
        [class.gap-3]="iconTile()"
        [class.gap-2]="!iconTile()"
      >
        @if (selectionLabel()) {
          <span
            class="pointer-events-none flex shrink-0 items-center justify-center"
            aria-hidden="true"
            [class]="iconTile() ? 'size-12 rounded-xl border border-surface bg-emphasis' : 'w-8'"
          >
            <span
              class="tree-item-icon flex group-focus-within/tree-item:invisible"
              [class.invisible]="isMouseInside() || isSelected()"
            >
              <ng-content select="[itemIcon]" />
            </span>
          </span>
        }
        @if (isParent() || !selectionLabel()) {
          <button
            pButton
            text
            class="size-8 shrink-0"
            rounded
            aria-label="Toggle children"
            [class.invisible]="!isParent()"
            [class.disabled]="!isParent()"
            (click)="toggleClicked.emit($event)"
          >
            <i
              pButtonIcon
              class="material-symbols-outlined"
              style="font-size: 24px;"
              [class.rotate-90]="isExpanded()"
            >
              chevron_right
            </i>
          </button>
        }
        <ng-content />
      </div>

      <span
        class="touch-actions-visible inline-flex shrink-0 gap-2 opacity-0 focus-within:opacity-100"
        [class.opacity-100]="isMouseInside() || alwaysShowActions()"
      >
        <ng-content select="[actions]" />
      </span>
    </div>
  `,
  styles: `
    @media (hover: none), (pointer: coarse) {
      .tree-item-icon {
        visibility: hidden;
      }
    }
  `,
})
export class TreeItem {
  readonly level = input(0, { transform: numberAttribute });
  readonly isTabRoot = input(false, { transform: booleanAttribute });
  readonly isExpanded = input(false, { transform: booleanAttribute });
  readonly isParent = input(false, { transform: booleanAttribute });
  readonly isActive = input(false, { transform: booleanAttribute });
  readonly canInteract = input(true, { transform: booleanAttribute });
  readonly alwaysShowActions = input(false, { transform: booleanAttribute });
  readonly selectionLabel = input('');
  readonly iconTile = input(false, { transform: booleanAttribute });
  readonly isSelected = input(false);
  readonly selectionDisabled = input(false);

  toggleClicked = output<MouseEvent>();
  selectionToggled = output<void>();

  protected mouseInsideService = inject(MouseInsideService);

  isMouseInsideRoot = this.mouseInsideService.isMouseInside;
  linePaddingLeft = `calc(var(--spacing) * 3.75)`;

  readonly isMouseInside = signal(false);
  readonly lines = computed(() => Array.from({ length: this.level() }, (_, i) => i));
  readonly paddingLeft = computed(
    () => `calc(((var(--spacing) * 4) * ${this.level()}) + var(--spacing))`,
  );
}
