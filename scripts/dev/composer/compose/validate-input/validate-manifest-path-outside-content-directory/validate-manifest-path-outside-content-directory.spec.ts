import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateManifestPathOutsideContentDirectoryError } from '../../../types/function-errors/validate-manifest-path-outside-content-directory-error';
import { validateManifestPathOutsideContentDirectory } from './validate-manifest-path-outside-content-directory';

test('accepts a manifest outside the content directory', t => {
  let result: Result.Result<
    void,
    ValidateManifestPathOutsideContentDirectoryError
  > = validateManifestPathOutsideContentDirectory({
    contentDirectory: resolve('/workspace/content'),
    manifestPath: resolve('/workspace/COMPOSER.md')
  });

  t.is(result.type, 'Success');
});

test('rejects a manifest in the content directory', t => {
  let manifestPath: string = resolve('/workspace/content/COMPOSER.md');

  let result: Result.Result<
    void,
    ValidateManifestPathOutsideContentDirectoryError
  > = validateManifestPathOutsideContentDirectory({
    contentDirectory: resolve('/workspace/content'),
    manifestPath: manifestPath
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_PATH_IN_CONTENT_DIRECTORY');

    t.is(result.error.path, manifestPath);
  }
});
