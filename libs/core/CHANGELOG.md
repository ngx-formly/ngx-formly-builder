# @ngx-formly/builder

## 0.0.1

Initial public release of the barebones embeddable Angular form editor.

Only `@ngx-formly/builder` is published. The editing engine and persistence are bundled into the
same package. Additional Material fields and their editor integrations remain private Studio
examples; extensions belong in separate libraries and are not re-exported by the builder.

- Use native controls, Angular Material 22 and CDK 22 for the editor shell. PrimeNG, its theme preset and peer overrides are removed before first publication.
- Configure the editor with `provideFormlyBuilder` and render `FormlyBuilder`. Use native fields or supply a Formly UI library, templates, presets, and a custom styling catalogue.
- Create, import, edit, preview, and export forms. Drag fields into responsive rows, move them with keyboard-accessible menus, and edit properties, validation, expressions, model values, and styles.
- Organize forms in folders, delete workspace selections, and reuse saved validation expressions. `PanelService` supports host navigation and active workspace/add-field tabs.
- Use local persistence or a custom asynchronous store, with autosave, load-error recovery, and backups of corrupted local data. Hosts must await a successful save before destroying the editor to preserve unsaved changes.
- Inspect effective host configuration in Builder settings; set `showSettings: false` to hide it. Readonly fields are identified in the builder and preview.

The API is experimental. See the embedding and asynchronous-store guides before integrating a custom host.
