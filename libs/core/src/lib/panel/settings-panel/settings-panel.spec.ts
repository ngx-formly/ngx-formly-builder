import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createLibrary } from '../../config/library';
import { FormlyBuilderConfig } from '../../config/types';
import { CORE_FORM_STORE } from '../../persistence/types';
import { provideFormlyBuilder } from '../../provider';
import { tailwindConfig } from '../styling-panel/config/tailwind';
import { SettingsPanel } from './settings-panel';

describe('SettingsPanel', () => {
  async function render(config: FormlyBuilderConfig = {}, customStore = false) {
    TestBed.configureTestingModule({
      imports: [SettingsPanel],
      providers: [provideFormlyBuilder(config)],
    });
    if (customStore) TestBed.overrideProvider(CORE_FORM_STORE, { useValue: {} });
    const fixture = TestBed.createComponent(SettingsPanel);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows effective defaults and readable styling choices without a form', async () => {
    const element = await render();
    expect(element.textContent).toContain('form-editor');
    expect(element.textContent).toContain('Enabled');
    expect(element.textContent).toContain('3000 ms');
    expect(element.textContent).toContain('Browser local storage');
    expect(element.textContent).toContain('Vanilla');
    expect(element.textContent).toContain('Provided by UI libraries');
    expect(element.textContent).toContain('Tailwind');
    expect(element.textContent).toContain('48 · 12rem');
    expect(element.querySelector('a[href$="/embed-in-angular/"]')).not.toBeNull();
    expect(element.querySelector('input, select, textarea')).toBeNull();
  });

  it('shows overrides and empty catalogues without exposing store internals', async () => {
    const element = await render(
      {
        editorType: 'customer-surveys',
        autoSave: false,
        autoSaveDelay: 750,
        formTemplates: [],
        styles: {
          ...tailwindConfig,
          label: undefined,
          breakpoints: [],
          className: [],
          fieldGroupClassName: [],
        },
      },
      true,
    );
    expect(element.textContent).toContain('customer-surveys');
    expect(element.textContent).toContain('Disabled');
    expect(element.textContent).toContain('750 ms (inactive)');
    expect(element.textContent).toContain('Custom storage');
    expect(element.textContent).toContain('Shared across UI libraries');
    expect(element.textContent).toContain('No templates configured.');
    expect(element.textContent).toContain('Custom styles');
    expect(element.textContent).toContain('No breakpoints configured.');
    expect(element.textContent).toContain('No styling categories configured.');
  });

  it('matches template precedence and marks libraries retained for saved forms', async () => {
    const element = await render({
      libraries: [
        createLibrary({
          id: 'legacy',
          label: 'Legacy library',
          hidden: true,
          fieldCategoryOptions: [],
          configOptions: [],
          formTemplates: [
            { id: 'old', name: 'Hidden template', fields: [], model: {}, libraryId: 'legacy' },
          ],
        }),
      ],
      formTemplates: [{ id: 'shared', name: 'Shared example', fields: [], model: {} }],
    });
    expect(element.textContent).toContain('Legacy library');
    expect(element.textContent).toContain('Available for saved forms only');
    expect(element.textContent).toContain('Shared example');
    expect(element.textContent).not.toContain('Hidden template');
  });
});
