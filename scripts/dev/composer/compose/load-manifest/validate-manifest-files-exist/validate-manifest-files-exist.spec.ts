import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateManifestFilesExistError } from '../../../types/function-errors/validate-manifest-files-exist-error';
import { validateManifestFilesExist } from './validate-manifest-files-exist';

test('accepts manifest paths that exist', t => {
  let result: Result.Result<void, ValidateManifestFilesExistError> =
    validateManifestFilesExist({
      manifestRelativePaths: ['intro.md', 'rules.md'],
      markdownRelativePaths: ['intro.md', 'rules.md']
    });

  t.is(result.type, 'Success');
});

test('rejects a manifest path missing from the content directory', t => {
  let result: Result.Result<void, ValidateManifestFilesExistError> =
    validateManifestFilesExist({
      manifestRelativePaths: ['intro.md', 'missing.md'],
      markdownRelativePaths: ['intro.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE');
  }
});
