import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateManifestAndOutputPathsDifferentError } from '../../../types/function-errors/validate-manifest-and-output-paths-different-error';
import { validateManifestAndOutputPathsDifferent } from './validate-manifest-and-output-paths-different';

test('accepts different manifest and output paths', t => {
  let result: Result.Result<
    void,
    ValidateManifestAndOutputPathsDifferentError
  > = validateManifestAndOutputPathsDifferent({
    manifestPath: '/workspace/COMPOSER.md',
    outputPath: '/workspace/AGENTS.md'
  });

  t.is(result.type, 'Success');
});

test('rejects matching manifest and output paths', t => {
  let result: Result.Result<
    void,
    ValidateManifestAndOutputPathsDifferentError
  > = validateManifestAndOutputPathsDifferent({
    manifestPath: '/workspace/AGENTS.md',
    outputPath: '/workspace/AGENTS.md'
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_OUTPUT_PATH_CONFLICT');
  }
});
