import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BooleanProperty } from './boolean.directive';
import { FieldPropertyWrapper } from '../property-wrapper';

@Component({
  selector: 'core-field-boolean-property',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatSlideToggle, FieldPropertyWrapper],
  template: `
    <core-field-property-wrapper
      [label]="property().label"
      [description]="property().description"
      [labelForId]="switchId"
      [isClearable]="true"
      (clear)="onClear()"
    >
      <mat-slide-toggle
        [id]="switchId"
        [aria-label]="property().label || 'Enabled'"
        [ngModel]="currentValue()"
        (ngModelChange)="onValueChange($event)"
      />
    </core-field-property-wrapper>
  `,
})
export class FieldBooleanProperty extends BooleanProperty {
  switchId = `boolean-property-switch-${Math.random().toString(36).substring(2, 15)}`;
}
