import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-action-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <button
      coreButton
      class="w-full justify-start p-4 text-left"
      type="button"
      [attr.text]="text()"
      (click)="activated.emit()"
    >
      <i
        coreButtonIcon
        class="material-symbols-outlined"
        >{{ icon() }}</i
      >
      <span class="flex flex-col items-start gap-1">
        <span
          coreButtonLabel
          class="text-base"
          >{{ label() }}</span
        >
        <span class="font-normal">{{ description() }}</span>
      </span>
    </button>
  `,
})
export class ActionButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input.required<string>();
  readonly text = input(false, { transform: booleanAttribute });
  readonly activated = output<void>();
}
