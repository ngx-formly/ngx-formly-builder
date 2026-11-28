import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import type { StyleValue, StyleValueList, StyleValues } from '@ngx-formly/builder';
import { STYLE_VALUE_LIST_NAMES } from '../styling-panel/style-values';

/** Rows of value + optional label for each style value list; the parent form saves them. */
@Component({
  selector: 'core-style-values-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (list of lists(); track list.key) {
      <details class="rounded-sm border border-surface-200 p-2 dark:border-surface-700">
        <summary class="cursor-pointer font-medium">
          {{ list.name }} · {{ values()[list.key]!.length }} values
        </summary>
        <div class="mt-2 flex flex-col gap-2">
          @for (entry of values()[list.key]; track $index) {
            <div class="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-2">
              <input
                coreInput
                class="w-full min-w-0"
                placeholder="Value"
                [attr.aria-label]="list.name + ' value ' + ($index + 1)"
                [value]="entry.value"
                [disabled]="disabled()"
                (input)="edit(list.key, $index, { value: field($event) })"
              />
              <input
                coreInput
                class="w-full min-w-0"
                placeholder="Label (optional)"
                [attr.aria-label]="list.name + ' label ' + ($index + 1)"
                [value]="entry.label ?? ''"
                [disabled]="disabled()"
                (input)="edit(list.key, $index, { label: field($event) })"
              />
              <button
                coreButton
                text
                type="button"
                [attr.aria-label]="'Remove ' + list.name + ' value ' + ($index + 1)"
                [disabled]="disabled()"
                (click)="remove(list.key, $index)"
              >
                <i
                  class="material-symbols-outlined"
                  aria-hidden="true"
                  >delete</i
                >
              </button>
            </div>
          } @empty {
            <p class="text-muted-color">No {{ list.name }} values: its options offer no choices.</p>
          }
          <button
            coreButton
            text
            type="button"
            class="self-start"
            [attr.aria-label]="'Add ' + list.name + ' value'"
            [disabled]="disabled()"
            (click)="add(list.key)"
          >
            Add value
          </button>
        </div>
      </details>
    }
  `,
})
export class StyleValuesSettings {
  readonly values = model.required<StyleValues>();
  readonly disabled = input(false);
  protected readonly lists = computed(() =>
    (Object.keys(STYLE_VALUE_LIST_NAMES) as StyleValueList[])
      .filter((key) => this.values()[key])
      .map((key) => ({ key, name: STYLE_VALUE_LIST_NAMES[key] })),
  );

  protected field(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected edit(list: StyleValueList, index: number, change: Partial<StyleValue>): void {
    this.update(list, (entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, ...change } : entry)),
    );
  }

  protected add(list: StyleValueList): void {
    this.update(list, (entries) => [...entries, { value: '' }]);
  }

  protected remove(list: StyleValueList, index: number): void {
    this.update(list, (entries) => entries.filter((_, i) => i !== index));
  }

  private update(list: StyleValueList, change: (entries: StyleValue[]) => StyleValue[]): void {
    this.values.update((values) => ({ ...values, [list]: change(values[list] ?? []) }));
  }
}
