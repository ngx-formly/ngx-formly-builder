/** Builder settings users can change at runtime. Host configuration supplies the defaults. */
export interface BuilderSettings {
  autoSave: boolean;
  /** Milliseconds, a non-negative integer. */
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
    (autoSaveDelay as number) >= 0
  );
}
