import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { DiscoverPathsPayload } from '../../../types/discover-paths-payload';
import type { ValidateNoEmptyDirectoriesError } from '../../../types/function-errors/validate-no-empty-directories-error';

export function validateNoEmptyDirectories(item: {
  contentDirectory: string;
  discoverPathsPayload: DiscoverPathsPayload;
}): Result.Result<void, ValidateNoEmptyDirectoriesError> {
  let { contentDirectory, discoverPathsPayload } = item;

  if (discoverPathsPayload.emptyDirectories.length > 0) {
    let emptyDirectoryPath: string = resolve(
      contentDirectory,
      discoverPathsPayload.emptyDirectories[0]
    );

    return Result.fail({
      code: 'COMPOSER_EMPTY_DIRECTORY',
      message: `Content directory contains an empty directory: ${emptyDirectoryPath}`,
      path: emptyDirectoryPath
    });
  }

  return Result.succeed();
}
