import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateMarkdownFilesReferencedError } from '../../../types/function-errors/validate-markdown-files-referenced-error';
import { validateMarkdownFilesReferenced } from './validate-markdown-files-referenced';

test('accepts Markdown files referenced by the manifest', t => {
  let result: Result.Result<void, ValidateMarkdownFilesReferencedError> =
    validateMarkdownFilesReferenced({
      manifestRelativePaths: ['intro.md', 'rules.md'],
      markdownRelativePaths: ['intro.md', 'rules.md']
    });

  t.is(result.type, 'Success');
});

test('rejects an unreferenced Markdown file', t => {
  let result: Result.Result<void, ValidateMarkdownFilesReferencedError> =
    validateMarkdownFilesReferenced({
      manifestRelativePaths: ['intro.md'],
      markdownRelativePaths: ['intro.md', 'rules.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MARKDOWN_FILE_UNREFERENCED');
  }
});
