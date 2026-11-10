import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { CoreFormService } from '../../editor/core-form.service';

@Component({
  selector: 'core-form-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    @if (forms.activeFormId(); as formId) {
      @if (edit()?.formId === formId) {
        <input
          #focusTarget
          #nameInput
          type="text"
          aria-label="Form name"
          class="block w-48 max-w-full rounded border border-primary bg-content-background px-1 text-lg font-medium focus-visible:outline-2 focus-visible:outline-primary"
          [value]="edit()?.name ?? ''"
          (blur)="finishEdit(nameInput.value)"
          (keydown)="handleKeydown($event, nameInput.value)"
        />
      } @else {
        <button
          #focusTarget
          type="button"
          class="block max-w-full cursor-pointer truncate rounded px-1 text-lg font-medium hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          [attr.aria-label]="'Rename form: ' + forms.activeFormName()"
          [title]="forms.activeFormName() ?? ''"
          (click)="startEdit(formId)"
        >
          {{ forms.activeFormName() }}
        </button>
      }
    }
  `,
})
export class FormTitle {
  protected readonly forms = inject(CoreFormService);
  protected readonly edit = signal<{ formId: string; name: string } | null>(null);
  private readonly injector = inject(Injector);
  private readonly focusTarget = viewChild<ElementRef<HTMLElement>>('focusTarget');

  protected startEdit(formId: string): void {
    this.edit.set({ formId, name: this.forms.activeFormName() ?? '' });
    this.focusAfterRender();
  }

  protected handleKeydown(event: KeyboardEvent, name: string): void {
    if (event.isComposing) return;
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      this.finishEdit(event.key === 'Enter' ? name : null, true);
    }
  }

  protected finishEdit(name: string | null, restoreFocus = false): void {
    const edit = this.edit();
    this.edit.set(null);

    if (edit && name?.trim() && name !== edit.name) {
      this.forms.setWorkspaceNodeName(edit.formId, name);
    }
    if (restoreFocus) this.focusAfterRender();
  }

  private focusAfterRender(): void {
    afterNextRender(
      { write: () => this.focusTarget()?.nativeElement.focus() },
      { injector: this.injector },
    );
  }
}
