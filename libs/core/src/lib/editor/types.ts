import { MenuItem } from 'primeng/api';
import { FieldTypePreset } from '../config/types';

export interface CoreAddFieldOption extends MenuItem {
  items?: CoreAddFieldOption[];
  fieldType?: string;
}

export type LHSPanelType = 'fields' | 'add-field' | 'forms';
export type RHSPanelType = 'field-edit' | 'validation' | 'styling' | 'model';

export enum DropAction {
  COPY = 'copy',
  MOVE = 'move',
}

export interface DragData {
  action: DropAction;
  fieldType: string;
  fieldId: string;
  index?: number;
  preset?: FieldTypePreset;
}

export interface DragOverData {
  fieldId: string;
  clientX: number;
  clientY: number;
}

export type { FieldDropPosition } from '@ngx-formly/builder-state';

export type FormDisplayMode = 'form' | 'preview' | 'json';
