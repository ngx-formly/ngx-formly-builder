import { nativeFieldConfig } from '@ngx-formly/builder/ui';
import { withFormlyNgZorroAntd } from '@ngx-formly/ng-zorro-antd';

export function ngZorroConfigOptions() {
  return [...withFormlyNgZorroAntd(), nativeFieldConfig];
}
