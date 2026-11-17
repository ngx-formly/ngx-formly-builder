import { Directive, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[coreTooltip]',
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: [
        'matTooltip: coreTooltip',
        'matTooltipPosition: tooltipPosition',
        'matTooltipShowDelay: showDelay',
      ],
    },
  ],
})
export class Tooltip {
  protected tooltip = inject(MatTooltip);

  constructor() {
    this.tooltip.showDelay = 500;
  }
}
