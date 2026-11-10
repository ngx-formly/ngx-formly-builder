import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from '../editor/panel.service';
import { LHSPanelType } from '../editor/types';
import { AddFieldPanel, FieldsPanel, FormsPanel, PanelOptionConfig } from '../panel';
import { SettingsPanel } from '../panel/settings-panel/settings-panel';
import { PanelOptionList } from './panel-option-list';

@Component({
  selector: 'core-lhs-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldsPanel, AddFieldPanel, FormsPanel, PanelOptionList, SettingsPanel],
  host: { class: 'flex h-full min-h-0 min-w-0 shrink-0' },
  template: `
    <core-panel-option-list
      position="left"
      [options]="panelOptions"
      [value]="activePanel()"
      (selected)="setActivePanel($event)"
    />
    @switch (activePanel()) {
      @case ('settings') {
        @if (panelService.showSettings) {
          <core-settings-panel class="panel" />
        }
      }
      @case ('fields') {
        <core-fields-panel class="panel" />
      }
      @case ('add-field') {
        <core-add-field-panel class="panel" />
      }
      @case ('forms') {
        <core-forms-panel class="panel" />
      }
    }
  `,
})
export class LHSSidebar {
  protected panelService = inject(PanelService);

  activePanel = this.panelService.activeLHSPanel;
  panelOptions: PanelOptionConfig[] = [
    { label: 'Workspace', value: 'forms', matIcon: 'assignment' },
    { label: 'Fields', value: 'fields', matIcon: 'lists' },
    { label: 'Add Field', value: 'add-field', matIcon: 'add' },
    { label: 'Builder settings', value: 'settings', matIcon: 'settings' },
  ];

  setActivePanel(panel: string) {
    this.panelService.setActiveLHSPanel(panel as LHSPanelType);
  }
}
