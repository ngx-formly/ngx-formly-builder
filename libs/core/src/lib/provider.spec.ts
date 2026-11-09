import {
  BuilderEngineService,
  BuilderFieldStateService as EngineFieldState,
} from '@ngx-formly/builder-state';
import { CoreFormService } from './editor/core-form.service';
import { BuilderFieldStateService } from './editor/builder-field-state.service';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { createLibrary } from './config/library';
import { CoreFieldService } from './config/core-field.service';
import { CoreLibraryService } from './config/core-library.service';
import { VANILLA_LIBRARY_ID } from './config/vanilla/vanilla.library';
import { CORE_EDITOR_CONFIG, CORE_LIBRARY_CONFIGS } from './config/types';
import { BaseEditorForm, DefaultForm, WorkspaceHierarchy } from './model/types';
import { LocalFormStoreService } from './persistence/local-form-store.service';
import { CORE_FORM_STORE, FormStoreService } from './persistence/types';
import { provideFormlyBuilder } from './provider';

const library = createLibrary({
  id: 'test-library',
  label: 'Test library',
  fieldCategoryOptions: [],
  formTemplates: [],
  configOptions: [],
});

class TestFormStore implements FormStoreService {
  addForm$(): Observable<void> {
    return of(void 0);
  }

  updateForm$(): Observable<void> {
    return of(void 0);
  }

  removeForm$(): Observable<void> {
    return of(void 0);
  }

  getForm$(): Observable<DefaultForm> {
    return of({ name: 'Test', libraryId: library.id, fields: [], model: {} });
  }

  getFormList$(): Observable<BaseEditorForm[]> {
    return of([]);
  }

  getHierarchy$(): Observable<WorkspaceHierarchy> {
    return of({ workspaceId: 'test', rootNodeIds: [], nodeMap: {} });
  }

  saveHierarchy$(): Observable<void> {
    return of(void 0);
  }
}

describe('provideFormlyBuilder', () => {
  it('provides defaults for an embedded editor', () => {
    TestBed.configureTestingModule({
      providers: [provideFormlyBuilder({ libraries: [library] })],
    });

    expect(TestBed.inject(BuilderEngineService)).toBe(TestBed.inject(CoreFormService));
    expect(TestBed.inject(EngineFieldState)).toBe(TestBed.inject(BuilderFieldStateService));
    expect(TestBed.inject(CORE_LIBRARY_CONFIGS).map(({ id }) => id)).toEqual([
      VANILLA_LIBRARY_ID,
      library.id,
    ]);
    expect(TestBed.inject(CORE_EDITOR_CONFIG)).toMatchObject({
      editorType: 'form-editor',
      autoSave: true,
    });
    expect(TestBed.inject(CORE_FORM_STORE)).toBeInstanceOf(LocalFormStoreService);
  });

  it.each([undefined, { libraries: [] }])(
    'creates and reopens vanilla forms without profiles: %j',
    (config) => {
      localStorage.clear();
      TestBed.configureTestingModule({ providers: [provideFormlyBuilder(config)] });
      const forms = TestBed.inject(CoreFormService);
      const libraries = TestBed.inject(CoreLibraryService);
      const fields = TestBed.inject(CoreFieldService);

      forms.addForm$('Vanilla form', [], {}, VANILLA_LIBRARY_ID).subscribe();
      expect(libraries.libraryOptions).toEqual([]);
      expect(libraries.activeLibraryLabel()).toBe('Vanilla');
      expect(fields.activeFieldTypeOptions().map(({ name }) => name)).toContain('input');
      forms.addField('input');
      forms.saveActiveForm();
      const formId = forms.activeFormId()!;
      forms.setActiveForm(null);
      forms.setActiveForm(formId);

      expect(forms.formLoadError()).toBeNull();
      expect(forms.activeFieldCount()).toBe(1);
      expect(forms.convertToRawForm(forms.activeForm()!).fields[0].type).toBe('input');
    },
  );

  it('accepts editor identity, autosave, and storage overrides', () => {
    TestBed.configureTestingModule({
      providers: [
        provideFormlyBuilder({
          libraries: [library],
          editorType: 'customer-forms',
          autoSave: false,
          autoSaveDelay: 750,
          formStore: TestFormStore,
        }),
      ],
    });

    expect(TestBed.inject(CORE_EDITOR_CONFIG)).toMatchObject({
      editorType: 'customer-forms',
      autoSave: false,
      autoSaveDelay: 750,
    });
    expect(TestBed.inject(CORE_FORM_STORE)).toBeInstanceOf(TestFormStore);
  });
});
