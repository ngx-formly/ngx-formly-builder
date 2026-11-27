import type { StyleValue, StyleValues } from '@ngx-formly/builder';
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
