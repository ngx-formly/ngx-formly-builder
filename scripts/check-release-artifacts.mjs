import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const packages = ['libs/core'];
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
for (const directory of packages) {
  const source = readJson(`${directory}/package.json`);
  const output = resolve(directory, source.publishConfig.directory);
  const built = readJson(`${output}/package.json`);
  assert.equal(built.name, source.name, `${directory}: wrong built package`);
  assert.equal(built.version, source.version, `${source.name}: stale built version`);
  assert.deepEqual(
    built.peerDependencies,
    source.peerDependencies,
    `${source.name}: stale peer ranges`,
  );
  assert.deepEqual(built.dependencies, source.dependencies, `${source.name}: stale dependencies`);
  assert.deepEqual(
    built.peerDependenciesMeta,
    source.peerDependenciesMeta,
    `${source.name}: stale optional peers`,
  );
  assert.ok(existsSync(resolve(output, built.typings)), `${source.name}: missing declarations`);
  assert.ok(existsSync(resolve(output, built.module)), `${source.name}: missing bundle`);
  for (const file of ['LICENSE', 'README.md', 'CHANGELOG.md']) {
    assert.ok(existsSync(resolve(output, file)), `${source.name}: missing ${file}`);
  }
  assert.deepEqual(
    Object.keys(built.exports).sort(),
    ['.', './package.json', './styles.css', './ui'],
    `${source.name}: unexpected public entry points`,
  );
}
console.log(
  'Release names, versions, peer ranges, bundles and declarations match source manifests.',
);
