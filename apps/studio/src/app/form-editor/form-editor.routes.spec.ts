import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CoreFormService, PanelService } from '@ngx-formly/builder';
import { vi } from 'vitest';
import { routes } from '../app.routes';
import { FormEditorApp } from './form-editor';

describe('workspace routes', () => {
  const storageKey = 'formly-studio-forms-form-editor';

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        first: {
          id: 'first',
          name: 'First form',
          libraryId: 'form-vanilla',
          fields: [],
          model: {},
        },
        second: {
          id: 'second',
          name: 'Second form',
          libraryId: 'form-vanilla',
          fields: [],
          model: {},
        },
      }),
    );
    TestBed.overrideComponent(FormEditorApp, { set: { imports: [], template: '' } });
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  async function open(url: string) {
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    const injector = harness.routeDebugElement!.injector;
    return {
      harness,
      forms: injector.get(CoreFormService),
      panels: injector.get(PanelService),
      router: TestBed.inject(Router),
    };
  }

  it.each([
    ['fields', 'fields'],
    ['field', 'add-field'],
  ] as const)(
    'restores the form and panel from /workspaces/:workspaceId/%s',
    async (path, panel) => {
      const { forms, panels, router } = await open(`/workspaces/second/${path}`);

      expect(router.url).toBe(`/workspaces/second/${path}`);
      expect(forms.activeFormName()).toBe('Second form');
      expect(panels.activeLHSPanel()).toBe(panel);
    },
  );

  it('updates the URL from selection and panel changes while retaining the editor and edits', async () => {
    const { harness, forms, panels, router } = await open('/workspaces');
    const editor = harness.routeDebugElement!.componentInstance;
    forms.setActiveForm('first');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/fields');

    forms.setActiveModel({ draft: 'keep me' });
    panels.setActiveLHSPanel('add-field');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/field');

    panels.setActiveRHSPanel('model');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/field');
    expect(panels.activePanel()).toBe('model');

    panels.setActiveLHSPanel('forms');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces');
    expect(forms.activeModel()).toEqual({ draft: 'keep me' });
    expect(harness.routeDebugElement!.componentInstance).toBe(editor);
  });

  it('changes forms through routes and saves pending edits before switching', async () => {
    const { harness, forms, panels } = await open('/workspaces/first/fields');
    forms.setActiveModel({ draft: 'saved before switching' });

    await harness.navigateByUrl('/workspaces/second/field', FormEditorApp);
    await harness.fixture.whenStable();
    expect(forms.activeFormId()).toBe('second');
    expect(panels.activeLHSPanel()).toBe('add-field');
    expect(JSON.parse(localStorage.getItem(storageKey)!).first.model).toEqual({
      draft: 'saved before switching',
    });

    await harness.navigateByUrl('/workspaces/first/fields', FormEditorApp);
    await harness.fixture.whenStable();
    expect(forms.activeModel()).toEqual({ draft: 'saved before switching' });
    expect(panels.activeLHSPanel()).toBe('fields');
  });

  it('returns missing forms to Workspace without modifying stored forms', async () => {
    const saved = localStorage.getItem(storageKey);
    const { forms, panels, router } = await open('/workspaces/missing/field');

    expect(router.url).toBe('/workspaces');
    expect(panels.activeLHSPanel()).toBe('forms');
    expect(forms.formLoadError()).toMatchObject({ formId: 'missing', reason: 'not-found' });
    expect(localStorage.getItem(storageKey)).toBe(saved);
  });

  it('keeps unsaved edits and navigation available when saving before a route change fails', async () => {
    const { harness, forms, panels, router } = await open('/workspaces/first/fields');
    forms.setActiveModel({ draft: 'keep unsaved' });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    await harness.navigateByUrl('/workspaces/second/fields', FormEditorApp);
    await harness.fixture.whenStable();

    expect(router.url).toBe('/workspaces');
    expect(forms.activeFormId()).toBe('first');
    expect(forms.activeModel()).toEqual({ draft: 'keep unsaved' });
    expect(forms.saveStatus()).toBe('error');

    panels.setActiveLHSPanel('add-field');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/field');
  });

  it('stays in Workspace until a form is selected', async () => {
    const { harness, panels, router } = await open('/workspaces');
    panels.setActiveLHSPanel('add-field');
    await harness.fixture.whenStable();

    expect(router.url).toBe('/workspaces');
    expect(panels.activeLHSPanel()).toBe('forms');
  });

  it('returns to Workspace when the selected form is deleted', async () => {
    const { harness, forms, panels, router } = await open('/workspaces/first/field');
    forms.deleteWorkspaceNode('first');
    await harness.fixture.whenStable();

    expect(router.url).toBe('/workspaces');
    expect(panels.activeLHSPanel()).toBe('forms');
    expect(forms.activeFormId()).toBeUndefined();
  });
});
