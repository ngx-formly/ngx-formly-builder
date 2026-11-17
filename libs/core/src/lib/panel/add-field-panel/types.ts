import { MenuItem } from '../../ui/menu-item';

export interface AddFieldAction extends MenuItem {
  icon: string;
  parentId?: string;
  index?: number;
}

export interface AddFieldActionInput {
  label: string;
  icon: string;
  parentId?: string;
  index?: number;
}
