import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { FormlyFormBuilder } from '@ngx-formly/core';
import { isValidationRuleName } from '@ngx-formly/builder-state';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { FieldPropertyWrapper } from '../property-wrapper';

export interface ValidationExpression {
  expression: string;
  message?: string;
}

@Component({
  selector: 'core-validation-expression-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormlyFormBuilder],
  imports: [FormsModule, InputText, Textarea, ButtonDirective, ButtonLabel, FieldPropertyWrapper],
  host: { class: 'flex min-w-0 flex-col gap-3' },
  template: `
    <core-field-property-wrapper
      label="Rule name"
      [labelForId]="id + '-name'"
    >
      <input
        pInputText
        class="field-property-control"
        placeholder="e.g., minimumAge"
        [id]="id + '-name'"
        [disabled]="saving()"
        [(ngModel)]="name"
      />
    </core-field-property-wrapper>
    <core-field-property-wrapper
      label="Valid when"
      [labelForId]="id + '-expression'"
    >
      <textarea
        pTextarea
        class="field-property-control resize-y"
        rows="3"
        placeholder="control.value >= 18"
        [id]="id + '-expression'"
        [attr.aria-describedby]="id + '-help'"
        [disabled]="saving()"
        [(ngModel)]="expression"
      ></textarea>
    </core-field-property-wrapper>
    <p
      class="text-sm"
      [id]="id + '-help'"
    >
      Write a condition that is true for valid values. Use control.value for this field or
      model.fieldKey for another value. Comparisons and &&, ||, ! are supported; function calls are
      not.
    </p>
    <core-field-property-wrapper
      label="Error message"
      [labelForId]="id + '-message'"
    >
      <textarea
        pTextarea
        class="field-property-control resize-y"
        rows="2"
        placeholder="Enter an age of at least 18."
        [id]="id + '-message'"
        [disabled]="saving()"
        [(ngModel)]="message"
      ></textarea>
    </core-field-property-wrapper>
    @if (error()) {
      <p
        role="alert"
        class="text-sm text-red-700 dark:text-red-300"
      >
        {{ error() }}
      </p>
    }
    <div class="flex flex-wrap justify-end gap-2">
      <button
        pButton
        text
        [disabled]="saving()"
        (click)="cancelled.emit()"
      >
        <span pButtonLabel>Cancel</span>
      </button>
      <button
        pButton
        [disabled]="saving()"
        (click)="save()"
      >
        <span pButtonLabel>Save validation</span>
      </button>
    </div>
  `,
})
export class ValidationExpressionEditor {
  readonly originalName = input('');
  readonly rule = input<ValidationExpression>();
  readonly reservedNames = input<string[]>([]);
  readonly saving = input(false);
  readonly saved = output<{ name: string; rule: ValidationExpression }>();
  readonly cancelled = output();

  protected readonly id = `validation-expression-${Math.random().toString(36).slice(2)}`;
  protected readonly name = signal('');
  protected readonly expression = signal('');
  protected readonly message = signal('');
  protected readonly error = signal('');
  private readonly builder = inject(FormlyFormBuilder);

  constructor() {
    effect(() => {
      this.name.set(this.originalName());
      this.expression.set(this.rule()?.expression ?? '');
      this.message.set(this.rule()?.message ?? '');
      this.error.set('');
    });
  }

  protected save(): void {
    if (this.saving()) return;
    const name = this.name().trim();
    const expression = this.expression().trim();
    const message = this.message().trim();
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
      this.error.set(
        'Start the rule name with a letter and use only letters, numbers, or underscores.',
      );
      return;
    }
    if (
      !isValidationRuleName(name) ||
      (name !== this.originalName() && this.reservedNames().includes(name))
    ) {
      this.error.set('This rule name is already used or reserved. Choose another name.');
      return;
    }
    if (!expression || !message) {
      this.error.set('Enter a condition and an error message before saving.');
      return;
    }
    try {
      // Use the same parser as preview and exported forms, without executing JavaScript.
      this.builder.buildForm(
        new FormGroup({}),
        [
          {
            key: 'value',
            validators: { [name]: { expression } },
          },
        ],
        {},
        {},
      );
    } catch {
      this.error.set(
        'This condition is not supported. Use comparisons such as control.value >= 18; function calls and assignments are not allowed.',
      );
      return;
    }
    this.saved.emit({ name, rule: { expression, message } });
  }
}
