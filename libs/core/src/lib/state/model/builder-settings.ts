/** Builder settings users can change at runtime. Host configuration supplies the defaults. */
export interface BuilderSettings {
  autoSave: boolean;
  /** Milliseconds, an integer from 0 to 60000. */
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
    (autoSaveDelay as number) <= 60000
  );
}
