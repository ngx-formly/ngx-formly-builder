import { TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CoreFormService, CoreLibraryService } from '@ngx-formly/builder';
import { FormlyConfig, FormlyForm } from '@ngx-formly/core';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideFormEditor } from './form-editor.provider';
import { formTemplates } from './form-templates';

describe.each(['form-vanilla', 'form-material', 'form-bootstrap', 'form-ng-zorro'])(
  'shared examples with %s',
  (libraryId) => {
    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        imports: [FormlyForm],
        providers: [provideFormEditor(), provideNoopAnimations()],
      });
    });

    it.each(formTemplates)('renders, validates, exports, and reopens $name', async (template) => {
      const library = TestBed.inject(CoreLibraryService).getLibrary(libraryId)!;
      const schema = library.schema.safeParse(template.fields);
      expect(schema.success, schema.success ? '' : JSON.stringify(schema.error.issues)).toBe(true);
      const forms = TestBed.inject(CoreFormService);
      await firstValueFrom(
        forms.addForm$(template.name, template.fields, template.model, libraryId),
      );
      const id = forms.activeFormId()!;
      expect(forms.formLoadError()).toBeNull();
      const exported = forms.convertToRawForm(forms.activeForm()!);
      expect(exported.libraryId).toBe(libraryId);
      expect(exported.fields).toMatchObject(template.fields);

      const config = TestBed.inject(FormlyConfig);
      library.configOptions.forEach((option) => config.addConfig(option));
      const fixture = TestBed.createComponent(FormlyForm);
      const form = new UntypedFormGroup({});
      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('fields', structuredClone(exported.fields));
      fixture.componentRef.setInput('model', structuredClone(exported.model));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelectorAll('input, textarea, select').length,
      ).toBeGreaterThan(0);
      if (template.id === 'starter') {
        expect(form.valid).toBe(false);
        form.patchValue({
          name: 'Ada',
          email: 'ada@example.com',
          topic: 'general',
          message: 'Hello from the shared example.',
        });
        expect(form.valid).toBe(true);
      } else if (template.id === 'expense-report') {
        expect(form.get('expenseReport.date')?.value).toBe('2026-09-18');
        expect(form.valid).toBe(true);
        form.get('expenseReport.amount')!.setValue(-1);
        expect(form.valid).toBe(false);
        form.get('expenseReport.amount')!.setValue(420);
        expect(form.valid).toBe(true);
      } else {
        const submit = fixture.nativeElement.querySelector(
          'core-example-submit-field button',
        ) as HTMLButtonElement;
        expect(submit).not.toBeNull();
        if (template.id === 'contact-us') {
          expect(form.valid).toBe(false);
          submit.click();
          fixture.detectChanges();
          expect(form.get('firstName')?.touched).toBe(true);
          expect(fixture.nativeElement.textContent).toContain(
            'Please complete the required fields',
          );
          form.patchValue({
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.com',
            subject: 'general',
            message: 'Hello from the contact example.',
          });
        } else {
          expect(form.valid).toBe(true);
          expect(fixture.nativeElement.querySelector('input[type="file"]').accept).toBe('image/*');
          form.get('bio')!.setValue('x'.repeat(501));
          expect(form.valid).toBe(false);
          form.get('bio')!.setValue('My short bio.');
        }
        expect(form.valid).toBe(true);
        form.get('email')!.setValue('invalid-email');
        expect(form.valid).toBe(false);
        form.get('email')!.setValue('ada@example.com');
        submit.click();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Demo complete. No data was sent.');
      }

      forms.setActiveForm(null);
      forms.setActiveForm(id);
      expect(forms.formLoadError()).toBeNull();
      expect(forms.activeForm()?.libraryId).toBe(libraryId);
      expect(forms.convertToRawForm(forms.activeForm()!).model).toEqual(template.model);
    });
  },
);
