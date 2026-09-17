import { type Stats, statSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerSourceDirectoryAccessFailedError } from '../types/errors/composer-source-directory-access-failed-error';
import type { ComposerSourcePathNotDirectoryError } from '../types/errors/composer-source-path-not-directory-error';
import type { ValidateSourceDirectoryError } from '../types/function-errors/validate-source-directory-error';

export function validateSourceDirectory(item: {
  sourceDirectory: string;
}): Result.Result<void, ValidateSourceDirectoryError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'sourceStats',
      (v): Result.Result<Stats, ComposerSourceDirectoryAccessFailedError> =>
        Result.try({
          try: (): Stats => statSync(v.sourceDirectory),
          catch: (
            error: unknown
          ): ComposerSourceDirectoryAccessFailedError => ({
            code: 'COMPOSER_SOURCE_DIRECTORY_ACCESS_FAILED',
            message: `Unable to access ${v.sourceDirectory}`,
            path: v.sourceDirectory,
            originalError: error
          })
        })
    ),
    Result.andThen(
      (v): Result.Result<void, ComposerSourcePathNotDirectoryError> => {
        let sourceIsDirectory: boolean = v.sourceStats.isDirectory();

        return sourceIsDirectory
          ? Result.succeed()
          : Result.fail({
              code: 'COMPOSER_SOURCE_PATH_NOT_DIRECTORY',
              message: `Source path is not a directory: ${v.sourceDirectory}`,
              path: v.sourceDirectory
            });
      }
    )
  );
}
