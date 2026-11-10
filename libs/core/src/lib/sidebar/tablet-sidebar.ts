import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from '../editor/panel.service';
import { LHSPanelType, RHSPanelType } from '../editor/types';
import {
  AddFieldPanel,
  FieldEditPanel,
  FieldsPanel,
  FormsPanel,
  ModelEditPanel,
  PanelOptionConfig,
  StylingPanel,
} from '../panel';
import { ValidationPanel } from '../panel/validation-panel/validation-panel';
import { SettingsPanel } from '../panel/settings-panel/settings-panel';
import { PanelOptionList } from './panel-option-list';

export const TABLET_PANEL_OPTIONS: PanelOptionConfig[] = [
  { label: 'Workspace', value: 'forms', matIcon: 'assignment' },
  { label: 'Fields', value: 'fields', matIcon: 'lists' },
  { label: 'Add Field', value: 'add-field', matIcon: 'add' },
  { label: 'Field Edit', value: 'field-edit', matIcon: 'edit_square' },
  { label: 'Validation', value: 'validation', matIcon: 'rule' },
  { label: 'Styling', value: 'styling', matIcon: 'palette' },
  { label: 'Model', value: 'model', matIcon: 'database' },
  { label: 'Builder settings', value: 'settings', matIcon: 'settings' },
];

@Component({
  selector: 'core-tablet-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AddFieldPanel,
    FieldEditPanel,
    FieldsPanel,
    FormsPanel,
    ModelEditPanel,
    PanelOptionList,
    StylingPanel,
    ValidationPanel,
    SettingsPanel,
  ],
  host: { class: 'flex h-full min-w-0' },
  template: `
    <core-panel-option-list
      position="left"
      [options]="panelOptions"
      [value]="activePanel()"
      (selected)="setActivePanel($event)"
    />
    <div class="min-h-0 min-w-0 grow">
      @switch (activePanel()) {
        @case ('forms') {
          <core-forms-panel class="panel" />
        }
        @case ('settings') {
          @if (panelService.showSettings) {
            <core-settings-panel class="panel" />
          }
        }
        @case ('field-edit') {
          <core-field-edit-panel class="panel" />
        }
        @case ('styling') {
          <core-styling-panel class="panel" />
        }
        @case ('validation') {
          <core-validation-panel class="panel" />
        }
        @case ('model') {
          <core-model-edit-panel class="panel" />
        }
        @case ('fields') {
          <core-fields-panel class="panel" />
        }
        @case ('add-field') {
          <core-add-field-panel class="panel" />
        }
      }
    </div>
  `,
})
export class TabletSidebar {
  protected readonly panelService = inject(PanelService);

  protected readonly activePanel = this.panelService.activePanel;
  protected readonly panelOptions = TABLET_PANEL_OPTIONS;

  setActivePanel(panel: string): void {
    this.panelService.setActivePanel(panel as LHSPanelType | RHSPanelType);
  }
}
