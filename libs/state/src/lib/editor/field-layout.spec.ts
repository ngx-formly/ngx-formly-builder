import { TestBed } from '@angular/core/testing';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BuilderEngineService } from './builder-engine.service';
import { provideBuilderEngine } from './provider';
import { isLayoutRow } from './field-layout';

describe('directional field drops', () => {
  let engine: BuilderEngineService;
  const fields = ['name', 'email', 'phone'].map((key) => ({ type: 'input', key }));

  function load(config: FormlyFieldConfig[] = fields, model = {}) {
    engine.addForm$('Layout', config, model, 'test').subscribe();
    return engine.activeRootFieldIds();
  }

  function children(id: string) {
    return engine.getField(id)!._info.childIds;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideBuilderEngine({
          editorType: 'layout-test',
          autoSave: false,
          libraries: [
            {
              id: 'test',
              fieldTypes: [
                { name: 'input', displayName: 'Input', defaultConfig: {} },
                {
                  name: 'formly-group',
                  displayName: 'Group',
                  isParent: true,
                  disableKeyGeneration: true,
                  defaultConfig: {},
                },
                {
                  name: 'repeat',
                  displayName: 'Repeat',
                  isParent: true,
                  isFieldArray: true,
                  defaultConfig: {},
                },
              ],
            },
          ],
        }),
      ],
    });
    engine = TestBed.inject(BuilderEngineService);
  });

  it.each(['left', 'right'] as const)(
    'creates a row on a %s drop without changing field data',
    (position) => {
      const [name, email, phone] = load(
        [
          { ...fields[0], className: 'custom-field', validators: { validation: ['email'] } },
          fields[1],
          fields[2],
        ],
        { name: 'Ada', email: 'ada@example.com' },
      );
      engine.dropField(name, position, { fieldId: email });
      const [row, remaining] = engine.activeRootFieldIds();
      expect(remaining).toBe(phone);
      expect(isLayoutRow(engine.getField(row))).toBe(true);
      expect(engine.getField(row)?.key).toBeUndefined();
      expect(children(row)).toEqual(position === 'left' ? [email, name] : [name, email]);
      expect(engine.getField(name)?._info.idPath).toEqual([row, name]);
      expect(engine.getField(name)?.className).toBe('custom-field');
      expect(engine.getField(name)?.validators).toEqual({ validation: ['email'] });
      expect(engine.activeModel()).toEqual({ name: 'Ada', email: 'ada@example.com' });
      expect(engine.activeFieldId()).toBe(email);
    },
  );

  it('joins and reorders an existing row without nesting new rows', () => {
    const [name, email, phone] = load();
    engine.dropField(name, 'right', { fieldId: email });
    const row = engine.activeRootFieldIds()[0];
    engine.dropField(email, 'left', { fieldId: phone });
    expect(children(row)).toEqual([name, phone, email]);
    engine.dropField(email, 'right', { fieldId: name });
    expect(children(row)).toEqual([phone, email, name]);
    engine.dropField(phone, 'left', { fieldId: name });
    expect(children(row)).toEqual([name, phone, email]);
    expect(engine.activeFieldCount()).toBe(4);
  });

  it.each(['top', 'bottom'] as const)('extracts a field %s of the whole target row', (position) => {
    const [name, email, phone] = load();
    engine.dropField(name, 'right', { fieldId: email });
    engine.dropField(email, 'right', { fieldId: phone });
    const row = engine.activeRootFieldIds()[0];
    engine.dropField(email, position, { fieldId: phone });
    expect(engine.activeRootFieldIds()).toEqual(position === 'top' ? [phone, row] : [row, phone]);
    expect(children(row)).toEqual([name, email]);
    expect(engine.getField(phone)?._info.idPath).toEqual([phone]);
  });

  it('reorders vertically in both directions without off-by-one shifts', () => {
    const [name, email, phone] = load();
    engine.dropField(phone, 'bottom', { fieldId: name });
    expect(engine.activeRootFieldIds()).toEqual([email, phone, name]);
    engine.dropField(email, 'top', { fieldId: name });
    expect(engine.activeRootFieldIds()).toEqual([name, email, phone]);
  });

  it('drops a new preset into a row and preserves its configuration', () => {
    const [name] = load();
    engine.dropField(name, 'left', {
      fieldType: 'input',
      preset: { field: { type: 'input', key: 'city', props: { label: 'City', required: true } } },
    });
    const row = engine.activeRootFieldIds()[0];
    expect(children(row)[0]).toBe(engine.activeFieldId());
    expect(engine.activeField()?.props).toEqual({ label: 'City', required: true });
    expect(engine.activeModel()).toEqual({});
  });

  it('cleans up empty generated rows after moves and deletion, keeping ordinary groups', () => {
    const [name, email, phone] = load();
    engine.dropField(name, 'right', { fieldId: email });
    const row = engine.activeRootFieldIds()[0];
    engine.dropField(phone, 'bottom', { fieldId: name });
    expect(children(row)).toEqual([email]);
    engine.setActiveField(row);
    engine.removeField(email);
    expect(engine.getField(row)).toBeUndefined();
    expect(engine.activeFieldId()).toBeNull();
    expect(engine.activeRootFieldIds()).toEqual([phone, name]);

    const [ordinary] = load([{ type: 'formly-group', fieldGroup: [fields[0]] }]);
    engine.removeField(children(ordinary)[0]);
    expect(engine.getField(ordinary)).toBeDefined();
  });

  it('cleans up rows when the existing move API moves their last child', () => {
    const [name, email] = load();
    engine.dropField(name, 'right', { fieldId: email });
    const row = engine.activeRootFieldIds()[0];
    engine.moveField(name, 0, undefined);
    engine.moveField(email, 0, undefined);
    expect(engine.getField(row)).toBeUndefined();
    expect(engine.getField(email)?._info.idPath).toEqual([email]);
  });

  it('removes values belonging to a deleted row without clearing other fields', () => {
    const [name, email] = load(fields, { name: 'Ada', email: 'ada@example.com', phone: '123' });
    engine.dropField(name, 'right', { fieldId: email });
    engine.removeField(engine.activeRootFieldIds()[0]);
    expect(engine.activeModel()).toEqual({ phone: '123' });
  });

  it('keeps nested model paths and descendants intact when grouping inside a keyed group', () => {
    const [group] = load(
      [
        {
          type: 'formly-group',
          key: 'person',
          fieldGroup: [
            { type: 'formly-group', key: 'address', fieldGroup: [fields[0]] },
            fields[1],
          ],
        },
      ],
      { person: { address: { name: 'Ada' }, email: 'ada@example.com' } },
    );
    const [address, email] = children(group);
    const name = children(address)[0];
    engine.dropField(address, 'left', { fieldId: email });
    const row = children(group)[0];
    expect(engine.getField(name)?._info.idPath).toEqual([group, row, address, name]);
    expect(engine.activeModel()).toEqual({
      person: { address: { name: 'Ada' }, email: 'ada@example.com' },
    });
    engine.removeField(name);
    expect(engine.activeModel()).toEqual({ person: { address: {}, email: 'ada@example.com' } });
  });

  it('rejects self, descendant, missing and cross-model moves without changing the document', () => {
    const [group, outside] = load([
      { type: 'formly-group', key: 'person', fieldGroup: fields },
      fields[0],
    ]);
    const inside = children(group)[0];
    const before = engine.activeForm();
    for (const [source, target, position] of [
      [group, inside, 'left'],
      [inside, inside, 'right'],
      [outside, inside, 'left'],
      [inside, outside, 'top'],
      [outside, group, 'center'],
      ['missing', outside, 'bottom'],
    ] as const) {
      expect(engine.canDropField(source, target, position)).toBe(false);
      engine.dropField(target, position, { fieldId: source });
      expect(engine.activeForm()).toBe(before);
    }
  });

  it('allows adding inside a group, but does not overwrite repeater templates', () => {
    const [group, repeater] = load([
      { type: 'formly-group', fieldGroup: [] },
      { type: 'repeat', key: 'people', fieldArray: { type: 'formly-group', fieldGroup: fields } },
    ]);
    engine.dropField(group, 'center', { fieldType: 'input' });
    expect(children(group)).toHaveLength(1);
    const template = children(repeater)[0];
    const before = engine.activeForm();
    engine.dropField(repeater, 'center', { fieldType: 'input' });
    engine.dropField(template, 'right', { fieldType: 'input' });
    expect(engine.activeForm()).toBe(before);
    const [name, email] = children(template);
    engine.dropField(name, 'right', { fieldId: email });
    expect(isLayoutRow(engine.getField(children(template)[0]))).toBe(true);
  });

  it('round-trips rows through export, save and reload without generating a row key', () => {
    const [name, email] = load();
    engine.dropField(name, 'right', { fieldId: email });
    const exported = engine.activePreviewFormFields();
    expect(exported[0]).not.toHaveProperty('_info');
    expect(exported[0].fieldGroup?.map((field) => field.key)).toEqual(['name', 'email']);
    engine.saveActiveForm();
    const id = engine.activeFormId()!;
    engine.addForm$('Other', [], {}, 'test').subscribe();
    engine.setActiveForm(id);
    expect(engine.activePreviewFormFields()).toEqual(exported);
    const row = engine.activeRootFieldIds()[0];
    expect(engine.getField(row)?._info).toMatchObject({ name: 'Row', isParent: true });
    const [first, second] = children(row);
    engine.dropField(first, 'left', { fieldId: second });
    expect(children(row)).toEqual([second, first]);
  });
});
