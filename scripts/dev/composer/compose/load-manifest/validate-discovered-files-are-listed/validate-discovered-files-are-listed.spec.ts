import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateDiscoveredFilesAreListedError } from '../../../types/function-errors/validate-discovered-files-are-listed-error';
import { validateDiscoveredFilesAreListed } from './validate-discovered-files-are-listed';

test('accepts Markdown files referenced by the manifest', t => {
  let result: Result.Result<void, ValidateDiscoveredFilesAreListedError> =
    validateDiscoveredFilesAreListed({
      discoverPathsPayload: {
        directories: [],
        emptyDirectories: [],
        files: ['intro.md', 'rules.md']
      },
      listedPaths: ['intro.md', 'rules.md']
    });

  t.is(result.type, 'Success');
});

test('rejects an unreferenced Markdown file', t => {
  let result: Result.Result<void, ValidateDiscoveredFilesAreListedError> =
    validateDiscoveredFilesAreListed({
      discoverPathsPayload: {
        directories: [],
        emptyDirectories: [],
        files: ['intro.md', 'rules.md']
      },
      listedPaths: ['intro.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MARKDOWN_FILE_UNREFERENCED');
  }
});
