import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  FieldArrayType,
  FieldType,
  FieldTypeConfig,
  FormlyField,
  FormlyFieldConfig,
  FormlyForm,
  provideFormlyCore,
} from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BuilderEngineService } from './builder-engine.service';
import { provideBuilderEngine } from './provider';
import { PropertyChangeType } from './property-change';

@Component({
  selector: 'core-preview-test-input',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="formControl" [attr.aria-label]="props.label" />',
})
class TestInput extends FieldType<FieldTypeConfig> {}

@Component({
  selector: 'core-preview-test-array',
  imports: [FormlyField],
  template: `@for (item of field.fieldGroup; track item) {
    <formly-field [field]="item" />
  }`,
})
class TestArray extends FieldArrayType {}

describe('stable builder previews', () => {
  let engine: BuilderEngineService;
  const input = (key: string): FormlyFieldConfig => ({ key, type: 'input', props: { label: key } });

  beforeEach(() => {
    localStorage.clear();
    const fieldTypes = [
      { name: 'input', displayName: 'Input', defaultConfig: {} },
      { name: 'group', displayName: 'Group', defaultConfig: {}, isParent: true },
      {
        name: 'array',
        displayName: 'Array',
        defaultConfig: {},
        isParent: true,
        isFieldArray: true,
      },
    ];
    TestBed.configureTestingModule({
      providers: [
        provideFormlyCore({
          types: [
            { name: 'input', component: TestInput },
            { name: 'group', extends: 'formly-group' },
            { name: 'array', component: TestArray },
          ],
        }),
        provideBuilderEngine({
          editorType: 'preview-test',
          autoSave: false,
          libraries: [
            { id: 'test', fieldTypes },
            { id: 'other', fieldTypes },
          ],
        }),
      ],
    });
    engine = TestBed.inject(BuilderEngineService);
  });

  function edit(id: string, path: string[], value: unknown) {
    engine.setActiveField(id);
    engine.modifyActiveField({ type: PropertyChangeType.VALUE, path, value });
  }

  async function render() {
    const fields = engine.createPreviewFields();
    const fixture = TestBed.createComponent(FormlyForm);
    const form = new UntypedFormGroup({});
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('model', structuredClone(engine.activeModel()));
    fixture.componentRef.setInput('fields', fields());
    fixture.autoDetectChanges();
    await fixture.whenStable();
    return {
      fields,
      fixture,
      form,
      inputs: () => [...fixture.nativeElement.querySelectorAll('input')] as HTMLInputElement[],
      refresh: async () => {
        fixture.componentRef.setInput('fields', fields());
        await fixture.whenStable();
      },
    };
  }

  it('preserves unrelated inputs and control state while isolating simultaneous renderers', async () => {
    engine
      .addForm$(
        'First',
        [input('name'), input('email')],
        { name: 'Ada', email: 'a@example.test' },
        'test',
      )
      .subscribe();
    const first = await render();
    const second = await render();
    const untouched = first.inputs()[1];
    const control = first.form.get('email')!;
    control.markAsDirty();
    control.markAsTouched();
    expect(first.fields()[1]).not.toBe(second.fields()[1]);
    expect(control).not.toBe(second.form.get('email'));

    edit(engine.activeRootFieldIds()[0], ['props', 'label'], 'Full name');
    await first.refresh();
    await second.refresh();

    expect(first.inputs()[0].getAttribute('aria-label')).toBe('Full name');
    expect(first.inputs()[1]).toBe(untouched);
    expect(first.form.get('email')).toBe(control);
    expect(control.dirty && control.touched).toBe(true);
    first.form.get('name')!.setValue('Grace');
    expect(second.form.get('name')!.value).toBe('Ada');
    expect(JSON.parse(engine.activeFormFieldsJSON())).toEqual([
      { ...input('name'), props: { label: 'Full name' } },
      input('email'),
    ]);
    first.fixture.destroy();
    edit(engine.activeRootFieldIds()[0], ['props', 'required'], true);
    await second.refresh();
    expect(second.form.get('name')!.value).toBe('Ada');
  });

  it('updates nested fields without replacing unaffected siblings', async () => {
    engine
      .addForm$(
        'Nested',
        [
          { type: 'group', key: 'person', fieldGroup: [input('name'), input('email')] },
          input('outside'),
        ],
        { person: { name: 'Ada', email: 'saved' } },
        'test',
      )
      .subscribe();
    const preview = await render();
    const [group] = engine.activeRootFieldIds();
    const [name] = engine.getField(group)!._info.childIds;
    const [, email, outside] = preview.inputs();
    edit(name, ['props', 'label'], 'Full name');
    await preview.refresh();
    expect(preview.inputs()[0].getAttribute('aria-label')).toBe('Full name');
    expect(preview.inputs()[1]).toBe(email);
    expect(preview.inputs()[2]).toBe(outside);
    expect(preview.form.get('person.email')!.value).toBe('saved');
    edit(group, ['props', 'disabled'], true);
    await preview.refresh();
    expect(preview.form.get('person.name')!.disabled).toBe(true);
    expect(preview.form.get('person.email')!.disabled).toBe(true);
    edit(group, ['props', 'disabled'], false);
    await preview.refresh();
    expect(preview.form.get('person.email')!.disabled).toBe(false);
  });

  it('rebinds descendants after a parent key change or reparenting', async () => {
    engine
      .addForm$(
        'Paths',
        [
          { type: 'group', key: 'person', fieldGroup: [input('name')] },
          { type: 'group', key: 'target', fieldGroup: [input('email')] },
        ],
        {
          person: { name: 'Ada' },
          renamed: { name: 'Grace' },
          target: { name: 'Lin', email: 'saved' },
        },
        'test',
      )
      .subscribe();
    const preview = await render();
    const [group, target] = engine.activeRootFieldIds();
    const [name] = engine.getField(group)!._info.childIds;
    edit(group, ['key'], 'renamed');
    await preview.refresh();
    expect(preview.inputs()[0].value).toBe('Grace');
    engine.moveField(name, 0, 0, target);
    await preview.refresh();
    expect(preview.inputs().map((element) => element.value)).toEqual(['Lin', 'saved']);
    expect(preview.form.get('target.name')!.value).toBe('Lin');
  });

  it('updates repeater templates and keeps unrelated previews intact', async () => {
    engine
      .addForm$(
        'Repeater',
        [
          {
            type: 'array',
            key: 'people',
            fieldArray: { type: 'group', fieldGroup: [input('name')] },
          },
          input('outside'),
        ],
        { people: [{ name: 'Ada' }, { name: 'Grace' }] },
        'test',
      )
      .subscribe();
    const preview = await render();
    const outside = preview.inputs()[2];
    const [array] = engine.activeRootFieldIds();
    const [group] = engine.getField(array)!._info.childIds;
    const [name] = engine.getField(group)!._info.childIds;
    edit(name, ['props', 'label'], 'Full name');
    await preview.refresh();
    expect(
      preview
        .inputs()
        .slice(0, 2)
        .map((element) => element.getAttribute('aria-label')),
    ).toEqual(['Full name', 'Full name']);
    expect(
      preview
        .inputs()
        .slice(0, 2)
        .map((element) => element.value),
    ).toEqual(['Ada', 'Grace']);
    expect(preview.inputs()[2]).toBe(outside);
    preview.fixture.componentRef.setInput('model', {
      people: [{ name: 'Ada' }, { name: 'Grace' }, { name: 'Lin' }],
    });
    await preview.refresh();
    edit(engine.activeRootFieldIds()[1], ['props', 'label'], 'Other');
    await preview.refresh();
    expect(
      preview
        .inputs()
        .slice(0, 3)
        .map((element) => element.value),
    ).toEqual(['Ada', 'Grace', 'Lin']);
    preview.fixture.componentRef.setInput('model', { people: [{ name: 'Ada' }] });
    await preview.refresh();
    expect(preview.inputs()).toHaveLength(2);
    expect(JSON.parse(engine.activeFormFieldsJSON())[0].fieldArray.fieldGroup[0].props.label).toBe(
      'Full name',
    );
  });

  it('handles reordering, deletion and switching forms and libraries', async () => {
    engine
      .addForm$(
        'First',
        [input('first'), input('second'), input('third')],
        { first: '1', second: '2', third: '3' },
        'test',
      )
      .subscribe();
    const preview = await render();
    const original = preview.fields();
    const [first, second] = engine.activeRootFieldIds();
    engine.moveField(second, 1, 0);
    await preview.refresh();
    expect(preview.fields()[0].key).toBe('second');
    expect(preview.inputs().map((element) => element.value)).toEqual(['2', '1', '3']);
    expect(preview.fields()[2]).toBe(original[2]);
    engine.removeField(first);
    await preview.refresh();
    expect(preview.inputs().map((element) => element.value)).toEqual(['2', '3']);
    engine.setActiveForm(null);
    await preview.refresh();
    expect(preview.inputs()).toEqual([]);
    engine.addForm$('Other', [input('second')], { second: 'new' }, 'other').subscribe();
    preview.fixture.componentRef.setInput('model', structuredClone(engine.activeModel()));
    await preview.refresh();
    expect(preview.inputs()[0].value).toBe('new');
    expect(preview.fields()[0]).not.toBe(original[1]);
  });
});
