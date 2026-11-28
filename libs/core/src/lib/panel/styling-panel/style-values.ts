import type { StyleValue, StyleValueList, StyleValues } from '@ngx-formly/builder';
import { StyleOptionCategory, StyleOptionConfig, StylesConfig } from './types';

/** The styles config with the variants of tagged options replaced by the given lists. */
export function applyStyleValues(styles: StylesConfig, values: StyleValues): StylesConfig {
  if (!Object.keys(values).length) {
    return styles;
  }

  const apply = (categories: StyleOptionCategory[]) =>
    categories.map((category) => ({
      ...category,
      options: category.options.map((option) => {
        const list = option.valueList && values[option.valueList];
        return list ? withValues(option, list) : option;
      }),
    }));

  return {
    ...styles,
    className: apply(styles.className),
    fieldGroupClassName: apply(styles.fieldGroupClassName),
  };
}

/** The values each list offers before users change it, read from its first tagged option. */
export function defaultStyleValues(styles: StylesConfig): StyleValues {
  const values: StyleValues = {};
  for (const category of [...styles.className, ...styles.fieldGroupClassName]) {
    for (const { valueList, variants, variantLabels } of category.options) {
      if (valueList && !values[valueList]) {
        values[valueList] = variants.map((value) => {
          const label = variantLabels?.[value];
          return label === undefined ? { value } : { value, label };
        });
      }
    }
  }

  return values;
}

function withValues(option: StyleOptionConfig, list: StyleValue[]): StyleOptionConfig {
  return {
    ...option,
    variants: list.map((entry) => entry.value),
    variantLabels: Object.fromEntries(
      // An empty label would show a blank choice: the value is shown instead.
      list.flatMap((entry) => (entry.label ? [[entry.value, entry.label]] : [])),
    ),
  };
}

export const STYLE_VALUE_LIST_NAMES: Record<StyleValueList, string> = {
  height: 'Height',
  width: 'Width',
  margin: 'Margin',
  padding: 'Padding',
};

/** Trimmed values without empty labels, or the first problem found, for users to fix. */
export function cleanStyleValues(values: StyleValues): StyleValues | string {
  const clean: StyleValues = {};
  for (const [list, entries] of Object.entries(values) as [StyleValueList, StyleValue[]][]) {
    const name = STYLE_VALUE_LIST_NAMES[list];
    const seen = new Set<string>();
    clean[list] = [];
    for (const entry of entries) {
      const value = entry.value.trim();
      const label = entry.label?.trim();
      if (!value) {
        return `${name}: enter a value in every row.`;
      }

      if (!/^[^\s:]+$/.test(value)) {
        return `${name}: "${value}" cannot contain spaces or ":".`;
      }

      if (seen.has(value)) {
        return `${name}: "${value}" is listed twice.`;
      }

      seen.add(value);
      clean[list].push(label ? { value, label } : { value });
    }
  }

  return clean;
}
