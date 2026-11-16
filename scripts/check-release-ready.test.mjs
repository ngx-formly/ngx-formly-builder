import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

test('publishing requires one public builder package, consumed changesets and release notes', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'builder-release-ready-'));
  try {
    mkdirSync(join(fixture, '.changeset'));
    writeFileSync(join(fixture, '.changeset/README.md'), '# Changesets');
    for (const directory of ['libs/core']) {
      mkdirSync(join(fixture, directory), { recursive: true });
      writeFileSync(
        join(fixture, directory, 'package.json'),
        JSON.stringify({ name: '@ngx-formly/builder', version: '0.0.1' }),
      );
      writeFileSync(
        join(fixture, directory, 'CHANGELOG.md'),
        '# Package\n\n## 0.0.1\n\nInitial release.\n',
      );
    }
    const check = () =>
      spawnSync(process.execPath, [resolve(import.meta.dirname, 'check-release-ready.mjs')], {
        cwd: fixture,
        encoding: 'utf8',
      });
    assert.equal(check().status, 0);

    const extension = join(fixture, 'libs/ui/material');
    mkdirSync(extension, { recursive: true });
    writeFileSync(
      join(extension, 'package.json'),
      JSON.stringify({ name: '@formly-studio/material-fields', private: true }),
    );
    assert.equal(check().status, 0);
    writeFileSync(
      join(extension, 'package.json'),
      JSON.stringify({ name: '@formly-studio/material-fields' }),
    );
    assert.match(check().stderr, /Only @ngx-formly\/builder may be published/);
    rmSync(extension, { recursive: true });

    const pending = join(fixture, '.changeset/pending.md');
    writeFileSync(pending, '---\n"@ngx-formly/builder": patch\n---\n\nA fix.\n');
    const unversioned = check();
    assert.notEqual(unversioned.status, 0);
    assert.match(unversioned.stderr, /Prepare and merge release notes/);
    rmSync(pending);

    writeFileSync(join(fixture, 'libs/core/CHANGELOG.md'), '# Package\n\n## 0.0.0\n');
    const undocumented = check();
    assert.notEqual(undocumented.status, 0);
    assert.match(undocumented.stderr, /missing notes for 0.0.1/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
