import { inject, Injectable } from '@angular/core';
import { BuilderFieldStateService as FieldState } from '../state';
import { CoreFormService } from './core-form.service';

@Injectable()
export class BuilderFieldStateService extends FieldState {
  constructor() {
    super(inject(CoreFormService));
  }
}
