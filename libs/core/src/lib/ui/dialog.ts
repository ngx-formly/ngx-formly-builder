import { Dialog as CdkDialog, DialogRef } from '@angular/cdk/dialog';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  effect,
  inject,
  Injector,
  input,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';

interface DialogPart {
  class?: string;
  style?: Record<string, string | number>;
}
export interface DialogLayout {
  header?: DialogPart;
  content?: DialogPart;
  footer?: DialogPart;
}

/** Declarative host for the editor's existing dialog services. CDK owns focus and dismissal. */
@Component({
  selector: 'core-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #body>
      <section
        class="core-root core-dialog"
        [style]="style()"
      >
        <header
          class="core-dialog-header"
          [class]="pt().header?.class"
          [style]="pt().header?.style"
        >
          <div [id]="titleId">
            @if (headerTemplate(); as title) {
              <ng-container
                [ngTemplateOutlet]="title"
                [ngTemplateOutletContext]="{ ariaLabelledBy: titleId + '-text' }"
              />
            } @else {
              <h2>{{ header() }}</h2>
            }
          </div>
          <button
            coreButton
            text
            rounded
            type="button"
            aria-label="Close"
            [disabled]="!closable()"
            (click)="close()"
          >
            <i
              class="material-symbols-outlined"
              aria-hidden="true"
              >close</i
            >
          </button>
        </header>
        <div
          class="core-dialog-content"
          [class]="pt().content?.class"
          [style]="pt().content?.style"
        >
          <ng-content />
        </div>
        @if (footerTemplate(); as footer) {
          <footer
            class="core-dialog-footer"
            [class]="pt().footer?.class"
            [style]="pt().footer?.style"
          >
            <ng-container [ngTemplateOutlet]="footer" />
          </footer>
        }
      </section>
    </ng-template>
  `,
})
export class Dialog implements OnDestroy {
  readonly visible = input(false, { transform: booleanAttribute });
  readonly header = input('');
  readonly focusOnShow = input(true, { transform: booleanAttribute });
  readonly style = input<Record<string, string | number>>({});
  readonly pt = input<DialogLayout>({});
  readonly closable = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly visibleChange = output<boolean>();
  readonly opened = output<void>();
  readonly role = input<'dialog' | 'complementary'>('dialog');
  protected readonly headerTemplate = contentChild<TemplateRef<unknown>>('header');
  protected readonly footerTemplate = contentChild<TemplateRef<unknown>>('footer');
  protected readonly titleId = `core-dialog-${crypto.randomUUID()}`;
  private readonly body = viewChild<TemplateRef<unknown>>('body');
  private readonly dialogs = inject(CdkDialog);
  private readonly injector = inject(Injector);
  private ref?: DialogRef;

  constructor() {
    effect(() => {
      const body = this.body();
      if (this.visible() && body && !this.ref) {
        const ref = this.dialogs.open(body, {
          ariaLabel: this.header() || undefined,
          ariaLabelledBy: this.header() ? undefined : this.titleId,
          closeOnNavigation: false,
          disableClose: true,
          autoFocus: this.focusOnShow() ? 'first-tabbable' : 'dialog',
          panelClass:
            this.role() === 'complementary' ? 'core-drawer-overlay' : 'core-dialog-overlay',
        });
        this.ref = ref;
        if (this.role() === 'complementary')
          ref.overlayRef.overlayElement.setAttribute('role', 'complementary');
        ref.closed.subscribe(() => {
          this.ref = undefined;
          this.visibleChange.emit(false);
        });
        ref.keydownEvents.subscribe((event) => {
          if (
            event.key === 'Escape' &&
            !hasModifierKey(event) &&
            this.closable() &&
            this.closeOnEscape()
          ) {
            event.preventDefault();
            ref.close();
          }
        });
        // Only the navigation drawer dismisses on an outside click; editors can hold unsaved work.
        ref.backdropClick.subscribe(() => {
          if (this.role() === 'complementary' && this.closable()) ref.close();
        });
        afterNextRender(() => this.opened.emit(), { injector: this.injector });
      } else if (!this.visible()) {
        this.ref?.close();
      }
    });
  }

  close(): void {
    this.ref?.close();
  }
  ngOnDestroy(): void {
    this.ref?.close();
  }
}
