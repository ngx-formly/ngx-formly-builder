import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject, tap, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BuilderEngineService } from './builder-engine.service';
import { provideBuilderEngine } from './provider';
import {
  CORE_FORM_STORE,
  FormStoreRecoveryRequiredError,
  FormStoreService,
} from '../persistence/types';
import { WorkspaceValidation } from '../model/types';
import { LocalFormStoreService } from '../persistence/local-form-store.service';

const draft = {
  name: 'minimumAge',
  expression: 'control.value >= 18',
  message: 'Enter 18 or more.',
};
const key = 'formly-studio-validations-catalog';

describe('workspace validations', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideBuilderEngine({ editorType: 'catalog', libraries: [], autoSave: false })],
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('creates, renames, reloads and deletes rules without changing forms', async () => {
    const engine = TestBed.inject(BuilderEngineService);
    const before = localStorage.getItem('formly-studio-forms-catalog');
    await firstValueFrom(engine.saveValidation$(draft));
    const id = engine.validations()[0].id;
    await firstValueFrom(
      engine.saveValidation$({ ...draft, name: 'adult', expression: 'control.value >= 21' }, id),
    );
    engine.loadValidations();
    expect(engine.validations()).toEqual([
      { ...draft, id, name: 'adult', expression: 'control.value >= 21' },
    ]);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(engine.validations());
    await firstValueFrom(engine.deleteValidation$(id));
    expect(engine.validations()).toEqual([]);
    expect(localStorage.getItem('formly-studio-forms-catalog')).toBe(before);
  });

  it('isolates namespaces and loads persisted rules in a new injector', async () => {
    const engine = TestBed.inject(BuilderEngineService);
    await firstValueFrom(engine.saveValidation$(draft));
    const parent = TestBed.inject(EnvironmentInjector);
    const same = createEnvironmentInjector(
      [provideBuilderEngine({ editorType: 'catalog', libraries: [] })],
      parent,
    );
    const other = createEnvironmentInjector(
      [provideBuilderEngine({ editorType: 'other', libraries: [] })],
      parent,
    );
    try {
      expect(same.get(BuilderEngineService).validations()).toEqual(engine.validations());
      expect(other.get(BuilderEngineService).validations()).toEqual([]);
    } finally {
      same.destroy();
      other.destroy();
    }
  });

  it('rejects duplicates, unsafe names, and blank expressions or messages', async () => {
    const engine = TestBed.inject(BuilderEngineService);
    await firstValueFrom(engine.saveValidation$(draft));
    const saved = localStorage.getItem(key);
    for (const invalid of [
      draft,
      { ...draft, name: '__proto__' },
      { ...draft, name: 'required' },
      { ...draft, name: 'empty', message: ' ' },
      { ...draft, name: 'empty', expression: '' },
    ]) {
      await expect(firstValueFrom(engine.saveValidation$(invalid))).rejects.toThrow();
    }
    expect(localStorage.getItem(key)).toBe(saved);
    expect(engine.validations()).toHaveLength(1);
  });

  it.each([
    '{',
    '{}',
    '[{"id":"x"}]',
    JSON.stringify([
      { id: 'one', ...draft },
      { id: 'two', ...draft },
    ]),
  ])('preserves malformed catalog data and resets only that key: %s', async (raw) => {
    localStorage.setItem(key, raw);
    localStorage.setItem('formly-studio-forms-catalog', '{');
    localStorage.setItem('formly-studio-hierarchy-catalog', '{');
    const engine = TestBed.inject(BuilderEngineService);
    expect(engine.validationsLoadError()).toBeTruthy();
    expect(engine.validationRecoveryIssues()).toHaveLength(1);
    expect(JSON.parse(engine.getStorageRecoveryBackup('validations')).entries[0].rawValue).toBe(
      raw,
    );
    await expect(firstValueFrom(engine.saveValidation$(draft))).rejects.toBeInstanceOf(
      FormStoreRecoveryRequiredError,
    );
    expect(localStorage.getItem(key)).toBe(raw);
    await firstValueFrom(engine.resetValidations$());
    expect(localStorage.getItem(key)).toBeNull();
    expect(localStorage.getItem('formly-studio-forms-catalog')).toBe('{');
    expect(localStorage.getItem('formly-studio-hierarchy-catalog')).toBe('{');
    expect(engine.validationRecoveryIssues()).toEqual([]);
    expect(engine.validationsLoadError()).toBeNull();
  });

  it('allows form storage to work while the catalog needs recovery', async () => {
    localStorage.setItem(key, '{');
    const store = TestBed.inject(CORE_FORM_STORE);
    await firstValueFrom(store.getRecoveryIssues$!('catalog'));
    await firstValueFrom(
      store.addForm$('catalog', {
        id: 'form',
        name: 'Kept',
        libraryId: 'native',
        fields: [],
        model: {},
      }),
    );
    expect(await firstValueFrom(store.getForm$('catalog', 'form'))).toMatchObject({ name: 'Kept' });
    expect(localStorage.getItem(key)).toBe('{');
  });

  it('retains the catalog on save and delete failures and allows retry', async () => {
    const engine = TestBed.inject(BuilderEngineService);
    await firstValueFrom(engine.saveValidation$(draft));
    const original = engine.validations();
    const store = TestBed.inject(CORE_FORM_STORE);
    const save = vi
      .spyOn(store, 'saveValidations$')
      .mockReturnValue(throwError(() => new Error('Offline')));
    await expect(
      firstValueFrom(engine.saveValidation$({ ...draft, name: 'changed' }, original[0].id)),
    ).rejects.toThrow('Offline');
    await expect(firstValueFrom(engine.deleteValidation$(original[0].id))).rejects.toThrow(
      'Offline',
    );
    expect(engine.validations()).toEqual(original);
    expect(engine.saveStatus()).toBe('saved');
    save.mockRestore();
    await firstValueFrom(engine.deleteValidation$(original[0].id));
    expect(engine.validations()).toEqual([]);
  });

  it('serializes asynchronous read-modify-write operations', async () => {
    const engine = TestBed.inject(BuilderEngineService);
    const store = TestBed.inject(CORE_FORM_STORE);
    const commit = new Subject<void>();
    const save = store.saveValidations$!.bind(store);
    vi.spyOn(store, 'saveValidations$').mockImplementationOnce((namespace, rules) =>
      commit.pipe(tap(() => save(namespace, rules))),
    );
    const first = firstValueFrom(engine.saveValidation$(draft));
    const second = firstValueFrom(engine.saveValidation$({ ...draft, name: 'second' }));
    expect(engine.validations()).toEqual([]);
    commit.next();
    await Promise.all([first, second]);
    expect(engine.validations().map((rule) => rule.name)).toEqual(['minimumAge', 'second']);
  });

  it('keeps stores without catalog methods compatible', () => {
    const store = new LocalFormStoreService() as FormStoreService;
    store.getValidations$ = undefined;
    store.saveValidations$ = undefined;
    TestBed.overrideProvider(CORE_FORM_STORE, { useValue: store });
    const engine = TestBed.inject(BuilderEngineService);
    expect(engine.validationStorageAvailable).toBe(false);
    expect(engine.validations()).toEqual([]);
    expect(engine.formList()).toEqual([]);
  });

  it('checks custom-store results and recovers after a retry', () => {
    const store = TestBed.inject(CORE_FORM_STORE);
    const load = vi
      .spyOn(store, 'getValidations$')
      .mockReturnValue(of([{}] as WorkspaceValidation[]));
    const engine = TestBed.inject(BuilderEngineService);
    expect(engine.validationsLoadError()).toBeTruthy();
    load.mockRestore();
    engine.loadValidations();
    expect(engine.validationsLoadError()).toBeNull();
  });
});
