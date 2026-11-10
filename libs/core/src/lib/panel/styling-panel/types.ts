import { InjectionToken } from '@angular/core';

export enum ClassType {
  CLASS_NAME = 'className',
  FIELD_GROUP_CLASS_NAME = 'fieldGroupClassName',
}

export enum BreakpointAffix {
  PREFIX = 'prefix',
  INFIX = 'infix',
  SUFFIX = 'suffix',
}

export interface StyleDependency {
  type: ClassType;
  value: string;
}

export interface StyleOptionConfig {
  name: string;
  /** Explains the option without changing its generated classes. */
  description?: string;
  value?: string;
  variants: string[];
  /** Display labels keyed by variant; omitted labels fall back to the variant. */
  variantLabels?: Record<string, string>;
  hasBreakpoints?: boolean;
  spanWidth?: boolean;
  dependsOn?: StyleDependency;
  dependsOnParent?: StyleDependency;
}

export interface StylesConfig {
  /** Name displayed in Builder settings. */
  label?: string;
  breakpointAffix: BreakpointAffix;
  breakpoints: Breakpoint[];
  className: StyleOptionCategory[];
  fieldGroupClassName: StyleOptionCategory[];
}

export interface StyleOptionCategory {
  name: string;
  options: StyleOptionConfig[];
}

export interface Breakpoint {
  name: string;
  description: string;
  value: string;
}

export const CORE_STYLES_CONFIG = new InjectionToken<StylesConfig>('CORE_STYLES_CONFIG ');
