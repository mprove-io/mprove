import { Result } from '@praha/byethrow';
import test from 'ava';
import type { ParseListedPathError } from '../../../types/function-errors/parse-listed-path-error';
import { parseListedPath } from './parse-listed-path';

test('parses and trims a Markdown list item', t => {
  let result: Result.Result<string, ParseListedPathError> = parseListedPath({
    manifestLine: { line: '- rules/example.md  ', lineNumber: 3 },
    manifestPath: '/workspace/COMPOSER.md'
  });

  t.deepEqual(result, {
    type: 'Success',
    value: 'rules/example.md'
  });
});

test('rejects a line that is not a Markdown list item', t => {
  let manifestPath: string = '/workspace/COMPOSER.md';

  let result: Result.Result<string, ParseListedPathError> = parseListedPath({
    manifestLine: { line: 'rules/example.md', lineNumber: 7 },
    manifestPath: manifestPath
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MANIFEST_PATH_INVALID');

    t.true(result.error.message.includes(`${manifestPath}:7`));
  }
});
