import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'core-name-edit-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus, FormsModule],
  template: `
    <ng-template #popover>
      <div
        class="core-root core-popover"
        role="dialog"
        cdkTrapFocus
        [attr.aria-label]="title()"
        [cdkTrapFocusAutoCapture]="true"
      >
        <div class="flex w-full max-w-72 flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{ title() }}</span>
          </div>
          <input
            type="text"
            coreInput
            [attr.aria-label]="title()"
            [placeholder]="placeholder()"
            [(ngModel)]="value"
            (keydown.enter)="save.emit()"
          />
          <div class="flex w-full items-center justify-end">
            <div class="flex items-center gap-2">
              <button
                type="button"
                coreButton
                severity="secondary"
                variant="outlined"
                size="small"
                (click)="hide()"
              >
                Cancel
              </button>
              <button
                type="button"
                coreButton
                size="small"
                (click)="save.emit()"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class NameEditPopover implements OnDestroy {
  readonly value = model.required<string>();
  readonly title = input.required<string>();
  readonly placeholder = input.required<string>();

  readonly save = output();
  readonly visibleChange = output<boolean>();

  private readonly popover = viewChild.required<TemplateRef<unknown>>('popover');
  private readonly overlay = inject(Overlay);
  private readonly viewContainer = inject(ViewContainerRef);
  private ref?: OverlayRef;

  show(target: HTMLElement) {
    this.hide();
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
    ref.attach(new TemplatePortal(this.popover(), this.viewContainer));
    ref.backdropClick().subscribe(() => this.hide());
    ref.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') this.hide();
    });
    this.visibleChange.emit(true);
  }

  hide() {
    if (!this.ref) return;
    const ref = this.ref;
    this.ref = undefined;
    ref.dispose();
    this.visibleChange.emit(false);
  }
  ngOnDestroy(): void {
    this.hide();
  }
}
