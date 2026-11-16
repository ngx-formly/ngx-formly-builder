# @ngx-formly/builder

An embeddable visual editor for ngx-formly forms. Version 0.0.1 has an experimental public API.

Use Angular 22, Angular Material/CDK 22 and Formly 11. Import `FormlyBuilder` and
`provideFormlyBuilder` from this package, and process `@ngx-formly/builder/styles.css` with
Tailwind CSS 4/PostCSS. The stylesheet includes the editor theme. PrimeNG is not required.

See the [embedding guide](https://docs.formlystudio.com/developers/embed-in-angular/) for setup,
library registration and persistence, and the [repository](https://github.com/ngx-formly/ngx-formly-builder)
for examples and release instructions. State and persistence are included in this package.
Additional fields and feature integrations belong in separate libraries; Studio's Material examples
are not included. The public JavaScript entry point is `@ngx-formly/builder`.

MIT licensed. See LICENSE and CHANGELOG.md in this package.
