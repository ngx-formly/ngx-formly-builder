import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'core-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="flex min-w-0 items-center gap-2">
      <span class="inline-flex shrink-0 items-center">
        <i class="material-symbols-outlined"> search </i>
      </span>
      <div class="relative min-w-0 flex-1">
        <input
          #input
          class="w-full truncate text-sm"
          coreInput
          type="text"
          placeholder="Filter items..."
          [class.pe-10]="value() || showClearWhenEmpty()"
          [(ngModel)]="value"
        />
        @if (value() || showClearWhenEmpty()) {
          <button
            coreButton
            text
            type="button"
            class="absolute end-0.5 top-1/2 size-8 min-h-0 -translate-y-1/2 rounded-sm p-0 text-color focus-visible:outline-offset-0"
            [attr.aria-label]="clearLabel()"
            (click)="clearFilter()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
              aria-hidden="true"
              >clear</i
            >
          </button>
        }
      </div>
    </div>
  `,
})
export class Filter {
  readonly value = model.required<string>();
  readonly clearLabel = input('Clear filter');
  readonly showClearWhenEmpty = input(false);
  clear = output();
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  focus(): void {
    this.input().nativeElement.focus();
  }

  protected clearFilter(): void {
    this.focus();
    this.clear.emit();
  }
}
