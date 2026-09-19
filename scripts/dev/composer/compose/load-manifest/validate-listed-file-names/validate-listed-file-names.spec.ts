import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateListedFileNamesError } from '../../../types/function-errors/validate-listed-file-names-error';
import { validateListedFileNames } from './validate-listed-file-names';

test('accepts lowercase letters, digits, and hyphens in filename stems', t => {
  let result: Result.Result<void, ValidateListedFileNamesError> =
    validateListedFileNames({
      contentDirectory: resolve('/workspace/content'),
      listedPaths: ['intro.md', 'rules/rule-2.md']
    });

  t.is(result.type, 'Success');
});

['Intro.md', 'under_score.md', 'punctuation!.md'].forEach(listedPath => {
  test(`rejects invalid filename: ${listedPath}`, t => {
    let contentDirectory: string = resolve('/workspace/content');

    let result: Result.Result<void, ValidateListedFileNamesError> =
      validateListedFileNames({
        contentDirectory: contentDirectory,
        listedPaths: [listedPath]
      });

    t.is(result.type, 'Failure');

    if (result.type === 'Failure') {
      t.is(result.error.code, 'COMPOSER_LISTED_FILE_NAME_INVALID');

      t.is(result.error.filePath, resolve(contentDirectory, listedPath));
    }
  });
});
