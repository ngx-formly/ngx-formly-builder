import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from '../../ui/panel';
import { ExpressionDialogService } from './expression-dialog.service';
import { beautifyCode, flattenToOneLine } from '../../shared/code-editor-utils';
import { Tooltip } from '../../shared/tooltip';
import { FieldPropertyWrapper } from '../property-wrapper';
import { Expression } from './expressions.types';

@Component({
  selector: 'core-expression-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, FormsModule, Tooltip, FieldPropertyWrapper],
  template: `
    <core-property-panel [header]="'Expression ' + (index() + 1)">
      <ng-template #icons>
        <span class="inline-flex items-center gap-2">
          @if (dialogService) {
            <button
              coreButton
              text
              rounded
              aria-label="Open expression editor"
              coreTooltip="Open expression editor"
              tooltipPosition="left"
              (click)="openEditor()"
            >
              <i
                coreButtonIcon
                class="material-symbols-outlined"
                >code_blocks</i
              >
            </button>
          }
          <button
            coreButton
            text
            rounded
            severity="danger"
            aria-label="Remove expression"
            coreTooltip="Remove expression"
            tooltipPosition="above"
            (click)="remove.emit()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
              >remove</i
            >
          </button>
        </span>
      </ng-template>

      <div class="flex flex-col gap-1">
        <core-field-property-wrapper
          label="Target"
          description="Target model path (e.g. model.myKey)"
          [labelForId]="keyInputId"
        >
          <input
            coreInput
            class="field-property-control"
            type="text"
            placeholder="e.g., model.myKey"
            [id]="keyInputId"
            [ngModel]="key()"
            [ngModelOptions]="{ updateOn: 'blur' }"
            (ngModelChange)="keyChange.emit($event)"
          />
        </core-field-property-wrapper>
        <core-field-property-wrapper
          label="Expression"
          description="JS expression — can use model, formState, field"
          [labelForId]="valueInputId"
        >
          <textarea
            class="field-property-control"
            rows="3"
            coreInput
            placeholder="e.g., model.siblingKey.nested + 68"
            [id]="valueInputId"
            [ngModel]="value()"
            [ngModelOptions]="{ updateOn: 'blur' }"
            (ngModelChange)="valueChange.emit($event)"
          ></textarea>
        </core-field-property-wrapper>
      </div>
    </core-property-panel>
  `,
})
export class ExpressionItem {
  readonly index = input.required<number>();
  readonly key = input<string>();
  readonly value = input<string>();
  keyChange = output<string>();
  valueChange = output<string>();
  expressionChange = output<Expression>();
  remove = output<void>();

  dialogService = inject(ExpressionDialogService);

  keyInputId = `expression-item-key-input-${Math.random().toString(36).substring(2, 15)}`;
  valueInputId = `expression-item-value-input-${Math.random().toString(36).substring(2, 15)}`;

  openEditor(): void {
    if (!this.dialogService) {
      return;
    }

    const beautifiedText = beautifyCode(this.value() || '');
    this.dialogService.open({
      key: this.key() || '',
      value: beautifiedText,
      saveCallback: async (key: string, value: string) => {
        const singleLineText = await flattenToOneLine(value);
        this.expressionChange.emit({ key, value: singleLineText });
      },
    });
  }
}
