import { ConfigOption, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { cloneDeep, isEqual } from 'lodash-es';

/** Recheck expression validators when another field changes their model. */
export function withValidationExpressions(): ConfigOption {
  const wrapped = new WeakSet<FormlyFormOptions>();
  return {
    extensions: [
      {
        name: 'builder-validation-expressions',
        extension: {
          postPopulate(root) {
            const options = root.options;
            if (root.parent || !options || wrapped.has(options)) return;
            wrapped.add(options);
            const checkExpressions:
              ((field: FormlyFieldConfig, ignoreCache?: boolean) => void) | undefined =
              options.checkExpressions;
            let previousModel: unknown;
            options.checkExpressions = (field: FormlyFieldConfig, ignoreCache?: boolean) => {
              checkExpressions?.(field, ignoreCache);
              const fields = expressionFields(root);
              if (!fields.length || isEqual(previousModel, root.model)) return;
              // Cache before emitting control events so Formly's model updates cannot recurse.
              previousModel = cloneDeep(root.model);
              for (const candidate of fields) candidate.formControl?.updateValueAndValidity();
              options.detectChanges?.(root);
            };
          },
        },
      },
    ],
  };
}

function expressionFields(field: FormlyFieldConfig): FormlyFieldConfig[] {
  const hasExpression = Object.values(field.validators ?? {}).some(
    (rule) =>
      rule &&
      typeof rule === 'object' &&
      'expression' in rule &&
      typeof rule.expression === 'string',
  );
  return [...(hasExpression ? [field] : []), ...(field.fieldGroup ?? []).flatMap(expressionFields)];
}
