import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import type { TemporaryDirectory } from '../../../test-helpers/create-temporary-directory/create-temporary-directory';
import { createTemporaryDirectory } from '../../../test-helpers/create-temporary-directory/create-temporary-directory';
import { writeFiles } from '../../../test-helpers/write-files/write-files';
import type { DiscoverPathsPayload } from '../../../types/discover-paths-payload';
import type { DiscoverPathsError } from '../../../types/function-errors/discover-paths-error';
import { discoverPaths } from './discover-paths';

let testPrefix: string = 'discover-paths';

test('discovers Markdown files, directories, and empty directories', t => {
  let temporaryDirectory: TemporaryDirectory = createTemporaryDirectory({
    testId: `${testPrefix}-content-tree`
  });

  t.teardown(temporaryDirectory.cleanup);

  writeFiles({
    files: {
      'content/intro.md': '# Intro',
      'content/notes.txt': 'ignored',
      'content/rules.md': '# Rules',
      'content/rules/example.md': '# Example'
    },
    rootDirectory: temporaryDirectory.path
  });

  mkdirSync(resolve(temporaryDirectory.path, 'content/empty'));

  let result: Result.Result<DiscoverPathsPayload, DiscoverPathsError> =
    discoverPaths({
      contentDirectory: resolve(temporaryDirectory.path, 'content')
    });

  t.is(result.type, 'Success');

  if (result.type === 'Success') {
    t.deepEqual(result.value.directories.sort(), ['empty', 'rules']);

    t.deepEqual(result.value.emptyDirectories, ['empty']);

    t.deepEqual(result.value.files.sort(), [
      'intro.md',
      'rules.md',
      'rules/example.md'
    ]);
  }
});

test('reports the directory that cannot be scanned', t => {
  let contentDirectory: string = '/path/that/does/not/exist';

  let result: Result.Result<DiscoverPathsPayload, DiscoverPathsError> =
    discoverPaths({ contentDirectory: contentDirectory });

  t.is(result.type, 'Failure');

  if (result.type === 'Failure') {
    t.is(result.error.code, 'COMPOSER_MARKDOWN_FILE_SCAN_FAILED');

    t.is(result.error.path, contentDirectory);
  }
});
