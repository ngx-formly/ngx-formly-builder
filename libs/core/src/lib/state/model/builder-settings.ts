/** Longer timers overflow a 32-bit integer and fire immediately. */
const MAX_TIMER_DELAY = 2 ** 31 - 1;

const STYLE_VALUE_LISTS = ['height', 'width', 'margin', 'padding'] as const;

/** One CSS class suffix offered by a style option, such as `4` in `m-4`. */
export interface StyleValue {
  /** Non-empty, without whitespace or `:`, unique within its list. */
  value: string;
  /** Shown instead of the value when set. */
  label?: string;
}

export type StyleValueList = (typeof STYLE_VALUE_LISTS)[number];

/** Values offered per category. A missing list keeps the values of the styles config. */
export type StyleValues = Partial<Record<StyleValueList, StyleValue[]>>;

/** Builder settings users can change at runtime. Host configuration supplies the defaults. */
export interface BuilderSettings {
  autoSave: boolean;
  /** Milliseconds, an integer from 0 to 2147483647. */
  autoSaveDelay: number;
  styleValues?: StyleValues;
}

export function isBuilderSettings(value: unknown): value is BuilderSettings {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const settings = value as Record<string, unknown>;
  const { autoSave, autoSaveDelay } = settings;
  return (
    typeof autoSave === 'boolean' &&
    Number.isInteger(autoSaveDelay) &&
    (autoSaveDelay as number) >= 0 &&
    (autoSaveDelay as number) <= MAX_TIMER_DELAY &&
    (settings['styleValues'] === undefined || isStyleValues(settings['styleValues']))
  );
}

export function isStyleValues(value: unknown): value is StyleValues {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  // Lists from newer builder versions are ignored, like unknown settings.
  return STYLE_VALUE_LISTS.every((list) => {
    const entries = (value as Record<string, unknown>)[list];
    return entries === undefined || isStyleValueList(entries);
  });
}

function isStyleValueList(entries: unknown): entries is StyleValue[] {
  if (!Array.isArray(entries)) {
    return false;
  }

  const values = new Set<string>();
  // Array.from turns holes into undefined entries, which `every` would skip.
  return Array.from(entries).every((entry: unknown) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const { value, label } = entry as Record<string, unknown>;
    if (typeof value !== 'string' || !/^[^\s:]+$/.test(value) || values.has(value)) {
      return false;
    }

    values.add(value);
    return label === undefined || typeof label === 'string';
  });
}
