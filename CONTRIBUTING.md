# Contributing to ngx-formly Builder

Thanks for helping build the shared visual editor for ngx-formly.

## Before starting

Use an issue or discussion for changes that affect the document format, public APIs, package
boundaries, extension contracts, or user workflows. Small fixes and test improvements can go
directly to a pull request.

The public builder package is `@ngx-formly/builder`, built from `libs/core`. State and UI packages
use `@ngx-formly/builder-*`; see the [package map](README.md#package-names).
Avoid introducing new imports from application code into a library or exporting an internal
service without discussing the compatibility cost.

## Local setup

Use Node.js 24.15 or newer within the Node.js 24 release line and pnpm 10.25.0.

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts Studio on port 4200 and docs on port 4321. Use `pnpm start` or
`pnpm start:docs` to run just one app. Library edits are watched by Studio.

Use `pnpm dev:portless` for both apps with named local HTTPS URLs and automatically assigned ports.
See the [development setup](README.md#development) for URLs and first-run proxy setup.

Use `pnpm install --frozen-lockfile` to reproduce CI installs. Commit `pnpm-lock.yaml` when
dependencies change. The package-consumer fixture is intentionally outside the pnpm workspace.

## Validation

Run the checks relevant to your change and, before requesting review, run the complete validation
set:

```sh
pnpm run lint
pnpm test
pnpm run check:docs
pnpm run build
```

Install Playwright Chromium once before running browser tests:

```sh
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm run build:core
pnpm run check:packages:e2e
```

The production build includes package-contract validation. It checks built bundle imports against
package manifests, packs the builder, and installs its tarball into an isolated Angular
consumer for type-checking, export resolution, and a production build. `check:packages:e2e` also
opens that consumer in Chromium at desktop and mobile sizes, checks its styles, and creates a form.
It uses port 4314 and does not reuse a running server. CI runs this alongside the Studio browser
tests.

See the [package architecture](docs/package-architecture.md) for engine/shell ownership,
the public entry point and private Studio examples.

## Architecture rules

- Keep the Studio application dependent on libraries, not the reverse.
- Keep the engine in `libs/core/src/lib/state` independent from the UI: it must not depend on Angular CDK, UI frameworks, or the
  editor shell.
- Keep reusable Material runtime fields independent from editor state.
- Keep additional fields and editor integrations in private Studio workspaces until they move to a separate library.
- Publish only `@ngx-formly/builder`; do not re-export Studio examples from its public API.
- Use Formly type names and JSON-safe configuration as the persistence boundary.
- Preserve unknown supported Formly properties during import and export.
- Treat exported symbols and dependency-injection tokens as compatibility commitments.
- Add behavior-focused tests for state transitions and document transformations.

## Pull requests

Describe the user-facing outcome, compatibility impact, and validation performed. Include migration
notes when changing stored documents, package APIs, or configuration metadata. Add screenshots or a
short recording for material interaction or responsive-layout changes.
