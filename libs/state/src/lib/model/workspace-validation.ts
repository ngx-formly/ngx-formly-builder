import { WorkspaceValidation } from './types';

/** Whether a name can safely identify a custom expression validator. */
export function isValidationRuleName(name: string): boolean {
  return (
    /^[A-Za-z][A-Za-z0-9_]*$/.test(name) &&
    !(name in Object.prototype) &&
    ![
      'validation',
      'required',
      'pattern',
      'min',
      'max',
      'minLength',
      'maxLength',
      'minlength',
      'maxlength',
      'email',
      'step',
      'multipleOf',
    ].includes(name)
  );
}

export function isWorkspaceValidation(value: unknown): value is WorkspaceValidation {
  if (!value || typeof value !== 'object') return false;
  const rule = value as Record<string, unknown>;
  return (
    typeof rule['id'] === 'string' &&
    !!rule['id'].trim() &&
    typeof rule['name'] === 'string' &&
    isValidationRuleName(rule['name']) &&
    typeof rule['expression'] === 'string' &&
    !!rule['expression'].trim() &&
    typeof rule['message'] === 'string' &&
    !!rule['message'].trim()
  );
}

export function isWorkspaceValidationList(value: unknown): value is WorkspaceValidation[] {
  return (
    Array.isArray(value) &&
    value.every(isWorkspaceValidation) &&
    new Set(value.map((rule) => rule.id)).size === value.length &&
    new Set(value.map((rule) => rule.name)).size === value.length
  );
}
