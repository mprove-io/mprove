import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateListedPathsAreDiscoveredError } from '../../../types/function-errors/validate-listed-paths-are-discovered-error';
import { validateListedPathsAreDiscovered } from './validate-listed-paths-are-discovered';

test('accepts manifest paths that exist', t => {
  let result: Result.Result<void, ValidateListedPathsAreDiscoveredError> =
    validateListedPathsAreDiscovered({
      discoverPathsPayload: {
        directories: [],
        emptyDirectories: [],
        files: ['intro.md', 'rules.md']
      },
      listedPaths: ['intro.md', 'rules.md']
    });

  t.is(result.type, 'Success');
});

test('rejects a manifest path missing from the content directory', t => {
  let result: Result.Result<void, ValidateListedPathsAreDiscoveredError> =
    validateListedPathsAreDiscovered({
      discoverPathsPayload: {
        directories: [],
        emptyDirectories: [],
        files: ['intro.md']
      },
      listedPaths: ['intro.md', 'missing.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE');
  }
});
