import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { TemporaryDirectory } from '../../test-helpers/create-temporary-directory/create-temporary-directory';
import { createTemporaryDirectory } from '../../test-helpers/create-temporary-directory/create-temporary-directory';
import { writeFiles } from '../../test-helpers/write-files/write-files';
import type { ReadTextFileError } from '../../types/function-errors/read-text-file-error';
import { readTextFile } from './read-text-file';

let testPrefix: string = 'read-text-file';

test('reads UTF-8 text without modifying it', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-success`
  });

  t.teardown(temporaryDirectory.cleanup);

  writeFiles({
    files: { 'source.md': '# Source\r\n' },
    rootDirectory: temporaryDirectory.path
  });

  let result: Result.Result<string, ReadTextFileError> = readTextFile({
    filePath: resolve(temporaryDirectory.path, 'source.md')
  });

  t.deepEqual(result, { type: 'Success', value: '# Source\r\n' });
});

test('reports a text file read failure', t => {
  let filePath: string = '/path/that/does/not/exist.md';

  let result: Result.Result<string, ReadTextFileError> = readTextFile({
    filePath: filePath
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_TEXT_FILE_READ_FAILED');

    t.is(result.error.path, filePath);
  }
});
