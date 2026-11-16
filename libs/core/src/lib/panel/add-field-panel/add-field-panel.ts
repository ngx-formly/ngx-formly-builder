import { CoreFormService } from '../../editor/core-form.service';
import { CoreFieldService } from '../../config/core-field.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { EmptyNoForm } from '../../empty';
import { AddFieldService } from './add-field.service';
import { PanelHeader } from '../../shared/panel-header';
import { FieldsTabContent } from './fields-tab-content';
import { PresetsTabContent } from './presets-tab-content';
import { PanelService } from '../../editor/panel.service';

@Component({
  selector: 'core-add-field-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddFieldService],
  imports: [MatTabsModule, EmptyNoForm, PanelHeader, FieldsTabContent, PresetsTabContent],
  host: {
    class: 'overflow-hidden h-full block',
  },
  template: `
    <core-panel-header
      header="Add Field"
      subHeader="Add or drag a field into the form"
    />
    @if (activeFormId()) {
      <mat-tab-group
        class="core-tabs min-h-0 flex-1"
        animationDuration="0ms"
        [preserveContent]="true"
        [selectedIndex]="['fields', 'presets'].indexOf(activeTab())"
        (selectedTabChange)="activeTab.set($event.index === 0 ? 'fields' : 'presets')"
        ><mat-tab
          ><ng-template mat-tab-label>
            <i
              class="material-symbols-outlined size-6 shrink-0 overflow-hidden"
              aria-hidden="true"
              >ad</i
            >
            <span>Field</span>
          </ng-template>
          <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            <core-fields-tab-content /></div></mat-tab
        ><mat-tab
          ><ng-template mat-tab-label>
            <i
              class="material-symbols-outlined size-6 shrink-0 overflow-hidden"
              aria-hidden="true"
              >tune</i
            >
            <span>Preset</span>
          </ng-template>
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
            <core-presets-tab-content /></div></mat-tab
      ></mat-tab-group>
    } @else {
      <core-empty-no-form />
    }
  `,
})
export class AddFieldPanel {
  protected formService = inject(CoreFormService);
  protected fieldService = inject(CoreFieldService);

  activeFormId = this.formService.activeFormId;
  activeField = this.formService.activeField;
  fieldCategoryPresets = this.fieldService.fieldCategoryPresets;

  readonly activeTab = inject(PanelService).activeAddFieldTab;
}
