import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormBuilder, provideFormlyCore } from '@ngx-formly/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationExpressionEditor } from './validation-expression-editor';

describe('ValidationExpressionEditor', () => {
  let fixture: ComponentFixture<ValidationExpressionEditor>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ValidationExpressionEditor],
      providers: [provideFormlyCore()],
    });
    fixture = TestBed.createComponent(ValidationExpressionEditor);
    fixture.detectChanges();
    fixture.componentInstance['name'].set('minimumAge');
    fixture.componentInstance['expression'].set('control.value >= 18');
    fixture.componentInstance['message'].set('Enter an age of at least 18.');
  });

  it('saves a portable rule that validates after a JSON round trip', () => {
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance['save']();
    expect(saved).toHaveBeenCalledWith({
      name: 'minimumAge',
      rule: { expression: 'control.value >= 18', message: 'Enter an age of at least 18.' },
    });

    const { name, rule } = saved.mock.calls[0][0];
    const fields: FormlyFieldConfig[] = JSON.parse(
      JSON.stringify([{ key: 'age', validators: { [name]: rule } }]),
    );
    const form = new UntypedFormGroup({});
    fixture.debugElement.injector.get(FormlyFormBuilder).buildForm(form, fields, {}, {});
    form.get('age')!.setValue(17);
    expect(form.get('age')!.hasError('minimumAge')).toBe(true);
    form.get('age')!.setValue(18);
    expect(form.valid).toBe(true);
  });

  it.each(['validation', 'constructor', '__proto__', 'required', 'ip', 'bad.name'])(
    'rejects the unsafe, duplicate, or reserved name %s',
    (name) => {
      fixture.componentRef.setInput('reservedNames', ['ip']);
      fixture.componentInstance['name'].set(name);
      const saved = vi.fn();
      fixture.componentInstance.saved.subscribe(saved);
      fixture.componentInstance['save']();
      expect(saved).not.toHaveBeenCalled();
      expect(fixture.componentInstance['error']()).not.toBe('');
    },
  );

  it.each(['control.value >=', 'alert(1)', 'control.value = 18'])(
    'rejects unsupported syntax without saving: %s',
    (expression) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      fixture.componentInstance['expression'].set(expression);
      const saved = vi.fn();
      fixture.componentInstance.saved.subscribe(saved);
      fixture.componentInstance['save']();
      expect(saved).not.toHaveBeenCalled();
      expect(fixture.componentInstance['error']()).toContain('not supported');
      vi.restoreAllMocks();
    },
  );

  it('requires a condition and a correction message', () => {
    fixture.componentInstance['message'].set(' ');
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance['save']();
    expect(saved).not.toHaveBeenCalled();
    expect(fixture.componentInstance['error']()).toContain('error message');
  });

  it('allows editing the existing rule under its current name', () => {
    fixture.componentRef.setInput('originalName', 'minimumAge');
    fixture.componentRef.setInput('reservedNames', ['minimumAge']);
    fixture.componentRef.setInput('rule', {
      expression: 'control.value >= 21',
      message: 'Enter 21 or more.',
    });
    fixture.detectChanges();
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    fixture.componentInstance['save']();
    expect(saved).toHaveBeenCalledWith({
      name: 'minimumAge',
      rule: { expression: 'control.value >= 21', message: 'Enter 21 or more.' },
    });
  });
});
