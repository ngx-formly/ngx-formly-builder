import { MenuItem } from './menu-item';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger, MENU_STACK, MenuStack } from '@angular/cdk/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  DestroyRef,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'core-menu-items',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, NgTemplateOutlet],
  template: `
    <div
      cdkMenu
      class="core-root core-menu"
      [attr.aria-label]="label() || null"
      (closed)="root() && closed.emit()"
    >
      @for (item of items(); track $index) {
        @if (item.visible !== false) {
          @if (item.separator) {
            <hr role="separator" />
          } @else {
            <button
              cdkMenuItem
              type="button"
              [cdkMenuItemDisabled]="!!item.disabled"
              [cdkMenuTriggerFor]="item.items?.length ? children : null"
              [class]="item.styleClass"
              [attr.aria-label]="item.label"
              (cdkMenuItemTriggered)="activate(item)"
            >
              @if (itemTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{ $implicit: item }"
                />
              } @else {
                @if (item.icon) {
                  <i
                    class="material-symbols-outlined"
                    aria-hidden="true"
                    >{{ item.icon }}</i
                  >
                }
                <span>{{ item.label }}</span>
              }
              @if (item.items?.length) {
                <i
                  class="material-symbols-outlined ml-auto"
                  aria-hidden="true"
                  >chevron_right</i
                >
              }
            </button>
            <ng-template #children>
              <core-menu-items
                [items]="item.items || []"
                [itemTemplate]="itemTemplate()"
                (closed)="closed.emit()"
              />
            </ng-template>
          }
        }
      }
    </div>
  `,
})
export class MenuItems implements AfterViewInit {
  readonly root = input(false);
  readonly label = input('');
  private readonly destroyRef = inject(DestroyRef);
  private readonly menu = viewChild.required(CdkMenu);
  ngAfterViewInit(): void {
    if (this.root()) {
      // This root opens through Overlay rather than CdkMenuTrigger.
      this.menu().menuStack.push(this.menu());
      this.menu().focusFirstItem();
      this.menu()
        .menuStack.emptied.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.closed.emit());
    }
  }
  readonly items = input<MenuItem[]>([]);
  readonly itemTemplate = input<TemplateRef<unknown>>();
  readonly closed = output<void>();

  activate(item: MenuItem): void {
    if (!item.items?.length && !item.disabled) {
      item.command?.({ item });
      this.closed.emit();
    }
  }
}

@Component({
  selector: 'core-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MENU_STACK, useFactory: () => new MenuStack() }],
  imports: [MenuItems],
  template: `<ng-template #body
    ><core-menu-items
      [root]="true"
      [label]="ariaLabel()"
      [items]="model()"
      [itemTemplate]="itemTemplate()"
      (closed)="hide()"
  /></ng-template>`,
})
export class Menu implements OnDestroy {
  readonly model = input<MenuItem[]>([]);
  readonly ariaLabel = input('');
  readonly opened = output<void>();
  readonly dismissed = output<void>();
  protected readonly itemTemplate = contentChild<TemplateRef<unknown>>('item');
  private readonly body = viewChild.required<TemplateRef<unknown>>('body');
  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly open = signal(false);
  private ref?: OverlayRef;
  private trigger?: HTMLElement;

  get visible(): boolean {
    return this.open();
  }
  set visible(value: boolean) {
    this.open.set(value);
  }

  toggle(event: Event): void {
    if (this.visible) this.hide();
    else this.show(event);
  }
  show(event: Event): void {
    this.hide();
    const target = event.currentTarget || event.target;
    if (!(target instanceof HTMLElement)) return;
    this.trigger = target;
    const ref = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(target)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
        ])
        .withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    this.ref = ref;
    ref.attach(new TemplatePortal(this.body(), this.viewContainer));
    this.open.set(true);
    this.opened.emit();
    ref.backdropClick().subscribe(() => this.hide());
    ref.keydownEvents().subscribe((key) => {
      if (key.key === 'Escape') this.hide();
    });
  }
  hide(): void {
    if (!this.ref) return;
    const ref = this.ref;
    this.ref = undefined;
    ref.dispose();
    this.open.set(false);
    this.dismissed.emit();
    this.trigger?.focus();
  }
  ngOnDestroy(): void {
    this.hide();
  }
}
