import { type Stats, statSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerContentDirectoryAccessFailedError } from '../../types/errors/composer-content-directory-access-failed-error';
import type { ComposerContentPathNotDirectoryError } from '../../types/errors/composer-content-path-not-directory-error';
import type { ValidateContentDirectoryError } from '../../types/function-errors/validate-content-directory-error';

export function validateContentDirectory(item: {
  contentDirectory: string;
}): Result.Result<void, ValidateContentDirectoryError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'contentStats',
      (v): Result.Result<Stats, ComposerContentDirectoryAccessFailedError> =>
        Result.try({
          try: (): Stats => statSync(v.contentDirectory),
          catch: (
            error: unknown
          ): ComposerContentDirectoryAccessFailedError => ({
            code: 'COMPOSER_CONTENT_DIRECTORY_ACCESS_FAILED',
            message: `Unable to access ${v.contentDirectory}`,
            path: v.contentDirectory,
            originalError: error
          })
        })
    ),
    Result.andThen(
      (v): Result.Result<void, ComposerContentPathNotDirectoryError> =>
        v.contentStats.isDirectory()
          ? Result.succeed()
          : Result.fail({
              code: 'COMPOSER_CONTENT_PATH_NOT_DIRECTORY',
              message: `Content path is not a directory: ${v.contentDirectory}`,
              path: v.contentDirectory
            })
    )
  );
}
