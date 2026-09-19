import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateMarkdownTitlesError } from '../../../types/function-errors/validate-markdown-titles-error';
import { validateMarkdownTitles } from './validate-markdown-titles';

['# Getting Started', '# getting-started', '# Getting, Started!'].forEach(
  title => {
    test(`accepts title slug matching filename: ${title}`, t => {
      let result: Result.Result<void, ValidateMarkdownTitlesError> =
        validateMarkdownTitles({
          contentDirectory: resolve('/workspace/content'),
          contents: [`${title}\nBody`],
          listedPaths: ['getting-started.md']
        });

      t.is(result.type, 'Success');
    });
  }
);

['', 'Intro', '## Intro', ' # Intro', '#'].forEach(content => {
  test(`rejects content without a first-line H1: ${JSON.stringify(content)}`, t => {
    let result: Result.Result<void, ValidateMarkdownTitlesError> =
      validateMarkdownTitles({
        contentDirectory: resolve('/workspace/content'),
        contents: [content],
        listedPaths: ['intro.md']
      });

    t.is(result.type, 'Failure');

    if (result.type === 'Failure') {
      t.is(result.error.code, 'COMPOSER_MARKDOWN_H1_MISSING');
    }
  });
});

test('rejects an H1 whose slug does not match the filename', t => {
  let filePath: string = resolve('/workspace/content/intro.md');

  let result: Result.Result<void, ValidateMarkdownTitlesError> =
    validateMarkdownTitles({
      contentDirectory: resolve('/workspace/content'),
      contents: ['# Different'],
      listedPaths: ['intro.md']
    });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MARKDOWN_TITLE_MISMATCH');

    t.is(result.error.filePath, filePath);
  }
});
