import { describe, expect, it } from 'vitest';
import { isBuilderSettings, isStyleValues } from './builder-settings';

describe('isBuilderSettings', () => {
  it.each([
    { autoSave: true, autoSaveDelay: 3000 },
    { autoSave: false, autoSaveDelay: 0 },
    { autoSave: true, autoSaveDelay: 2147483647 },
    // Files from newer builder versions may carry settings this version does not know.
    { autoSave: true, autoSaveDelay: 1, styles: {} },
    { autoSave: true, autoSaveDelay: 1, styleValues: { margin: [{ value: '4' }] } },
    { autoSave: true, autoSaveDelay: 1, styleValues: undefined },
  ])('accepts %o', (value) => expect(isBuilderSettings(value)).toBe(true));

  it.each([
    null,
    {},
    { autoSave: 'yes', autoSaveDelay: 1 },
    { autoSave: true, autoSaveDelay: -1 },
    { autoSave: true, autoSaveDelay: 1.5 },
    { autoSave: true, autoSaveDelay: 2147483648 },
    { autoSave: true, autoSaveDelay: 1, styleValues: { margin: [{ value: '' }] } },
    { autoSave: true, autoSaveDelay: 1, styleValues: null },
  ])('rejects %o', (value) => expect(isBuilderSettings(value)).toBe(false));
});

describe('isStyleValues', () => {
  it.each([
    {},
    { height: [], width: [] },
    { margin: [{ value: '4', label: 'Small' }, { value: 'auto' }], padding: [{ value: 'px' }] },
    { margin: [{ value: '1.5' }, { value: '[3px]' }] },
    // Extra entry keys are ignored.
    { margin: [{ value: '4', note: 'x' }] },
    // Lists from newer builder versions are ignored.
    { gap: [{ value: '4' }] },
  ])('accepts %o', (value) => expect(isStyleValues(value)).toBe(true));

  it.each([
    null,
    [],
    'margin',
    { margin: {} },
    { margin: [null] },
    { margin: [{}] },
    { margin: [{ value: 4 }] },
    { margin: [{ value: '' }] },
    { margin: [{ value: 'a b' }] },
    { margin: [{ value: 'a\tb' }] },
    // eslint-disable-next-line no-sparse-arrays
    { margin: [, { value: '4' }] },
    { margin: [{ value: '4' }], padding: 'px' },
    { margin: [{ value: 'md:4' }] },
    { margin: [{ value: '4' }, { value: '4', label: 'Again' }] },
    { margin: [{ value: '4', label: 1 }] },
  ])('rejects %o', (value) => expect(isStyleValues(value)).toBe(false));
});
