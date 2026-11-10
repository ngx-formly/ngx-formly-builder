import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Filter } from '../../shared/filter';
import { Tooltip } from '../../shared/tooltip';

@Component({
  selector: 'core-workspace-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ButtonIcon, ButtonLabel, Filter, Tooltip],
  host: { class: 'flex shrink-0 items-center gap-1 px-4 pt-1' },
  template: `
    <div class="@container relative flex min-w-0 flex-1 items-center justify-between gap-1">
      <div
        class="flex min-w-0"
        [class.invisible]="searchOpen()"
      >
        <ng-content />
      </div>
      @if (canSearch()) {
        <button
          #searchButton
          pButton
          type="button"
          class="shrink-0"
          severity="secondary"
          text
          tooltipPosition="top"
          [attr.aria-label]="searchLabel()"
          [coreTooltip]="searchLabel()"
          [class.invisible]="searchOpen()"
          (click)="setSearchOpen(true)"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            aria-hidden="true"
            >search</i
          >
        </button>
      }
      @if (searchOpen()) {
        <core-filter
          class="absolute inset-x-0"
          clearLabel="Close search"
          [(value)]="filterValue"
          (clear)="setSearchOpen(false)"
        />
      }
    </div>
    <button
      pButton
      type="button"
      class="shrink-0 px-2"
      text
      tooltipPosition="top"
      [severity]="deleteDisabled() ? 'secondary' : 'danger'"
      [coreTooltip]="deleteLabel()"
      [attr.aria-label]="deleteLabel() + ' (' + selectedCount() + ')'"
      [disabled]="deleteDisabled()"
      (click)="deleteSelected.emit()"
    >
      <i
        pButtonIcon
        class="material-symbols-outlined"
        aria-hidden="true"
        >delete</i
      >
      <span
        pButtonLabel
        class="tabular-nums"
        >{{ selectedCount() }}</span
      >
    </button>
  `,
})
export class WorkspaceToolbar {
  readonly canSearch = input.required<boolean>();
  readonly searchLabel = input.required<string>();
  readonly deleteLabel = input.required<string>();
  readonly selectedCount = input.required<number>();
  readonly deleteUnavailable = input(false);
  readonly filterValue = model.required<string>();
  readonly deleteSelected = output();

  protected readonly searchOpen = signal(false);
  protected readonly deleteDisabled = computed(
    () => !this.selectedCount() || this.deleteUnavailable(),
  );
  private readonly injector = inject(Injector);
  private readonly filter = viewChild(Filter);
  private readonly searchButton = viewChild<ElementRef<HTMLButtonElement>>('searchButton');
  private readonly createButton = contentChild<ElementRef<HTMLButtonElement>>('createButton');

  protected setSearchOpen(open: boolean): void {
    this.searchOpen.set(open);
    if (!open) this.filterValue.set('');

    afterNextRender(
      {
        write: () => {
          if (open) {
            this.filter()?.focus();
          } else {
            (this.searchButton() ?? this.createButton())?.nativeElement.focus();
          }
        },
      },
      { injector: this.injector },
    );
  }
}
