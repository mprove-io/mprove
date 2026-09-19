import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'ava';
import type { TemporaryDirectory } from './test-helpers/create-temporary-directory/create-temporary-directory';
import { createTemporaryDirectory } from './test-helpers/create-temporary-directory/create-temporary-directory';
import {
  type RunComposerOutput,
  runComposer
} from './test-helpers/run-composer/run-composer';
import { writeFiles } from './test-helpers/write-files/write-files';

let testPrefix: string = 'main';

test('CLI composes files in manifest order', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-manifest-order`
  });

  t.teardown(temporaryDirectory.cleanup);

  writeFiles({
    files: {
      'COMPOSER.md': '- second.md\n- first.md\n',
      'content/first.md': '# First',
      'content/second.md': '# Second'
    },
    rootDirectory: temporaryDirectory.path
  });

  let outputPath: string = resolve(temporaryDirectory.path, 'AGENTS.md');

  let result: RunComposerOutput = runComposer({
    contentDirectory: resolve(temporaryDirectory.path, 'content'),
    manifestPath: resolve(temporaryDirectory.path, 'COMPOSER.md'),
    outputPath: outputPath
  });

  t.is(result.status, 0);

  t.true(result.stdout.includes(`Wrote ${outputPath}`));

  let output: string = readFileSync(outputPath, 'utf8');

  t.true(output.indexOf('# Second') < output.indexOf('# First'));
});

test('CLI propagates a composition failure without creating output', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-failure-propagation`
  });

  t.teardown(temporaryDirectory.cleanup);

  let contentDirectory: string = resolve(temporaryDirectory.path, 'content');

  mkdirSync(contentDirectory);

  let outputPath: string = resolve(temporaryDirectory.path, 'AGENTS.md');

  let result: RunComposerOutput = runComposer({
    contentDirectory: contentDirectory,
    manifestPath: resolve(temporaryDirectory.path, 'missing-manifest.md'),
    outputPath: outputPath
  });

  t.is(result.status, 1);

  t.true(result.stderr.includes('COMPOSER_TEXT_FILE_READ_FAILED'));

  t.false(existsSync(outputPath));
});
