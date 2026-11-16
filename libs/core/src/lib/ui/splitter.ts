import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  ElementRef,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'core-splitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'block h-full min-h-0' },
  template: `
    <div
      #layout
      class="core-splitter"
    >
      @for (panel of panels(); track $index) {
        <div
          class="core-splitter-panel"
          [style.flex-basis.%]="sizes()[$index]"
        >
          <ng-container [ngTemplateOutlet]="panel" />
        </div>
        @if (!$last) {
          <div
            class="core-splitter-handle"
            role="separator"
            tabindex="0"
            aria-orientation="vertical"
            [attr.aria-label]="'Resize panel ' + ($index + 1)"
            [attr.aria-valuenow]="sizes()[$index]"
            [attr.aria-valuemin]="minimum($index)"
            [attr.aria-valuemax]="sizes()[$index] + sizes()[$index + 1] - minimum($index + 1)"
            (pointerdown)="start($event, $index)"
            (pointermove)="move($event)"
            (pointerup)="finish()"
            (pointercancel)="finish()"
            (keydown)="resizeWithKeyboard($event, $index)"
          ></div>
        }
      }
    </div>
  `,
})
export class Splitter {
  readonly panelSizes = input.required<number[]>();
  readonly minSizes = input<number[]>([]);
  readonly stateKey = input.required<string>();
  protected readonly panels = contentChildren<TemplateRef<unknown>>('panel');
  protected readonly sizes = signal<number[]>([]);
  private readonly layout = viewChild.required<ElementRef<HTMLElement>>('layout');
  private drag?: { index: number; start: number; sizes: number[] };

  constructor() {
    effect(() => {
      const fallback = this.panelSizes();
      let sizes = fallback;
      try {
        const stored = JSON.parse(localStorage.getItem(this.stateKey()) || 'null')?.panelSizes;
        if (
          Array.isArray(stored) &&
          stored.length === fallback.length &&
          stored.every(
            (size: unknown) => typeof size === 'number' && Number.isFinite(size) && size > 0,
          ) &&
          Math.abs(stored.reduce((sum: number, size: number) => sum + size, 0) - 100) < 0.01
        )
          sizes = stored;
      } catch {
        /* Storage may be unavailable or contain an invalid saved layout. */
      }
      this.sizes.set([...sizes]);
    });
  }

  protected minimum(index: number): number {
    return this.minSizes()[index] ?? 10;
  }

  protected start(event: PointerEvent, index: number): void {
    if (event.button !== 0) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = { index, start: event.clientX, sizes: [...this.sizes()] };
    event.preventDefault();
  }

  protected move(event: PointerEvent): void {
    if (!this.drag) return;
    const width = this.layout().nativeElement.clientWidth;
    if (width > 0)
      this.resize(
        this.drag.index,
        ((event.clientX - this.drag.start) / width) * 100,
        this.drag.sizes,
      );
  }

  protected finish(): void {
    this.drag = undefined;
    this.persist();
  }

  protected resizeWithKeyboard(event: KeyboardEvent, index: number): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const delta =
      event.key === 'Home' ? -100 : event.key === 'End' ? 100 : event.key === 'ArrowLeft' ? -2 : 2;
    this.resize(index, delta, this.sizes());
    this.persist();
  }

  private resize(index: number, delta: number, initial: number[]): void {
    const total = initial[index] + initial[index + 1];
    const left = Math.max(
      this.minimum(index),
      Math.min(total - this.minimum(index + 1), initial[index] + delta),
    );
    const sizes = [...initial];
    sizes[index] = left;
    sizes[index + 1] = total - left;
    this.sizes.set(sizes);
  }

  private persist(): void {
    try {
      localStorage.setItem(this.stateKey(), JSON.stringify({ panelSizes: this.sizes() }));
    } catch {
      /* Resizing still works when browser storage is unavailable. */
    }
  }
}
