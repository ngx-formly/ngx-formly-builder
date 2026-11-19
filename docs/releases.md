# Builder releases

Only `@ngx-formly/builder` is published. Its authoritative version and release notes are
`libs/core/package.json` and `libs/core/CHANGELOG.md`. State and persistence are bundled into
that package. Studio, docs, and the extra Material field examples are private workspaces.

Changesets 3.0.3 prepares the builder version and changelog, then publishes the ng-packagr output
from `dist/core`. There are no companion package releases or independent version relationships.
The release guard rejects a second public package.

## First release: 0.0.1

The initial changelog contains the accumulated prerelease work. The pending headless-root
changeset is an incompatible API move and must be versioned before publication. The release guard
rejects publishing while changesets remain pending. The API is experimental.

The optional `/ui` editor uses native controls, Angular Material 22 and CDK 22. Its hosts install
UI peers explicitly and need the packaged stylesheet. Headless root consumers need neither.
No PrimeNG providers or peer overrides are required. Additional fields and feature
integrations are not shipped by the builder and must come from the host or a separate library.

Configure the repository's `npm-release` environment with a required reviewer, a deployment
rule restricted to `main`, and an `NPM_TOKEN` secret authorized to publish `@ngx-formly/builder`.
Add the token through GitHub settings or the secure CLI prompt:

```sh
gh secret set NPM_TOKEN --env npm-release --repo ngx-formly/ngx-formly-builder
```

Allow GitHub Actions to create pull requests for future version PRs. These settings and credentials
are separate from the checked-in workflow. Never commit a token. The publish job fails explicitly
when its environment secret is missing.

Merge the reviewed preparation changes and wait for CI. Run **Release builder** on `main` with
`action: validate`, review the checks and deployed Studio, then choose `action: publish` for the
reviewed commit. The environment reviewer approves publication after validation succeeds.
Publishing uses npm provenance and creates the package tag and GitHub release notes.

## Subsequent releases

1. Run `pnpm run changeset` for a builder change. Select only `@ngx-formly/builder` and describe
   user-visible changes and migration steps. Private Studio/example changes need no builder release
   unless they also change the published code or its contract.
2. Inspect `pnpm run release:status` and run `pnpm run release:dry-run`. The dry run creates a temporary
   workspace, proposes a builder patch, runs version preparation, and verifies that private
   workspaces remain unchanged. With `--consumer`, it also packs that simulated version and builds
   a clean consumer. It never changes repository versions, tags, or registry entries.
3. Run **Release builder** on `main` with `action: version`. After validation, Changesets opens or
   updates the version PR. Review the manifest, changelog, and lockfile, then merge it.
   `pnpm run release:version` performs the same preparation locally without publication.
4. Wait for CI on the version commit and verify its production deployment in
   [Netlify](https://app.netlify.com/projects/ngx-formly-builder/deploys). Open the
   [demo](https://builder.formly.dev/) and refresh the [editor](https://builder.formly.dev/form-editor).
5. Run the workflow on that reviewed `main` commit with `action: publish`. The workflow checks
   release notes, the single-package boundary, lint, unit tests, docs, builds, release artifacts,
   tarball contracts, strict peer installation, and Studio/consumer browser tests before approval.

The default action is `validate`, which performs no versioning or publication. Dispatches outside
`main` are skipped. Publication checks out the exact commit validated by its run, even if `main`
advances while approval is pending.

Compatible `0.x` fixes and additions use a patch; incompatible changes require a minor bump and
migration notes. Moving to `1.0.0` is an explicit stabilization decision. After 1.0, use ordinary
SemVer patch, minor, and major bumps. Update external peer ranges when the supported dependencies
change, and test those combinations before claiming compatibility.

## Artifacts and retries

Source `publishConfig.directory` points to `dist/core`. Never run `npm publish` from the source
directory. `release:validate` builds the package, checks its manifest and required declarations,
verifies README/LICENSE/CHANGELOG assets, and installs its tarball into a clean consumer.
The tarball contains Angular partial-compilation output and declarations, not workspace aliases.

Changesets skips a version already in the registry. Tags use the package name, for example
`@ngx-formly/builder@0.0.2`. If publication partially fails, inspect npm, the tag, and the GitHub
release before retrying the same reviewed commit. Never overwrite or unpublish an existing
version to repair a release.

## Prereleases

Use `pnpm run changeset pre enter next`, commit `.changeset/pre.json`, then add a builder changeset
and prepare/review versions through the same workflow. Publish under `next`, not `latest`.
To exit, run `pnpm run changeset pre exit` and prepare a reviewed stable version PR. Do not
hand-edit prerelease suffixes or delete the prerelease state file.

## Local validation

Use pnpm 10.25.0 and Node 24. Version preparation refreshes the lockfile; CI uses frozen installs.

```sh
pnpm run release:check
pnpm run test:release
pnpm run release:validate
```

See the [Changesets configuration](https://changesets.dev/guide/config),
[publishing guide](https://changesets.dev/guide/versioning-and-publishing), and
[prerelease rules](https://changesets.dev/guide/prereleases).
