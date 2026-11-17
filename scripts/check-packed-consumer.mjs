import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureSource = join(workspaceRoot, 'integration/package-consumer');
const packageDirectories = ['libs/core'];
const nodeCommand = process.execPath;
const pnpmCli = process.env['npm_execpath'];
const headless = process.argv.includes('--headless');
const builderManifest = JSON.parse(
  readFileSync(join(workspaceRoot, 'libs/core/package.json'), 'utf8'),
);
const optionalPeers = Object.keys(builderManifest.peerDependenciesMeta);
const fixtureRoot = mkdtempSync(join(tmpdir(), 'formly-editor-consumer-'));
const tarballDirectory = join(fixtureRoot, 'packages');

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: fixtureRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: {
      ...process.env,
      FORMLY_CONSUMER_ROOT: fixtureRoot,
      FORMLY_CONSUMER_MODE: headless ? 'headless' : 'ui',
    },
  });
}

function runPnpm(args, options = {}) {
  if (!pnpmCli) {
    throw new Error('npm_execpath is unavailable; run this check through pnpm run check:packages');
  }
  return run(nodeCommand, [pnpmCli, ...args], options);
}

try {
  mkdirSync(tarballDirectory);
  for (const file of ['tsconfig.json', 'angular.json', 'index.html']) {
    cpSync(join(fixtureSource, file), join(fixtureRoot, file));
  }

  cpSync(
    join(fixtureSource, headless ? 'headless.ts' : 'consumer.ts'),
    join(fixtureRoot, 'consumer.ts'),
  );
  if (!headless) {
    for (const file of ['.postcssrc.json', 'styles.css'])
      cpSync(join(fixtureSource, file), join(fixtureRoot, file));
  }

  const fixtureManifest = JSON.parse(readFileSync(join(fixtureSource, 'package.json'), 'utf8'));

  if (headless) {
    for (const name of optionalPeers) delete fixtureManifest.dependencies[name];
    delete fixtureManifest.devDependencies['@tailwindcss/postcss'];
    delete fixtureManifest.devDependencies.postcss;
    const angularPath = join(fixtureRoot, 'angular.json');
    const angular = JSON.parse(readFileSync(angularPath, 'utf8'));
    const options = angular.projects.consumer.architect.build.options;
    options.styles = [];
    options.statsJson = true;
    options.budgets = [{ type: 'initial', maximumError: '400kB' }];
    writeFileSync(angularPath, JSON.stringify(angular));
  }

  for (const directory of packageDirectories) {
    const packagePath = join(workspaceRoot, 'dist', basename(directory));
    const packOutput = runPnpm(
      [
        '--dir',
        join(workspaceRoot, directory),
        'pack',
        '--json',
        '--pack-destination',
        tarballDirectory,
      ],
      { capture: true },
    );
    const { filename } = JSON.parse(packOutput);
    const packageManifest = JSON.parse(readFileSync(join(packagePath, 'package.json'), 'utf8'));
    fixtureManifest.dependencies[packageManifest.name] = `file:./packages/${basename(filename)}`;
  }

  writeFileSync(join(fixtureRoot, 'package.json'), `${JSON.stringify(fixtureManifest, null, 2)}\n`);

  runPnpm(['install', '--ignore-scripts', '--lockfile=false', '--strict-peer-dependencies']);
  runPnpm(['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json']);
  runPnpm(['run', 'build']);
  if (headless) {
    const stats = JSON.parse(readFileSync(join(fixtureRoot, 'dist/browser-stats.json'), 'utf8'));
    const forbidden = Object.keys(stats.inputs).filter(
      (path) =>
        /ngx-formly-builder-ui|builder-app-dialogs/.test(path) ||
        optionalPeers.some((name) => path.includes(`node_modules/${name}/`)),
    );
    assert.deepEqual(forbidden, [], 'Headless output must not include UI code or UI peers');
    run(nodeCommand, [
      '--input-type=module',
      '--eval',
      `
      import assert from 'node:assert/strict';
      for (const name of ${JSON.stringify(optionalPeers)}) {
        assert.throws(() => import.meta.resolve(name), { code: 'ERR_MODULE_NOT_FOUND' },
          name + ' must not be installed for the headless consumer');
      }
    `,
    ]);
  }
  run(nodeCommand, [
    '--input-type=module',
    '--eval',
    [
      "import { existsSync } from 'node:fs';",
      "import { fileURLToPath } from 'node:url';",
      `for (const name of ${JSON.stringify(headless ? ['@ngx-formly/builder'] : ['@ngx-formly/builder', '@ngx-formly/builder/ui', '@ngx-formly/builder/styles.css'])}) {`,
      '  const entryPoint = fileURLToPath(import.meta.resolve(name));',
      '  if (!existsSync(entryPoint)) throw new Error(`Missing package entry point: ${name}`);',
      '}',
    ].join('\n'),
  ]);

  if (process.argv.includes('--browser')) {
    run(nodeCommand, [
      join(workspaceRoot, 'node_modules/@playwright/test/cli.js'),
      'test',
      '--config',
      join(fixtureSource, 'playwright.config.ts'),
    ]);
  }

  console.log(
    `Validated the builder tarball in a clean ${headless ? 'headless' : 'UI'} consumer installation.`,
  );
} finally {
  rmSync(fixtureRoot, { force: true, recursive: true });
}
