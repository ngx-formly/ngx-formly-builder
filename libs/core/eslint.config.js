// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../../eslint.config.js');

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['@formly-studio/*', '@ngx-formly/builder-*'] },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'core',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['core', 'formly'],
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/state/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@angular/cdk',
                '@angular/cdk/*',
                '@angular/material',
                '@angular/material/*',
                '@ngx-formly/builder',
                '@ngx-formly/builder/*',
                '@ngx-formly/builder-*',
                '@formly-studio/*',
                'primeng',
                'primeng/*',
              ],
              message:
                'Keep the internal editing engine independent from the editor UI and Studio examples.',
            },
          ],
        },
      ],
    },
  },
]);
