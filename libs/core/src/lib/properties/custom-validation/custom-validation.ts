import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormlyConfig } from '@ngx-formly/core';
import { CoreFormService } from '../../editor/core-form.service';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { get } from 'lodash-es';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Panel, PanelPassThrough } from 'primeng/panel';
import { Empty } from '../../empty/empty';
import { CustomValidation, CustomValidationPropertyConfig } from './custom-validation.config';
import { BaseProperty } from '../base.directive';
import { PropertyType } from '../types';
import { getChildPath } from '../utils';
import { Tooltip } from '../../shared/tooltip';
import { CustomValidationItem } from './custom-validation-item';
import { ValidationExpression, ValidationExpressionEditor } from './validation-expression-editor';

@Component({
  selector: 'core-field-custom-validation-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    ButtonIcon,
    Menu,
    Panel,
    CustomValidationItem,
    Empty,
    Tooltip,
    ValidationExpressionEditor,
  ],
  template: `
    <p-panel
      toggler="header"
      [pt]="panelPT"
      [toggleable]="true"
      [(collapsed)]="isCollapsed"
    >
      <ng-template #header>
        <span
          class="p-panel-title"
          tooltipPosition="left"
          [coreTooltip]="property().description"
        >
          {{ property().label }}
          {{ '[' + (childProperties().length + expressionRules().length) + ']' }}
        </span>
      </ng-template>
      <ng-template #icons>
        <p-menu
          #addMenu
          appendTo="body"
          ariaLabel="Add validation"
          [model]="addMenuItems()"
          [popup]="true"
        >
          <ng-template
            #item
            let-item
          >
            <div class="flex cursor-pointer items-center gap-2 px-3 py-2">
              @if (item.icon) {
                <i
                  class="material-symbols-outlined"
                  aria-hidden="true"
                  >{{ item.icon }}</i
                >
              }
              {{ item.label }}
            </div>
          </ng-template>
        </p-menu>
        <button
          class="mr-2"
          pButton
          text
          rounded
          aria-label="Add custom validation"
          aria-haspopup="menu"
          coreTooltip="Add custom validation"
          tooltipPosition="top"
          [attr.aria-expanded]="!!addMenu.visible"
          [disabled]="!addMenuItems().length || editingName() !== null"
          (click)="$event.stopPropagation(); isCollapsed.set(false); addMenu.toggle($event)"
        >
          <i
            pButtonIcon
            class="material-symbols-outlined"
            aria-hidden="true"
            >add</i
          >
        </button>
      </ng-template>
      <ng-template #headericons>
        <i class="material-symbols-outlined">{{ isCollapsed() ? 'expand_more' : 'expand_less' }}</i>
      </ng-template>
      @for (customValidation of childProperties(); track $index) {
        <core-custom-validation-item
          [validationOptions]="property().validationOptions"
          [path]="getChildPath(path(), $index)"
          [name]="customValidation.name"
          [target]="target()"
          (remove)="onRemoveChild($index)"
          (targetChanged)="targetChanged.emit($event)"
        />
      }
      @for (entry of expressionRules(); track entry.name) {
        <p-panel [header]="entry.name">
          <ng-template #icons>
            <button
              pButton
              text
              rounded
              coreTooltip="Edit validation"
              [attr.aria-label]="'Edit validation ' + entry.name"
              (click)="editingName.set(entry.name)"
            >
              <i
                pButtonIcon
                class="material-symbols-outlined"
                >edit</i
              >
            </button>
            <button
              pButton
              text
              rounded
              severity="danger"
              coreTooltip="Remove validation"
              [attr.aria-label]="'Remove validation ' + entry.name"
              (click)="removeExpression(entry.name)"
            >
              <i
                pButtonIcon
                class="material-symbols-outlined"
                >remove</i
              >
            </button>
          </ng-template>
          @if (editingName() === entry.name) {
            <core-validation-expression-editor
              [originalName]="entry.name"
              [rule]="entry.rule"
              [reservedNames]="reservedNames()"
              (saved)="saveExpression(entry.name, $event)"
              (cancelled)="editingName.set(null)"
            />
          } @else {
            <p class="font-mono text-sm break-words">{{ entry.rule.expression }}</p>
            <p class="mt-2 text-sm break-words">{{ entry.rule.message }}</p>
          }
        </p-panel>
      }
      @if (editingName() === '') {
        <core-validation-expression-editor
          [reservedNames]="reservedNames()"
          (saved)="saveExpression('', $event)"
          (cancelled)="editingName.set(null)"
        />
      }
      @if (!childProperties().length && !expressionRules().length && editingName() === null) {
        <core-empty
          label="No custom validations"
          [description]="
            isSynchronous()
              ? 'Click + to choose a validation or create your own.'
              : 'Click the + button to add a custom validation.'
          "
        />
      }
    </p-panel>
  `,
})
export class FieldCustomValidationProperty extends BaseProperty<
  CustomValidationPropertyConfig,
  (string | CustomValidation)[]
> {
  panelPT: PanelPassThrough = {
    header: {
      class: 'cursor-pointer',
    },
  };

  protected defaultValue = [];
  protected propertyType = PropertyType.CUSTOM_VALIDATION;

  readonly isCollapsed = signal(true);
  private readonly forms = inject(CoreFormService, { optional: true });
  private readonly formlyConfig = inject(FormlyConfig, { optional: true });
  readonly availableWorkspaceValidations = computed(() =>
    this.isSynchronous() && !this.forms?.validationsLoadError()
      ? (this.forms?.validations() ?? []).filter(
          (rule) => !this.reservedNames().includes(rule.name),
        )
      : [],
  );
  readonly editingName = signal<string | null>(null);
  private readonly fieldId = computed(() => get(this.target(), ['_info', 'id']));
  readonly isSynchronous = computed(() => this.property().key === 'validators.validation');
  private readonly validators = computed<Record<string, unknown>>(
    () => get(this.target(), ['validators']) ?? {},
  );
  readonly expressionRules = computed(() =>
    this.isSynchronous()
      ? Object.entries(this.validators()).flatMap(([name, rule]) =>
          name !== 'validation' &&
          rule &&
          typeof rule === 'object' &&
          'expression' in rule &&
          typeof rule.expression === 'string'
            ? [{ name, rule: rule as ValidationExpression }]
            : [],
        )
      : [],
  );
  readonly reservedNames = computed(() => [
    ...Object.keys(this.formlyConfig?.validators ?? {}),
    ...Object.keys(this.validators()),
    ...Object.keys(get(this.target(), ['asyncValidators']) ?? {}),
    ...(
      get(this.target(), ['asyncValidators', 'validation'], []) as (string | CustomValidation)[]
    ).map((rule) => (typeof rule === 'string' ? rule : rule.name)),
    ...this.property().validationOptions.map(({ value }) => value),
    ...this.childProperties().map(({ name }) => name),
  ]);
  readonly childProperties = computed(() =>
    this.currentValue().map((item) => (typeof item === 'string' ? { name: item } : item)),
  );

  readonly availableOptions = computed(() => {
    const selected = [
      ...this.childProperties().map(({ name }) => name),
      ...this.expressionRules().map(({ name }) => name),
    ];
    return this.property().validationOptions.filter(({ value }) => !selected.includes(value));
  });
  readonly addMenuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = this.availableOptions().map(({ label, value }) => ({
      label,
      command: () => this.addValidation(value),
    }));
    if (this.isSynchronous()) {
      items.push(
        ...this.availableWorkspaceValidations().map((rule) => ({
          label: rule.name,
          icon: 'rule',
          command: () => this.addWorkspaceValidation(rule.id),
        })),
      );
      items.push({
        label: 'Create validation',
        icon: 'add',
        command: () => this.editingName.set(''),
      });
    }
    return items;
  });

  getChildPath = getChildPath;

  constructor() {
    super();
    effect(() => {
      this.fieldId();
      this.editingName.set(null);
    });
  }

  addValidation(name: string): void {
    if (!this.availableOptions().some(({ value }) => value === name)) return;
    this._modifyValue([...this.currentValue(), { name }]);
  }

  addWorkspaceValidation(id: string): void {
    const rule = this.availableWorkspaceValidations().find((entry) => entry.id === id);
    if (!rule) return;
    this.saveExpression('', {
      name: rule.name,
      rule: { expression: rule.expression, message: rule.message },
    });
  }

  onRemoveChild(index: number): void {
    const newValue = this.currentValue().filter((_, i) => i !== index);
    this._modifyValue(newValue);
  }

  saveExpression(
    originalName: string,
    { name, rule }: { name: string; rule: ValidationExpression },
  ): void {
    const validators = { ...this.validators() };
    const original = originalName ? validators[originalName] : undefined;
    if (originalName) delete validators[originalName];
    validators[name] = { ...(original && typeof original === 'object' ? original : {}), ...rule };
    this._modifyValue(validators, ['validators']);
    this.editingName.set(null);
  }

  removeExpression(name: string): void {
    this._clear(['validators', name]);
    if (this.editingName() === name) this.editingName.set(null);
  }

  protected override _isValidProperty(x: unknown): x is CustomValidationPropertyConfig {
    return (
      this._isBaseProperty(x) && 'validationOptions' in x && Array.isArray(x.validationOptions)
    );
  }
}
