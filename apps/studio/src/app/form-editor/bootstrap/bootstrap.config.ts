import { nativeFieldConfig } from '@ngx-formly/builder';
import { withFormlyBootstrap } from '@ngx-formly/bootstrap';

export function bootstrapConfigOptions() {
  return [...withFormlyBootstrap(), nativeFieldConfig];
}
