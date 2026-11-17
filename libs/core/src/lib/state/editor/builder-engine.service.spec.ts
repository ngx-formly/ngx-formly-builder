import { Component, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyForm, provideFormlyCore } from '@ngx-formly/core';
import { throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BuilderEngineService } from './builder-engine.service';
import { BuilderFieldStateService } from './builder-field-state.service';
import { provideBuilderEngine } from './provider';
import { CORE_FORM_STORE } from '../persistence/types';
import { PropertyChangeType } from './property-change';
import { EngineLibrary } from './types';

const library: EngineLibrary = {
  id: 'headless',
  fieldTypes: [
    { name: 'input', displayName: 'Input', defaultConfig: {} },
    { name: 'group', displayName: 'Group', isParent: true, defaultConfig: {} },
  ],
};

@Component({
  selector: 'core-test-input',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="formControl" />',
})
class TestInput extends FieldType<FieldTypeConfig> {}

describe('headless builder engine', () => {
  let engine: BuilderEngineService;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideFormlyCore({
          types: [
            { name: 'input', component: TestInput },
            { name: 'group', extends: 'formly-group' },
          ],
        }),
        provideBuilderEngine({
          editorType: 'engine-test',
          libraries: [library],
          autoSave: true,
          autoSaveDelay: 20,
        }),
      ],
    });
    engine = TestBed.inject(BuilderEngineService);
  });
  afterEach(() => vi.useRealTimers());

  it.each([false, true])(
    'isolates exports from rendered previews (export read first: %s)',
    async (readExportFirst) => {
      const fields = [
        {
          type: 'group',
          key: 'person',
          fieldGroup: [{ type: 'input', key: 'name', props: { label: 'Name', custom: 'kept' } }],
        },
      ];
      engine.addForm$('Preview', fields, { person: { name: 'Ada' } }, library.id).subscribe();
      if (readExportFirst) expect(JSON.parse(engine.activeFormFieldsJSON())).toEqual(fields);

      const fixture = TestBed.createComponent(FormlyForm);
      fixture.componentRef.setInput('form', new FormGroup({}));
      fixture.componentRef.setInput('model', { person: { name: 'Ada' } });
      fixture.componentRef.setInput('fields', engine.activePreviewFormFields());
      fixture.autoDetectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('input').value).toBe('Ada');
      expect(engine.activePreviewFormFields()[0].fieldGroup![0].formControl).toBeDefined();
      expect(JSON.parse(engine.activeFormFieldsJSON())).toEqual(fields);

      const child = engine.activeField()!._info.childIds[0];
      engine.setActiveField(child);
      engine.modifyActiveField({
        type: PropertyChangeType.VALUE,
        path: ['props', 'label'],
        value: 'Full name',
      });
      fixture.componentRef.setInput('fields', engine.activePreviewFormFields());
      await fixture.whenStable();

      fields[0].fieldGroup[0].props.label = 'Full name';
      expect(JSON.parse(engine.activeFormFieldsJSON())).toEqual(fields);
      expect(fixture.nativeElement.querySelector('input').value).toBe('Ada');
      engine.setActiveForm(null);
      expect(engine.activeFormFieldsJSON()).toBe('[]');
    },
  );

  it.each([
    { type: PropertyChangeType.VALUE, path: ['props', 'label'], value: 'Name' },
    { type: PropertyChangeType.VALUE, path: ['props', 'required'], value: false },
    { type: PropertyChangeType.CLEAR, path: ['props', 'description'] },
  ])('ignores an unchanged field edit: $type $path', async (change) => {
    vi.useFakeTimers();
    engine
      .addForm$(
        'Unchanged',
        [
          {
            type: 'input',
            key: 'name',
            props: { label: 'Name', required: false },
          },
        ],
        {},
        library.id,
      )
      .subscribe();
    const form = engine.activeForm();
    const preview = engine.activePreviewFormFields();
    const save = vi.spyOn(TestBed.inject(CORE_FORM_STORE), 'updateForm$');

    engine.modifyActiveField(change);

    expect(engine.activeForm()).toBe(form);
    expect(engine.activePreviewFormFields()).toBe(preview);
    expect(engine.saveStatus()).toBe('saved');
    await vi.advanceTimersByTimeAsync(20);
    expect(save).not.toHaveBeenCalled();

    engine.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'label'],
      value: 'Full name',
    });
    expect(engine.activePreviewFormFields()).not.toBe(preview);
    expect(engine.saveStatus()).toBe('dirty');
    await vi.advanceTimersByTimeAsync(20);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][1].fields[0].props?.label).toBe('Full name');
  });

  it('edits nested documents and exports unknown properties without shell providers', () => {
    engine
      .addForm$(
        'Nested',
        [
          {
            type: 'group',
            key: 'person',
            fieldGroup: [{ type: 'input', key: 'name', props: { custom: 'kept' } }],
          },
        ],
        { person: { name: 'Ada' } },
        library.id,
      )
      .subscribe();
    const group = engine.activeRootFieldIds()[0];
    const child = engine.getField(group)!._info.childIds[0];
    engine.setActiveField(child);
    engine.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'label'],
      value: 'Name',
    });
    expect(engine.activePreviewFormFields()[0].fieldGroup![0].props).toEqual({
      custom: 'kept',
      label: 'Name',
    });
    engine.addField('input', group);
    const added = engine.activeFieldId()!;
    engine.moveField(added, 1, 0);
    expect(engine.activeRootFieldIds()[0]).toBe(added);
    engine.removeField(child);
    expect(engine.activeModel()).toEqual({ person: {} });
    expect(engine.activePreviewFormFields()[0]).not.toHaveProperty('_info');
  });

  it('selects a live field when reloading a saved form', () => {
    engine.addForm$('First', [{ type: 'input' }, { type: 'input' }], {}, library.id).subscribe();
    const first = engine.activeFormId()!;
    engine.setActiveField(engine.activeRootFieldIds()[1]);
    engine.addForm$('Second', [], {}, library.id).subscribe();
    engine.setActiveForm(first);
    expect(engine.activeFieldId()).toBe(engine.activeRootFieldIds()[0]);
    // Reloaded fields receive new IDs; stale selections must never survive a reload.
    expect(engine.activeField()).toBeDefined();
  });

  it('debounces autosave and can retry a failed save', async () => {
    vi.useFakeTimers();
    engine.addForm$('Save', [], {}, library.id).subscribe();
    const store = TestBed.inject(CORE_FORM_STORE);
    const save = vi
      .spyOn(store, 'updateForm$')
      .mockReturnValueOnce(throwError(() => new Error('offline')));
    engine.setActiveModel({ changed: 1 });
    await vi.advanceTimersByTimeAsync(20);
    expect(engine.saveStatus()).toBe('error');
    engine.saveActiveForm();
    expect(engine.saveStatus()).toBe('saved');
    expect(save).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(localStorage.getItem('formly-studio-forms-engine-test')!)[engine.activeFormId()!]
        .model,
    ).toEqual({ changed: 1 });
  });

  it('isolates injectors and prunes transient field state', () => {
    engine.addForm$('First', [{ type: 'input' }], {}, library.id).subscribe();
    const field = engine.activeField()!;
    const state = TestBed.inject(BuilderFieldStateService);
    state.setState(field, { expanded: true });
    const other = createEnvironmentInjector(
      [provideBuilderEngine({ editorType: 'other', libraries: [library] })],
      TestBed.inject(EnvironmentInjector),
    );
    try {
      expect(other.get(BuilderEngineService).formList()).toEqual([]);
      expect(other.get(BuilderFieldStateService).getState(field)).toBeUndefined();
      engine.removeField(field._info.id);
      expect(state.getState(field)).toBeUndefined();
    } finally {
      other.destroy();
    }
  });

  it('preserves corrupted content until an explicit recovery reset', () => {
    const otherKey = 'formly-studio-forms-other';
    localStorage.setItem('formly-studio-forms-corrupt', '{');
    localStorage.setItem(otherKey, '{}');
    const recovery = createEnvironmentInjector(
      [provideBuilderEngine({ editorType: 'corrupt', libraries: [library] })],
      TestBed.inject(EnvironmentInjector),
    );
    try {
      const service = recovery.get(BuilderEngineService);
      expect(service.hasStorageRecoveryIssues()).toBe(true);
      expect(service.getStorageRecoveryBackup()).toContain('"rawValue": "{"');
      expect(localStorage.getItem('formly-studio-forms-corrupt')).toBe('{');
      service.resetCorruptedStorage();
      expect(service.hasStorageRecoveryIssues()).toBe(false);
      expect(localStorage.getItem(otherKey)).toBe('{}');
    } finally {
      recovery.destroy();
    }
  });
});
