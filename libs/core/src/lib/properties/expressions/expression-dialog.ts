import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogLayout } from '../../ui/dialog';
import { ExpressionDialogService } from './expression-dialog.service';
import { CodeEditor } from '../../shared/code-editor';
import { beautifyCode, flattenToOneLine } from '../../shared/code-editor-utils';
import { Tooltip } from '../../shared/tooltip';

@Component({
  selector: 'core-expression-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, CodeEditor, FormsModule, Tooltip],
  template: `
    <core-dialog
      [style]="{
        width: '800px',
        maxWidth: 'calc(100vw - 32px)',
        height: '600px',
        maxHeight: 'calc(100vh - 32px)',
      }"
      [pt]="dialogPT"
      [visible]="isOpen()"
      (visibleChange)="updateVisibility($event)"
    >
      <ng-template #header>
        <div class="inline-flex items-center justify-center gap-2 text-xl font-semibold">
          <span>Edit expression:</span>

          @if (!editingKey()) {
            <button
              #targetEditButton
              coreButton
              text
              type="button"
              aria-label="Edit expression target"
              (click)="editingKey.set(true)"
            >
              <span class="inline-flex items-center gap-2">
                <span class="ml-2">{{ data()?.key || '<- target ->' }}</span>
                <i class="material-symbols-outlined"> edit </i>
              </span>
            </button>
          } @else {
            <span class="inline-flex gap-2">
              <input
                #nameInput="ngModel"
                #targetInput
                type="text"
                placeholder="e.g., model.myKey"
                coreInput
                aria-label="Expression target"
                [ngModel]="data()?.key || ''"
                (keydown.enter)="setKey(nameInput.value)"
              />
              <button
                coreButton
                text
                rounded
                aria-label="Confirm target"
                coreTooltip="Confirm target"
                tooltipPosition="above"
                [showDelay]="500"
                (click)="setKey(nameInput.value)"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  check
                </i>
              </button>
              <button
                coreButton
                text
                rounded
                severity="danger"
                aria-label="Cancel target edit"
                coreTooltip="Cancel target edit"
                tooltipPosition="above"
                [showDelay]="500"
                (click)="editingKey.set(false)"
              >
                <i
                  coreButtonIcon
                  class="material-symbols-outlined"
                >
                  close
                </i>
              </button>
            </span>
          }
        </div>
      </ng-template>

      @if (isOpen() && data()) {
        <core-code-editor
          [text]="data()?.value || ''"
          [placeholderText]="placeholder"
        />
      }
      <ng-template #footer>
        <span class="inline-flex items-center gap-2">
          <button
            coreButton
            text
            aria-label="Format expression as single line"
            coreTooltip="Single Line"
            tooltipPosition="above"
            (click)="flattenToLine()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              remove
            </i>
            <span
              class="hidden sm:inline"
              coreButtonLabel
              >Single Line</span
            >
          </button>
          <button
            coreButton
            text
            aria-label="Beautify expression"
            coreTooltip="Beautify expression"
            tooltipPosition="above"
            (click)="beautify()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              wand_stars
            </i>
            <span
              class="hidden sm:inline"
              coreButtonLabel
              >Beautify</span
            >
          </button>
          <button
            coreButton
            text
            aria-label="Add function block"
            coreTooltip="Add function block"
            tooltipPosition="above"
            (click)="addFunctionBlock()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              code
            </i>
            <span
              class="hidden sm:inline"
              coreButtonLabel
              >Add Function Block</span
            >
          </button>
        </span>
        <button
          coreButton
          (click)="save()"
        >
          <i
            coreButtonIcon
            class="material-symbols-outlined"
          >
            save
          </i>
          <span coreButtonLabel>Save</span>
        </button>
      </ng-template>
    </core-dialog>
  `,
})
export class ExpressionDialog {
  readonly editingKey = signal(false);
  private readonly targetInput = viewChild<ElementRef<HTMLInputElement>>('targetInput');
  private readonly targetEditButton = viewChild<ElementRef<HTMLButtonElement>>('targetEditButton');
  constructor() {
    let wasEditing = false;
    effect(() => {
      const editing = this.editingKey();
      if (editing) this.targetInput()?.nativeElement.focus();
      else if (wasEditing) this.targetEditButton()?.nativeElement.focus();
      wasEditing = editing;
    });
  }

  readonly codeEditor = viewChild(CodeEditor);

  dialogService = inject(ExpressionDialogService);

  isOpen = this.dialogService.isOpen;
  data = this.dialogService.data;
  dialogPT: DialogLayout = {
    header: {
      style: { height: '5rem' },
    },
    content: {
      style: { height: 'calc(100% - 10rem)', overflow: 'hidden' },
    },
    footer: {
      style: { height: '5rem', alignItems: 'center', justifyContent: 'space-between' },
    },
  };
  placeholder = `// Set the target using a javascript expression.

// Available variables:
// model: The current model object
// formState: The current form state
// field: The current field configuration

// Example:
// model.age >= 18; // sets the target to true if age is 18 or older

// You can also use a self executing function for a multi-line expression:
(() => {
  console.log('Evaluating expression with', model);
  const age = model.age || 0;
  return age >= 18;
})();
  `;

  setKey(newKey: string) {
    this.dialogService.setKey(newKey);
    this.editingKey.set(false);
  }

  beautify() {
    this.dialogService.setValue(beautifyCode(this.getEditorValue()));
  }

  async flattenToLine() {
    this.dialogService.setValue(await flattenToOneLine(this.getEditorValue()));
  }

  addFunctionBlock() {
    const block = `(() => {
  const bar = 'World';
  return 'Hello ' + (model?.foo || bar);
})()`;
    this.dialogService.setValue(this.getEditorValue() + block);
  }

  save() {
    const key = this.data()?.key || '';
    const value = this.getEditorValue();
    this.data()?.saveCallback(key, value);
    this.dialogService.close();
  }

  updateVisibility(visible: boolean) {
    if (!visible) {
      this.dialogService.close();
    }
  }

  protected getEditorValue(): string {
    return this.codeEditor()?.getValue() || '';
  }
}
