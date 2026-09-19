import { mkdirSync, type Stats } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { TemporaryDirectory } from '../../../test-helpers/create-temporary-directory/create-temporary-directory';
import { createTemporaryDirectory } from '../../../test-helpers/create-temporary-directory/create-temporary-directory';
import type { GetContentStatsError } from '../../../types/function-errors/get-content-stats-error';
import { getContentStats } from './get-content-stats';

let testPrefix: string = 'get-content-stats';

test('returns stats for an accessible content path', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-accessible`
  });

  t.teardown(temporaryDirectory.cleanup);

  let contentDirectory: string = resolve(temporaryDirectory.path, 'content');

  mkdirSync(contentDirectory);

  let result: Result.Result<Stats, GetContentStatsError> = getContentStats({
    contentDirectory: contentDirectory
  });

  t.is(result.type, 'Success');
});

test('reports an inaccessible content path', t => {
  let contentDirectory: string = '/path/that/does/not/exist';

  let result: Result.Result<Stats, GetContentStatsError> = getContentStats({
    contentDirectory: contentDirectory
  });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_CONTENT_DIRECTORY_ACCESS_FAILED');

    t.is(result.error.path, contentDirectory);
  }
});
