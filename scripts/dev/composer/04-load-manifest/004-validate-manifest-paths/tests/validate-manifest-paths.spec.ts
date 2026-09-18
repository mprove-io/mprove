import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateManifestPathsError } from '../../../types/function-errors/validate-manifest-paths-error';
import { validateManifestPaths } from '../validate-manifest-paths';

test('accepts matching source and manifest paths', t => {
  let result: Result.Result<void, ValidateManifestPathsError> =
    validateManifestPaths({
      ignoredRelativePaths: ['_COMPOSER.md', 'AGENTS.md'],
      manifestRelativePaths: ['intro.md', 'rules.md'],
      markdownPaths: ['_COMPOSER.md', 'AGENTS.md', 'intro.md', 'rules.md']
    });

  t.is(result.type, 'Success');
});

test('rejects a referenced ignored path first', t => {
  let result: Result.Result<void, ValidateManifestPathsError> =
    validateManifestPaths({
      ignoredRelativePaths: ['_COMPOSER.md'],
      manifestRelativePaths: ['_COMPOSER.md'],
      markdownPaths: ['_COMPOSER.md', 'intro.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_IGNORED_PATH_REFERENCED');
  }
});

test('rejects an unreferenced source Markdown file', t => {
  let result: Result.Result<void, ValidateManifestPathsError> =
    validateManifestPaths({
      ignoredRelativePaths: ['_COMPOSER.md'],
      manifestRelativePaths: ['intro.md'],
      markdownPaths: ['_COMPOSER.md', 'intro.md', 'rules.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MARKDOWN_FILE_UNREFERENCED');
  }
});

test('rejects a manifest path missing from the source', t => {
  let result: Result.Result<void, ValidateManifestPathsError> =
    validateManifestPaths({
      ignoredRelativePaths: ['_COMPOSER.md'],
      manifestRelativePaths: ['intro.md', 'missing.md'],
      markdownPaths: ['_COMPOSER.md', 'intro.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_REFERENCES_MISSING_FILE');
  }
});
