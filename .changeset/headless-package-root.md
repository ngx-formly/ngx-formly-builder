---
'@ngx-formly/builder': minor
---

Make the package root headless. Import the visual editor, its providers, theme and configuration helpers from `@ngx-formly/builder/ui`. Engine, document and persistence imports remain at `@ngx-formly/builder`.

UI-only peer dependencies are now optional and must be installed explicitly by `/ui` consumers. Headless consumers no longer install Material/CDK, Tailwind, CodeMirror, drag/drop, file utilities or editor tooling. Lodash, mutative and UUID are package implementation dependencies.

The UI and root entry points share the same engine and injection tokens. Stored forms and local-storage keys are unchanged. See the embedding guide for the UI dependency installation command.
