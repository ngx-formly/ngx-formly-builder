import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
});
