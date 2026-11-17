# Private Studio Material editor integrations

This private workspace preserves selected tabs and steps while Studio edits composite fields.
It is not published, bundled, or re-exported by `@ngx-formly/builder`.

Studio imports `withStepperTypeBuilder()` and `withTabsTypeBuilder()` from
`@formly-studio/material-editor` for its `builderConfigOptions`. Runtime registrations from
`@formly-studio/material-fields` stay in `configOptions`, so preview uses the ordinary field types.

These examples depend on the builder's public extension contracts. The builder does not depend
on them. Additional fields and features will be provided by a separate library.
