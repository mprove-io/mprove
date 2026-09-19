import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ValidateListedPathError } from '../../../types/function-errors/validate-listed-path-error';
import { validateListedPath } from './validate-listed-path';

let invalidPaths: string[] = [
  '',
  'intro.txt',
  'with space.md',
  './intro.md',
  'rules/../intro.md',
  '../intro.md',
  '/intro.md',
  'C:\\intro.md',
  'rules\\intro.md',
  'rules//intro.md'
];

test('accepts a safe relative Markdown path', t => {
  let result: Result.Result<void, ValidateListedPathError> = validateListedPath(
    {
      listedPath: 'rules/example.md',
      manifestLine: { line: '- rules/example.md', lineNumber: 1 },
      manifestPath: '/workspace/COMPOSER.md'
    }
  );

  t.is(result.type, 'Success');
});

invalidPaths.forEach(listedPath => {
  test(`rejects unsafe listed path: ${JSON.stringify(listedPath)}`, t => {
    let result: Result.Result<void, ValidateListedPathError> =
      validateListedPath({
        listedPath: listedPath,
        manifestLine: { line: `- ${listedPath}`, lineNumber: 2 },
        manifestPath: '/workspace/COMPOSER.md'
      });

    t.is(result.type, 'Failure');

    if (result.type === 'Failure') {
      t.is(result.error.code, 'COMPOSER_MANIFEST_PATH_INVALID');
    }
  });
});
