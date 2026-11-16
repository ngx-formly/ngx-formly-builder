import { FormlyFieldConfig } from '@ngx-formly/core';
import { EditorField, EditorForm } from '../model/types';

export type FieldDropPosition = 'left' | 'right' | 'top' | 'bottom' | 'center';

// Standard utilities keep exported rows usable without a custom Formly type.
const ROW_CLASSES =
  'formly-builder-row flex flex-col gap-4 md:flex-row [&>formly-field]:min-w-0 [&>formly-field]:flex-1';

export function isLayoutRow(field: FormlyFieldConfig | undefined): boolean {
  return !!(
    field &&
    field.key == null &&
    field.type === 'formly-group' &&
    field.fieldGroupClassName?.split(/\s+/).includes('formly-builder-row')
  );
}

function parentId(field: EditorField): string | undefined {
  return field._info.idPath.at(-2);
}

function childIds(form: EditorForm, id?: string): string[] {
  return id ? form.fieldMap[id]._info.childIds : form.rootFieldIds;
}

function updateFieldPath(form: EditorForm, fieldId: string, path: string[]): void {
  const field = form.fieldMap[fieldId];
  field._info.idPath = [...path, fieldId];
  field._info.childIds.forEach((id) => updateFieldPath(form, id, field._info.idPath));
}

/** Only discard empty generated rows; a remaining field keeps its full row and original styles. */
export function removeEmptyRows(form: EditorForm): void {
  for (const field of Object.values(form.fieldMap)) {
    if (!isLayoutRow(field) || field._info.childIds.length) continue;
    const siblings = childIds(form, parentId(field));
    siblings.splice(siblings.indexOf(field._info.id), 1);
    delete form.fieldMap[field._info.id];
    removeEmptyRows(form);
    return;
  }
}

export function canDropField(
  form: EditorForm,
  sourceId: string | undefined,
  targetId: string,
  position: FieldDropPosition,
): boolean {
  const target = form.fieldMap[targetId];
  const source = sourceId ? form.fieldMap[sourceId] : undefined;
  if (!target || (sourceId && !source) || target._info.idPath.includes(sourceId ?? '')) {
    return false;
  }
  if (position === 'center') {
    // A repeater has one template; dropping into it must not overwrite that template.
    if (!target._info.isParent || (target._info.isFieldArray && target._info.childIds.length)) {
      return false;
    }
  } else if (form.fieldMap[parentId(target) ?? '']?._info.isFieldArray) {
    return false;
  }
  if (!source) return true;

  // Layout changes must not move values into another object or repeater item.
  const modelScope = (path: string[]) =>
    path.filter((id) => {
      const field = form.fieldMap[id];
      return field.key != null || field._info.isFieldArray;
    });
  const sourceScope = modelScope(source._info.idPath.slice(0, -1));
  const targetScope = modelScope(
    position === 'center' ? target._info.idPath : target._info.idPath.slice(0, -1),
  );
  return (
    sourceScope.length === targetScope.length &&
    sourceScope.every((id, index) => id === targetScope[index])
  );
}

/** Mutates a draft after canDropField has validated the destination. */
export function placeField(
  form: EditorForm,
  sourceId: string,
  targetId: string,
  position: FieldDropPosition,
  rowId: string,
): void {
  const source = form.fieldMap[sourceId];
  let target = form.fieldMap[targetId];
  const sourceSiblings = childIds(form, parentId(source));
  const sourceIndex = sourceSiblings.indexOf(sourceId);
  if (sourceIndex !== -1) sourceSiblings.splice(sourceIndex, 1);

  let destinationId = parentId(target);
  if (position === 'center') {
    destinationId = targetId;
    childIds(form, destinationId).push(sourceId);
  } else if (position === 'left' || position === 'right') {
    if (isLayoutRow(target)) {
      destinationId = targetId;
    } else if (!isLayoutRow(form.fieldMap[destinationId ?? ''])) {
      const siblings = childIds(form, destinationId);
      siblings.splice(siblings.indexOf(targetId), 1, rowId);
      form.fieldMap[rowId] = {
        type: 'formly-group',
        className: 'col-span-full min-w-0',
        fieldGroupClassName: ROW_CLASSES,
        _info: {
          id: rowId,
          name: 'Row',
          formId: form.id,
          idPath: [...target._info.idPath.slice(0, -1), rowId],
          childIds: [targetId],
          isParent: true,
        },
      };
      updateFieldPath(form, targetId, form.fieldMap[rowId]._info.idPath);
      destinationId = rowId;
    }
    const siblings = childIds(form, destinationId);
    const index = isLayoutRow(target)
      ? position === 'left'
        ? 0
        : siblings.length
      : siblings.indexOf(targetId) + (position === 'right' ? 1 : 0);
    siblings.splice(index, 0, sourceId);
  } else {
    if (isLayoutRow(form.fieldMap[destinationId ?? ''])) {
      target = form.fieldMap[destinationId!];
      destinationId = parentId(target);
    }
    const siblings = childIds(form, destinationId);
    siblings.splice(
      siblings.indexOf(target._info.id) + (position === 'bottom' ? 1 : 0),
      0,
      sourceId,
    );
  }

  updateFieldPath(form, sourceId, destinationId ? form.fieldMap[destinationId]._info.idPath : []);
  removeEmptyRows(form);
}
