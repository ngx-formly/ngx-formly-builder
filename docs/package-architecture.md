# Package architecture

`@ngx-formly/builder` is the only published package. Its root API is a headless editing engine;
the ready-made editor is an optional secondary entry point at `@ngx-formly/builder/ui`.

## Public boundary

The root exports `BuilderEngineService`, `provideBuilderEngine`, transient field state, document
models, persistence contracts and `withValidationExpressions`. It depends on Angular, Formly
and RxJS, with lodash-es, mutative, uuid and tslib as implementation dependencies. It must not
import the UI entry point, Material/CDK, editor tooling or styles.

`@ngx-formly/builder/ui` exports `FormlyBuilder`, `provideFormlyBuilder`, configuration helpers,
property editors, themes and native baseline fields. It imports the engine and injection tokens
from the root so both entry points share their identities. Its Material/CDK, CodeMirror,
Tailwind, drag/drop and editor utility peers are optional in the package manifest and must be
installed explicitly by UI consumers. UI styles remain at `@ngx-formly/builder/styles.css`.

`@ngx-formly/builder/http` exports the opt-in `HttpFormStoreService` and `HTTP_FORM_STORE_CONFIG`.
It depends on `@angular/common/http`, which the headless root must not import, and imports root
symbols through `@ngx-formly/builder`. It needs no UI peers.

Migration from the combined API: move editor components, providers, theme and UI configuration
imports to `/ui`. Keep engine, model and persistence imports at the root. Stored documents and
storage namespaces do not change. The pending minor changeset records this breaking API move.

Additional fields and feature integrations belong in separate libraries. They register through
`LibraryConfig.configOptions`, `builderConfigOptions`, palette metadata and the existing
extension contracts. Studio's examples are private and are not re-exported by either entry point.

## Source ownership

| Source                                                                                         | Responsibility                                                  | Public API                                       |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| `libs/core/src/public-api.ts`                                                                  | Headless package boundary                                       | `@ngx-formly/builder`                            |
| `libs/core/src/lib/state`                                                                      | Models, editing operations, hierarchy, persistence and recovery | Root                                             |
| `libs/core/src/ui-public-api.ts`, `libs/core/ui/ng-package.json`                               | Optional UI package boundary                                    | `@ngx-formly/builder/ui`                         |
| `libs/core/src/http-public-api.ts`, `libs/core/http/ng-package.json`, `libs/core/src/lib/http` | Optional REST form store                                        | `@ngx-formly/builder/http`                       |
| Other `libs/core/src/lib` modules                                                              | Editor shell, configuration, baseline fields, property editors  | UI, except the root validation-expression helper |
| `libs/ui/material`, `libs/ui/builder-material`                                                 | Additional field examples and editor integrations               | Private Studio workspaces                        |
| `apps/studio`, `apps/docs`                                                                     | Demo application and documentation                              | Private workspaces                               |

The private example imports are `@formly-studio/material-fields` and
`@formly-studio/material-editor`. They are not supported consumer packages.

## Internal boundaries

State owns active form/field selection, normalized documents, nested editing operations,
Formly import/export conversion, model/property edits, hierarchy operations, autosave, recovery
and storage namespaces. It uses Angular signals and DI without the editor UI or field examples.

The shell owns panels, hover state, edit/preview/JSON modes, layouts, menus, drag/drop, themes
and property presentation. It delegates document mutations to the engine. `provideFormlyBuilder`
exposes the same engine through `BuilderEngineService` and `CoreFormService` and shares transient
field state with extensions. UI modules must import root symbols through `@ngx-formly/builder`,
not through relative source paths that could compile a second copy of the engine or its tokens.

Use separate injectors and storage namespaces for independent editors. Do not register both
`provideBuilderEngine` and `provideFormlyBuilder` in the same injector. The default store uses
local storage; hosts can provide their own `FormStoreService` for server or in-memory storage.

## Verification

Package checks reject non-headless root imports, required UI-only peers, undeclared dependencies, private
examples and extra field packages. The clean headless consumer installs without UI peers, builds
under a 400 kB initial budget and rejects UI code in its bundle graph. The clean UI consumer
installs optional peers explicitly, tests shared engine identity and renders the editor in
Chromium. Both consumers install a packed tarball with strict peer checking.

See the [embedding guide](../README.md#embedding-contract-experimental),
[store lifecycle guide](asynchronous-stores.md) and [release process](releases.md).
