import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'core-readonly-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.contents]': '!props.readonly',
    '[class.block]': 'props.readonly',
    '[class.opacity-50]': 'props.readonly',
  },
  template: `<ng-template #fieldComponent />`,
})
export class ReadonlyWrapper extends FieldWrapper {}
