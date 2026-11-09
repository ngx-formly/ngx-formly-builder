import { TestBed } from '@angular/core/testing';
import { withStepperTypeBuilder, withTabsTypeBuilder } from '@ngx-formly/builder-material';
import {
  BuilderFieldStateService,
  CoreFormService,
  CoreLibraryService,
  PropertyChangeType,
  provideFormlyBuilder,
} from '@ngx-formly/builder';
import { withStepperType, withTabsType } from '@ngx-formly/builder-material-fields';
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideFormEditor } from '../form-editor.provider';
import { materialFormEditorConfig } from './material.library';

const materialForm = {
  id: 'material-button-group',
  libraryId: 'form-material',
  name: 'Material Button Group',
  model: { density: 'comfortable' },
  fields: [
    {
      type: 'button-group',
      key: 'density',
      defaultValue: 'comfortable',
      props: {
        label: 'Density',
        options: [
          { label: 'Compact', value: 'compact' },
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Spacious', value: 'spacious', disabled: true },
        ],
      },
    },
  ],
};

const materialCardForm = {
  id: 'material-card',
  libraryId: 'form-material',
  name: 'Material Card',
  model: { firstName: 'Ada' },
  fields: [
    {
      type: 'card',
      props: {
        cardTitle: 'Profile',
        cardSubtitle: 'Personal details',
      },
      fieldGroup: [
        {
          type: 'input',
          key: 'firstName',
          props: {
            label: 'First name',
          },
        },
      ],
    },
  ],
};

const materialPostalCodeForm = {
  id: 'material-postal-code',
  libraryId: 'form-material',
  name: 'Material Postal Code',
  model: { postalCode: 'K1A0B1' },
  fields: [
    {
      type: 'postal-code',
      key: 'postalCode',
      props: {
        label: 'Postal Code',
        mask: 'A0A 0A0',
        inputMode: 'text',
        autoCapitalize: true,
        storeRawValue: true,
        autocompleteContext: 'shipping',
        postalCodePattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$',
      },
    },
  ],
};

const materialStepperForm = {
  id: 'material-stepper',
  libraryId: 'form-material',
  name: 'Stepper',
  model: { country: 'Canada', firstName: 'Ada' },
  fields: [
    {
      type: 'stepper',
      props: {
        ariaLabel: 'Travel details',
        linear: true,
        orientation: 'vertical',
      },
      fieldGroup: [
        {
          type: 'step',
          props: {
            label: 'Personal data',
            nextButtonLabel: 'Continue',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: {
                label: 'First name',
                required: true,
              },
            },
          ],
        },
        {
          type: 'step',
          props: {
            label: 'Destination',
            optional: true,
            previousButtonLabel: 'Return',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'country',
              props: { label: 'Country' },
            },
          ],
        },
      ],
    },
  ],
};

const materialTabsForm = {
  id: 'material-tabs',
  libraryId: 'form-material',
  name: 'Tabs',
  model: { firstName: 'Ada', country: 'Canada' },
  fields: [
    {
      type: 'tabs',
      props: {
        alignTabs: 'center',
        dynamicHeight: true,
        fitInkBarToContent: true,
        headerPosition: 'below',
        preserveContent: false,
        disableStretchTabs: true,
      },
      fieldGroup: [
        {
          type: 'tab',
          props: {
            label: 'Personal data',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'firstName',
              props: { label: 'First name' },
            },
          ],
        },
        {
          type: 'tab',
          props: {
            disabled: false,
            label: 'Destination',
          },
          fieldGroup: [
            {
              type: 'input',
              key: 'country',
              props: { label: 'Country' },
            },
          ],
        },
      ],
    },
  ],
};

describe('Material profile integration', () => {
  let libraryService: CoreLibraryService;
  let formService: CoreFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideFormlyBuilder({
          libraries: [materialFormEditorConfig],
          autoSave: false,
        }),
      ],
    });

    libraryService = TestBed.inject(CoreLibraryService);
    formService = TestBed.inject(CoreFormService);
  });

  it('keeps runtime components separate from builder overrides and preserves defaults', () => {
    const runtime = new FormlyConfig();
    for (const option of materialFormEditorConfig.configOptions ?? []) {
      runtime.addConfig(option);
    }
    expect(runtime.getType('stepper')?.component).toBe(withStepperType().types?.[0].component);
    expect(runtime.getType('tabs')?.component).toBe(withTabsType().types?.[0].component);

    for (const option of materialFormEditorConfig.builderConfigOptions ?? []) {
      runtime.addConfig(option);
    }
    expect(runtime.getType('stepper')?.component).toBe(
      withStepperTypeBuilder().types?.[0].component,
    );
    expect(runtime.getType('tabs')?.component).toBe(withTabsTypeBuilder().types?.[0].component);
    expect(runtime.getType('stepper')?.defaultOptions).toEqual(
      withStepperType().types?.[0].defaultOptions,
    );
  });

  it.each(['form-material', 'form-studio-material'])(
    'opens, edits, saves, and reopens forms with library id %s',
    async (libraryId) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideFormEditor()] });
      formService = TestBed.inject(CoreFormService);
      libraryService = TestBed.inject(CoreLibraryService);
      await firstValueFrom(
        formService.addForm$(
          'Saved Material form',
          materialCardForm.fields,
          { firstName: 'Ada' },
          libraryId,
        ),
      );
      expect(formService.formLoadError()).toBeNull();
      expect(libraryService.activeLibrary()?.label).toBe('Material');
      expect(formService.activeFormFields()[0]._info.isParent).toBe(true);

      const formId = formService.activeFormId()!;
      formService.setActiveField(formService.activeRootFieldIds()[0]);
      formService.modifyActiveField({
        type: PropertyChangeType.VALUE,
        path: ['props', 'cardTitle'],
        value: 'Updated profile',
      });
      formService.saveActiveForm();
      formService.setActiveForm(null);
      formService.setActiveForm(formId);

      const exported = formService.convertToRawForm(formService.activeForm()!);
      expect(exported.libraryId).toBe(libraryId);
      expect(exported.model).toEqual({ firstName: 'Ada' });
      expect(exported.fields[0].props?.['cardTitle']).toBe('Updated profile');
      expect(exported.fields[0].fieldGroup?.[0]).toMatchObject(
        materialCardForm.fields[0].fieldGroup[0],
      );
    },
  );

  it('retains transient state through edits and mode changes without exporting it', async () => {
    await firstValueFrom(
      formService.addForm$(
        'Transient tabs state',
        materialTabsForm.fields,
        materialTabsForm.model,
        'form-material',
      ),
    );
    const state = TestBed.inject(BuilderFieldStateService);
    const fieldId = formService.activeRootFieldIds()[0];
    const field = formService.activeFieldMap()[fieldId];
    state.setState(field, { selectedIndex: 1 });
    formService.setActiveField(fieldId);
    formService.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'dynamicHeight'],
      value: true,
    });
    expect(state.getState(formService.activeFormFields()[0])).toEqual({ selectedIndex: 1 });

    for (const mode of ['preview', 'json', 'form'] as const) {
      formService.setActiveFormDisplayMode(mode);
      expect(state.getState(formService.activeFormFields()[0])).toEqual({ selectedIndex: 1 });
    }

    const exported = formService.convertToRawForm(formService.activeForm()!);
    expect(exported.model).toEqual(materialTabsForm.model);
    expect(JSON.stringify(exported)).not.toContain('selectedIndex');
    expect(JSON.stringify(exported)).not.toContain('_info');

    const formId = formService.activeFormId()!;
    formService.setActiveForm(null);
    formService.setActiveForm(formId);
    expect(state.getState(formService.activeFormFields()[0])).toBeUndefined();
  });

  it('discards transient state when a container and its descendants are deleted', async () => {
    await firstValueFrom(
      formService.addForm$(
        'Deleted stepper state',
        materialStepperForm.fields,
        {},
        'form-material',
      ),
    );
    const state = TestBed.inject(BuilderFieldStateService);
    const fieldId = formService.activeRootFieldIds()[0];
    const field = formService.activeFieldMap()[fieldId];
    const child = formService.activeFieldMap()[field._info.childIds[0]];
    state.setState(field, { selectedIndex: 1 });
    state.setState(child, { expanded: true });

    formService.removeField(fieldId);
    expect(state.getState(field)).toBeUndefined();
    expect(state.getState(child)).toBeUndefined();
    expect(formService.activeFieldMap()).toEqual({});
  });

  it('round-trips Button Group options and scalar values without editor metadata', () => {
    libraryService.setActiveLibrary('form-material');

    const editorForm = formService.convertFromRawForm(materialForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const serializedForm = JSON.stringify(convertedForm);

    expect(convertedForm.libraryId).toBe('form-material');
    expect(convertedForm.model).toEqual({ density: 'comfortable' });
    expect(convertedForm.fields[0]).toMatchObject(materialForm.fields[0]);
    expect(serializedForm).not.toContain('_info');
  });

  it('round-trips nested Card fields and wrapper properties', () => {
    libraryService.setActiveLibrary('form-material');

    const editorForm = formService.convertFromRawForm(materialCardForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const convertedRoot = convertedForm.fields[0] as FormlyFieldConfig;

    expect(convertedForm.fields[0]).toMatchObject(materialCardForm.fields[0]);
    expect(convertedRoot.props?.['cardSubtitle']).toBe('Personal details');
    expect(convertedRoot.fieldGroup).toHaveLength(1);
    expect(convertedRoot.fieldGroup?.[0]).toMatchObject(materialCardForm.fields[0].fieldGroup[0]);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });

  it('round-trips Postal Code formatting and storage properties', () => {
    libraryService.setActiveLibrary('form-material');

    const editorForm = formService.convertFromRawForm(materialPostalCodeForm);
    const convertedForm = formService.convertToRawForm(editorForm);

    expect(convertedForm.model).toEqual({ postalCode: 'K1A0B1' });
    expect(convertedForm.fields[0]).toMatchObject(materialPostalCodeForm.fields[0]);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });

  it('exposes Stepper as a configurable parent in the field catalog', () => {
    const stepperType = materialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'stepper');

    expect(stepperType).toMatchObject({
      displayName: 'Stepper',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(stepperType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.linear',
      'props.orientation',
      'props.ariaLabel',
      'hide',
      'expressions',
    ]);
  });

  it('exposes Step as a configurable parent in the field catalog', () => {
    const stepType = materialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'step');

    expect(stepType).toMatchObject({
      displayName: 'Step',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(stepType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.label',
      'props.optional',
      'props.disableEdit',
      'props.previousButtonLabel',
      'props.nextButtonLabel',
      'hide',
      'expressions',
    ]);
  });

  it('exposes Tabs as a configurable parent in the field catalog', () => {
    const tabsType = materialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'tabs');

    expect(tabsType).toMatchObject({
      displayName: 'Tabs',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(tabsType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.dynamicHeight',
      'props.headerPosition',
      'props.alignTabs',
      'props.disableStretchTabs',
      'props.fitInkBarToContent',
      'props.preserveContent',
      'hide',
      'expressions',
    ]);
  });

  it('exposes Tab as a configurable parent in the field catalog', () => {
    const tabType = materialFormEditorConfig.fieldCategoryOptions
      .flatMap(({ children }) => children)
      .find(({ name }) => name === 'tab');

    expect(tabType).toMatchObject({
      displayName: 'Tab',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: {
        fieldGroup: [],
      },
    });
    expect(tabType?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.label',
      'props.disabled',
      'hide',
      'expressions',
    ]);
  });

  it('accepts and round-trips Stepper fields with explicit Step children', () => {
    libraryService.setActiveLibrary('form-material');

    expect(materialFormEditorConfig.schema.safeParse(materialStepperForm.fields).success).toBe(
      true,
    );

    const editorForm = formService.convertFromRawForm(materialStepperForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const convertedRoot = convertedForm.fields[0] as FormlyFieldConfig;

    expect(convertedForm.fields[0]).toMatchObject(materialStepperForm.fields[0]);
    expect(convertedRoot.fieldGroup).toHaveLength(2);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });

  it('accepts and round-trips Tabs fields with explicit Tab children', () => {
    libraryService.setActiveLibrary('form-material');

    expect(materialFormEditorConfig.schema.safeParse(materialTabsForm.fields).success).toBe(true);

    const editorForm = formService.convertFromRawForm(materialTabsForm);
    const convertedForm = formService.convertToRawForm(editorForm);
    const convertedRoot = convertedForm.fields[0] as FormlyFieldConfig;

    expect(convertedForm.fields[0]).toMatchObject(materialTabsForm.fields[0]);
    expect(convertedRoot.fieldGroup).toHaveLength(2);
    expect(JSON.stringify(convertedForm)).not.toContain('_info');
  });
});
