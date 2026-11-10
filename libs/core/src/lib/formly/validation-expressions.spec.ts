import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyForm, provideFormlyCore } from '@ngx-formly/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { vanillaLibraryConfig } from '../config/vanilla/vanilla.library';
import { withValidationExpressions } from './validation-expressions';

describe('validation expressions', () => {
  let fixture: ComponentFixture<FormlyForm>;
  let form: UntypedFormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideFormlyCore([...vanillaLibraryConfig.configOptions, withValidationExpressions()]),
      ],
    });
    fixture = TestBed.createComponent(FormlyForm);
    form = new UntypedFormGroup({});
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('model', {});
  });

  async function render(fields: FormlyFieldConfig[]) {
    fixture.componentRef.setInput('fields', JSON.parse(JSON.stringify(fields)));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const fields: FormlyFieldConfig[] = [
    {
      key: 'confirmation',
      type: 'input',
      props: { label: 'Confirm password' },
      validators: {
        matches: {
          expression: 'control.value === model.password',
          message: 'Passwords must match.',
        },
      },
    },
    { key: 'password', type: 'input', props: { label: 'Password' } },
  ];

  it('rechecks a comparison and its message when either sibling changes', async () => {
    await render(fields);
    const confirmation = form.get('confirmation')!;
    const password = form.get('password')!;
    confirmation.markAsTouched();
    confirmation.setValue('secret');
    password.setValue('secret');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(form.valid).toBe(true);

    password.setValue('changed');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(confirmation.hasError('matches')).toBe(true);
    expect(form.valid).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Passwords must match.');

    password.setValue('secret');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(form.valid).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain('Passwords must match.');
  });

  it('uses the local model inside nested groups and survives a rebuild', async () => {
    const nested = [{ key: 'account', fieldGroup: fields }];
    await render(nested);
    await render(nested);
    form.get('account.confirmation')!.setValue('secret');
    form.get('account.password')!.setValue('secret');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(form.valid).toBe(true);
    form.get('account.password')!.setValue('changed');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(form.get('account.confirmation')!.hasError('matches')).toBe(true);
  });

  it('preserves asynchronous validation and does not loop on object values', async () => {
    const asyncCheck = vi.fn(async () => ({ external: true }));
    fixture.componentRef.setInput('fields', [
      {
        key: 'value',
        type: 'input',
        validators: { valid: { expression: 'control.value != null' } },
        asyncValidators: { validation: [asyncCheck] },
      },
    ]);
    fixture.detectChanges();
    form.get('value')!.setValue({ nested: 'value' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(form.get('value')!.hasError('external')).toBe(true);
    expect(asyncCheck.mock.calls.length).toBeLessThan(5);
  });
});
