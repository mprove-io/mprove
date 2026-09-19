import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateOutputPathOutsideContentDirectoryError } from '../../../types/function-errors/validate-output-path-outside-content-directory-error';
import { validateOutputPathOutsideContentDirectory } from './validate-output-path-outside-content-directory';

test('accepts output outside the content directory', t => {
  let result: Result.Result<
    void,
    ValidateOutputPathOutsideContentDirectoryError
  > = validateOutputPathOutsideContentDirectory({
    contentDirectory: resolve('/workspace/content'),
    outputPath: resolve('/workspace/AGENTS.md')
  });

  t.is(result.type, 'Success');
});

test('rejects output in the content directory', t => {
  let outputPath: string = resolve('/workspace/content/AGENTS.md');

  let result: Result.Result<
    void,
    ValidateOutputPathOutsideContentDirectoryError
  > = validateOutputPathOutsideContentDirectory({
    contentDirectory: resolve('/workspace/content'),
    outputPath: outputPath
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_OUTPUT_PATH_IN_CONTENT_DIRECTORY');

    t.is(result.error.path, outputPath);
  }
});
