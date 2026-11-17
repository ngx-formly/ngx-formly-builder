import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CoreFormService } from '../../editor/core-form.service';
import { provideFormlyBuilder } from '../../provider';
import { VANILLA_LIBRARY_ID } from '../../config/vanilla/vanilla.library';
import { PropertyChangeType } from '@ngx-formly/builder';
import { FormPreviewRenderer } from './form-preview-renderer';

describe('Studio preview rendering', () => {
  let engine: CoreFormService;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideFormlyBuilder({ autoSave: false })] });
    engine = TestBed.inject(CoreFormService);
    engine
      .addForm$(
        'Preview',
        [
          {
            type: 'formly-group',
            key: 'person',
            fieldGroup: [
              { type: 'input', key: 'name', props: { label: 'Name' } },
              { type: 'input', key: 'email', props: { label: 'Email' } },
            ],
          },
        ],
        { person: { name: 'Ada', email: 'saved' } },
        VANILLA_LIBRARY_ID,
      )
      .subscribe();
  });

  async function render() {
    const fixture = TestBed.createComponent(FormPreviewRenderer);
    fixture.componentRef.setInput('formFields', engine.activePreviewFormFields());
    fixture.autoDetectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('keeps nested inputs, form state and separate renderer controls across edits', async () => {
    const first = await render();
    const second = await render();
    const form = first.componentInstance.formGroup;
    const email = first.nativeElement.querySelectorAll('input')[1];
    form.get('person.email')!.markAsTouched();
    form.get('person.email')!.markAsDirty();
    const [group] = engine.activeRootFieldIds();
    const [name] = engine.getField(group)!._info.childIds;
    engine.setActiveField(name);
    engine.modifyActiveField({
      type: PropertyChangeType.VALUE,
      path: ['props', 'label'],
      value: 'Full name',
    });
    for (const fixture of [first, second]) {
      fixture.componentRef.setInput('formFields', engine.activePreviewFormFields());
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain('Full name');
    }
    expect(first.componentInstance.formGroup).toBe(form);
    expect(first.nativeElement.querySelectorAll('input')[1]).toBe(email);
    expect(form.get('person.email')!.touched && form.get('person.email')!.dirty).toBe(true);
    expect(second.componentInstance.formGroup.get('person.email')).not.toBe(
      form.get('person.email'),
    );
    expect(engine.activePreviewFormFields()[0].fieldGroup![0].formControl).toBeUndefined();
    expect(JSON.parse(engine.activeFormFieldsJSON())[0].fieldGroup[0].props).toEqual({
      label: 'Full name',
    });
  });

  it('creates a fresh form when the active document changes', async () => {
    const fixture = await render();
    const first = fixture.componentInstance.formGroup;
    first.markAsTouched();
    engine
      .addForm$(
        'Other',
        [{ key: 'name', type: 'input', props: { label: 'Other name' } }],
        { name: 'Grace' },
        VANILLA_LIBRARY_ID,
      )
      .subscribe();
    fixture.componentRef.setInput('formFields', engine.activePreviewFormFields());
    await fixture.whenStable();
    expect(fixture.componentInstance.formGroup).not.toBe(first);
    expect(fixture.componentInstance.formGroup.touched).toBe(false);
    expect(fixture.nativeElement.querySelector('input').value).toBe('Grace');
  });
});
