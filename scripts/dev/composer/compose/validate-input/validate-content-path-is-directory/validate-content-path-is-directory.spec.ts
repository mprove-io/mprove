import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { TemporaryDirectory } from '../../../test-helpers/create-temporary-directory/create-temporary-directory';
import { createTemporaryDirectory } from '../../../test-helpers/create-temporary-directory/create-temporary-directory';
import { writeFiles } from '../../../test-helpers/write-files/write-files';
import type { ValidateContentPathIsDirectoryError } from '../../../types/function-errors/validate-content-path-is-directory-error';
import { validateContentPathIsDirectory } from './validate-content-path-is-directory';

let testPrefix: string = 'validate-content-path-is-directory';

test('accepts a directory', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-directory`
  });

  t.teardown(temporaryDirectory.cleanup);

  let result: Result.Result<void, ValidateContentPathIsDirectoryError> =
    validateContentPathIsDirectory({
      contentDirectory: temporaryDirectory.path,
      contentStats: statSync(temporaryDirectory.path)
    });

  t.is(result.type, 'Success');
});

test('rejects a regular file', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-file`
  });

  t.teardown(temporaryDirectory.cleanup);

  writeFiles({
    files: { 'content.md': '# Content' },
    rootDirectory: temporaryDirectory.path
  });

  let contentPath: string = resolve(temporaryDirectory.path, 'content.md');

  let result: Result.Result<void, ValidateContentPathIsDirectoryError> =
    validateContentPathIsDirectory({
      contentDirectory: contentPath,
      contentStats: statSync(contentPath)
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_CONTENT_PATH_NOT_DIRECTORY');

    t.is(result.error.path, contentPath);
  }
});
