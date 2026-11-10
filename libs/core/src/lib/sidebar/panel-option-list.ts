import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { Divider } from 'primeng/divider';
import { CoreFormService } from '../editor/core-form.service';
import { PanelOptionConfig } from '../panel';
import { PanelOption } from './panel-option';

@Component({
  selector: 'core-panel-option-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Divider, PanelOption],
  host: {
    class: 'flex',
  },
  template: `
    @if (position() === 'right') {
      <p-divider
        class="h-full"
        layout="vertical"
      />
    }
    <ul>
      @for (option of options(); track option.value) {
        <li>
          @if (!$first && option.value === 'field-edit') {
            <div
              class="px-3 py-2"
              aria-hidden="true"
            >
              <p-divider />
            </div>
          }
          <core-panel-option
            [matIcon]="option.matIcon"
            [label]="option.label"
            [value]="option.value"
            [isActive]="option.value === value()"
            [disabled]="option.value !== 'forms' && !activeFormId()"
            [position]="position()"
            (selected)="selectOption(option.value)"
          />
        </li>
      }
    </ul>
    @if (position() === 'left') {
      <p-divider
        class="h-full"
        layout="vertical"
      />
    }
  `,
})
export class PanelOptionList {
  protected readonly activeFormId = inject(CoreFormService).activeFormId;

  readonly options = input.required<PanelOptionConfig[]>();
  readonly position = input.required<'left' | 'right'>();
  readonly value = model.required<string>();
  readonly selected = output<string>();

  selectOption(value: string): void {
    this.value.set(value);
    this.selected.emit(value);
  }
}
