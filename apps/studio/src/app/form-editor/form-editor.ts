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
    workspaceId: string;
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
      const workspaceId = this.forms.activeFormId();
      const panel = this.panels.activeLHSPanel();
      const activePanel = this.panels.activePanel();
      const addFieldTab = this.panels.activeAddFieldTab();
      const pending = this.pendingRoute();
      if (this.router.currentNavigation()) return;

      if (pending) {
        if (workspaceId === pending.workspaceId) {
          this.pendingRoute.set(null);
          this.panels.setActiveLHSPanel(pending.panel);
          this.restoreFieldPanel();
        } else if (
          this.forms.formLoadError()?.formId === pending.workspaceId ||
          this.forms.saveStatus() === 'error'
        ) {
          this.pendingRoute.set(null);
          this.panels.setActiveLHSPanel('forms');
          void this.router.navigateByUrl('/workspaces', { replaceUrl: true });
        }
        return;
      }

      if (!workspaceId && panel !== 'forms') {
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
        panel === 'forms' || !workspaceId
          ? ['/workspaces']
          : [
              '/workspaces',
              workspaceId,
              panel === 'fields' ? 'fields' : addFieldTab === 'presets' ? 'preset' : 'field',
            ],
        { queryParams: { field }, queryParamsHandling: 'merge', preserveFragment: true },
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
    const workspaceId = route?.paramMap.get('workspaceId');
    if (panel === 'add-field') {
      this.panels.activeAddFieldTab.set(route!.data['addFieldTab']);
    }
    this.pendingRoute.set(null);
    if (workspaceId && workspaceId !== this.forms.activeFormId()) {
      this.pendingRoute.set({ workspaceId, panel });
      this.forms.setActiveForm(workspaceId);
    }
    if (workspaceId || this.panels.activePanel() !== panel) {
      this.panels.setActiveLHSPanel(panel);
    }
    this.restoreFieldPanel();
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
