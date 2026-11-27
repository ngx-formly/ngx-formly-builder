import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { Menu } from '../ui/menu';
import { MenuItem } from '../ui/menu-item';
import { CoreFieldService } from '../config/core-field.service';
import { CoreFormService } from '../editor/core-form.service';
import { FieldPresetDialogService } from '../field-preset/field-preset-dialog.service';
import { isLayoutRow } from '@ngx-formly/builder';
import { EditorField, FieldInfo } from '../model/types';
import { Tooltip } from '../shared';

@Component({
  selector: 'core-formly-field-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tooltip, Menu],
  host: {
    class:
      'absolute end-0 bottom-full z-10 flex max-w-full items-center gap-1 rounded-t-sm bg-highlight ps-1.5 text-sm text-highlight-color',
    '[class]': 'isMouseInside() || menu()?.visible ? "" : "pointer-events-none opacity-0"',
  },
  template: `
    <div class="flex min-w-0 items-center gap-1">
      @if (!fieldInfo().isRoot) {
        <i
          class="material-symbols-outlined"
          aria-hidden="true"
          >drag_indicator</i
        >
      }
      @if (fieldIcon(); as icon) {
        <i
          class="material-symbols-outlined"
          tooltipPosition="above"
          [style.fontSize]="'1rem'"
          [coreTooltip]="fieldInfo().name"
          [attr.aria-label]="fieldInfo().name"
          >{{ icon }}</i
        >
      }
      <span class="truncate">{{ fieldLabel() }}</span>
    </div>
    @if (menuOptions().length) {
      <core-menu
        #optionsMenu
        [model]="menuOptions()"
      />
      <button
        type="button"
        coreButton
        text
        class="size-7 min-h-0 shrink-0 p-0 pointer-coarse:w-[44px]"
        aria-label="Options"
        aria-haspopup="menu"
        [attr.aria-expanded]="optionsMenu.visible"
        (click)="optionsMenu.show($event)"
      >
        <i
          coreButtonIcon
          class="material-symbols-outlined"
          aria-hidden="true"
          >more_horiz</i
        >
      </button>
    }
  `,
})
export class FormlyFieldHeader {
  readonly field = input.required<EditorField>();
  readonly fieldInfo = input.required<FieldInfo>();
  readonly fieldLabel = input.required<string>();
  readonly isMouseInside = input.required<boolean>();
  readonly menu = viewChild(Menu);

  formService = inject(CoreFormService);
  fieldService = inject(CoreFieldService);
  presetDialogService = inject(FieldPresetDialogService);

  readonly fieldIcon = computed(() => this.fieldService.getFieldIcon(this.field()));
  readonly menuOptions = computed(() => {
    const options: MenuItem[] = [];
    const fieldInfo = this.fieldInfo();
    const addOptions = this.formService.getAddOptions(fieldInfo);
    const replaceOptions = this.formService.getReplaceOptions(fieldInfo);
    if (addOptions.length) {
      options.push({ label: 'Add Field', icon: 'add', items: addOptions });
    }
    if (replaceOptions.length) {
      options.push({ label: 'Replace Field', icon: 'swap_horiz', items: replaceOptions });
    }

    const fieldIndex = this.formService.getFieldIndex(fieldInfo.id);
    const siblingIds = this.siblingIds();
    const parentId = fieldInfo.idPath.at(-2);
    const inRow = !!parentId && isLayoutRow(this.formService.getField(parentId));

    if (fieldIndex > 0) {
      options.push({
        label: inRow ? 'Move left' : 'Move up',
        icon: inRow ? 'arrow_back' : 'arrow_upward',
        command: () => this.moveField(-1),
      });
    }
    if (fieldIndex >= 0 && fieldIndex < siblingIds.length - 1) {
      options.push({
        label: inRow ? 'Move right' : 'Move down',
        icon: inRow ? 'arrow_forward' : 'arrow_downward',
        command: () => this.moveField(1),
      });
    }

    if (inRow && parentId) {
      options.push(
        {
          label: 'Move above row',
          icon: 'arrow_upward',
          command: () => this.formService.dropField(parentId, 'top', { fieldId: fieldInfo.id }),
        },
        {
          label: 'Move below row',
          icon: 'arrow_downward',
          command: () => this.formService.dropField(parentId, 'bottom', { fieldId: fieldInfo.id }),
        },
      );
    }

    if (!fieldInfo.isRoot) {
      options.push(
        {
          label: 'Save as Preset',
          icon: 'save',
          command: () => this.openPresetDialog(),
        },
        {
          label: 'Remove',
          icon: 'delete',
          styleClass: 'text-button-text-danger',
          command: () => this.removeField(),
        },
      );
    }

    return options;
  });
  readonly siblingIds = computed(() => {
    const parentId = this.fieldInfo().idPath[this.fieldInfo().idPath.length - 2];
    if (!parentId) {
      return this.formService.activeRootFieldIds();
    }

    const parent = this.formService.getField(parentId);
    return parent ? this.fieldService.getChildIds(parent._info) : [];
  });

  openPresetDialog() {
    const fieldMap = this.formService.activeFieldMap();
    const field = this.formService.buildField(this.fieldInfo().id, fieldMap);
    this.formService.cleanField(field);
    const fieldJSON = JSON.stringify(field, null, 2);

    this.presetDialogService.open({
      name: `My ${this.fieldInfo().name}`,
      json: fieldJSON,
    });
  }

  removeField() {
    this.formService.removeField(this.fieldInfo().id);
  }

  moveField(direction: -1 | 1): void {
    const fieldInfo = this.fieldInfo();
    const fieldIndex = this.formService.getFieldIndex(fieldInfo.id);
    if (fieldIndex < 0) {
      return;
    }

    const parentId = fieldInfo.idPath[fieldInfo.idPath.length - 2];
    const targetIndex = direction === -1 ? fieldIndex - 1 : fieldIndex + 2;
    this.formService.moveField(fieldInfo.id, fieldIndex, targetIndex, parentId);
  }
}
