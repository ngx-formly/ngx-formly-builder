import { withStepperTypeBuilder, withTabsTypeBuilder } from '@ngx-formly/builder-material';
import {
  withButtonGroupType,
  withCardType,
  withCardWrapper,
  withDividerType,
  withMarkdownType,
  withPostalCodeType,
  withRepeatingSectionType,
  withStepperType,
  withStepType,
  withTabsType,
  withTabType,
} from '@ngx-formly/builder-material-fields';
import { nativeFieldConfig } from '@ngx-formly/builder';
import { ConfigOption } from '@ngx-formly/core';
import { withFormlyMaterial } from '@ngx-formly/material';
import { withFormlyFieldDatepicker } from '@ngx-formly/material/datepicker';
import { withFormlyFieldToggle } from '@ngx-formly/material/toggle';
import { ipAsyncValidator, ipValidator, ipValidatorMessage } from './material.utils';

export function materialConfigOptions(): ConfigOption[] {
  return [
    nativeFieldConfig,
    {
      validators: [
        { name: 'ip', validation: ipValidator },
        { name: 'ipAsync', validation: ipAsyncValidator },
      ],
      validationMessages: [
        { name: 'ip', message: ipValidatorMessage },
        { name: 'ipAsync', message: 'This is not a valid IP Address' },
        { name: 'required', message: 'This field is required' },
      ],
    },
    ...withFormlyMaterial(),
    withFormlyFieldDatepicker(),
    withFormlyFieldToggle(),
    withButtonGroupType(),
    withCardType(),
    withCardWrapper(),
    withDividerType(),
    withMarkdownType(),
    withPostalCodeType(),
    withRepeatingSectionType(),
    withTabType(),
    withStepType(),
    withTabsType(),
    withStepperType(),
  ];
}

export function materialBuilderConfigOptions(): ConfigOption[] {
  return [withStepperTypeBuilder(), withTabsTypeBuilder()];
}
