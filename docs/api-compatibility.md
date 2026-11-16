# Public API compatibility

Issue #11 tracks stabilization, not an immediate API freeze. The API report in `etc/api/core.api.md` is a
reviewable snapshot of the single `@ngx-formly/builder` package. It includes exports, providers, injection tokens, extension contracts and the builder stylesheet
export. It is intentionally broader than the packaged-consumer fixture.

## Gate and stabilization decision

`pnpm run check:api` builds the builder and compares its declarations and package export map
with the checked-in report. It detects a removed export or changed signature even when no fixture
uses it. Run `pnpm run test:api` to verify the comparison tool itself.

CI and the release workflow enforce the checked-in baseline for the initial `0.0.1` release.
This makes API changes visible during review; it does not freeze the experimental API or promise
1.0 stability. PrimeNG-specific exports were removed before first publication. Future incompatible
changes require version and migration decisions under the [release policy](releases.md).

## Intentional changes

1. Build and run `pnpm run check:api`. Review the source/API change and its effect on hosts and
   downstream adapters. An additive export also changes the report; the check is conservative.
2. For a removal or incompatible signature, deprecate the old contract first where practical.
   Use `@deprecated` with the replacement and planned removal version. Keep the alias or adapter
   through the announced migration window; tests must cover that compatibility path.
3. Add a builder release entry and migration instructions. Under the
   release policy, an incompatible `0.x` change increments the minor; after 1.0 it increments
   the major. Update external peer ranges when required. An API report update alone never authorizes
   a breaking release or makes downstream callers compatible.
4. Run `pnpm run update:api`, inspect every changed report in the same PR, then rerun `check:api`,
   package contracts and the clean tarball consumer. Require maintainer review of report updates.
   Never regenerate reports automatically in CI or skip the gate just to make a PR green.

## Scope and limits

The reports use ng-packagr's complete rolled `.d.ts` output plus package export maps, so inherited
engine contracts and referenced declarations are present in the same report. This avoids introducing another declaration bundler. Source-map comments, formatting, line
endings and union-member ordering are normalized; all signatures, doc comments and Angular declaration metadata remain.
Private declaration changes can produce review noise and may be rebaselined when harmless.

This is a declaration-diff gate, not a semantic proof that every change is breaking or compatible.
It does not detect runtime behavior changes, DI scope changes with unchanged signatures, CSS
visual changes, changed external dependency types, or saved-document incompatibilities. Retain
unit, package-boundary, tarball-consumer and browser checks for those. A change to Angular's
emitted declarations may need a deliberate report refresh alongside the supported Angular range.

The package reports do not grant support to private deep-import paths. New secondary entry points
must have their exports and declarations reviewed with their package's report. Private Studio
field examples have no published API report and must not appear in the builder bundle or exports.
