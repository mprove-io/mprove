import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateNoEmptyDirectoriesError } from '../../../types/function-errors/validate-no-empty-directories-error';
import { validateNoEmptyDirectories } from './validate-no-empty-directories';

test('accepts content without empty directories', t => {
  let result: Result.Result<void, ValidateNoEmptyDirectoriesError> =
    validateNoEmptyDirectories({
      contentDirectory: resolve('content'),
      discoverPathsPayload: {
        directories: ['rules'],
        emptyDirectories: [],
        files: ['rules.md', 'rules/example.md']
      }
    });

  t.is(result.type, 'Success');
});

test('rejects an empty directory', t => {
  let contentDirectory: string = resolve('content');

  let result: Result.Result<void, ValidateNoEmptyDirectoriesError> =
    validateNoEmptyDirectories({
      contentDirectory: contentDirectory,
      discoverPathsPayload: {
        directories: ['rules'],
        emptyDirectories: ['rules'],
        files: ['rules.md']
      }
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_EMPTY_DIRECTORY');

    t.is(result.error.path, resolve(contentDirectory, 'rules'));
  }
});
