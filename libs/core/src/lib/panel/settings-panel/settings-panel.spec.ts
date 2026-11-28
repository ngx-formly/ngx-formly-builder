import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLibrary } from '../../config/library';
import { FormlyBuilderConfig } from '../../config/types';
import { CoreFormService } from '../../editor/core-form.service';
import { LocalFormStoreService } from '../../persistence/local-form-store.service';
import { CORE_FORM_STORE } from '../../persistence/types';
import { provideFormlyBuilder } from '../../provider';
import { tailwindConfig } from '../styling-panel/config/tailwind';
import type { BuilderSettings } from '@ngx-formly/builder';
import { SettingsPanel } from './settings-panel';

/** The library store does not keep settings; this one keeps them in memory. */
class SettingsStore extends LocalFormStoreService {
  saved?: BuilderSettings;

  getSettings$(): Observable<BuilderSettings | undefined> {
    return of(this.saved);
  }

  saveSettings$(_editorType: string, settings: BuilderSettings): Observable<void> {
    this.saved = settings;
    return of(undefined);
  }
}

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
    expect(element.textContent).toContain('Disabled');
    expect(element.textContent).toContain('3000 ms (inactive)');
    expect(element.textContent).toContain('Browser local storage');
    expect(element.textContent).toContain('Vanilla');
    expect(element.textContent).toContain('Provided by UI libraries');
    expect(element.textContent).toContain('Tailwind');
    expect(element.textContent).toContain('48 · 12rem');
    expect(element.querySelector('a[href$="/embed-in-angular/"]')).not.toBeNull();
    expect(element.querySelector('input, select, textarea')).toBeNull();
  });

  it('shows settings applied through the engine in the read-only panel', async () => {
    const element = await render();
    const forms = TestBed.inject(CoreFormService);
    forms.updateSettings$({ autoSave: false, autoSaveDelay: 750 }).subscribe();
    TestBed.tick();

    expect(element.textContent).toContain('Disabled');
    expect(element.textContent).toContain('750 ms (inactive)');
  });

  it('lists the style values in effect', async () => {
    const element = await render({ styleValues: { height: [{ value: '96', label: 'Tall' }] } });
    const forms = TestBed.inject(CoreFormService);
    forms
      .updateSettings$({
        ...forms.settings(),
        styleValues: { margin: [{ value: '7', label: 'Custom' }] },
      })
      .subscribe();
    TestBed.tick();

    expect(element.textContent).toContain('Tall');
    expect(element.textContent).toContain('Custom');
    expect(element.textContent).toContain('24 · 6rem'); // Padding keeps the Tailwind values.
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
    async function renderEditable(
      config: FormlyBuilderConfig = {},
      prepare: (store: SettingsStore) => void = () => undefined,
    ) {
      const store = new SettingsStore();
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
        'Autosave and style values can be changed here; other settings come from the host application',
      );
      expect(element.textContent).toContain('form-editor');
      expect(element.textContent).toContain('Browser local storage');
      expect(autosave().checked).toBe(false);
      expect(delay().value).toBe('750');
      expect(delay().disabled).toBe(true);
    });

    it('blocks editing and export until saved settings arrive', async () => {
      const saved = new Subject<{ autoSave: boolean; autoSaveDelay: number }>();
      const { autosave, delay, button, settle, text } = await renderEditable({}, (store) =>
        vi.spyOn(store, 'getSettings$').mockReturnValue(saved),
      );
      expect(text('status')).toEqual(['Loading saved settings…']);
      expect(autosave().disabled).toBe(true);
      expect(delay().disabled).toBe(true);
      expect(button('Save settings').disabled).toBe(true);
      expect(button('Reset to host defaults').disabled).toBe(true);
      expect(button('Import settings').disabled).toBe(true);
      expect(button('Export settings').disabled).toBe(true);

      saved.next({ autoSave: true, autoSaveDelay: 500 });
      await settle();

      expect(text('status')).toEqual(['']);
      expect(delay().value).toBe('500');
      expect(delay().disabled).toBe(false);
      expect(button('Export settings').disabled).toBe(false);
    });

    it('saves and applies the edited settings', async () => {
      const { forms, store, autosave, typeDelay, click, button, text } = await renderEditable();
      await click(autosave());
      await typeDelay('750');
      await click(button('Save settings'));

      expect(forms.settings()).toEqual({ autoSave: true, autoSaveDelay: 750 });
      expect(store.saved).toEqual(forms.settings());
      expect(text('status')).toEqual(['Settings updated.']);

      await typeDelay('800');
      expect(text('status')).toEqual(['']);
    });

    it('keeps the current style lists when saving autosave', async () => {
      const styleValues = { margin: [{ value: '4' }] };
      const { forms, store, autosave, click, button, settle } = await renderEditable();
      forms.updateSettings$({ autoSave: false, autoSaveDelay: 3000, styleValues }).subscribe();
      await settle();

      await click(autosave());
      await click(button('Save settings'));

      expect(store.saved).toEqual({ autoSave: true, autoSaveDelay: 3000, styleValues });
    });

    it('disables the delay without autosave and keeps its saved value', async () => {
      const { forms, autosave, delay, typeDelay, click, button } = await renderEditable({
        autoSave: true,
      });
      await typeDelay('-1');
      await click(autosave());
      expect(delay().disabled).toBe(true);
      await click(button('Save settings'));

      expect(forms.settings()).toEqual({ autoSave: false, autoSaveDelay: 3000 });
      expect(delay().value).toBe('3000');
    });

    it.each(['', '-1', '1.5', '2147483648'])('does not save the delay "%s"', async (value) => {
      const { forms, store, delay, typeDelay, click, button, text } = await renderEditable({
        autoSave: true,
      });
      await typeDelay(value);
      expect(delay().validity.valid).toBe(false);
      await click(button('Save settings'));

      expect(forms.settings().autoSaveDelay).toBe(3000);
      expect(store.saved).toBeUndefined();
      expect(text('alert')).toEqual([]);
    });

    it('resets to the host settings and discards unsaved edits', async () => {
      const { forms, store, autosave, delay, typeDelay, click, button } = await renderEditable(
        { autoSave: true, autoSaveDelay: 750 },
        (store) => (store.saved = { autoSave: false, autoSaveDelay: 500 }),
      );
      expect(autosave().checked).toBe(false);
      await click(button('Reset to host defaults'));

      expect(forms.settings()).toEqual({ autoSave: true, autoSaveDelay: 750 });
      expect(autosave().checked).toBe(true);
      expect(delay().value).toBe('750');

      await typeDelay('900');
      await click(button('Reset to host defaults'));
      expect(delay().value).toBe('750');
      expect(store.saved).toEqual(forms.settings());
    });

    it('reports a failed save and keeps the current settings and the edit', async () => {
      const { forms, store, delay, typeDelay, click, button, text } = await renderEditable({
        autoSave: true,
      });
      vi.spyOn(store, 'saveSettings$').mockReturnValue(throwError(() => new Error('500')));
      await typeDelay('750');
      await click(button('Save settings'));

      expect(text('alert')).toEqual(['Settings could not be saved.']);
      expect(text('status')).toEqual(['']);
      expect(forms.settings().autoSaveDelay).toBe(3000);
      expect(delay().value).toBe('750');
    });

    it('blocks the form while a save is running', async () => {
      const { store, forms, typeDelay, click, button, settle } = await renderEditable({
        autoSave: true,
      });
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
      const { fixture, store, forms, typeDelay, click, button } = await renderEditable({
        autoSave: true,
      });
      const earlier = new Subject<void>();
      vi.spyOn(store, 'saveSettings$').mockReturnValueOnce(earlier);
      forms.updateSettings$({ autoSave: true, autoSaveDelay: 100 }).subscribe();
      await typeDelay('750');
      await click(button('Save settings'));
      fixture.destroy();
      earlier.next();

      expect(forms.settings().autoSaveDelay).toBe(750);
    });

    describe('style values', () => {
      const host = {
        styleValues: {
          margin: [{ value: '4', label: 'Small' }, { value: '8' }],
        },
      };
      async function renderLists(config: FormlyBuilderConfig = host) {
        const view = await renderEditable(config);
        const input = (label: string) =>
          view.element.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`);
        const labelled = (label: string) =>
          view.element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
        const type = async (label: string, value: string) => {
          input(label)!.value = value;
          input(label)!.dispatchEvent(new Event('input', { bubbles: true }));
          await view.settle();
        };
        return { ...view, input, labelled, type };
      }

      it('shows the values in effect for each list', async () => {
        const { input, element } = await renderLists();
        expect(input('Margin value 1')!.value).toBe('4');
        expect(input('Margin label 1')!.value).toBe('Small');
        expect(input('Margin label 2')!.value).toBe('');
        expect(input('Height value 1')!.value).toBe('0');
        expect(input('Height label 1')!.value).toBe('0 · 0rem');
        expect(element.querySelectorAll('input[aria-label^="Height value"]')).toHaveLength(
          tailwindConfig.className[1].options[0].variants.length,
        );
      });

      it('saves edited, added and removed values', async () => {
        const { forms, store, type, labelled, click, button } = await renderLists();
        await type('Margin label 2', ' Large ');
        await click(labelled('Remove Margin value 1'));
        await click(labelled('Add Margin value'));
        await type('Margin value 2', '12');
        await click(button('Save settings'));

        const margin = [{ value: '8', label: 'Large' }, { value: '12' }];
        expect(store.saved).toEqual({
          autoSave: false,
          autoSaveDelay: 3000,
          styleValues: { margin },
        });
        expect(forms.settings().styleValues).toEqual({ margin });
      });

      it('saves an empty list', async () => {
        const { store, labelled, click, button, element } = await renderLists();
        await click(labelled('Remove Margin value 1'));
        await click(labelled('Remove Margin value 1'));
        expect(element.textContent).toContain('No Margin values: its options offer no choices.');
        await click(button('Save settings'));

        expect(store.saved?.styleValues).toEqual({ margin: [] });
      });

      it('keeps unchanged lists out of the saved settings', async () => {
        const { store, type, click, button } = await renderLists({});
        await type('Padding label 1', 'None');
        await click(button('Save settings'));

        expect(Object.keys(store.saved!.styleValues!)).toEqual(['padding']);
        expect(store.saved!.styleValues!.padding![0]).toEqual({ value: '0', label: 'None' });
      });

      it.each([
        ['', 'Margin: enter a value in every row.'],
        ['a b', 'Margin: "a b" cannot contain spaces or ":".'],
        ['md:4', 'Margin: "md:4" cannot contain spaces or ":".'],
        ['8', 'Margin: "8" is listed twice.'],
      ])('does not save the value "%s"', async (value, message) => {
        const { forms, store, type, click, button, text } = await renderLists();
        await type('Margin value 1', value);
        await click(button('Save settings'));

        expect(text('alert')).toEqual([message]);
        expect(store.saved).toBeUndefined();
        expect(forms.settings().styleValues).toEqual(host.styleValues);
      });

      it('saves when an unchanged catalogue list breaks the value rules', async () => {
        const styles = {
          ...tailwindConfig,
          className: [
            {
              name: 'Margin',
              options: [
                { name: 'General', value: 'm', valueList: 'margin' as const, variants: ['4', '4'] },
              ],
            },
          ],
        };
        const { store, autosave, click, button, text } = await renderLists({ styles });
        await click(autosave());
        await click(button('Save settings'));

        expect(text('alert')).toEqual([]);
        expect(store.saved).toEqual({ autoSave: true, autoSaveDelay: 3000 });
      });

      it('clears the saved status when a row is added or removed', async () => {
        const { labelled, click, button, text } = await renderLists();
        await click(button('Save settings'));
        expect(text('status')).toEqual(['Settings updated.']);

        await click(labelled('Remove Margin value 1'));
        expect(text('status')).toEqual(['']);
      });

      it('shows imported and reset values', async () => {
        const { input, chooseFile, click, button } = await renderLists();
        await chooseFile(
          '{"autoSave":false,"autoSaveDelay":500,"styleValues":{"margin":[{"value":"2"}]}}',
        );
        expect(input('Margin value 1')!.value).toBe('2');
        expect(input('Margin value 2')).toBeNull();

        await click(button('Reset to host defaults'));
        expect(input('Margin value 2')!.value).toBe('8');
      });

      it('blocks the lists while saved settings load', async () => {
        const saved = new Subject<BuilderSettings>();
        const view = await renderEditable(host, (store) =>
          vi.spyOn(store, 'getSettings$').mockReturnValue(saved),
        );
        const input = view.element.querySelector<HTMLInputElement>(
          'input[aria-label="Margin value 1"]',
        )!;
        expect(input.disabled).toBe(true);
        expect(
          view.element.querySelector<HTMLButtonElement>('button[aria-label="Add Margin value"]')!
            .disabled,
        ).toBe(true);

        saved.next({
          autoSave: false,
          autoSaveDelay: 3000,
          styleValues: { margin: [{ value: '1' }] },
        });
        await view.settle();
        expect(input.disabled).toBe(false);
        expect(
          view.element.querySelector<HTMLInputElement>('input[aria-label="Margin value 1"]')!.value,
        ).toBe('1');
      });
    });

    it('explains when the storage does not save settings', async () => {
      const note =
        'Changes apply to this session only; the configured storage does not save settings.';
      const { element, forms, store, typeDelay, click, button } = await renderEditable(
        { autoSave: true },
        (store) => Object.assign(store, { getSettings$: undefined, saveSettings$: undefined }),
      );
      expect(element.textContent).toContain(note);
      await typeDelay('750');
      await click(button('Save settings'));

      expect(forms.settings().autoSaveDelay).toBe(750);
      expect(store.saved).toBeUndefined();
    });

    it('offers to retry when saved settings cannot be loaded', async () => {
      const { element, store, delay, click, button, text } = await renderEditable({}, (store) =>
        vi.spyOn(store, 'getSettings$').mockReturnValueOnce(throwError(() => new Error('500'))),
      );
      store.saved = { autoSave: true, autoSaveDelay: 500 };
      expect(text('alert')[0]).toContain('Saved settings could not be loaded.');
      expect(element.textContent).not.toContain('this session only');
      await click(button('Try again'));

      expect(text('alert')).toEqual([]);
      expect(delay().value).toBe('500');
    });

    it('exports the settings in effect', async () => {
      const { forms, typeDelay, button } = await renderEditable({
        editorType: 'customer-surveys',
        autoSave: true,
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
      const { forms, store, autosave, delay, chooseFile, text } = await renderEditable();
      await chooseFile('{"autoSave":false,"autoSaveDelay":500,"styles":{}}');

      expect(forms.settings()).toEqual({ autoSave: false, autoSaveDelay: 500 });
      expect(store.saved).toEqual(forms.settings());
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
        expect(forms.settings()).toEqual({ autoSave: false, autoSaveDelay: 3000 });
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
