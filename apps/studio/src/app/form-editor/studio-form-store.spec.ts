import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioFormStore } from './studio-form-store';

describe('StudioFormStore settings', () => {
  const editorId = 'test-editor';
  const key = `formly-studio-settings-${editorId}`;
  const settings = { autoSave: false, autoSaveDelay: 500 };
  let store: StudioFormStore;

  beforeEach(() => {
    localStorage.clear();
    store = new StudioFormStore();
  });
  afterEach(() => vi.restoreAllMocks());

  it('saves and reads settings per editor namespace', async () => {
    await firstValueFrom(store.saveSettings$(editorId, settings));

    expect(await firstValueFrom(store.getSettings$(editorId))).toEqual(settings);
    expect(await firstValueFrom(store.getSettings$('other-editor'))).toBeUndefined();
  });

  it('stores only known settings fields', async () => {
    await firstValueFrom(
      store.saveSettings$(editorId, { ...settings, editorType: 'other' } as typeof settings),
    );

    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(settings);
  });

  it('saves and reads style values', async () => {
    const withValues = { ...settings, styleValues: { margin: [{ value: '4', label: 'Small' }] } };
    await firstValueFrom(store.saveSettings$(editorId, withValues));

    expect(await firstValueFrom(store.getSettings$(editorId))).toEqual(withValues);
  });

  it('reads nothing when settings were never saved', async () => {
    expect(await firstValueFrom(store.getSettings$(editorId))).toBeUndefined();
  });

  it.each(['{bad', '{"autoSave":"yes"}'])('reads nothing from the stored value %s', async (raw) => {
    localStorage.setItem(key, raw);

    expect(await firstValueFrom(store.getSettings$(editorId))).toBeUndefined();
  });

  it('fails when the browser denies storage access', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage access denied.', 'SecurityError');
    });

    expect(() => store.getSettings$(editorId)).toThrow('Storage access denied.');
  });

  it('rejects invalid settings without writing them', async () => {
    await expect(
      firstValueFrom(store.saveSettings$(editorId, { autoSave: true, autoSaveDelay: -1 })),
    ).rejects.toThrow('Invalid builder settings.');
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('keeps the library local store label', () => {
    expect(store.label).toBe('Browser local storage');
  });
});
