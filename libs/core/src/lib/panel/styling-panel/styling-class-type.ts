import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from '../../ui/panel';

import { PropertyChange } from '../../properties/types';
import { StylingOption } from './styling-option';
import { ClassType, CORE_STYLES_CONFIG, StyleOptionCategory } from './types';

@Component({
  selector: 'core-styling-class-type',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Panel, StylingOption],
  host: { class: 'flex flex-col gap-2' },
  template: `
    @if (activeBreakpoint(); as breakpoint) {
      <div
        class="core-segmented"
        role="group"
      >
        @for (option of stylesConfig.breakpoints; track option.value) {
          <button
            coreButton
            text
            type="button"
            [attr.aria-pressed]="activeBreakpointValue() === option.value"
            (click)="activeBreakpointValue.set(option.value)"
          >
            {{ option.name }}
          </button>
        }
      </div>
      <h4>{{ breakpoint.description }}</h4>
      <div>
        @for (category of activeCategories(); track category.name) {
          <core-property-panel [header]="category.name">
            <div class="grid grid-cols-2 gap-2">
              @for (option of category.options; track option.name) {
                <core-styling-option
                  [class.col-span-2]="option.spanWidth"
                  [option]="option"
                  [breakpoint]="breakpoint"
                  [classType]="classType()"
                  (fieldChange)="fieldChange.emit($event)"
                />
              }
            </div>
          </core-property-panel>
        }
      </div>
    } @else {
      <p class="text-sm text-muted-color">No styling presets configured.</p>
    }
  `,
})
export class StylingClassType {
  readonly classType = input.required<ClassType>();
  readonly classNameMap = input.required<Record<string, StyleOptionCategory[]>>();
  readonly fieldGroupClassNameMap = input.required<Record<string, StyleOptionCategory[]>>();

  stylesConfig = inject(CORE_STYLES_CONFIG);

  fieldChange = output<PropertyChange>();

  readonly activeCategories = computed(() =>
    this.classType() === ClassType.CLASS_NAME
      ? this.classNameMap()[this.activeBreakpointValue()]
      : this.fieldGroupClassNameMap()[this.activeBreakpointValue()],
  );
  readonly activeBreakpoint = computed(() => this.breakpointMap[this.activeBreakpointValue()]);

  breakpoints = this.stylesConfig.breakpoints;
  breakpointMap = Object.fromEntries(this.stylesConfig.breakpoints.map((bp) => [bp.value, bp]));

  readonly activeBreakpointValue = signal<string>(this.breakpoints[0]?.value ?? '');
}
