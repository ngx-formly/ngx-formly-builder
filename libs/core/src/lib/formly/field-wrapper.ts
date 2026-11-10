import { CoreFormService } from '../editor/core-form.service';
import { CoreFieldService } from '../config/core-field.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { DndDraggableDirective, DndDropzoneDirective, DndHandleDirective } from 'ngx-drag-drop';
import { DNDService } from '../editor/dnd.service';
import { EditorField, FieldInfo } from '../model/types';
import { DropAction, FieldDropPosition } from '../editor/types';
import { getDropPosition } from '../editor/drop-position';
import { FormlyFieldHeader } from './formly-field-header';
import { FormlyFieldOverlay } from './formly-field-overlay';

@Component({
  selector: 'core-field-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DndDraggableDirective,
    DndDropzoneDirective,
    DndHandleDirective,
    FormlyFieldHeader,
    FormlyFieldOverlay,
  ],
  host: {
    class: 'block',
    '[id]': 'fieldInfo.id',
    '[tabindex]': '0',
    '[attr.aria-label]': "'Field ' + fieldInfo.id",
    '[attr.aria-pressed]': 'isActiveField()',
    '(mouseenter)': 'setMouseEntered()',
    '(mouseleave)': 'setMouseLeft()',
    '(click)': 'onFieldClick($event)',
    '(keydown.enter)': 'onFieldKeydown($event)',
    '(keydown.space)': 'onFieldKeydown($event)',
  },
  template: `
    <div
      dndDropzone
      [class]="'relative rounded-sm border-2 transition-[border-color] ' + this.borderColor()"
      (dndDragover)="onDragover($event)"
      (dndDragleave)="onDragLeave()"
      (dndDrop)="onDrop()"
    >
      <div
        class="h-full w-full"
        dndDraggable
        dndEffectAllowed="move"
        [dndDisableIf]="!isDraggable"
        (dndStart)="onDragStart()"
        (dndEnd)="onDragEnd()"
      >
        <core-formly-field-header
          dndHandle
          [field]="field"
          [fieldInfo]="fieldInfo"
          [fieldKey]="field.key"
          [isMouseInside]="isMouseInside()"
        />

        <div
          class="p-1"
          [class.py-8]="showExpandedDropzone()"
        >
          <ng-template #fieldComponent />
        </div>

        <core-formly-field-overlay
          [canDrop]="canDrop()"
          [hoverPosition]="hoverPosition()"
          [showCenter]="fieldInfo.isParent"
          [showSides]="!fieldInfo.isRoot"
          [style.left.px]="rowIndicator()?.left"
          [style.top.px]="rowIndicator()?.top"
          [style.width.px]="rowIndicator()?.width"
          [style.height.px]="rowIndicator()?.height"
        />
      </div>
    </div>
  `,
})
export class CoreFieldWrapper extends FieldWrapper<EditorField> implements OnInit, OnDestroy {
  formService = inject(CoreFormService);
  fieldService = inject(CoreFieldService);
  // isPreviewMode = inject(CORE_PREVIEW_MODE, { optional: true });
  dndService = inject(DNDService);
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  fieldInfo!: FieldInfo;
  isDraggable!: boolean;

  readonly isActiveField = computed(() => {
    return this.formService.activeFieldId() === this.fieldInfo.id;
  });
  readonly isMouseInside = computed(() => {
    return this.formService.activeMouseInside() === this.fieldInfo.id;
  });

  readonly borderColor = computed(() => {
    if (this.isActiveField()) {
      return 'border-primary/70';
    }
    if (this.isMouseInside()) {
      return 'border-primary/30';
    }
    return 'border-transparent';
  });

  fieldOptions = this.fieldService.activeFieldCategoryOptions;

  readonly boundingRect = computed(() => {
    this.dndService.activeDragData();
    this.dndService.activeDragOverData();
    return this.elementRef.nativeElement.getBoundingClientRect();
  });

  readonly canDrop = computed(() => {
    const activeDragData = this.dndService.activeDragData();
    const position = this.hoverPosition();
    if (!activeDragData || !position) return false;
    return this.formService.canDropField(
      activeDragData.action === DropAction.MOVE ? activeDragData.fieldId : undefined,
      this.fieldInfo.id,
      position,
    );
  });

  readonly showExpandedDropzone = computed(() => {
    const activeDragData = this.dndService.activeDragData();
    if (!activeDragData) return false;

    return (
      this.fieldInfo.isParent &&
      !this.fieldInfo.isRoot &&
      !(!!this.field.fieldGroup?.length || Object.keys(this.field.fieldArray ?? {}).length)
    );
  });

  readonly hoverPosition = computed<FieldDropPosition | null>(() => {
    const activeDragOverData = this.dndService.activeDragOverData();
    if (!activeDragOverData || activeDragOverData.fieldId !== this.fieldInfo.id) {
      return null;
    }

    if (this.fieldInfo.isRoot) return 'center';
    return getDropPosition(
      activeDragOverData.clientX,
      activeDragOverData.clientY,
      this.boundingRect(),
      !!this.fieldInfo.isParent,
    );
  });

  readonly rowIndicator = computed(() => {
    const position = this.hoverPosition();
    if (position !== 'top' && position !== 'bottom') return null;
    const element = this.elementRef.nativeElement;
    const row = element.closest('.formly-builder-row');
    if (!row) return null;
    const bounds = element.getBoundingClientRect();
    const rowBounds = row.getBoundingClientRect();
    return {
      left: rowBounds.left - bounds.left,
      top: rowBounds.top - bounds.top,
      width: rowBounds.width,
      height: rowBounds.height,
    };
  });

  ngOnInit(): void {
    this.fieldInfo = this.formService.getField(this.field._info.id)!._info;
    this.isDraggable = !this.fieldInfo.isRoot;
  }

  ngOnDestroy(): void {
    this.setMouseLeft();
  }

  onDragStart() {
    this.dndService.setActiveDragData({
      action: DropAction.MOVE,
      fieldType: this.field.type as string,
      fieldId: this.fieldInfo.id,
      index: this.formService.getFieldIndex(this.fieldInfo.id),
    });
  }

  onDragover(event: DragEvent) {
    this.dndService.setActiveDragOverData({
      fieldId: this.fieldInfo.id,
      clientX: event.clientX,
      clientY: event.clientY,
    });
    event.preventDefault();
  }

  onDrop() {
    const dragData = this.dndService.activeDragData();
    if (!dragData || !this.canDrop()) {
      return;
    }

    const position = this.hoverPosition();
    if (!position) return;
    this.formService.dropField(
      this.fieldInfo.id,
      position,
      dragData.action === DropAction.COPY
        ? { fieldType: dragData.fieldType, preset: dragData.preset }
        : { fieldId: dragData.fieldId },
    );
    this.onDragEnd();
  }

  onDragLeave() {
    if (this.dndService.activeDragOverData()?.fieldId === this.fieldInfo.id) {
      this.dndService.setActiveDragOverData(null);
    }
  }

  onDragEnd() {
    this.dndService.setActiveDragData(null);
    this.dndService.setActiveDragOverData(null);
  }

  setActiveField() {
    this.formService.setActiveField(this.fieldInfo.id);
  }

  onFieldClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const nearestWrapper = target.closest('core-field-wrapper');
    if (nearestWrapper !== event.currentTarget) {
      return;
    }

    this.setActiveField();
  }

  onFieldKeydown(event: Event) {
    if (
      event.defaultPrevented ||
      this.elementRef.nativeElement.ownerDocument.activeElement !== this.elementRef.nativeElement
    ) {
      return;
    }

    event.preventDefault();
    this.setActiveField();
  }

  setMouseEntered() {
    this.formService.setMouseEnteredField(this.fieldInfo.id);
  }

  setMouseLeft() {
    this.formService.setMouseLeftField(this.fieldInfo.id);
  }
}
