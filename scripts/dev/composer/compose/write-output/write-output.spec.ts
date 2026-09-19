import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { TemporaryDirectory } from '../../test-helpers/create-temporary-directory/create-temporary-directory';
import { createTemporaryDirectory } from '../../test-helpers/create-temporary-directory/create-temporary-directory';
import { writeFiles } from '../../test-helpers/write-files/write-files';
import type { WriteOutputError } from '../../types/function-errors/write-output-error';
import { writeOutput } from './write-output';

let testPrefix: string = 'write-output';

test('atomically replaces output and appends one newline', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-replace`
  });

  t.teardown(temporaryDirectory.cleanup);

  writeFiles({
    files: { 'AGENTS.md': 'old content' },
    rootDirectory: temporaryDirectory.path
  });

  let outputPath: string = resolve(temporaryDirectory.path, 'AGENTS.md');

  let result: Result.Result<void, WriteOutputError> = writeOutput({
    markdown: '# New content',
    outputPath: outputPath
  });

  t.is(result.type, 'Success');

  let output: string = readFileSync(outputPath, 'utf8');

  t.is(output, '# New content\n');

  t.deepEqual(readdirSync(temporaryDirectory.path), ['AGENTS.md']);
});

test('reports a rename failure and removes temporary output', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-rename-failure`
  });

  t.teardown(temporaryDirectory.cleanup);

  let outputPath: string = resolve(temporaryDirectory.path, 'AGENTS.md');

  mkdirSync(outputPath);

  let result: Result.Result<void, WriteOutputError> = writeOutput({
    markdown: '# Content',
    outputPath: outputPath
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_OUTPUT_WRITE_FAILED');
  }

  if (
    result.type === 'Failure' &&
    result.error.code === 'COMPOSER_OUTPUT_WRITE_FAILED'
  ) {
    t.is(result.error.outputPath, outputPath);

    t.false(existsSync(result.error.temporaryOutputPath));
  }

  t.deepEqual(readdirSync(temporaryDirectory.path), ['AGENTS.md']);
});
