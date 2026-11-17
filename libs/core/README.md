# @ngx-formly/builder

A headless editing engine for ngx-formly forms. The public API is experimental.

Import `BuilderEngineService`, `provideBuilderEngine`, document types and persistence contracts
from `@ngx-formly/builder`. Use Angular 22, Formly 11 and RxJS 7.8. The root has no Material,
Tailwind, CodeMirror or other editor-UI dependency. Register your application's Formly runtime
separately and render `engine.activePreviewFormFields()` with your own controls.

The optional ready-made editor is exported by `@ngx-formly/builder/ui`. Its UI-only peers are
optional in the manifest and must be installed explicitly. It uses
`@ngx-formly/builder/styles.css`, processed by Tailwind CSS 4/PostCSS, plus the Material Symbols
icon font. No stylesheet or icon font is needed for a headless host.

Migration: move `FormlyBuilder`, `provideFormlyBuilder`, theme, UI configuration and property-editor
imports from the root to `/ui`. Engine and persistence imports stay at the root. The UI shares
the root engine and injection tokens; saved documents and local-storage keys are unchanged.

See the [embedding guide](https://docs.formlystudio.com/developers/embed-in-angular/) for the
headless example, UI dependency installation command, isolation and persistence, and the
[repository](https://github.com/ngx-formly/ngx-formly-builder) for release instructions.
Additional fields and feature integrations belong in separate libraries; Studio's Material
examples are not included.

MIT licensed. See LICENSE and CHANGELOG.md in this package.
