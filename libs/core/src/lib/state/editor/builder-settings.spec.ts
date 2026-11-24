import { TestBed } from '@angular/core/testing';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BuilderSettings } from '../model/builder-settings';
import { LocalFormStoreService } from '../persistence/local-form-store.service';
import { CORE_FORM_STORE } from '../persistence/types';
import { BuilderEngineService } from './builder-engine.service';
import { provideBuilderEngine } from './provider';
import type { BuilderEngineConfig } from './types';

describe('builder settings', () => {
  function setup(config: Pick<BuilderEngineConfig, 'autoSave' | 'autoSaveDelay'> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideBuilderEngine({
          editorType: 'settings-test',
          libraries: [{ id: 'test', fieldTypes: [] }],
          ...config,
        }),
      ],
    });
    const engine = TestBed.inject(BuilderEngineService);
    const save = vi.spyOn(TestBed.inject(CORE_FORM_STORE), 'updateForm$');
    engine.addForm$('Form', [{ key: 'name' }], {}, 'test').subscribe();
    const edit = (value: number) => engine.setActiveModel({ value });
    return { engine, save, edit };
  }

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts from the host configuration', () => {
    const { engine } = setup({ autoSave: false, autoSaveDelay: 750 });
    expect(engine.hostSettings).toEqual({ autoSave: false, autoSaveDelay: 750 });
    expect(engine.settings()).toEqual(engine.hostSettings);
  });

  it('defaults to autosaving after 3000 ms', () => {
    expect(setup().engine.settings()).toEqual({ autoSave: true, autoSaveDelay: 3000 });
  });

  it('uses a changed delay for the next edit', () => {
    const { engine, save, edit } = setup();
    engine['applySettings']({ autoSave: true, autoSaveDelay: 500 });
    edit(1);
    vi.advanceTimersByTime(499);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledOnce();
  });

  it('applies a changed delay to an edit already waiting to be saved', () => {
    const { engine, save, edit } = setup({ autoSaveDelay: 60000 });
    edit(1);
    engine['applySettings']({ autoSave: true, autoSaveDelay: 500 });
    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledOnce();
    expect(engine.saveStatus()).toBe('saved');
  });

  it('autosaves once enabled, including edits made while disabled', () => {
    const { engine, save, edit } = setup({ autoSave: false });
    edit(1);
    vi.advanceTimersByTime(10000);
    expect(save).not.toHaveBeenCalled();
    expect(engine.saveStatus()).toBe('dirty');

    engine['applySettings']({ autoSave: true, autoSaveDelay: 500 });
    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledOnce();

    edit(2);
    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('saves a pending edit immediately and only once when disabled', () => {
    const { engine, save, edit } = setup();
    edit(1);
    engine['applySettings']({ autoSave: false, autoSaveDelay: 3000 });
    expect(save).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(10000);
    expect(save).toHaveBeenCalledOnce();
  });

  it('does not save edits made after disabling when an earlier timer fires', () => {
    const { engine, save, edit } = setup();
    edit(1);
    engine['applySettings']({ autoSave: false, autoSaveDelay: 3000 });
    edit(2);
    vi.advanceTimersByTime(10000);
    expect(save).toHaveBeenCalledOnce();
    expect(engine.saveStatus()).toBe('dirty');
  });

  it('keeps manual edits unsaved when autosave was already off', () => {
    const { engine, save, edit } = setup({ autoSave: false });
    edit(1);
    engine['applySettings']({ autoSave: false, autoSaveDelay: 500 });
    vi.advanceTimersByTime(10000);
    expect(save).not.toHaveBeenCalled();
    expect(engine.saveStatus()).toBe('dirty');
  });

  describe('storage', () => {
    const saved = { autoSave: false, autoSaveDelay: 1000 };
    const host = { autoSave: true, autoSaveDelay: 3000 };
    const getSettings = () => vi.spyOn(LocalFormStoreService.prototype, 'getSettings$');
    const saveSettings = () => vi.spyOn(LocalFormStoreService.prototype, 'saveSettings$');

    function setupEditable(store: LocalFormStoreService = new LocalFormStoreService()) {
      TestBed.configureTestingModule({
        providers: [
          provideBuilderEngine({
            editorType: 'settings-test',
            libraries: [],
            editableSettings: true,
          }),
          { provide: CORE_FORM_STORE, useValue: store },
        ],
      });
      return TestBed.inject(BuilderEngineService);
    }
    function subscribe(source: ReturnType<BuilderEngineService['updateSettings$']>) {
      const result = { emitted: false, error: undefined as Error | undefined };
      source.subscribe({
        next: () => (result.emitted = true),
        error: (error) => (result.error = error),
      });
      return result;
    }

    it('loads saved settings over the host configuration', () => {
      getSettings().mockReturnValue(of({ ...saved, styles: {} } as BuilderSettings));
      const engine = setupEditable();
      expect(engine.settingsStorageAvailable).toBe(true);
      expect(engine.settings()).toEqual(saved);
      expect(engine.hostSettings).toEqual(host);
    });

    it('keeps the host configuration when nothing was saved', () => {
      const engine = setupEditable();
      expect(engine.settings()).toEqual(host);
      expect(engine.settingsLoadError()).toBeNull();
    });

    it.each([
      ['invalid', of({ autoSaveDelay: 'abc' } as unknown as BuilderSettings)],
      ['failing', throwError(() => new Error('offline'))],
      ['empty', EMPTY],
    ])('keeps the host configuration after an %s load and can retry', (_, response) => {
      const load = getSettings().mockReturnValueOnce(response);
      const engine = setupEditable();
      expect(engine.settings()).toEqual(host);
      expect(engine.settingsLoadError()).not.toBeNull();

      load.mockReturnValueOnce(of(saved));
      engine.loadSettings();
      expect(engine.settings()).toEqual(saved);
      expect(engine.settingsLoadError()).toBeNull();
    });

    it('applies an update only after it was saved', () => {
      const response = new Subject<void>();
      const save = saveSettings().mockReturnValue(response);
      const engine = setupEditable();
      const result = subscribe(engine.updateSettings$(saved));
      expect(save).toHaveBeenCalledExactlyOnceWith('settings-test', saved);
      expect(engine.settings()).toEqual(host);

      response.next();
      expect(engine.settings()).toEqual(saved);
      expect(result.emitted).toBe(true);
    });

    it('keeps the previous settings when saving fails', () => {
      saveSettings().mockReturnValue(throwError(() => new Error('offline')));
      const engine = setupEditable();
      const result = subscribe(engine.updateSettings$(saved));
      expect(result.error?.message).toBe('offline');
      expect(engine.settings()).toEqual(host);
    });

    it('rejects invalid settings without saving them', () => {
      const save = saveSettings();
      const engine = setupEditable();
      const result = subscribe(engine.updateSettings$({ autoSave: true, autoSaveDelay: -5 }));
      expect(result.error?.message).toBe('Invalid builder settings.');
      expect(save).not.toHaveBeenCalled();
      expect(engine.settings()).toEqual(host);
    });

    it('resets to the host configuration', () => {
      getSettings().mockReturnValue(of(saved));
      const save = saveSettings();
      const engine = setupEditable();
      subscribe(engine.resetSettings$());
      expect(save).toHaveBeenCalledExactlyOnceWith('settings-test', host);
      expect(engine.settings()).toEqual(host);
    });

    it('applies an update requested while settings are loading after the load', () => {
      const response = new Subject<BuilderSettings>();
      getSettings().mockReturnValue(response);
      const engine = setupEditable();
      const latest = { autoSave: true, autoSaveDelay: 200 };
      subscribe(engine.updateSettings$(latest));
      response.next(saved);
      expect(engine.settings()).toEqual(latest);
    });

    it('keeps updates for the session when the store has no settings support', () => {
      const store = Object.assign(new LocalFormStoreService(), {
        getSettings$: undefined,
        saveSettings$: undefined,
      }) as unknown as LocalFormStoreService;
      const engine = setupEditable(store);
      expect(engine.settingsStorageAvailable).toBe(false);
      const result = subscribe(engine.updateSettings$(saved));
      expect(result.emitted).toBe(true);
      expect(engine.settings()).toEqual(saved);
    });

    it('does not use stored settings unless the host allows editing', () => {
      const load = getSettings().mockReturnValue(of(saved));
      const { engine } = setup();
      expect(load).not.toHaveBeenCalled();
      expect(engine.settingsStorageAvailable).toBe(false);
      expect(engine.settings()).toEqual(host);
    });
  });
});
