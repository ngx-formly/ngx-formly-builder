import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CoreFormService, FormlyBuilder, PanelService } from '@ngx-formly/builder';
import { filter } from 'rxjs';

@Component({
  selector: 'app-form-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyBuilder],
  host: { class: 'block h-full' },
  template: `<formly-builder class="block h-full" />`,
})
export class FormEditorApp {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly forms = inject(CoreFormService);
  private readonly panels = inject(PanelService);
  private readonly pendingRoute = signal<{
    formId: string;
    panel: 'forms' | 'fields' | 'add-field';
  } | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // Panel clicks already set focus; restoring their URL would reopen the right panel.
        if (this.router.currentNavigation()?.extras.info !== 'panel-selection') {
          this.restoreRoute();
        }
      });

    effect(() => {
      const formId = this.forms.activeFormId();
      const panel = this.panels.activeLHSPanel();
      const activePanel = this.panels.activePanel();
      const addFieldTab = this.panels.activeAddFieldTab();
      const workspaceTab = this.panels.activeWorkspaceTab();
      const displayMode = this.forms.activeFormDisplayMode();
      const pending = this.pendingRoute();
      if (this.router.currentNavigation()) return;

      if (pending) {
        if (formId === pending.formId) {
          this.pendingRoute.set(null);
          this.panels.setActiveLHSPanel(pending.panel);
          this.restoreFieldPanel();
        } else if (
          this.forms.formLoadError()?.formId === pending.formId ||
          this.forms.saveStatus() === 'error'
        ) {
          this.pendingRoute.set(null);
          this.panels.setActiveLHSPanel('forms');
          void this.router.navigateByUrl('/workspaces/forms', { replaceUrl: true });
        }
        return;
      }

      if (!formId && panel !== 'forms') {
        this.panels.setActiveLHSPanel('forms');
        return;
      }

      const field =
        activePanel === 'field-edit'
          ? 'edit'
          : activePanel === 'validation' || activePanel === 'styling' || activePanel === 'model'
            ? activePanel
            : this.fieldQuery();
      const url = this.router.createUrlTree(
        panel === 'forms' || !formId
          ? ['/workspaces', workspaceTab]
          : [
              '/workspaces',
              'forms',
              formId,
              panel === 'fields' ? 'fields' : addFieldTab === 'presets' ? 'preset' : 'field',
            ],
        {
          queryParams: { field, view: displayMode === 'form' ? null : displayMode },
          queryParamsHandling: 'merge',
          preserveFragment: true,
        },
      );
      if (
        !this.router.isActive(url, {
          paths: 'exact',
          queryParams: 'exact',
          matrixParams: 'ignored',
          fragment: 'ignored',
        })
      ) {
        void this.router.navigateByUrl(url, { info: 'panel-selection' });
      }
    });
  }

  private restoreRoute(): void {
    const route = this.route.snapshot.firstChild;
    const panel = route?.data['panel'] as 'forms' | 'fields' | 'add-field';
    const formId = route?.paramMap.get('formId');
    const view = this.route.snapshot.queryParamMap.get('view');
    this.forms.setActiveFormDisplayMode(view === 'preview' || view === 'json' ? view : 'form');
    this.panels.activeWorkspaceTab.set(route?.data['workspaceTab'] ?? 'forms');
    if (panel === 'add-field') {
      this.panels.activeAddFieldTab.set(route!.data['addFieldTab']);
    }
    this.pendingRoute.set(null);
    if (formId && formId !== this.forms.activeFormId()) {
      this.pendingRoute.set({ formId, panel });
      this.forms.setActiveForm(formId);
    }
    if (
      formId ||
      this.panels.activePanel() !== panel ||
      route?.data['workspaceTab'] === 'validations'
    ) {
      this.panels.setActiveLHSPanel(panel);
    }
    if (panel !== 'forms') this.restoreFieldPanel();
  }

  private restoreFieldPanel(): void {
    const field = this.fieldQuery();
    if (field === 'edit') {
      this.panels.setActiveRHSPanel('field-edit');
    } else if (field === 'validation' || field === 'styling' || field === 'model') {
      this.panels.setActiveRHSPanel(field);
    }
  }

  private fieldQuery() {
    const field = this.route.snapshot.queryParamMap.get('field');
    return field === 'edit' || field === 'validation' || field === 'styling' || field === 'model'
      ? field
      : null;
  }
}
