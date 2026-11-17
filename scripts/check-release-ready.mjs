import assert from 'node:assert/strict';
import { globSync, readFileSync, readdirSync } from 'node:fs';

const publishable = globSync([
  'apps/*/package.json',
  'libs/*/package.json',
  'libs/ui/*/package.json',
])
  .map((path) => JSON.parse(readFileSync(path, 'utf8')))
  .filter((manifest) => !manifest.private)
  .map((manifest) => manifest.name);
assert.deepEqual(
  publishable.sort(),
  ['@ngx-formly/builder'],
  'Only @ngx-formly/builder may be published',
);

const pending = readdirSync('.changeset').filter(
  (file) => file.endsWith('.md') && file !== 'README.md',
);
assert.equal(
  pending.length,
  0,
  `Prepare and merge release notes before publishing: ${pending.join(', ')}`,
);

for (const directory of ['libs/core']) {
  const { name, version } = JSON.parse(readFileSync(`${directory}/package.json`, 'utf8'));
  const changelog = readFileSync(`${directory}/CHANGELOG.md`, 'utf8');
  assert.ok(
    changelog.split('\n').includes(`## ${version}`),
    `${name}: missing notes for ${version}`,
  );
}

console.log(
  'Only @ngx-formly/builder is publishable; its version has release notes and no pending changesets.',
);
