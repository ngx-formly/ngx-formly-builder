import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BooleanProperty } from '../../properties/boolean/boolean.directive';
import { Tooltip } from '../../shared/tooltip';
import { ModelPropertyKey } from './property-key';
import { ModelPropertyWrapper } from './property-wrapper';

@Component({
  selector: 'core-model-boolean-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModelPropertyKey, ModelPropertyWrapper, MatSlideToggle, FormsModule, Tooltip],
  template: `
    <core-model-property-wrapper [level]="level()">
      <span class="inline-flex min-w-0 items-center gap-2">
        <span class="invisible size-8 shrink-0"> </span>
        <span class="inline-flex items-center gap-0.5">
          <core-model-property-key
            [property]="property()"
            (keyChange)="onKeyChanged($event)"
          />
          <span>:</span>
        </span>

        <span class="inline-flex h-9 min-w-0 grow items-center truncate">
          <mat-slide-toggle
            [id]="switchId"
            [aria-label]="property().label"
            [ngModel]="currentValue()"
            (ngModelChange)="onValueChange($event)"
          />
        </span>
      </span>
      <ng-container actions>
        @if (property().isRemovable) {
          <button
            coreButton
            text
            class="size-8"
            rounded
            severity="danger"
            aria-label="Remove"
            coreTooltip="Remove"
            tooltipPosition="above"
            (click)="remove.emit()"
          >
            <i
              coreButtonIcon
              class="material-symbols-outlined"
            >
              delete
            </i>
          </button>
        }
      </ng-container>
    </core-model-property-wrapper>
  `,
})
export class ModelBooleanProperty extends BooleanProperty {
  readonly level = input(0, { transform: numberAttribute });

  switchId = `boolean-property-switch-${Math.random().toString(36).substring(2, 15)}`;
}
