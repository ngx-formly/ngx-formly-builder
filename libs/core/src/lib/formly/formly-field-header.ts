import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { Menu } from '../ui/menu';
import { MenuItem } from '../ui/menu-item';
import { CoreFieldService } from '../config/core-field.service';
import { CoreFormService } from '../editor/core-form.service';
import { FieldPresetDialogService } from '../field-preset/field-preset-dialog.service';
import { isLayoutRow } from '../state';
import { EditorField, FieldInfo } from '../model/types';
import { Tooltip } from '../shared';

@Component({
  selector: 'core-formly-field-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tooltip, Menu],
  host: {
    class: 'flex justify-between rounded-t-sm bg-primary/20 px-2',
    '[class.cursor-grab]': 'isDraggable()',
    '[class.cursor-pointer]': '!isDraggable()',
  },
  template: `
    <div class="flex min-w-24 items-center gap-1.5 overflow-hidden">
      @if (isDraggable()) {
        <i class="material-symbols-outlined opacity-50">drag_indicator</i>
      }
      @if (fieldIcon(); as icon) {
        <i
          class="material-symbols-outlined text-muted-color"
          tooltipPosition="above"
          [style.fontSize]="'1rem'"
          [coreTooltip]="fieldInfo().name"
        >
          {{ icon }}
        </i>
      }
      <span class="truncate">{{ fieldKey() || fieldInfo().name }} </span>
      @if (fieldInfo().badges; as badges) {
        @for (badge of badges; track badge.label) {
          <span
            class="core-chip"
            tooltipPosition="above"
            [coreTooltip]="badge.description"
            >{{ badge.label }}</span
          >
        }
      }
    </div>
    <div
      class="touch-actions-visible flex items-center gap-2 opacity-0 transition-opacity"
      [class.opacity-100]="areOptionsVisible()"
    >
      @if (addOptions().length) {
        <span class="inline-flex">
          <core-menu
            #addMenu
            [model]="addOptions()"
          />
          <button
            coreButton
            text
            class="size-6"
            aria-label="Add Field"
            coreTooltip="Add Field"
            tooltipPosition="above"
            (click)="openAddMenu($event)"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              add
            </i>
          </button>
        </span>
      }
      @if (replaceOptions().length) {
        <span class="inline-flex">
          <core-menu
            #replaceOptionsMenu
            [model]="replaceOptions()"
          />
          <button
            coreButton
            text
            class="size-6"
            aria-label="Replace Field"
            coreTooltip="Replace Field"
            tooltipPosition="above"
            (click)="openReplaceOptionsMenu($event)"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              swap_horiz
            </i>
          </button>
        </span>
      }
      @if (otherOptions().length) {
        <span class="inline-flex">
          <core-menu
            #otherOptionsMenu
            [model]="otherOptions()"
          >
            <ng-template
              #item
              let-item
            >
              <button
                type="button"
                tabindex="-1"
                class="flex w-full cursor-pointer items-center gap-2 px-3 py-1 text-start"
                [class.text-button-text-danger]="item.warn"
              >
                @if (item.matIcon) {
                  <i class="material-symbols-outlined">
                    {{ item.matIcon }}
                  </i>
                }
                {{ item.label }}
              </button>
            </ng-template>
          </core-menu>
          <button
            coreButton
            text
            class="size-6"
            aria-label="Options"
            coreTooltip="Options"
            tooltipPosition="above"
            (click)="openOtherOptionsMenu($event)"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              more_horiz
            </i>
          </button>
        </span>
      }
    </div>
  `,
})
export class FormlyFieldHeader {
  readonly field = input.required<EditorField>();
  readonly fieldInfo = input.required<FieldInfo>();
  readonly fieldKey = input<string | number | (string | number)[]>();
  readonly isMouseInside = input.required<boolean>();
  readonly addMenuChild = viewChild('addMenu', { read: Menu });
  readonly otherOptionsMenuChild = viewChild('otherOptionsMenu', { read: Menu });
  readonly replaceOptionsMenuChild = viewChild('replaceOptionsMenu', { read: Menu });

  formService = inject(CoreFormService);
  fieldService = inject(CoreFieldService);
  presetDialogService = inject(FieldPresetDialogService);

  readonly savePresetName = signal('');
  readonly savePresetJSON = signal('');
  readonly isSavePresetDialogOpen = signal(false);
  readonly isSavable = computed(() => !this.fieldInfo().isRoot);
  readonly isRemovable = computed(() => !this.fieldInfo().isRoot);
  readonly isDraggable = computed(() => !this.fieldInfo().isRoot);
  readonly fieldIcon = computed(() => {
    return this.fieldService.getFieldIcon(this.field());
  });
  readonly addOptions = computed(() => this.formService.getAddOptions(this.fieldInfo()));
  readonly replaceOptions = computed(() => this.formService.getReplaceOptions(this.fieldInfo()));
  readonly otherOptions = computed(() => {
    const options: MenuItem[] = [];
    const fieldInfo = this.fieldInfo();
    const fieldIndex = this.formService.getFieldIndex(fieldInfo.id);
    const siblingIds = this.siblingIds();
    const parentId = fieldInfo.idPath.at(-2);
    const inRow = !!parentId && isLayoutRow(this.formService.getField(parentId));

    if (fieldIndex > 0) {
      options.push({
        label: inRow ? 'Move left' : 'Move up',
        matIcon: inRow ? 'arrow_back' : 'arrow_upward',
        command: () => this.moveField(-1),
      });
    }
    if (fieldIndex >= 0 && fieldIndex < siblingIds.length - 1) {
      options.push({
        label: inRow ? 'Move right' : 'Move down',
        matIcon: inRow ? 'arrow_forward' : 'arrow_downward',
        command: () => this.moveField(1),
      });
    }

    if (inRow && parentId) {
      options.push(
        {
          label: 'Move above row',
          matIcon: 'arrow_upward',
          command: () => this.formService.dropField(parentId, 'top', { fieldId: fieldInfo.id }),
        },
        {
          label: 'Move below row',
          matIcon: 'arrow_downward',
          command: () => this.formService.dropField(parentId, 'bottom', { fieldId: fieldInfo.id }),
        },
      );
    }

    if (!this.fieldInfo().isRoot) {
      options.push(
        {
          label: 'Save as Preset',
          matIcon: 'save',
          command: () => this.openPresetDialog(),
        },
        {
          label: 'Remove',
          matIcon: 'delete',
          warn: true,
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
  readonly areOptionsVisible = computed(
    () =>
      this.isMouseInside() ||
      this.addMenuChild()?.visible ||
      this.otherOptionsMenuChild()?.visible ||
      this.replaceOptionsMenuChild()?.visible,
  );

  openAddMenu(event: MouseEvent) {
    this.addMenuChild()?.show(event);
    event.preventDefault();
  }

  openOtherOptionsMenu(event: MouseEvent) {
    this.otherOptionsMenuChild()?.show(event);
    event.preventDefault();
  }

  openReplaceOptionsMenu(event: MouseEvent) {
    this.replaceOptionsMenuChild()?.show(event);
    event.preventDefault();
  }

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
