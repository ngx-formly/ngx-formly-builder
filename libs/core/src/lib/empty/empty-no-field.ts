import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PanelService } from '../editor/panel.service';
import { Empty } from './empty';

@Component({
  selector: 'core-empty-no-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Empty],
  template: `
    <core-empty
      label="No field in this form"
      description="Add a field from the Add Field panel"
    >
      <button
        coreButton
        (click)="openAddFieldPanel()"
      >
        <i
          class="material-symbols-outlined"
          aria-hidden="true"
          >open_in_new</i
        >
        Open Add Field Panel
      </button>
    </core-empty>
  `,
})
export class EmptyNoField {
  protected panelService = inject(PanelService);

  openAddFieldPanel() {
    this.panelService.activeAddFieldTab.set('fields');
    this.panelService.setActiveLHSPanel('add-field');
  }
}
