import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateDirectorySectionFilesExistError } from '../../../types/function-errors/validate-directory-section-files-exist-error';
import { validateDirectorySectionFilesExist } from './validate-directory-section-files-exist';

test('accepts a sibling section file for every directory', t => {
  let result: Result.Result<void, ValidateDirectorySectionFilesExistError> =
    validateDirectorySectionFilesExist({
      contentDirectory: resolve('/workspace/content'),
      discoverPathsPayload: {
        directories: ['rules', 'rules/nested'],
        emptyDirectories: [],
        files: ['rules.md', 'rules/nested.md', 'rules/nested/example.md']
      }
    });

  t.is(result.type, 'Success');
});

test('rejects a directory without its sibling section file', t => {
  let contentDirectory: string = resolve('/workspace/content');

  let result: Result.Result<void, ValidateDirectorySectionFilesExistError> =
    validateDirectorySectionFilesExist({
      contentDirectory: contentDirectory,
      discoverPathsPayload: {
        directories: ['rules'],
        emptyDirectories: [],
        files: ['rules/example.md']
      }
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_DIRECTORY_SECTION_FILE_MISSING');

    t.is(result.error.path, resolve(contentDirectory, 'rules.md'));
  }
});
