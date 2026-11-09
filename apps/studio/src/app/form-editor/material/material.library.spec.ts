import type { FormlyFieldConfig } from '@ngx-formly/core';
import { describe, expect, it } from 'vitest';
import { materialFormEditorConfig } from './material.library';
import { materialBasicFieldTypeOptions, materialContainerTypeOptions } from './material.options';

const fieldTypes = materialFormEditorConfig.fieldCategoryOptions.flatMap(
  (category) => category.children,
);
const getFieldType = (name: string) => fieldTypes.find((field) => field.name === name);
const starterOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
];
const collectFieldTypes = (fields: FormlyFieldConfig[]): string[] =>
  fields.flatMap((field) => [
    ...(typeof field.type === 'string' ? [field.type] : []),
    ...(field.fieldGroup ? collectFieldTypes(field.fieldGroup) : []),
    ...(typeof field.fieldArray !== 'function' && field.fieldArray?.fieldGroup
      ? collectFieldTypes(field.fieldArray.fieldGroup)
      : []),
  ]);

describe('materialFormEditorConfig', () => {
  it('declares the Material profile identity and template ownership', () => {
    expect(materialFormEditorConfig.id).toBe('form-material');
    expect(materialFormEditorConfig.label).toBe('Material');
    expect(materialFormEditorConfig.formTemplates).toHaveLength(3);
    expect(
      materialFormEditorConfig.formTemplates.every(
        (template) => template.libraryId === 'form-material',
      ),
    ).toBe(true);
  });

  it('organizes display, form control, and container types into categories', () => {
    expect(
      materialFormEditorConfig.fieldCategoryOptions.map(({ displayName }) => displayName),
    ).toEqual(['Display', 'Form Controls', 'Containers']);
    expect(
      materialFormEditorConfig.fieldCategoryOptions[0].children.map(({ name }) => name),
    ).toEqual(['markdown', 'divider']);
    expect(materialFormEditorConfig.fieldCategoryOptions[1].children).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'markdown' }),
        expect.objectContaining({ name: 'divider' }),
      ]),
    );
  });

  it('places the simple Starter Form before the showcase', () => {
    expect(materialFormEditorConfig.formTemplates?.map(({ name }) => name)).toEqual([
      'Starter Form',
      'Material Showcase',
      'Expense Report',
    ]);
    expect(materialFormEditorConfig.formTemplates?.[0]).toMatchObject({
      libraryId: 'form-material',
      fields: [
        {
          key: 'name',
          type: 'input',
          props: { required: true },
        },
        { key: 'email', type: 'input', props: { type: 'email', required: true } },
        { key: 'topic', type: 'select', props: { required: true } },
        { key: 'message', type: 'textarea', props: { required: true, minLength: 10 } },
        { key: 'updates', type: 'checkbox' },
      ],
    });
  });

  it('provides a showcase for every registered Material field type', () => {
    const showcase = materialFormEditorConfig.formTemplates?.find(
      ({ name }) => name === 'Material Showcase',
    );

    expect(showcase?.name).toBe('Material Showcase');
    expect(new Set(collectFieldTypes(showcase?.fields ?? []))).toEqual(
      new Set([
        'formly-group',
        'input',
        'string',
        'number',
        'textarea',
        'datepicker',
        'multicheckbox',
        'toggle',
        'checkbox',
        'radio',
        'select',
        'button-group',
        'postal-code',
        'markdown',
        'divider',
        'card',
        'repeating-section',
        'step',
        'stepper',
        'tab',
        'tabs',
      ]),
    );
    expect(
      fieldTypes
        .filter((field) => field.wrapperOptions)
        .flatMap((field) => field.wrapperOptions?.map(({ name }) => name) ?? []),
    ).toEqual(expect.arrayContaining(['form-field', 'card']));
  });

  it('organizes showcase fields as cards in a responsive root grid', () => {
    const showcase = materialFormEditorConfig.formTemplates?.find(
      ({ name }) => name === 'Material Showcase',
    );
    const root = showcase?.fields?.[0];
    const showcaseCards = root?.fieldGroup ?? [];
    const findCard = (title: string) =>
      showcaseCards.find((field) => field.props?.['cardTitle'] === title);

    expect(root).toMatchObject({
      type: 'formly-group',
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    });
    expect(showcaseCards).toHaveLength(19);
    expect(showcaseCards.every((field) => field.type === 'card')).toBe(true);
    expect(showcaseCards.every((field) => field.props?.['cardTitle'])).toBe(true);
    expect(showcaseCards.every((field) => field.props?.['cardSubtitle'])).toBe(true);
    expect(findCard('Markdown')?.fieldGroup?.[0].props?.['text']).toContain(
      '**bold text**, *emphasis*',
    );
    expect(findCard('Markdown')?.fieldGroup?.[0].props?.['text']).toContain(
      '| Feature | Supported |',
    );
    expect(findCard('Markdown')?.fieldGroup?.[0].props?.['text']).toContain('```typescript');

    expect(
      [
        'Input',
        'Text',
        'Number',
        'Textarea',
        'Date',
        'Select',
        'Radio',
        'Multi Checkbox',
        'Checkbox',
        'Toggle',
        'Button Group',
        'Postal Code',
      ].map((title) => findCard(title)?.className),
    ).toEqual(Array(12).fill('col-span-1'));
    expect(
      ['Markdown', 'Divider', 'Group', 'Card', 'Repeater', 'Stepper', 'Tabs'].map(
        (title) => findCard(title)?.className,
      ),
    ).toEqual(Array(7).fill('col-span-1 md:col-span-2'));

    expect(findCard('Card')).toMatchObject({ type: 'card', fieldGroup: [] });
    expect(findCard('Group')?.fieldGroup?.[0]).toMatchObject({
      type: 'formly-group',
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    });
    expect(findCard('Repeater')?.fieldGroup?.[0]).toMatchObject({
      type: 'repeating-section',
      fieldArray: { fieldGroup: expect.any(Array) },
    });
    expect(findCard('Stepper')?.fieldGroup?.[0]?.fieldGroup?.[0]).toMatchObject({
      type: 'step',
    });
    expect(findCard('Tabs')?.fieldGroup?.[0]?.fieldGroup?.[0]).toMatchObject({
      type: 'tab',
    });
  });

  it('reuses the standard controls and exposes the complete container catalog', () => {
    expect(materialFormEditorConfig.fieldCategoryOptions[1].children).toEqual(
      expect.arrayContaining(materialBasicFieldTypeOptions),
    );
    expect(materialFormEditorConfig.fieldCategoryOptions[2].children).toBe(
      materialContainerTypeOptions,
    );
    expect(new Set(fieldTypes.map(({ name }) => name)).size).toBe(fieldTypes.length);
  });

  it('exposes Markdown text editing metadata', () => {
    const markdown = getFieldType('markdown');

    expect(markdown).toMatchObject({
      displayName: 'Markdown',
      name: 'markdown',
      disableKeyGeneration: true,
      defaultConfig: {
        props: {
          text: '## Markdown\n\nWrite formatted content here.',
        },
      },
    });
    expect(markdown?.properties?.map(({ key, type }) => [key, type])).toEqual([
      ['props.text', 'Markdown'],
      ['hide', 'Boolean'],
      ['expressions', 'Expressions'],
    ]);
  });

  it('exposes Divider presentation metadata', () => {
    const divider = getFieldType('divider');

    expect(divider).toMatchObject({
      displayName: 'Divider',
      name: 'divider',
      materialSymbol: 'horizontal_rule',
      disableKeyGeneration: true,
      defaultConfig: {
        props: {},
      },
    });
    expect(divider?.properties?.map(({ key, type }) => [key, type])).toEqual([
      ['props.vertical', 'Boolean'],
      ['props.inset', 'Boolean'],
      ['hide', 'Boolean'],
      ['expressions', 'Expressions'],
    ]);
  });

  it('provides choice defaults and provides Button Group defaults', () => {
    ['radio', 'select', 'multicheckbox'].forEach((type) => {
      expect(getFieldType(type)?.defaultConfig).toEqual({ props: { options: starterOptions } });
    });
    expect(getFieldType('button-group')?.defaultConfig).toEqual({
      props: { options: starterOptions },
    });
  });

  it('exposes scalar Button Group properties and option metadata', () => {
    const buttonGroup = getFieldType('button-group');
    const optionsProperty = buttonGroup?.properties?.find(({ key }) => key === 'props.options');

    expect(buttonGroup?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'defaultValue',
      'props.label',
      'props.description',
      'hide',
      'props.options',
      'expressions',
    ]);
    expect(
      buttonGroup?.validationConfig?.rules.map(({ name, property }) => [name, property.key]),
    ).toEqual([['required', 'props.required']]);
    const childProperty =
      optionsProperty && 'childProperty' in optionsProperty
        ? optionsProperty.childProperty
        : undefined;

    expect(
      childProperty && 'childProperties' in childProperty
        ? childProperty.childProperties.map(({ key }) => key)
        : undefined,
    ).toEqual(['label', 'value', 'disabled']);
    expect(
      optionsProperty && 'useTableDialog' in optionsProperty
        ? optionsProperty.useTableDialog
        : undefined,
    ).toBe(true);
  });

  it('registers custom runtime types alongside standard Material types', () => {
    const typeNames = materialFormEditorConfig.configOptions.flatMap(
      (option) => option.types?.map((type) => type.name) ?? [],
    );

    expect(typeNames).toContain('button-group');
    expect(typeNames).toContain('card');
    expect(typeNames).toContain('divider');
    expect(typeNames).toContain('markdown');
    expect(typeNames).toContain('postal-code');
    expect(typeNames).toContain('repeating-section');
    expect(typeNames).toContain('step');
    expect(typeNames).toContain('stepper');
    expect(typeNames).toContain('input');
    expect(typeNames).toContain('select');

    const cardType = materialFormEditorConfig.configOptions
      .flatMap((option) => option.types ?? [])
      .find((type) => type.name === 'card');
    expect(cardType).toEqual({
      name: 'card',
      extends: 'formly-group',
      wrappers: ['card'],
    });
  });

  it('exposes generic Postal Code configuration and regional presets', () => {
    const postalCode = getFieldType('postal-code');

    expect(postalCode?.defaultConfig).toEqual({});
    expect(postalCode?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'defaultValue',
      'props.label',
      'props.placeholder',
      'props.description',
      'props.mask',
      'props.inputMode',
      'props.autoCapitalize',
      'props.storeRawValue',
      'props.autocompleteContext',
      'hide',
      'expressions',
    ]);
    expect(
      postalCode?.validationConfig?.rules.map(({ name, property }) => [name, property.key]),
    ).toEqual([
      ['required', 'props.required'],
      ['postalCodePattern', 'props.postalCodePattern'],
    ]);
    expect(postalCode?.initialPresets).toMatchObject([
      {
        id: 'us-zip-code',
        displayName: 'US ZIP Code',
        isRemovable: false,
        field: {
          type: 'postal-code',
          props: { label: 'ZIP Code', mask: '00000', inputMode: 'numeric' },
        },
      },
      {
        id: 'canada-postal-code',
        displayName: 'Canada Postal Code',
        isRemovable: false,
        field: {
          type: 'postal-code',
          props: { label: 'Postal Code', mask: 'A0A 0A0', inputMode: 'text' },
        },
      },
    ]);
  });

  it('exposes Card as a grouped container without wrapper options', () => {
    const card = getFieldType('card');

    expect(card).toMatchObject({
      displayName: 'Card',
      name: 'card',
      materialSymbol: 'credit_card',
      disableKeyGeneration: true,
      isParent: true,
      defaultConfig: { fieldGroup: [] },
    });
    expect(card?.wrapperOptions).toBeUndefined();
    expect(card?.properties?.map(({ key }) => key)).toEqual([
      'key',
      'props.cardTitle',
      'props.cardSubtitle',
      'hide',
      'expressions',
    ]);
  });

  it('exposes the Material wrappers for Material fields', () => {
    expect(getFieldType('button-group')?.wrapperOptions?.map(({ name }) => name)).toEqual(
      getFieldType('input')?.wrapperOptions?.map(({ name }) => name),
    );
    expect(getFieldType('formly-group')?.wrapperOptions?.map(({ name }) => name)).toEqual(['card']);
    expect(getFieldType('repeating-section')?.wrapperOptions?.map(({ name }) => name)).toEqual([
      'card',
    ]);
    expect(
      getFieldType('formly-group')?.wrapperOptions?.[0].properties?.map(({ key }) => key),
    ).toEqual(['props.cardTitle', 'props.cardSubtitle']);
  });

  it.each([null, { type: 'does-not-exist', key: 'value' }])(
    'rejects invalid children in untyped groups: %j',
    (child) => {
      expect(
        materialFormEditorConfig.schema.safeParse([{ fieldGroup: [{ fieldGroup: [child] }] }])
          .success,
      ).toBe(false);
    },
  );

  it('accepts nested untyped groups with registered fields', () => {
    expect(
      materialFormEditorConfig.schema.safeParse([
        { fieldGroup: [{ fieldGroup: [{ type: 'input', key: 'email' }] }] },
      ]).success,
    ).toBe(true);
  });

  it('keeps validation controls out of general field properties', () => {
    const validationKeys = new Set([
      'props.required',
      'props.min',
      'props.max',
      'props.minLength',
      'props.maxLength',
      'props.pattern',
      'validation.show',
      'validation.messages',
      'validators.validation',
      'asyncValidators.validation',
    ]);

    const misplacedKeys = fieldTypes
      .flatMap((field) => field.properties ?? [])
      .map(({ key }) => key)
      .filter((key) => key && validationKeys.has(key));

    expect(misplacedKeys).toEqual([]);
  });

  it('exposes applicable built-in validation controls by field type', () => {
    expect(
      getFieldType('input')?.validationConfig?.rules.map(({ name, property }) => [
        name,
        property.key,
      ]),
    ).toEqual([
      ['required', 'props.required'],
      ['minLength', 'props.minLength'],
      ['maxLength', 'props.maxLength'],
      ['pattern', 'props.pattern'],
    ]);
    expect(
      getFieldType('number')?.validationConfig?.rules.map(({ name, property }) => [
        name,
        property.key,
      ]),
    ).toEqual([
      ['required', 'props.required'],
      ['min', 'props.min'],
      ['max', 'props.max'],
    ]);
    expect(
      getFieldType('input')?.validationConfig?.displayProperties?.map(({ key }) => key),
    ).toEqual(['validation.show']);
    expect(getFieldType('formly-group')?.validationConfig).toBeUndefined();
  });

  it('enables table editing for choice field options', () => {
    ['radio', 'select', 'multicheckbox'].forEach((type) => {
      const optionsProperty = getFieldType(type)?.properties?.find(
        ({ key }) => key === 'props.options',
      );

      expect(
        optionsProperty && 'useTableDialog' in optionsProperty
          ? optionsProperty.useTableDialog
          : undefined,
      ).toBe(true);
    });
  });

  it('offers only registered Material sync and async validators', () => {
    const inputValidation = getFieldType('input')?.validationConfig;

    expect(inputValidation?.customValidators?.key).toBe('validators.validation');
    expect(inputValidation?.customValidators?.validationOptions).toEqual([
      { label: 'IP Address', value: 'ip' },
    ]);
    expect(inputValidation?.asyncValidators?.key).toBe('asyncValidators.validation');
    expect(inputValidation?.asyncValidators?.validationOptions).toEqual([
      { label: 'IP Address', value: 'ipAsync' },
    ]);

    const registeredValidators = materialFormEditorConfig.configOptions.flatMap(
      (option) => option.validators?.map(({ name }) => name) ?? [],
    );
    expect(registeredValidators).toEqual(expect.arrayContaining(['ip', 'ipAsync']));
  });
});
