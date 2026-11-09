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
      .subscribe(() => this.restoreRoute());

    effect(() => {
      const workspaceId = this.forms.activeFormId();
      const panel = this.panels.activeLHSPanel();
      const pending = this.pendingRoute();
      if (this.router.currentNavigation()) return;

      if (pending) {
        if (workspaceId === pending.workspaceId) {
          this.pendingRoute.set(null);
          this.panels.setActiveLHSPanel(pending.panel);
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

      const url = this.router.createUrlTree(
        panel === 'forms' || !workspaceId
          ? ['/workspaces']
          : ['/workspaces', workspaceId, panel === 'fields' ? 'fields' : 'field'],
      );
      if (
        !this.router.isActive(url, {
          paths: 'exact',
          queryParams: 'ignored',
          matrixParams: 'ignored',
          fragment: 'ignored',
        })
      ) {
        void this.router.navigateByUrl(url);
      }
    });
  }

  private restoreRoute(): void {
    const route = this.route.snapshot.firstChild;
    const panel = route?.data['panel'] as 'forms' | 'fields' | 'add-field';
    const workspaceId = route?.paramMap.get('workspaceId');
    this.pendingRoute.set(null);
    if (workspaceId && workspaceId !== this.forms.activeFormId()) {
      this.pendingRoute.set({ workspaceId, panel });
      this.forms.setActiveForm(workspaceId);
    }
    if (workspaceId || this.panels.activeLHSPanel() !== panel) {
      this.panels.setActiveLHSPanel(panel);
    }
  }
}
