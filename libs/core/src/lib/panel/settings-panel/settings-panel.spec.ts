import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLibrary } from '../../config/library';
import { FormlyBuilderConfig } from '../../config/types';
import { CoreFormService } from '../../editor/core-form.service';
import { LocalFormStoreService } from '../../persistence/local-form-store.service';
import { CORE_FORM_STORE } from '../../persistence/types';
import { provideFormlyBuilder } from '../../provider';
import { tailwindConfig } from '../styling-panel/config/tailwind';
import { SettingsPanel } from './settings-panel';

describe('SettingsPanel', () => {
  async function render(config: FormlyBuilderConfig = {}, customStore?: object) {
    TestBed.configureTestingModule({
      imports: [SettingsPanel],
      providers: [provideFormlyBuilder(config)],
    });
    if (customStore) TestBed.overrideProvider(CORE_FORM_STORE, { useValue: customStore });
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
      {},
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

  it('shows the label a custom store declares', async () => {
    const element = await render({}, { label: 'Team API' });
    expect(element.textContent).toContain('Team API');
    expect(element.textContent).not.toContain('Custom storage');
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

  describe('editable settings', () => {
    const storageKey = 'formly-studio-settings-form-editor';

    async function renderEditable(
      config: FormlyBuilderConfig = {},
      prepare: (store: LocalFormStoreService) => void = () => undefined,
    ) {
      const store = new LocalFormStoreService();
      prepare(store);
      TestBed.configureTestingModule({
        imports: [SettingsPanel],
        providers: [provideFormlyBuilder({ editableSettings: true, ...config })],
      });
      TestBed.overrideProvider(CORE_FORM_STORE, { useValue: store });
      const fixture = TestBed.createComponent(SettingsPanel);
      const element = fixture.nativeElement as HTMLElement;
      const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
      };
      await settle();
      const button = (label: string) =>
        [...element.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)!;
      const control = (label: string) =>
        [...element.querySelectorAll('label')]
          .find((l) => l.textContent?.trim() === label)!
          .querySelector('input')!;
      return {
        fixture,
        element,
        store,
        forms: TestBed.inject(CoreFormService),
        settle,
        button,
        autosave: () => control('Autosave'),
        delay: () => control('Autosave delay (ms)'),
        text: (role: string) =>
          [...element.querySelectorAll(`[role="${role}"]`)].map((e) => e.textContent?.trim()),
        typeDelay: async (value: string) => {
          control('Autosave delay (ms)').value = value;
          control('Autosave delay (ms)').dispatchEvent(new Event('input', { bubbles: true }));
          await settle();
        },
        chooseFile: async (content: string) => {
          const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
          // jsdom does not implement File.text().
          const file = Object.assign(new File([content], 'settings.json'), {
            text: () => Promise.resolve(content),
          });
          Object.defineProperty(input, 'files', { configurable: true, value: [file] });
          input.dispatchEvent(new Event('change', { bubbles: true }));
          fixture.detectChanges();
          expect(button('Save settings').disabled).toBe(true);
          await vi.waitFor(async () => {
            await settle();
            expect(button('Save settings').disabled).toBe(false);
          });
        },
        click: async (target: HTMLElement) => {
          target.click();
          await settle();
        },
      };
    }

    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it('shows the effective autosave settings as controls', async () => {
      const { element, autosave, delay } = await renderEditable({ autoSaveDelay: 750 });
      expect(element.textContent).toContain(
        'Autosave can be changed here; other settings come from the host application',
      );
      expect(element.textContent).toContain('form-editor');
      expect(element.textContent).toContain('Browser local storage');
      expect(autosave().checked).toBe(true);
      expect(delay().value).toBe('750');
      expect(delay().disabled).toBe(false);
    });

    it('shows saved settings that arrive after the panel', async () => {
      const saved = new Subject<{ autoSave: boolean; autoSaveDelay: number }>();
      const { autosave, delay, settle } = await renderEditable({}, (store) =>
        vi.spyOn(store, 'getSettings$').mockReturnValue(saved),
      );
      expect(delay().value).toBe('3000');

      saved.next({ autoSave: false, autoSaveDelay: 500 });
      await settle();

      expect(autosave().checked).toBe(false);
      expect(delay().value).toBe('500');
    });

    it('saves and applies the edited settings', async () => {
      const { forms, typeDelay, click, button, text } = await renderEditable();
      await typeDelay('750');
      await click(button('Save settings'));

      expect(forms.settings()).toEqual({ autoSave: true, autoSaveDelay: 750 });
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(forms.settings());
      expect(text('status')).toEqual(['Settings updated.']);

      await typeDelay('800');
      expect(text('status')).toEqual(['']);
    });

    it('disables the delay without autosave and keeps its saved value', async () => {
      const { forms, autosave, delay, typeDelay, click, button } = await renderEditable();
      await typeDelay('-1');
      await click(autosave());
      expect(delay().disabled).toBe(true);
      await click(button('Save settings'));

      expect(forms.settings()).toEqual({ autoSave: false, autoSaveDelay: 3000 });
      expect(delay().value).toBe('3000');
    });

    it.each(['', '-1', '1.5', '2147483648'])('does not save the delay "%s"', async (value) => {
      const { forms, delay, typeDelay, click, button, text } = await renderEditable();
      await typeDelay(value);
      expect(delay().validity.valid).toBe(false);
      await click(button('Save settings'));

      expect(forms.settings().autoSaveDelay).toBe(3000);
      expect(localStorage.getItem(storageKey)).toBeNull();
      expect(text('alert')).toEqual([]);
    });

    it('resets to the host settings and discards unsaved edits', async () => {
      localStorage.setItem(storageKey, JSON.stringify({ autoSave: false, autoSaveDelay: 500 }));
      const { forms, autosave, delay, typeDelay, click, button } = await renderEditable({
        autoSaveDelay: 750,
      });
      expect(autosave().checked).toBe(false);
      await click(button('Reset to host defaults'));

      expect(forms.settings()).toEqual({ autoSave: true, autoSaveDelay: 750 });
      expect(autosave().checked).toBe(true);
      expect(delay().value).toBe('750');

      await typeDelay('900');
      await click(button('Reset to host defaults'));
      expect(delay().value).toBe('750');
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(forms.settings());
    });

    it('reports a failed save and keeps the current settings and the edit', async () => {
      const { forms, store, delay, typeDelay, click, button, text } = await renderEditable();
      vi.spyOn(store, 'saveSettings$').mockReturnValue(throwError(() => new Error('500')));
      await typeDelay('750');
      await click(button('Save settings'));

      expect(text('alert')).toEqual(['Settings could not be saved.']);
      expect(text('status')).toEqual(['']);
      expect(forms.settings().autoSaveDelay).toBe(3000);
      expect(delay().value).toBe('750');
    });

    it('blocks the form while a save is running', async () => {
      const { store, forms, typeDelay, click, button, settle } = await renderEditable();
      const saved = new Subject<void>();
      vi.spyOn(store, 'saveSettings$').mockReturnValue(saved);
      await typeDelay('750');
      await click(button('Save settings'));
      expect(button('Save settings').disabled).toBe(true);
      expect(button('Reset to host defaults').disabled).toBe(true);

      saved.next();
      await settle();
      expect(button('Save settings').disabled).toBe(false);
      expect(forms.settings().autoSaveDelay).toBe(750);
    });

    it('finishes a waiting save after the panel closes', async () => {
      const { fixture, store, forms, typeDelay, click, button } = await renderEditable();
      const earlier = new Subject<void>();
      vi.spyOn(store, 'saveSettings$').mockReturnValueOnce(earlier);
      forms.updateSettings$({ autoSave: true, autoSaveDelay: 100 }).subscribe();
      await typeDelay('750');
      await click(button('Save settings'));
      fixture.destroy();
      earlier.next();

      expect(forms.settings().autoSaveDelay).toBe(750);
    });

    it('explains when the storage does not save settings', async () => {
      const note =
        'Changes apply to this session only; the configured storage does not save settings.';
      const { element, forms, typeDelay, click, button } = await renderEditable({}, (store) =>
        Object.assign(store, { getSettings$: undefined, saveSettings$: undefined }),
      );
      expect(element.textContent).toContain(note);
      await typeDelay('750');
      await click(button('Save settings'));

      expect(forms.settings().autoSaveDelay).toBe(750);
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('offers to retry when saved settings cannot be loaded', async () => {
      const { element, delay, click, button, text } = await renderEditable({}, (store) =>
        vi.spyOn(store, 'getSettings$').mockReturnValueOnce(throwError(() => new Error('500'))),
      );
      localStorage.setItem(storageKey, JSON.stringify({ autoSave: true, autoSaveDelay: 500 }));
      expect(text('alert')[0]).toContain('Saved settings could not be loaded.');
      expect(element.textContent).not.toContain('this session only');
      await click(button('Try again'));

      expect(text('alert')).toEqual([]);
      expect(delay().value).toBe('500');
    });

    it('exports the settings in effect', async () => {
      const { forms, typeDelay, button } = await renderEditable({
        editorType: 'customer-surveys',
        autoSaveDelay: 750,
      });
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:settings');
      const blob = vi.spyOn(globalThis, 'Blob');
      let fileName = '';
      const download = vi
        .spyOn(HTMLAnchorElement.prototype, 'dispatchEvent')
        .mockImplementation(function (this: HTMLAnchorElement) {
          fileName = this.download;
          return true;
        });
      await typeDelay('900');
      // Not settled: FileSaver keeps a timer running to release the download URL.
      button('Export settings').click();
      await vi.waitFor(() => expect(download).toHaveBeenCalled());

      expect(fileName).toBe('formly-builder-settings-customer-surveys.json');
      const [content] = blob.mock.calls[0][0] as string[];
      expect(content).toBe(JSON.stringify({ autoSave: true, autoSaveDelay: 750 }, null, 2));
      expect(JSON.parse(content)).toEqual(forms.settings());
    });

    it('opens the file chooser for JSON files', async () => {
      const { element, click, button } = await renderEditable();
      const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
      const open = vi.spyOn(input, 'click');
      expect(input.accept).toBe('application/json,.json');
      await click(button('Import settings'));

      expect(open).toHaveBeenCalledOnce();
    });

    it('imports settings from a file', async () => {
      const { forms, autosave, delay, chooseFile, text } = await renderEditable();
      await chooseFile('{"autoSave":false,"autoSaveDelay":500,"styles":{}}');

      expect(forms.settings()).toEqual({ autoSave: false, autoSaveDelay: 500 });
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(forms.settings());
      expect(autosave().checked).toBe(false);
      expect(delay().value).toBe('500');
      expect(text('status')).toEqual(['Settings updated.']);
    });

    it.each(['{bad', '{"autoSave":"yes"}', '{"autoSave":true,"autoSaveDelay":-1}', 'null'])(
      'rejects the file content %s',
      async (content) => {
        const { forms, store, chooseFile, text } = await renderEditable();
        const save = vi.spyOn(store, 'saveSettings$');
        await chooseFile(content);

        expect(text('alert')).toEqual(['The file is not valid builder settings.']);
        expect(text('status')).toEqual(['']);
        expect(forms.settings()).toEqual({ autoSave: true, autoSaveDelay: 3000 });
        expect(save).not.toHaveBeenCalled();

        await chooseFile('{"autoSave":true,"autoSaveDelay":500}');
        expect(text('alert')).toEqual([]);
        expect(forms.settings().autoSaveDelay).toBe(500);
      },
    );

    it('reports an import that could not be saved', async () => {
      const { forms, store, chooseFile, text } = await renderEditable();
      vi.spyOn(store, 'saveSettings$').mockReturnValue(throwError(() => new Error('500')));
      await chooseFile('{"autoSave":true,"autoSaveDelay":500}');

      expect(text('alert')).toEqual(['Settings could not be saved.']);
      expect(forms.settings().autoSaveDelay).toBe(3000);
    });

    it('clears the chosen file so it can be imported again', async () => {
      const { element, chooseFile } = await renderEditable();
      const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
      const clear = vi.spyOn(input, 'value', 'set');
      await chooseFile('{bad');

      expect(clear).toHaveBeenCalledWith('');
    });
  });
});
