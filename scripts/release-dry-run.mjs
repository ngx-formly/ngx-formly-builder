import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  globSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fixture = mkdtempSync(join(tmpdir(), 'builder-release-plan-'));
const manifests = globSync(
  ['apps/*/package.json', 'libs/*/package.json', 'libs/ui/*/package.json'],
  { cwd: root },
);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
try {
  mkdirSync(join(fixture, '.changeset'));
  cpSync(join(root, 'pnpm-workspace.yaml'), join(fixture, 'pnpm-workspace.yaml'));
  cpSync(join(root, '.changeset/config.json'), join(fixture, '.changeset/config.json'));
  cpSync(join(root, 'package.json'), join(fixture, 'package.json'));
  for (const manifest of manifests) {
    const target = join(fixture, manifest);
    mkdirSync(resolve(target, '..'), { recursive: true });
    cpSync(join(root, manifest), target);
  }
  const builder = readJson(join(fixture, 'libs/core/package.json'));
  assert.deepEqual(
    manifests
      .map((path) => readJson(join(fixture, path)))
      .filter((pkg) => !pkg.private)
      .map((pkg) => pkg.name),
    ['@ngx-formly/builder'],
  );
  writeFileSync(
    join(fixture, '.changeset/builder-patch.md'),
    `---\n'${builder.name}': patch\n---\n\nCompatible builder fix.\n`,
  );
  execFileSync('git', ['init', '-b', 'main', fixture], { stdio: 'pipe' });
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Release fixture',
      '-c',
      'user.email=release@example.invalid',
      '-c',
      'commit.gpgsign=false',
      '-c',
      'core.hooksPath=/dev/null',
      'commit',
      '--allow-empty',
      '-m',
      'Initialize release fixture',
    ],
    { cwd: fixture, stdio: 'pipe' },
  );
  const output = join(fixture, 'plan.json');
  execFileSync(
    process.execPath,
    [join(root, 'node_modules/@changesets/cli/bin.js'), 'status', '--output', output],
    { cwd: fixture, stdio: 'inherit' },
  );
  const plan = readJson(output);
  const releases = plan.releases.filter((release) => release.type !== 'none');
  assert.equal(
    releases.length,
    1,
    `Only the builder may be released: ${JSON.stringify(plan.releases)}`,
  );
  assert.equal(releases[0].name, builder.name);
  assert.equal(releases[0].type, 'patch');
  execFileSync(process.execPath, [join(root, 'node_modules/@changesets/cli/bin.js'), 'version'], {
    cwd: fixture,
    stdio: 'inherit',
  });
  assert.equal(readJson(join(fixture, 'libs/core/package.json')).version, releases[0].newVersion);
  assert.match(
    readFileSync(join(fixture, 'libs/core/CHANGELOG.md'), 'utf8'),
    /Compatible builder fix/,
  );
  for (const manifest of manifests.filter((path) => path !== 'libs/core/package.json')) {
    assert.deepEqual(
      readJson(join(fixture, manifest)),
      readJson(join(root, manifest)),
      'Private workspaces must not be versioned',
    );
  }
  if (process.argv.includes('--consumer')) {
    for (const directory of ['core']) {
      cpSync(join(root, 'dist', directory), join(fixture, 'dist', directory), { recursive: true });
    }
    cpSync(
      join(root, 'integration/package-consumer'),
      join(fixture, 'integration/package-consumer'),
      { recursive: true },
    );
    mkdirSync(join(fixture, 'scripts'));
    cpSync(
      join(root, 'scripts/check-packed-consumer.mjs'),
      join(fixture, 'scripts/check-packed-consumer.mjs'),
    );
    const builtPath = join(fixture, 'dist/core/package.json');
    const built = readJson(builtPath);
    built.version = releases[0].newVersion;
    writeFileSync(builtPath, JSON.stringify(built));
    execFileSync(process.execPath, [join(fixture, 'scripts/check-packed-consumer.mjs')], {
      cwd: fixture,
      stdio: 'inherit',
    });
  }
  console.log(JSON.stringify(releases, null, 2));
  console.log(
    'Only @ngx-formly/builder is versioned. Private Studio examples are excluded. No repository files, tags or registry entries changed.',
  );
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
