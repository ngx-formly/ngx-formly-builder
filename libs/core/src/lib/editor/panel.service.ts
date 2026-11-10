import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { CORE_EDITOR_CONFIG } from '../config/types';
import { LHSPanelType, RHSPanelType } from './types';

@Injectable()
export class PanelService {
  readonly showSettings = inject(CORE_EDITOR_CONFIG, { optional: true })?.showSettings ?? true;

  protected readonly activePanelSrc = signal<LHSPanelType | RHSPanelType>('forms');
  readonly activePanel = this.activePanelSrc.asReadonly();

  protected readonly activeLHSPanelSrc = signal<LHSPanelType>('forms');
  readonly activeLHSPanel = this.activeLHSPanelSrc.asReadonly();

  readonly activeAddFieldTab = signal<'fields' | 'presets'>('fields');
  readonly activeWorkspaceTab = signal<'forms' | 'validations'>('forms');

  protected readonly activeRHSPanelSrc = signal<RHSPanelType>('field-edit');
  readonly activeRHSPanel = this.activeRHSPanelSrc.asReadonly();

  protected highlightPanelSrc$ = new Subject<RHSPanelType | LHSPanelType>();
  readonly highlightPanel$ = this.highlightPanelSrc$.asObservable();

  setActivePanel(panel: LHSPanelType | RHSPanelType) {
    if (panel === 'forms' || panel === 'fields' || panel === 'add-field' || panel === 'settings') {
      this.setActiveLHSPanel(panel);
    } else {
      this.setActiveRHSPanel(panel);
    }
  }

  setActiveLHSPanel(panel: LHSPanelType) {
    if (panel === 'settings' && !this.showSettings) return;
    if (panel === 'fields' || panel === 'add-field') this.activeWorkspaceTab.set('forms');
    this.activeLHSPanelSrc.set(panel);
    this.activePanelSrc.set(panel);
    this.highlightPanelSrc$.next(panel);
  }

  setActiveRHSPanel(panel: RHSPanelType) {
    this.activeRHSPanelSrc.set(panel);
    this.activePanelSrc.set(panel);
    this.highlightPanelSrc$.next(panel);
  }
}
