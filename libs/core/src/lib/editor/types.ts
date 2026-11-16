import { MenuItem } from '../ui/menu-item';
import { FieldTypePreset } from '../config/types';

export interface CoreAddFieldOption extends MenuItem {
  items?: CoreAddFieldOption[];
  fieldType?: string;
}

export type LHSPanelType = 'fields' | 'add-field' | 'forms' | 'settings';
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

export type { FieldDropPosition } from '../state';

export type FormDisplayMode = 'form' | 'preview' | 'json';
