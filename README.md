# ngx-formly Builder

A visual form builder for ngx-formly that brings community efforts together. Build Angular forms
with drag-and-drop editing, custom components, live previews, and Formly JSON export.

## Live demo

Try the builder at [builder.formly.dev](https://builder.formly.dev/).

Netlify automatically deploys successful builds of `main`, including the version commits used for
new package releases. The demo can include changes ahead of the latest npm release. See the
[release checklist](docs/releases.md#first-release-001) for deployment verification.

## Project status

The repository is the shared foundation for an official ngx-formly builder. It currently provides
the Studio application, reusable editor libraries, multiple UI profiles, local persistence, and
authoring documentation.

The package `@ngx-formly/builder` exposes a headless editing engine at its root and an
optional ready-made editor at `@ngx-formly/builder/ui`. Additional fields and feature integrations belong in separate libraries.
The API is experimental; review the changelog before upgrading. See
[CONTRIBUTING.md](CONTRIBUTING.md) before proposing public API changes.

The project originated from the community evaluation in
[ngx-formly discussion #4198](https://github.com/ngx-formly/ngx-formly/discussions/4198). It uses
Formly Studio as the initial authoring foundation and will incorporate the strongest engineering
and schema workflows from the other community builders.

## Name and canonical URLs

The application and documentation use **ngx-formly Builder**. `Studio` remains the reference
application's source-folder name. The Material UI profile includes the standard controls and the
builder's additional fields and layouts.
The demo is hosted at [builder.formly.dev](https://builder.formly.dev/). Canonical/social metadata
and crawler files still reference [formlystudio.com](https://formlystudio.com/), while package
homepages and documentation links use [docs.formlystudio.com](https://docs.formlystudio.com/).
The repository is [ngx-formly/ngx-formly-builder](https://github.com/ngx-formly/ngx-formly-builder).

When domains change, update both deployments, redirects, canonical/social URLs, sitemaps, crawler
files, the docs build's `site` setting and header links together. Local browser storage is tied
to an origin, so provide an export/import migration before a domain move. This branding change
preserves all `formly-studio-*` storage keys and the project's author and provenance attribution.

## Development

Use Node.js 24.15 or newer within the Node.js 24 release line and pnpm 10.25.0.
The builder uses Angular 22 and Formly 11.
The editor uses Angular Material 22, Angular CDK 22, and native HTML controls. No peer-dependency
overrides or commercial UI license keys are required.

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts Studio at `http://localhost:4200` and docs at `http://localhost:4321`.
Use `pnpm start` for Studio alone or `pnpm start:docs` for docs alone. Studio watches the
libraries through the source paths in `tsconfig.json`; no separate library watchers are needed.

Run `pnpm dev:portless` to start both apps through [Portless](https://portless.sh/), which assigns
free ports and provides named URLs at `https://builder-studio.ngx-formly.localhost` and
`https://builder-docs.ngx-formly.localhost`. On first use, Portless may request administrator access
to start its HTTPS proxy and trust its local certificate. Follow the URLs printed in the terminal
if you use a custom proxy configuration or a Git worktree.
Studio stores forms per browser origin, so export forms from `http://localhost:4200` before
switching URLs, then import them at the new URL.

The pnpm workspace includes `apps/*`, `libs/*`, and `libs/ui/*`, with one root lockfile.
The package-consumer fixture stays outside the workspace so it tests packed libraries in isolation.

Run `pnpm test`, `pnpm run lint`, `pnpm run check:docs`, and `pnpm run build` to validate changes. The
build also verifies that every external library import is declared by its published package, packs
the libraries, and builds a clean Angular consumer from those tarballs. After installing Playwright
Chromium, run `pnpm run check:packages:e2e` to check the packaged editor in a browser.

## Repository layout

- `apps/studio`: hosted reference application.
- `apps/docs`: author and integration documentation.
- `libs/core/src/lib/state`: internal document models, editing engine, and persistence.
- `libs/core`: editor shell, UI orchestration, and extension contracts.
- `libs/ui/material`: private Material field examples used by Studio.
- `libs/ui/builder-material`: private editor integrations for those Studio examples.

## Published package

`@ngx-formly/builder` is the only published package, built from `libs/core`. Its root exports the
headless engine, document model, persistence and validation-expression helper. The optional
`@ngx-formly/builder/ui` entry point contains the editor, native baseline fields and UI extension
contracts. UI consumers load `@ngx-formly/builder/styles.css`; headless consumers need no stylesheet.

Extra runtime fields and feature integrations are not bundled, re-exported, or installed by this
package. They belong in separate libraries registered through `libraries`, `configOptions`, and
`builderConfigOptions`. Studio's Material examples remain private workspace code under
`@formly-studio/material-fields` and `@formly-studio/material-editor`; they are not npm products.
The editor's Material/CDK dependency supplies its controls, not an additional form-field catalogue.

The private Studio/docs applications and package-consumer fixture are not published.

## Embedding contract (experimental)

Follow [Embed in Angular](https://docs.formlystudio.com/developers/embed-in-angular/) for a complete
installation from locally packed packages. The
[configuration reference](https://docs.formlystudio.com/developers/builder-configuration/) covers
initialization options, custom styling choices, and readable size labels.

The Studio route uses the same component and provider intended for embedding. The complete
[package-consumer fixture](integration/package-consumer) runs against npm tarballs without Studio
or workspace source imports.

The ready-made editor uses optional peers. Install them explicitly when importing `/ui`:

```sh
pnpm add @angular/cdk@^22 @angular/material@^22 ngx-drag-drop@^22
pnpm add codemirror@^6 @codemirror/state@^6 @codemirror/view@^6 @codemirror/lang-javascript@^6 @codemirror/lang-json@^6 @codemirror/lang-markdown@^6 @uiw/codemirror-theme-vscode@^4
pnpm add date-fns@^4 file-saver@^2 js-beautify@^1 terser@^5 zod@^4 tailwindcss@^4
pnpm add -D @tailwindcss/postcss@^4 postcss
```

The package root does not require these UI dependencies.

Add `.postcssrc.json` at the Angular application's root:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Import the packaged stylesheet from the application's global CSS:

```css
@layer theme, base;
@import '@ngx-formly/builder/styles.css';

html,
body,
app-root {
  display: block;
  height: 100%;
  margin: 0;
}
```

The CSS entry includes Tailwind's base styles, editor and Material styles, and class scanning
for the packaged editor, including its lazy dialogs. It also includes the layout utilities used
by the editor's Styling panel. It is Tailwind source CSS, so it must go through PostCSS rather than
a browser `<link>`. Give the builder's container an explicit height if it does not fill the page.
UI profiles may need their own styles, such as an Angular Material theme.

Load the Material Symbols Outlined icon font in `index.html`, as Studio does, or self-host that
font with its matching font-face and `.material-symbols-outlined` rules:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
/>
```

Register the builder and any optional UI profiles, then render the builder component:

```ts
import { ApplicationConfig, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormlyBuilder, provideFormlyBuilder } from '@ngx-formly/builder/ui';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormlyBuilder],
  template: `<formly-builder class="block h-full" />`,
})
export class FormEditorPage {}

export const appConfig: ApplicationConfig = {
  providers: [
    provideFormlyBuilder({ libraries: [myFormlyLibrary] }),
  ],
};
```

Use your own profile for `myFormlyLibrary`. Toggle `.dark` on the document root to use dark mode. `provideCoreTheme()` remains available to hosts that also synchronize the code editor theme.

`provideFormlyBuilder` accepts an editor storage namespace, autosave settings, and a custom
`FormStoreService` implementation. Pass `styles` to replace the Tailwind styling catalogue,
using `tailwindConfig` as an optional starting point. Style options accept `variantLabels` and
`description`; their saved class values stay unchanged. The **Builder settings** panel shows
the effective configuration, including before a form is opened. Set `editableSettings: true` to let
users change and share autosave settings there, or `showSettings: false` to hide the panel in your
application. Host CSS determines the actual dimensions and available classes.
The API is experimental in `0.0.x`.

Use `provideFormlyBuilder()` without profiles for native HTML controls. Leaving **UI Library**
empty when creating or importing a form uses Vanilla: input, number, textarea, checkbox, select,
and field groups. Pass shared `FormTemplate[]` through `formTemplates` to offer examples that use
the selected library. Without this setting, the editor uses the templates configured in each profile.

Document models and persistence APIs are available from the same package:

```ts
import { createEmptyWorkspaceHierarchy, type FormStoreService } from '@ngx-formly/builder';
```

Custom stores may optionally implement `getRecoveryIssues$` and `resetCorruptedStorage$`. These
hooks let the builder show its backup and reset workflow when persisted data cannot be read. Stores
that manage recovery outside the builder can omit them.

Recovery backups include each issue's original value and its optional `relatedEntries`, which hold
any other stored values that reset will remove. The local store includes the workspace hierarchy
when resetting corrupted forms also removes that hierarchy. Resetting only a corrupted hierarchy
preserves the active form's unsaved edits.

## Headless editing

`@ngx-formly/builder` is headless by default. It requires Angular core/common/forms, Formly and
RxJS; lodash-es, mutative and uuid are implementation dependencies. UI-only peers are optional
and are neither installed nor bundled when consuming the root alone.
Register `provideBuilderEngine` in a route or environment injector, then inject
`BuilderEngineService`. Use a different `editorType` for each independent storage namespace.

```ts
import { BuilderEngineService, provideBuilderEngine } from '@ngx-formly/builder';

const providers = [provideBuilderEngine({
  editorType: 'survey-designer',
  autoSave: true,
  libraries: [{
    id: 'survey',
    fieldTypes: [{ name: 'input', displayName: 'Input', defaultConfig: {} }],
  }],
})];
// In the configured Angular injection context:
// const engine = inject(BuilderEngineService);
// engine.addForm$('Survey', [], {}, 'survey').subscribe();
// engine.addField('input');
// engine.activePreviewFormFields() contains exported Formly fields.
```

Create `const previewFields = engine.createPreviewFields()` once per renderer and bind
`previewFields()` to Formly. Each preview owns its mutable runtime fields and keeps unchanged
inputs mounted across document edits. The shared `activePreviewFormFields` signal is suitable
for a single renderer; do not bind the same mutable fields to multiple Formly forms. Use
`activeFormFieldsJSON()` for clean exports, independently of rendered previews.

Autosave defaults to `true`, with a 3000 ms delay; set `autoSave: false` for explicit saves.
The provider accepts an optional `formStore` class and `autoSaveDelay`. Creating a form writes to
the store even with autosave disabled; use an in-memory store for transient demos. It does not register Formly
runtime components. Headless hosts render their own controls and register their chosen Formly
runtime separately. `BuilderFieldStateService` holds transient per-field UI state without storage.
The engine owns document edits, selection, hierarchy, autosave and recovery. Its `formSelected$`
event reports completed loads or unloads; the shell uses it to update library and panel selection.

Existing shell consumers move `provideFormlyBuilder`, `CoreFormService`, components, property
editors and UI configuration helpers to `@ngx-formly/builder/ui`. That provider exposes
the same engine and transient field-state instances through the package root. Do not also
register `provideBuilderEngine` in the same injector. Storage keys and document formats are unchanged.

See [Asynchronous stores and editor lifecycle](docs/asynchronous-stores.md) for custom-store
contracts, error handling, and saving before closing the editor.

`moveField` uses the original list’s insertion boundary: moving a root field down one position
uses `toIndex = fromIndex + 2`, and moving up uses `toIndex = fromIndex - 1`.
