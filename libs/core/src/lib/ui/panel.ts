import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  model,
  TemplateRef,
} from '@angular/core';

export interface PanelLayout {
  content?: { class?: string; style?: Record<string, string | number> };
  header?: { class?: string; style?: Record<string, string | number> };
}

@Component({
  selector: 'core-property-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'core-property-panel' },
  template: `
    <div
      class="core-property-panel-header"
      [class]="pt().header?.class"
      [style]="pt().header?.style"
    >
      @if (toggleable()) {
        <button
          class="core-property-panel-toggle"
          type="button"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="contentId"
          (click)="collapsed.set(!collapsed())"
        >
          <span [id]="contentId + '-title'"><ng-container [ngTemplateOutlet]="title" /></span>
          <i
            class="material-symbols-outlined"
            aria-hidden="true"
            >{{ collapsed() ? 'expand_more' : 'expand_less' }}</i
          >
        </button>
      } @else {
        <div class="font-semibold">
          <span [id]="contentId + '-title'"><ng-container [ngTemplateOutlet]="title" /></span>
        </div>
      }
      <ng-container [ngTemplateOutlet]="actions() || null" />
    </div>
    <div
      class="core-property-panel-content"
      role="region"
      [class]="pt().content?.class"
      [style]="pt().content?.style"
      [attr.aria-labelledby]="contentId + '-title'"
      [id]="contentId"
      [hidden]="toggleable() && collapsed()"
    >
      <ng-content />
    </div>
    <ng-template #title>
      @if (headerTemplate(); as template) {
        <ng-container [ngTemplateOutlet]="template" />
      } @else {
        {{ header() }}
      }
    </ng-template>
  `,
})
export class Panel {
  readonly header = input('');
  readonly toggleable = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly pt = input<PanelLayout>({});
  protected readonly headerTemplate = contentChild<TemplateRef<unknown>>('header');
  protected readonly actions = contentChild<TemplateRef<unknown>>('icons');
  protected readonly contentId = `core-panel-${crypto.randomUUID()}`;
}
