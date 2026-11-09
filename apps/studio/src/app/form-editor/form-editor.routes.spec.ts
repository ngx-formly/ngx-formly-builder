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
  const fieldPanels = [
    ['edit', 'field-edit'],
    ['validation', 'validation'],
    ['styling', 'styling'],
    ['model', 'model'],
  ] as const;

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
    ['fields', 'fields', 'fields'],
    ['field', 'add-field', 'fields'],
    ['preset', 'add-field', 'presets'],
  ] as const)(
    'restores the form and panel from /workspaces/:workspaceId/%s',
    async (path, panel, tab) => {
      const { forms, panels, router } = await open(`/workspaces/second/${path}`);

      expect(router.url).toBe(`/workspaces/second/${path}`);
      expect(forms.activeFormName()).toBe('Second form');
      expect(panels.activeLHSPanel()).toBe(panel);
      expect(panels.activeAddFieldTab()).toBe(tab);
    },
  );

  it.each(fieldPanels)('restores the right panel from ?field=%s', async (field, panel) => {
    const { forms, panels, router } = await open(`/workspaces/second/preset?field=${field}`);

    expect(router.url).toBe(`/workspaces/second/preset?field=${field}`);
    expect(forms.activeFormName()).toBe('Second form');
    expect(panels.activeLHSPanel()).toBe('add-field');
    expect(panels.activeAddFieldTab()).toBe('presets');
    expect(panels.activeRHSPanel()).toBe(panel);
    expect(panels.activePanel()).toBe(panel);
  });

  it.each(fieldPanels)('sets ?field=%s when the right panel is selected', async (field, panel) => {
    const { harness, panels, router } = await open(
      '/workspaces/first/preset?source=shared#builder',
    );

    panels.setActiveRHSPanel(panel);
    await harness.fixture.whenStable();

    const url = router.parseUrl(router.url);
    expect(url.root.children['primary'].segments.map((segment) => segment.path)).toEqual([
      'workspaces',
      'first',
      'preset',
    ]);
    expect(url.queryParams).toEqual({ source: 'shared', field });
    expect(url.fragment).toBe('builder');
    expect(panels.activePanel()).toBe(panel);
  });

  it('keeps the right-panel query while switching focus to left navigation', async () => {
    const { harness, panels, router } = await open('/workspaces/first/preset?field=validation');

    for (const [panel, path] of [
      ['fields', '/workspaces/first/fields'],
      ['forms', '/workspaces'],
      ['add-field', '/workspaces/first/preset'],
    ] as const) {
      panels.setActiveLHSPanel(panel);
      await harness.fixture.whenStable();

      expect(router.url).toBe(`${path}?field=validation`);
      expect(panels.activePanel()).toBe(panel);
      expect(panels.activeRHSPanel()).toBe('validation');
    }
  });

  it('restores Workspace navigation without a right-panel query', async () => {
    const { harness, panels, router } = await open('/workspaces?field=model');
    expect(panels.activePanel()).toBe('model');

    await harness.navigateByUrl('/workspaces', FormEditorApp);
    await harness.fixture.whenStable();

    expect(router.url).toBe('/workspaces');
    expect(panels.activePanel()).toBe('forms');
  });

  it('removes invalid right-panel queries while preserving other URL state', async () => {
    const { panels, router } = await open(
      '/workspaces/first/preset?field=unknown&source=shared#builder',
    );

    expect(router.url).toBe('/workspaces/first/preset?source=shared#builder');
    expect(panels.activePanel()).toBe('add-field');
  });

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

    panels.activeAddFieldTab.set('presets');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/preset');

    panels.setActiveRHSPanel('model');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/preset?field=model');
    expect(panels.activePanel()).toBe('model');

    panels.activeAddFieldTab.set('fields');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces/first/field?field=model');

    panels.setActiveLHSPanel('forms');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/workspaces?field=model');
    expect(forms.activeModel()).toEqual({ draft: 'keep me' });
    expect(harness.routeDebugElement!.componentInstance).toBe(editor);
  });

  it('changes forms through routes and saves pending edits before switching', async () => {
    const { harness, forms, panels } = await open('/workspaces/first/fields');
    forms.setActiveModel({ draft: 'saved before switching' });

    await harness.navigateByUrl('/workspaces/second/preset', FormEditorApp);
    await harness.fixture.whenStable();
    expect(forms.activeFormId()).toBe('second');
    expect(panels.activeLHSPanel()).toBe('add-field');
    expect(panels.activeAddFieldTab()).toBe('presets');
    expect(JSON.parse(localStorage.getItem(storageKey)!).first.model).toEqual({
      draft: 'saved before switching',
    });

    await harness.navigateByUrl('/workspaces/first/field', FormEditorApp);
    await harness.fixture.whenStable();
    expect(forms.activeModel()).toEqual({ draft: 'saved before switching' });
    expect(panels.activeLHSPanel()).toBe('add-field');
    expect(panels.activeAddFieldTab()).toBe('fields');
  });

  it('returns missing forms to Workspace without modifying stored forms', async () => {
    const saved = localStorage.getItem(storageKey);
    const { forms, panels, router } = await open('/workspaces/missing/field?field=model');

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
