import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { get } from 'lodash-es';
import { Panel } from '../../ui/panel';
import { MatTabsModule } from '@angular/material/tabs';
import { CoreFieldService } from '../../config/core-field.service';
import { CoreFormService } from '../../editor/core-form.service';
import { EmptyNoFieldSelected } from '../../empty';
import { EditorField } from '../../model/types';
import { createChipsProperty } from '../../properties';
import { FieldChipsProperty } from '../../properties/chips/chips';
import { PropertyChange } from '../../properties/types';
import { PanelHeader } from '../../shared/panel-header';
import { StylingClassType } from './styling-class-type';
import {
  Breakpoint,
  ClassType,
  CORE_STYLES_CONFIG,
  StyleOptionCategory,
  StyleOptionConfig,
} from './types';
import { hasClass } from './utils';

@Component({
  selector: 'core-styling-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule,
    FormsModule,
    StylingClassType,
    EmptyNoFieldSelected,
    PanelHeader,
    FieldChipsProperty,
    Panel,
  ],
  template: `
    <core-panel-header
      header="Styling"
      subHeader="Edit responsive classes for the selected field"
    />
    @if (activeField()) {
      <mat-tab-group
        class="core-tabs min-h-0 flex-1"
        animationDuration="0ms"
        [preserveContent]="true"
        [selectedIndex]="['self', 'children'].indexOf(activeTab())"
        (selectedTabChange)="activeTab.set($event.index === 0 ? 'self' : 'children')"
        ><mat-tab
          ><ng-template mat-tab-label>
            <i class="material-symbols-outlined">person</i>
            <span>Self</span>
          </ng-template>
          <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <core-styling-class-type
              [classType]="typeOfClassType.CLASS_NAME"
              [classNameMap]="classNameMap()"
              [fieldGroupClassNameMap]="fieldGroupClassNameMap()"
              (fieldChange)="onFieldChanged($event)"
            />
            @if (activeField(); as field) {
              <core-property-panel header="CSS Class Names">
                <core-field-chips-property
                  [property]="classNameProperty"
                  [path]="classNamePath"
                  [target]="field"
                  (targetChanged)="onFieldChanged($event)"
                />
              </core-property-panel>
            }</div></mat-tab
        ><mat-tab [disabled]="!isParent()"
          ><ng-template mat-tab-label>
            <i class="material-symbols-outlined">groups</i>
            <span>Children</span>
          </ng-template>
          <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
            <core-styling-class-type
              [classType]="typeOfClassType.FIELD_GROUP_CLASS_NAME"
              [classNameMap]="classNameMap()"
              [fieldGroupClassNameMap]="fieldGroupClassNameMap()"
              (fieldChange)="onFieldChanged($event)"
            />
            @if (activeField(); as field) {
              <core-property-panel header="CSS Class Names">
                <core-field-chips-property
                  [property]="fieldGroupClassNameProperty"
                  [path]="fieldGroupClassNamePath"
                  [target]="field"
                  (targetChanged)="onFieldChanged($event)"
                />
              </core-property-panel>
            }</div></mat-tab
      ></mat-tab-group>
    } @else {
      <core-empty-no-field-selected />
    }
  `,
})
export class StylingPanel {
  fieldChange = output<PropertyChange>();

  typeOfClassType: typeof ClassType = ClassType;
  readonly activeTab = signal<'self' | 'children'>('self');

  readonly isParent = computed(() => !!this.activeField()?._info.isParent);
  readonly classNameMap = computed(() => {
    const activeField = this.activeField();
    if (!activeField) {
      return {};
    }

    const parentField = this.parentField();
    return this.getBreakpointCategoryEntries(ClassType.CLASS_NAME, activeField, parentField);
  });
  readonly fieldGroupClassNameMap = computed(() => {
    const activeField = this.activeField();
    if (!activeField) {
      return {};
    }

    const parentField = this.parentField();
    return this.getBreakpointCategoryEntries(
      ClassType.FIELD_GROUP_CLASS_NAME,
      activeField,
      parentField,
    );
  });

  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);
  protected stylesConfig = inject(CORE_STYLES_CONFIG);

  protected classNamePath = this.fieldService.classNamePath;
  protected fieldGroupClassNamePath = this.fieldService.fieldGroupClassNamePath;
  protected activeField = this.formService.activeField;
  protected readonly parentField = computed(() => {
    const field = this.activeField();
    if (!field) {
      return null;
    }
    const parentId = field._info.idPath[field._info.idPath.length - 2];
    return parentId ? this.formService.activeFieldMap()[parentId] : null;
  });

  classNameProperty = createChipsProperty({
    label: 'Classes',
    key: this.classNamePath.join('.'),
    description: 'CSS class names applied to this field.',
    outputString: {
      separator: ' ',
    },
  });

  fieldGroupClassNameProperty = createChipsProperty({
    label: 'Group Classes',
    key: this.fieldGroupClassNamePath.join('.'),
    description: `CSS class names applied to this field's group container.`,
    outputString: {
      separator: ' ',
    },
  });

  constructor() {
    // Reset to 'self' tab if field is not a parent
    effect(() => {
      if (!this.isParent()) {
        this.activeTab.set('self');
      }
    });
  }

  onFieldChanged(change: PropertyChange): void {
    this.formService.modifyActiveField(change);
  }

  protected getBreakpointCategoryEntries(
    classType: ClassType,
    activeField: EditorField,
    parentField: EditorField | null,
  ): Record<string, StyleOptionCategory[]> {
    const categories = this.formService.styles()[classType];
    const entries = this.stylesConfig.breakpoints.map((breakpoint) => {
      const breakpointCategories = categories.map((category) => ({
        ...category,
        // Filter options based on whether they can be shown for the current breakpoint
        options: category.options.filter((option) =>
          this.canShowOption(option, breakpoint, activeField, parentField),
        ),
      }));

      return [breakpoint.value, breakpointCategories];
    });

    return Object.fromEntries(entries);
  }

  protected canShowOption(
    option: StyleOptionConfig,
    breakpoint: Breakpoint,
    activeField: EditorField,
    parentField: EditorField | null,
  ): boolean {
    if (breakpoint.value && !option.hasBreakpoints) {
      return false;
    }

    // Hide option if active field doesn't have required class
    if (option.dependsOn) {
      const { type, value } = option.dependsOn;
      const classValue = this.getClassValue(activeField, type);
      if (!hasClass(classValue, value)) {
        return false;
      }
    }

    // Hide option if parent field doesn't have required class
    if (option.dependsOnParent) {
      const { type, value } = option.dependsOnParent;
      const classValue = this.getClassValue(parentField, type);
      if (!hasClass(classValue, value)) {
        return false;
      }
    }

    return true;
  }

  protected getClassValue(field: EditorField | null, classType: ClassType) {
    const classPath =
      classType === ClassType.CLASS_NAME ? this.classNamePath : this.fieldGroupClassNamePath;
    return field ? ((get(field, classPath) as string | null | undefined) ?? '') : '';
  }
}
