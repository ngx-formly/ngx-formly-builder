/** Longer timers overflow a 32-bit integer and fire immediately. */
const MAX_TIMER_DELAY = 2 ** 31 - 1;

/** Builder settings users can change at runtime. Host configuration supplies the defaults. */
export interface BuilderSettings {
  autoSave: boolean;
  /** Milliseconds, an integer from 0 to 2147483647. */
  autoSaveDelay: number;
}

export function isBuilderSettings(value: unknown): value is BuilderSettings {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const { autoSave, autoSaveDelay } = value as Record<string, unknown>;
  return (
    typeof autoSave === 'boolean' &&
    Number.isInteger(autoSaveDelay) &&
    (autoSaveDelay as number) >= 0 &&
    (autoSaveDelay as number) <= MAX_TIMER_DELAY
  );
}
