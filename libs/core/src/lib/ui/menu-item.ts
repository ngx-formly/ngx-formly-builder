export interface MenuItem {
  label?: string;
  icon?: string;
  matIcon?: string;
  warn?: boolean;
  items?: MenuItem[];
  disabled?: boolean;
  visible?: boolean;
  separator?: boolean;
  styleClass?: string;
  command?: (event: { item?: MenuItem }) => void;
}
