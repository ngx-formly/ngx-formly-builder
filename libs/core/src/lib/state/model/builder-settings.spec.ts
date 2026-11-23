import { describe, expect, it } from 'vitest';
import { isBuilderSettings } from './builder-settings';

describe('isBuilderSettings', () => {
  it.each([
    { autoSave: true, autoSaveDelay: 3000 },
    { autoSave: false, autoSaveDelay: 0 },
    { autoSave: true, autoSaveDelay: 60000 },
    // Files from newer builder versions may carry settings this version does not know.
    { autoSave: true, autoSaveDelay: 1, styles: {} },
  ])('accepts %o', (value) => expect(isBuilderSettings(value)).toBe(true));

  it.each([
    null,
    {},
    { autoSave: 'yes', autoSaveDelay: 1 },
    { autoSave: true, autoSaveDelay: -1 },
    { autoSave: true, autoSaveDelay: 1.5 },
    { autoSave: true, autoSaveDelay: 60001 },
  ])('rejects %o', (value) => expect(isBuilderSettings(value)).toBe(false));
});
