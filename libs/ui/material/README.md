# Private Studio Material fields

This private workspace supplies Studio examples: cards, Markdown, postal code, repeaters,
tabs, steppers, and related field types. It is not published, bundled, or re-exported by
`@ngx-formly/builder`.

Studio imports these examples through `@formly-studio/material-fields`. Additional fields
will belong in a separate library; consumers should register their own Formly types through
`createLibrary()` and `provideFormlyBuilder({ libraries })`.

Runtime examples remain independent of the editor. Their Studio-specific editing integrations
live in the private `@formly-studio/material-editor` workspace.
