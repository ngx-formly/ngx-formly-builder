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
      <input
        #input
        class="w-full truncate text-sm"
        coreInput
        type="text"
        placeholder="Filter items..."
        [(ngModel)]="value"
      />
      <span class="inline-flex shrink-0 items-center">
        <button
          coreButton
          severity="secondary"
          [attr.aria-label]="clearLabel()"
          (click)="clear.emit()"
        >
          <i
            coreButtonIcon
            class="material-symbols-outlined"
          >
            clear
          </i>
        </button>
      </span>
    </div>
  `,
})
export class Filter {
  readonly value = model.required<string>();
  readonly clearLabel = input('Clear filter');
  clear = output();
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  focus(): void {
    this.input().nativeElement.focus();
  }
}
