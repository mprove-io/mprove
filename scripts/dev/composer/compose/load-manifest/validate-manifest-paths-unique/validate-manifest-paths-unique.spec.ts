import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateManifestPathsUniqueError } from '../../../types/function-errors/validate-manifest-paths-unique-error';
import { validateManifestPathsUnique } from './validate-manifest-paths-unique';

test('accepts unique manifest paths', t => {
  let result: Result.Result<void, ValidateManifestPathsUniqueError> =
    validateManifestPathsUnique({
      listedPaths: ['intro.md', 'rules.md'],
      manifestLines: [
        { line: '- intro.md', lineNumber: 1 },
        { line: '- rules.md', lineNumber: 2 }
      ],
      manifestPath: '/workspace/COMPOSER.md'
    });

  t.is(result.type, 'Success');
});

test('rejects a duplicate and reports its second line', t => {
  let result: Result.Result<void, ValidateManifestPathsUniqueError> =
    validateManifestPathsUnique({
      listedPaths: ['intro.md', 'intro.md'],
      manifestLines: [
        { line: '- intro.md', lineNumber: 2 },
        { line: '- intro.md', lineNumber: 5 }
      ],
      manifestPath: '/workspace/COMPOSER.md'
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_PATH_DUPLICATE');

    t.true(result.error.message.includes(':5'));
  }
});
