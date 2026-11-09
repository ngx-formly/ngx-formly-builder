import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig, FormlyForm, provideFormlyCore } from '@ngx-formly/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { FormlyConfigService } from '../../formly/formly-config.service';
import { provideFormlyBuilder } from '../../provider';
import { CoreLibraryService } from '../core-library.service';
import { createLibrary } from '../library';
import { VanillaField } from './vanilla-field';
import { vanillaLibraryConfig, VANILLA_LIBRARY_ID } from './vanilla.library';

describe('Vanilla fields', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideFormlyCore(vanillaLibraryConfig.configOptions)],
    }),
  );

  async function render(fields: FormlyFieldConfig[]) {
    const fixture = TestBed.createComponent(FormlyForm);
    const form = new FormGroup({});
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('model', {});
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, form, element: fixture.nativeElement as HTMLElement };
  }

  it('renders native controls, associates labels, and preserves model value types', async () => {
    const { form, element } = await render([
      {
        type: 'formly-group',
        fieldGroup: [
          { key: 'name', type: 'input', props: { label: 'Name' } },
          { key: 'age', type: 'number', props: { label: 'Age' } },
          { key: 'notes', type: 'textarea', props: { label: 'Notes', rows: 4 } },
          { key: 'accepted', type: 'checkbox', props: { label: 'Accepted', required: true } },
          {
            key: 'choice',
            type: 'select',
            props: {
              label: 'Choice',
              options: [
                { label: 'One', value: 1 },
                { label: 'Disabled', value: 2, disabled: true },
              ],
            },
          },
        ],
      },
    ]);

    for (const label of element.querySelectorAll('label')) {
      expect(element.querySelector(`[id="${label.htmlFor}"]`)).not.toBeNull();
    }
    const input = element.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'Sam';
    input.dispatchEvent(new Event('input'));
    const number = element.querySelector('input[type="number"]') as HTMLInputElement;
    number.value = '42';
    number.dispatchEvent(new Event('input'));
    const textarea = element.querySelector('textarea')!;
    expect(textarea.rows).toBe(4);
    textarea.value = 'Hello';
    textarea.dispatchEvent(new Event('input'));
    const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(form.valid).toBe(false);
    checkbox.click();
    const select = element.querySelector('select')!;
    expect(select.options[2].disabled).toBe(true);
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change'));

    expect(form.value).toEqual({ name: 'Sam', age: 42, notes: 'Hello', accepted: true, choice: 1 });
    expect(form.valid).toBe(true);
  });

  it('renders validation and descriptions and respects disabled fields', async () => {
    const { element, form } = await render([
      {
        key: 'name',
        type: 'input',
        props: { label: 'Name', description: 'Your name', required: true },
        validation: { show: true },
      },
      { key: 'disabled', type: 'input', props: { label: 'Disabled', disabled: true } },
    ]);
    const [input, disabled] = element.querySelectorAll('input');
    expect(form.valid).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(element.textContent).toContain('This field is required.');
    expect(element.querySelector(`[id="${input.id}-description"]`)?.textContent).toBe('Your name');
    expect(disabled.disabled).toBe(true);
  });

  it('validates supported field types and rejects unknown types on import', () => {
    expect(vanillaLibraryConfig.schema.safeParse([{ type: 'input', key: 'name' }]).success).toBe(
      true,
    );
    expect(vanillaLibraryConfig.schema.safeParse([{ type: 'unknown' }]).success).toBe(false);
  });
});

it('isolates vanilla controls when switching between configured libraries', () => {
  const custom = createLibrary({
    id: 'custom',
    label: 'Custom',
    fieldCategoryOptions: [],
    formTemplates: [],
    configOptions: [{ types: [{ name: 'custom-input' }] }],
  });
  TestBed.configureTestingModule({
    providers: [provideFormlyBuilder({ libraries: [custom] }), FormlyConfigService],
  });
  const libraries = TestBed.inject(CoreLibraryService);
  const loader = TestBed.inject(FormlyConfigService);
  const config = TestBed.inject(FormlyConfig);
  libraries.setActiveLibrary(VANILLA_LIBRARY_ID);
  loader.loadLibraryConfigOptions();
  expect(config.getType('input')?.component).toBe(VanillaField);
  libraries.setActiveLibrary(custom.id);
  loader.loadLibraryConfigOptions();
  expect(config.getType('input')).toBeNull();
  expect(config.getType('custom-input')).not.toBeNull();
  libraries.setActiveLibrary(VANILLA_LIBRARY_ID);
  loader.loadLibraryConfigOptions();
  expect(config.getType('input')?.component).toBe(VanillaField);
  expect(config.getType('custom-input')).toBeNull();
});
