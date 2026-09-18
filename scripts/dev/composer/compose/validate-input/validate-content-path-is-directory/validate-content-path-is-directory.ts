import type { Stats } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ValidateContentPathIsDirectoryError } from '../../../types/function-errors/validate-content-path-is-directory-error';

export function validateContentPathIsDirectory(item: {
  contentDirectory: string;
  contentStats: Stats;
}): Result.Result<void, ValidateContentPathIsDirectoryError> {
  return item.contentStats.isDirectory()
    ? Result.succeed()
    : Result.fail({
        code: 'COMPOSER_CONTENT_PATH_NOT_DIRECTORY',
        message: `Content path is not a directory: ${item.contentDirectory}`,
        path: item.contentDirectory
      });
}
