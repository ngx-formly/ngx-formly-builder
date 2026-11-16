# Package architecture

`@ngx-formly/builder` is the only published package. It provides the barebones editor,
its editing engine and persistence, native baseline fields, and contracts for registering
application-owned fields and extensions. Its version starts at `0.0.1`.

## Public boundary

Consumers import JavaScript and types from `@ngx-formly/builder` and styles from
`@ngx-formly/builder/styles.css`. State is compiled into the same package; there is no state
package to install and no Material field or feature subpath.

The package includes `FormlyBuilder`, `provideFormlyBuilder`, configuration helpers,
property editors, persistence contracts, and the document-editing engine. Angular Material/CDK
supply the editor's controls. They do not register an extra catalogue of runtime Formly fields.

Additional fields and feature integrations belong in separate libraries. They register through
`LibraryConfig.configOptions`, `builderConfigOptions`, palette metadata, and the existing
extension contracts. They must not be bundled or re-exported by the builder.

## Source ownership

| Source                     | Responsibility                                                            | Publication             |
| -------------------------- | ------------------------------------------------------------------------- | ----------------------- |
| `libs/core`                | Editor shell, configuration, baseline fields, extension contracts, styles | `@ngx-formly/builder`   |
| `libs/core/src/lib/state`  | Document models, editing operations, hierarchy, persistence and recovery  | Included in the builder |
| `libs/ui/material`         | Additional Material runtime examples used by Studio                       | Private workspace       |
| `libs/ui/builder-material` | Editor integrations for Studio's composite field examples                 | Private workspace       |
| `apps/studio`, `apps/docs` | Demo application and documentation                                        | Private workspaces      |

The private example imports are `@formly-studio/material-fields` and
`@formly-studio/material-editor`. They preserve the Studio demo while those features await a
separate library. They are not supported consumer packages.

## Internal boundaries

State owns active form/field selection, normalized documents, nested editing operations,
Formly import/export conversion, model/property edits, hierarchy operations, autosave, error
recovery, and storage namespaces. It uses Angular signals and DI without importing the editor
UI or field examples. Keep the existing JSON-safe document format and storage keys.

The shell owns panels, hover state, edit/preview/JSON modes, layouts, menus, drag/drop behavior,
theme integration, and property presentation. It delegates document mutations to the engine.
`provideFormlyBuilder` exposes the same engine instance through `BuilderEngineService` and
`CoreFormService`, and shares transient field state with extension components.

A host can use `provideBuilderEngine` from the same package to supply its own UI. It still installs
the builder's declared peer dependencies. Do not register both engine and shell providers in the
same injector. Use separate injectors and storage namespaces for independent editors.

Runtime field examples remain independent from editor state. Their private editing integrations
can use the builder's public extension contracts; the dependency must never point back into them
from the builder.

## Verification

The release guard rejects any second public workspace package. The API report captures the
builder root and stylesheet exports. Package checks reject references to the removed packages,
private examples, and extra field dependencies. The clean consumer installs one tarball with
strict peer checking, tests its public exports, and renders the editor in Chromium.

See the [embedding guide](../README.md#embedding-contract-experimental),
[store lifecycle guide](asynchronous-stores.md), and [release process](releases.md).
